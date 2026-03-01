# Fast Docs – Project Context

## Overview

Fast Docs is a collaborative markdown editor with GitHub auth, workspace (folders + docs), and persistence. The stack is Next.js (frontend) and Express + Prisma/PostgreSQL (backend). The plan is to add real-time collaboration via CRDT (Yjs).

---

## Auth

- **Backend:** GitHub OAuth (code exchange), JWT access + refresh tokens, keystore per device, signout.
- **Frontend:** Redirect to backend `/auth/github`, callback lands on `/auth/callback` with tokens in hash; tokens in `localStorage`; api-client handles refresh and 401; Sonner for API errors.
- **Routes:** `/auth/github`, `/auth/github/callback`, `/auth/token/refresh`, `/auth/signout`, `/auth/me`.

---

## Workspace & Docs

- **Models:** `User`, `Folder` (tree via `parentId`), `Doc` (optional `folderId`, `orderIndex` for ordering).
- **Backend:** No DB in routes; repos for DB, services for logic. Routes: `GET/POST/PATCH/DELETE /workspace/docs`, `GET/POST/PATCH/DELETE /workspace/folders`, `GET /workspace` (full workspace).
- **Frontend:** WorkspaceContext holds folders + docs; sidebar tree (folders + docs), create/rename/delete, drag-and-drop to move; editor loads doc by id, debounced save.

---

## Doc storage (efficient & CRDT-ready)

- **Goal:** Avoid storing only plain text; support efficient persistence and later real-time CRDT (Yjs) without a big migration.
- **Current structure:**
  - **`content` (text):** Kept as fallback and for search/preview. Still used when `yjsState` is null (e.g. existing docs, simple editor).
  - **`yjs_state` (bytea in DB, base64 in API):** Optional. Stores the **Yjs document state** (binary). When present it is the source of truth for that doc’s CRDT state.
- **API:**
  - **GET /workspace/docs/:id:** Returns `content` always; returns `yjsState` (base64) only when present. Workspace list (`GET /workspace`) omits `yjsState` to keep payload small.
  - **PATCH /workspace/docs/:id:** Accepts optional `content` and optional `yjsState` (base64). Either or both can be sent; backend stores what’s provided.
- **Why this is efficient:** Yjs state is a compact binary representation; storing it avoids re-saving full text on every change and aligns with how Yjs will sync (state-based). Plain text remains for compatibility and search.
- **Later (real-time CRDT):** When adding Yjs + room logic:
  - **Load:** If doc has `yjsState`, decode base64 → apply to `Y.Doc` → bind to editor (and provider). Else init `Y.Doc` from `content`.
  - **Save:** On disconnect or periodically, send `Y.encodeStateAsUpdate(ydoc)` as base64 in `yjsState`; optionally update `content` from `Y.Doc` for search/preview.
  - **Sync:** Same `Y.Doc` can be used with a provider (e.g. y-websocket); server can persist the same `yjs_state` from updates. No need to change the storage shape.

---

## Checklist (current)

- [x] Github Auth Flow in backend  
- [x] Integrate in the frontend, silently refresh the token  
- [x] Store the docs in db  
- [x] Add folder structure and user control (create/rename/delete/move)  
- [x] Doc storage: CRDT-ready (yjs_state in DB; content kept as fallback/snapshot)    
- [ ] Then use CRDT to add the collaboration and add room logic  
- [ ] Handle create/delete of the character and track the user  
- [ ] Build landing page  
- [ ] Deploy and production-ready  

---

## Tech notes

- **Backend:** Express, Prisma (PostgreSQL), Zod validation, auth middleware on protected routes. Repos only touch DB; services contain business logic.
- **Frontend:** Next.js App Router, WorkspaceContext, workspace API module, tree built from flat folders + docs. Editor: CodeMirror; Yjs/y-collab present in codebase for future collaborative mode.
- **Doc identity:** Keys in tree use `folder-${id}` and `doc-${id}` so folders and docs never share the same React key.
