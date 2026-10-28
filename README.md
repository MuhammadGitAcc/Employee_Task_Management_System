# Employee Task Management Platform

A full-stack web app for managing team work: tasks, employees, comments, notifications and live team chat, with role-based access.

## Features

- **Tasks**: create, edit, delete, search, filter (status, priority, assignee), sort by due date, overdue and due-soon highlighting, Kanban board with drag and drop
- **Task details**: comments and a full activity history, written by the server
- **Employees**: directory with roles; Admins add, edit and remove employees, change roles and reset passwords
- **Dashboard**: stat cards, charts (by status, priority, employee), "my tasks" and upcoming deadlines
- **Notifications**: a bell for tasks assigned to you and tasks due soon
- **Chat**: three channels (General, Tasks, Announcements); messages are saved in the database and arrive live over a WebSocket, with automatic reconnect
- **Accounts and roles**: open sign-up (every new account is an Employee), JWT login, change password; Admin, Manager and Employee permissions
- **UI**: dark mode, responsive layout with a mobile menu, loading skeletons, empty and error states, keyboard and screen-reader support

## Roles

| Action                            | Admin | Manager | Employee |
| --------------------------------- | :---: | :-----: | :------: |
| View tasks and chat               |  yes  |   yes   |   yes    |
| Move a task (status)              |  yes  |   yes   |   yes    |
| Comment on a task                 |  yes  |   yes   |   yes    |
| Change your own password          |  yes  |   yes   |   yes    |
| Create and edit tasks             |  yes  |   yes   |    no    |
| Delete tasks                      |  yes  |   no    |    no    |
| Add and edit employees            |  yes  |   no    |    no    |
| Remove employees, reset passwords |  yes  |   no    |    no    |

## Tech stack

| Part     | Technology                                                                |
| -------- | ------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 3, React Router 6              |
| Backend  | Node 22, Express 5, TypeScript, zod, JWT (jose), bcryptjs, ws (WebSocket) |
| Database | PostgreSQL (Neon) with Prisma 7                                           |
| Tests    | Vitest, React Testing Library (frontend), Vitest and supertest (backend)  |

## Project structure

```
frontend/   React app (feature-based: src/features, src/components, src/services)
backend/    Express API (routes -> controllers -> services), Prisma schema and migrations
docs/       ARCHITECTURE.md
```

How the pieces fit together (layers, authentication, real time, data model, state) is explained in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Getting started

### Requirements

