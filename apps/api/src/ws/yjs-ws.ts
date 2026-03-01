import http from 'http';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import DocRepo from '../database/repositories/DocRepo';
import DocAccessService from '../services/DocAccessService';
import jwtUtils from '../core/jwtUtils';
import { validateTokenData } from '../core/authUtils';
import UserRepo from '../database/repositories/UserRepo';
import logger from '../core/logger.js';

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;
const PERSIST_DEBOUNCE_MS = 2000;
const PING_INTERVAL_MS = 30000;

interface Room {
  ydoc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  conns: Map<import('ws').WebSocket, { readOnly: boolean; ws: import('ws').WebSocket }>;
}

const rooms = new Map<number, Room>();
const persistTimeouts = new Map<number, ReturnType<typeof setTimeout>>();

function getTokenFromRequest(req: http.IncomingMessage): { accessToken?: string; shareToken?: string } {
  const url = new URL(req.url ?? '', `http://${req.headers.host}`);
  const accessToken = url.searchParams.get('token') ?? undefined;
  const shareToken = url.searchParams.get('shareToken') ?? undefined;
  return { accessToken, shareToken };
}

async function getUserIdFromToken(accessToken: string): Promise<number | null> {
  try {
    const payload = jwtUtils.validate(accessToken);
    validateTokenData(payload);
    const userId = parseInt(payload.sub, 10);
    if (isNaN(userId)) return null;
    const user = await UserRepo.findById(userId);
    return user ? user.id : null;
  } catch {
    return null;
  }
}

