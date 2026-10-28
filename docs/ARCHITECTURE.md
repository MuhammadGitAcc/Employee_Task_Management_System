# Architecture

This document explains how the app is built and why. For setup and scripts, see the main [README](../README.md).

## Overview

```
 Browser (React)                         Server (Express)                 Database
+---------------------+   REST /api    +--------------------------+     +------------+
| pages and features  | -------------> | routes -> controllers -> | --> | PostgreSQL |
| services/api.ts     | <------------- | services (Prisma)        | <-- | (Neon)     |
|                     |                |                          |     +------------+
| chat socket client  | <== WebSocket  | realtime/ (ws, /ws)      |
+---------------------+       /ws      +--------------------------+
```

- The frontend and the backend are two independent apps, each with its own `package.json`.
- All data changes go through the REST API. The WebSocket only pushes events to the browser; it never accepts data.

## Backend (`backend/`)

### Layers

```
routes/        paths, authentication and role checks
controllers/   validate input (zod), call a service, send JSON
services/      Prisma queries and business rules
schemas/       zod schemas (the validation messages match the frontend rules)
middleware/    authenticate, requireRole, 404 and error handler
realtime/      chat.hub.ts (publish / subscribe), socket.server.ts (WebSocket)
utils/         httpError, jwt, validate, request helpers, prismaErrors
lib/prisma.ts  the Prisma client (driver adapter for Postgres)
```

A request goes through `routes -> controllers -> services`. Each layer has one job: routes decide who may call, controllers check the input, services talk to the database. Errors are thrown as `HttpError` and turned into JSON by one error handler: `{ error: { message, details } }`. In production, 500 errors hide their details.

### Endpoints

| Path                                    | Methods   | Who                           |
| --------------------------------------- | --------- | ----------------------------- |
| `/api/health`, `/api/health/db`         | GET       | anyone                        |
| `/api/auth/register`, `/api/auth/login` | POST      | anyone (rate limited)         |
| `/api/auth/me`                          | GET       | signed-in user                |
| `/api/auth/password`                    | PUT       | signed-in user (rate limited) |
| `/api/users`                            | GET       | any signed-in user            |
| `/api/users`, `/api/users/:id`          | POST, PUT | Admin                         |
| `/api/users/:id`                        | DELETE    | Admin (deactivates)           |
| `/api/users/:id/password`               | PUT       | Admin                         |
| `/api/tasks`                            | GET       | any signed-in user            |
| `/api/tasks`, `/api/tasks/:id`          | POST, PUT | Admin, Manager                |
| `/api/tasks/:id/status`                 | PATCH     | any signed-in user            |
| `/api/tasks/:id`                        | DELETE    | Admin                         |
| `/api/tasks/:id/comments`               | GET, POST | any signed-in user            |
| `/api/tasks/:id/activity`               | GET       | any signed-in user            |
| `/api/chat/:channelId/messages`         | GET, POST | any signed-in user            |

### Authentication

- `POST /api/auth/login` checks the password with bcrypt and returns a signed token (JWT, HS256, library `jose`) and the user.
- The frontend sends the token as `Authorization: Bearer <token>`.
- `authenticate` reads the user from the database on every request, so a deleted user or a changed role takes effect at once.
- `requireRole(...)` protects routes by role. The frontend has the same rules in `features/auth/permissions.ts`, but only to hide buttons; the server is the real guard.
- `POST /api/auth/register` creates an Employee (a role sent by the client is ignored) and signs the user in like login. `PUT /api/auth/password` changes your own password: the current one is required, and a wrong one answers 400, never 401, because the frontend signs the user out on any 401.
- Login, register and change password share one rate limiter: 20 failed attempts per 15 minutes per address (successful requests are not counted). The API trusts one proxy (`trust proxy` 1) because it sits behind Render.
- `DELETE /api/users/:id` (Admin) deactivates an employee: `active` becomes false and their tasks become unassigned. From then on their login is refused, their token is refused (401) and their open socket is closed. Their email stays reserved. `PUT /api/users/:id/password` (Admin) resets a password.

### Real time

- The socket path is `/ws`. The first message from the client must be `{ "type": "auth", "token": ... }`, so the token never appears in the URL or in logs.
- The server answers `{ "type": "ready" }`. After that, every authenticated socket receives the events that services and controllers publish through `chat.hub.ts`.
- Events:
  - `message`: a chat message was saved (carries the message).
  - `tasks-changed`: a task was created, edited, moved or deleted (carries nothing; clients load the list again).
  - `user-removed`: an employee was removed. It stays inside the server: the socket server closes that user's sockets with 4401 and never sends this event to clients.
- Close codes: 4401 (bad token, unknown user, or no auth within 5 seconds) and 4403 (origin not in `CORS_ORIGIN`). A ping every 30 seconds removes dead connections.
- The hub keeps services free of any `ws` code, so they stay easy to test.