- Node.js 22 or newer
- A PostgreSQL database. A free [Neon](https://neon.tech) project works well: copy its pooled connection string (`DATABASE_URL`) and its direct connection string (`DIRECT_URL`).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`: set `DATABASE_URL`, `DIRECT_URL` and a `JWT_SECRET` of at least 32 characters. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then create the tables, add the demo data and start the API:

```bash
npm run db:deploy
ALLOW_SEED=true npm run db:seed
npm run dev
```

The API runs on http://localhost:4000 (check http://localhost:4000/api/health).

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

### Demo accounts

Created by `ALLOW_SEED=true npm run db:seed`. The seed refuses to run without `ALLOW_SEED=true` and refuses to run when `NODE_ENV` is `production`. These passwords are public, so run it only on a development database, never on one that holds real data. The live site has no demo accounts: sign up there, and promote the first Admin by hand in Prisma Studio.

| Role     | Email                | Password    |
| -------- | -------------------- | ----------- |
| Admin    | admin@example.com    | admin123    |
| Manager  | manager@example.com  | manager123  |
| Employee | employee@example.com | employee123 |

## Environment variables

Backend (`backend/.env`):

| Variable       | Purpose                                                                |
| -------------- | ---------------------------------------------------------------------- |
| PORT           | API port (default 4000)                                                |
| CORS_ORIGIN    | Allowed frontend origins, comma separated; also limits the chat socket |
| DATABASE_URL   | Postgres connection string used by the API (Neon pooled)               |
| DIRECT_URL     | Postgres direct connection string used by migrations                   |
| JWT_SECRET     | Secret for signing tokens, at least 32 characters                      |
| JWT_EXPIRES_IN | Token lifetime (default 7d)                                            |

Frontend (`frontend/.env`):

| Variable      | Purpose                                                               |
| ------------- | --------------------------------------------------------------------- |
| VITE_APP_NAME | App name shown in the interface                                       |
| VITE_API_URL  | API address ending in /api (the chat socket address is built from it) |

Never commit `.env` files.

## Scripts

Run these inside `frontend/` or `backend/`.

| Script             | Where    | What it does                               |
| ------------------ | -------- | ------------------------------------------ |
| npm run dev        | both     | Start the dev server                       |
| npm run build      | both     | Type-check and build                       |
| npm run lint       | both     | Run ESLint                                 |
| npm test           | both     | Run the tests once                         |
| npm run test:watch | both     | Run the tests in watch mode                |
| npm run format     | frontend | Format the code with Prettier              |
| npm start          | backend  | Run the built API                          |
| npm run db:migrate | backend  | Create and apply a migration (development) |
| npm run db:deploy  | backend  | Apply existing migrations                  |
| npm run db:seed    | backend  | Add demo data (needs ALLOW_SEED=true)      |
| npm run db:studio  | backend  | Open Prisma Studio                         |

Before every commit, `npm run build`, `npm run lint` and `npm test` should pass in both folders.

## Chat and real time

Messages are sent through the REST API and pushed to everyone on the same server through a WebSocket at `/ws`. The first socket message must carry the login token, so the token never appears in the URL. If the connection drops (for example when a free hosting plan puts the server to sleep), the client reconnects by itself with growing delays and reloads the messages it missed.

## Security notes

- Sign-up is open and every new account is an Employee. Only an Admin changes roles.
- Login, sign-up and change password are rate limited (20 failed attempts per 15 minutes per address).
- Removing an employee deactivates the account: the person cannot sign in, their token is refused and their open chat socket is closed. Their comments and chat messages keep their name, and their tasks become unassigned.
- The login token is kept in the browser's localStorage, so a script injected into the page could read it.
- After a password change or reset, old tokens stay valid until they expire (7 days by default).
- The seed refuses to run on production and without `ALLOW_SEED=true`.

## Screenshots

Add screenshots to `docs/screenshots/` and link them here.

## Deployment

The app runs on a free stack: Neon (database), Render (API) and Cloudflare Pages (frontend). Deploy in this order, because each step needs an address from the one before.

Live addresses of this project:

- Frontend: https://employee-task-management-system.pages.dev
- API: https://employee-task-api-rqoo.onrender.com (health check: `/api/health`, database check: `/api/health/db`)
- Code: https://github.com/MuhammadGitAcc/Employee_Task_Management_System

### 1. Database (Neon)

Create the project in the `us-east-2` (Ohio) region and keep both connection strings: pooled (`DATABASE_URL`) and direct (`DIRECT_URL`). From `backend/`, with both set in `backend/.env`, apply the migrations:

```bash
npm run db:deploy
```

A fresh database has no users. Do not run `npm run db:seed` on it: the seed adds demo accounts with well-known passwords, and it refuses to run unless `ALLOW_SEED=true` is set. Instead, sign up on the live site (every new account is an Employee), then open Prisma Studio (`npm run db:studio` in `backend/`), open the `User` table and change the `role` of your own row to `Admin`. Reload the page.

### 2. API (Render)

Create a Web Service from the repository with these settings:

| Setting           | Value                                        |
| ----------------- | -------------------------------------------- |
| Region            | Ohio (US East), next to the Neon project     |
| Root Directory    | `backend`                                    |
| Build Command     | `npm install --include=dev && npm run build` |
| Start Command     | `npm start`                                  |
| Health Check Path | `/api/health`                                |
| Instance Type     | Free                                         |

The build needs the dev dependencies (TypeScript and the Prisma CLI), which is why the build command has `--include=dev`.

Environment variables on Render: `NODE_ENV=production`, `DATABASE_URL` (the pooled string), `JWT_SECRET` (at least 32 characters) and, after step 3, `CORS_ORIGIN`. `JWT_EXPIRES_IN` is optional. Render sets `PORT` itself, and `DIRECT_URL` is only needed for migrations, not on Render.

### 3. Frontend (Cloudflare Pages)

Create a Pages project from the repository:

| Setting                | Value                             |
| ---------------------- | --------------------------------- |
| Root directory         | `frontend`                        |
| Build command          | `npm run build`                   |
| Build output directory | `dist`                            |
| `VITE_API_URL`         | `https://<render-host>/api`       |
| `VITE_APP_NAME`        | Employee Task Management Platform |
| `NODE_VERSION`         | `22`                              |

`VITE_` variables are baked into the build, so after changing one the frontend must be deployed again. The chat socket address (`wss://<render-host>/ws`) is built from `VITE_API_URL`. Pages serves `index.html` for unknown paths when the project has no `404.html`, so refreshing on `/dashboard` works.

### 4. Link the two and check

Set `CORS_ORIGIN` on Render to the Pages address (for example `https://your-project.pages.dev`, with no trailing slash; several origins are separated by commas) and let Render redeploy. This value also limits which sites may open the chat socket. Then check on the live site:

- login works, and a refresh on `/dashboard` still shows the dashboard
- chat messages arrive live for a second user
- a task changed by one user appears for a second user without a refresh
- after the API has slept, the first request shows the "waking up the server" notice

On the free plan Render puts the API to sleep after 15 minutes without traffic, and the first request afterwards takes about a minute. The app shows a "waking up the server" notice during that time.

### 5. Update the live site

Every change travels on its own branch and a Pull Request. The `main` branch is protected: the checks `Frontend` and `Backend` must pass and only squash merge is allowed. After a merge, Cloudflare Pages deploys the frontend, and Render deploys the API when files inside `backend/` changed.

A change with a new database migration needs one extra step: run `npm run db:deploy` in `backend/` against the production database before the merge, because Render does not run migrations by itself. Keep migrations additive and never edit an old one. To roll back, use Cloudflare Pages > Deployments or Render > Deploys and pick the previous deployment; database changes are not rolled back.
