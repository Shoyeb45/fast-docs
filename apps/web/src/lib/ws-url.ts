/**
 * Build WebSocket base URL and room for Yjs WebsocketProvider(serverUrl, room, doc).
 * Provider connects to baseUrl + '/' + room.
 */
export function getDocWsRoom(docId: number, accessToken: string | null): { baseUrl: string; room: string } {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const baseUrl = base.replace(/^http:\/\//i, "ws://").replace(/^https:\/\//i, "wss://");
  const room = `ws/docs/${docId}${accessToken ? `?token=${encodeURIComponent(accessToken)}` : ""}`;
  return { baseUrl, room };
}