function getDocIdFromPath(pathname: string): number | null {
  const match = pathname.match(/^\/ws\/docs\/(\d+)$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function resolveDocAccess(
  docId: number,
  accessToken?: string,
  shareToken?: string
): Promise<{ role: 'owner' | 'editor' | 'viewer' | 'commenter' } | null> {
  const userId = accessToken ? await getUserIdFromToken(accessToken) : null;
  const result = await DocAccessService.getDocWithAccess(userId ?? null, {
    docId,
    shareToken: shareToken ?? undefined,
  });
  return result ? { role: result.role } : null;
}

function canSendUpdates(role: string): boolean {
  return role === 'owner' || role === 'editor';
}

async function loadYjsStateFromDb(docId: number): Promise<Uint8Array | null> {
  const doc = await DocRepo.findById(docId);
  if (!doc?.yjsState) return null;
  const buf = doc.yjsState as Buffer;
  return new Uint8Array(buf);
}

function schedulePersist(docId: number, ydoc: Y.Doc) {
  const existing = persistTimeouts.get(docId);
  if (existing) clearTimeout(existing);
  const timeout = setTimeout(() => {
    persistTimeouts.delete(docId);
    const state = Y.encodeStateAsUpdate(ydoc);
    DocRepo.updateOne(docId, { yjsState: Buffer.from(state) }).catch((err) => {
      logger.error('Yjs persist failed', { docId, err });
    });
  }, PERSIST_DEBOUNCE_MS);
  persistTimeouts.set(docId, timeout);
}

function getOrCreateRoom(docId: number): Room {
  let room = rooms.get(docId);
  if (!room) {
    const ydoc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(ydoc);
    room = { ydoc, awareness, conns: new Map() };
    rooms.set(docId, room);

    loadYjsStateFromDb(docId).then((state) => {
      if (state && state.length > 0) {
        Y.applyUpdate(room!.ydoc, state);
      }
    });

    ydoc.on('update', (update: Uint8Array, origin: unknown) => {
      const fromMeta = origin as { readOnly?: boolean; ws?: import('ws').WebSocket } | undefined;
      if (fromMeta?.readOnly === true) return;
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);
      const excludeWs = fromMeta?.ws;
      room!.conns.forEach((_, conn) => {
        if (conn !== excludeWs && conn.readyState === 1) {
          conn.send(message);
        }
      });
    });

    ydoc.on('update', () => schedulePersist(docId, ydoc));
  }
  return room;
}

function send(ws: import('ws').WebSocket, data: Uint8Array) {
  if (ws.readyState === 0 || ws.readyState === 1) {
    ws.send(data);
  }
}

export function attachYjsWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request: http.IncomingMessage, socket, head) => {
    const pathname = request.url?.split('?')[0] ?? '';
    if (!pathname.startsWith('/ws/docs/')) {
      socket.destroy();
      return;
    }
    const docId = getDocIdFromPath(pathname);
    if (docId == null) {
      socket.destroy();
      return;
    }
    const { accessToken, shareToken } = getTokenFromRequest(request);
    resolveDocAccess(docId, accessToken, shareToken).then((access) => {
      if (!access) {
        socket.destroy();
        return;
      }
      wss.handleUpgrade(request, socket, head, (ws) => {
        const role = access.role;
        const readOnly = !canSendUpdates(role);
        const room = getOrCreateRoom(docId);
        room.conns.set(ws, { readOnly, ws });
        (ws as unknown as { binaryType: string }).binaryType = 'arraybuffer';

        const connAsOrigin = { readOnly, ws };

        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_SYNC);
        syncProtocol.writeSyncStep1(encoder, room.ydoc);
        send(ws, encoding.toUint8Array(encoder));

        const awarenessStates = room.awareness.getStates();
        if (awarenessStates.size > 0) {
          const enc = encoding.createEncoder();
          encoding.writeVarUint(enc, MESSAGE_AWARENESS);
          encoding.writeVarUint8Array(enc, awarenessProtocol.encodeAwarenessUpdate(room.awareness, Array.from(awarenessStates.keys())));
          send(ws, encoding.toUint8Array(enc));
        }

        ws.on('message', (raw: ArrayBuffer) => {
          const message = new Uint8Array(raw);
          const decoder = decoding.createDecoder(message);
          const messageType = decoding.readVarUint(decoder);
          if (messageType === MESSAGE_SYNC) {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, MESSAGE_SYNC);
            syncProtocol.readSyncMessage(decoder, encoder, room.ydoc, connAsOrigin as never);
            if (encoding.length(encoder) > 1) {
              send(ws, encoding.toUint8Array(encoder));
            }
          } else if (messageType === MESSAGE_AWARENESS) {
            awarenessProtocol.applyAwarenessUpdate(room.awareness, decoding.readVarUint8Array(decoder), ws as never);
            const changedClients = Array.from(room.awareness.getStates().keys());
            const enc = encoding.createEncoder();
            encoding.writeVarUint(enc, MESSAGE_AWARENESS);
            encoding.writeVarUint8Array(enc, awarenessProtocol.encodeAwarenessUpdate(room.awareness, changedClients));
            room.conns.forEach((_, c) => {
              if (c !== ws) send(c, encoding.toUint8Array(enc));
            });
          }
        });

        let pongReceived = true;
        const pingInterval = setInterval(() => {
          if (!pongReceived) {
            ws.terminate();
            clearInterval(pingInterval);
          } else {
            pongReceived = false;
            ws.ping();
          }
        }, PING_INTERVAL_MS);

        const closeConn = () => {
          room.conns.delete(ws);
          clearInterval(pingInterval);
          if (room.conns.size === 0) {
            const t = persistTimeouts.get(docId);
            if (t) {
              clearTimeout(t);
              persistTimeouts.delete(docId);
            }
            const state = Y.encodeStateAsUpdate(room.ydoc);
            DocRepo.updateOne(docId, { yjsState: Buffer.from(state) }).finally(() => {
              room.ydoc.destroy();
              rooms.delete(docId);
            });
          }
        };

        ws.on('close', closeConn);
        ws.on('pong', () => { pongReceived = true; });
      });
    }).catch((err) => {
      logger.error('WS auth error', err);
      socket.destroy();
    });
  });
}