### Data model (Prisma)

```
User ──< Task (assignee)
User ──< TaskComment ──> Task
User ──< TaskActivity ──> Task
User ──< ChatMessage
```

- `User` is also the employee directory (name, email, role, password hash, `active` flag). Removing an employee sets `active` to false instead of deleting the row, so their comments, activity entries and chat messages keep their name; their tasks become unassigned (`assigneeId` is null).
- `Task`: title, description, status, priority, due date (a date, no time), assignee.
- Comments and activity entries are deleted together with their task.
- The server writes the activity entries ("changed status from ... to ...").
- Enums: `Role` (Admin, Manager, Employee), `TaskStatus` (To Do, In Progress, Done), `TaskPriority`. `task.mapper.ts` converts between the database labels and the API strings.

## Frontend (`frontend/`)

### Folders

```
src/app/          App, router (all routes in one file), providers, error and 404 pages
src/components/   layout/ (AppLayout, Navbar, ...) and ui/ (Button, Modal, Toast, ...)
src/features/     auth, tasks, employees, dashboard, chat, profile, notifications
src/services/     api client and one file per API area, chat socket, legacy cleanup
src/hooks/        shared hooks (useTheme)
src/utils/        env and date helpers
src/styles/       global CSS
```

Each feature keeps its pages, components, hooks, types and tests together. Tests sit next to the code (`*.test.ts`, `*.test.tsx`). The `~` alias points to `src/`.

### State

| What                  | Where                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------- |
| Logged-in user        | `AuthProvider`: token in localStorage, user refreshed from `/api/auth/me` on load       |
| Tasks                 | `TasksProvider`: one shared list for all pages; changes apply after the server confirms |
| Employees             | `useEmployees`: loads from the API for the page that needs it                           |
| Comments and activity | `useTaskDetails`: loads for the open task                                               |
| Chat messages         | `useChat`: loads the open channel and merges messages pushed over the socket            |
| Notifications         | derived from the shared tasks; the read state is saved per user in localStorage         |
| Theme                 | `useTheme`: saved in localStorage, follows the device setting on the first visit        |

No app data is kept in localStorage any more. Only the token, the session, the theme and the notification read state are.

### API client

`services/api.ts` wraps `fetch`: it adds the token, parses JSON errors into an `ApiError` (status, message, details), handles 204, and logs the user out when the server rejects the token. A request open for more than 3 seconds shows "waking up the server", because the free host sleeps when idle.

### Live updates

`services/chatSocket.ts` opens the socket, sends the token, reports `connecting / open / closed`, and reconnects with growing delays (1, 2, 5, 10, then 15 seconds) without giving up. It does not retry after 4401 or 4403.

Two places use it:

- `TasksProvider` (for the whole app): on `tasks-changed` it loads the tasks again without skeletons, and it loads them again after a reconnect to catch what was missed.
- `useChat` (Chat page only): merges pushed messages and loads the channel again after a reconnect.

### Loading, empty and error states

Pages show skeletons while loading, an `EmptyState` when there is nothing to show, and an `ErrorState` with a "Try again" button when a request fails. `ErrorBoundary` wraps the app and `RouteError` keeps the Navbar visible when one page crashes. Routes are lazy-loaded, so each page is its own chunk.

## Testing

- Backend: Vitest and supertest with a mocked Prisma client; no real database is touched.
- Frontend: Vitest and React Testing Library with a fake `WebSocket` for the socket code.
- Before every commit, run `npm run build`, `npm run lint` and `npm test` in both folders.

## Known limits

- The free API host sleeps after 15 minutes without traffic and needs about a minute to wake up. The socket drops while it sleeps and reconnects by itself.
- Any signed-in user can change a task's status (like the Kanban board). A later tightening is to allow only the assignee.
- The assignee is matched by name in the profile, dashboard and notification logic. A later tightening is to match by `assigneeId`.
- The task list and the chat each open their own socket on the Chat page. A shared socket would be a later refactor.
- The login token is kept in the browser's localStorage, so a script injected into the page could read it. HttpOnly cookies would avoid that, but they need a different CORS and CSRF setup.
- Old tokens stay valid until they expire (7 days by default) after a password change or reset. A fix needs a token version or a "password changed at" timestamp checked in `authenticate`, which is a database migration.
- Local development and the live site share one Neon database (a separate dev branch was skipped on purpose), so `npm run db:migrate` and local runs touch live data. The seed is guarded: it refuses on production and without `ALLOW_SEED=true`.
- Email verification, "forgot password", account lockout and refresh tokens are not built; they need an email service.
- In development mode a 500 response shows the raw error text, which helps debugging. Production hides it, and a test proves it.
