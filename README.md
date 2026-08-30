# Taskline

A full-stack task management dashboard built with the MERN stack (MongoDB, Express, React, Node.js). Users can register, log in, and manage their own tasks — complete with status, priority, due dates, and optional file attachments — all scoped so nobody can see or touch another user's data.

## Features

- **Authentication** — register/login with hashed passwords (bcrypt) and JWT-based sessions
- **Persistent sessions** — stays logged in across page refreshes; auto-logout if the token is ever rejected
- **Task CRUD** — create, read, update, and delete tasks, each one owned by the logged-in user
- **Ownership enforcement** — every task route checks that the task actually belongs to the requesting user before allowing access
- **File attachments** — attach an image, PDF, or Word doc to a task (5MB limit, type-restricted) via Multer
- **Filtering** — filter tasks by status (`todo`, `in-progress`, `done`) and priority (`low`, `medium`, `high`)
- **Dashboard overview** — task counts by status and a "recent tasks" view

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router v6
- Axios (with request/response interceptors for auth)
- Tailwind CSS v4

**Backend**
- Node.js + Express 4
- MongoDB with Mongoose 8
- JSON Web Tokens (`jsonwebtoken`) for auth
- `bcryptjs` for password hashing
- `multer` for file uploads
- `cors`, `dotenv`

## Prerequisites

- Node.js (v18 or newer recommended)
- A MongoDB connection string (local MongoDB or a MongoDB Atlas cluster)

## Project Structure

```
taskline/
├── backend/
│   ├── server.js          # entry point — connects DB, sets up Express, mounts routes
│   ├── models.js          # Mongoose schemas: User, Task
│   ├── middleware.js      # JWT "protect" check + Multer upload config
│   ├── routes.auth.js     # register / login / me
│   ├── routes.tasks.js    # task CRUD, all routes protected + ownership-checked
│   └── uploads/           # stored task attachments
│
└── frontend/
    ├── src/
    │   ├── api.js          # axios instance + every backend request
    │   ├── auth.jsx        # auth context (useAuth hook)
    │   ├── ui.jsx           # shared UI: Button, Badge, Modal, TaskCard, AppShell, etc.
    │   ├── TaskForm.jsx     # create/edit task form
    │   ├── App.jsx / main.jsx
    │   └── pages/           # Login, Register, Dashboard, TaskList, TaskDetail
    └── ...
```

## Installation & Setup

**1. Clone the repo**
```bash
git clone <your-repo-url>
cd taskline
```

**2. Backend setup**
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=5000
```

**3. Frontend setup**
```bash
cd frontend
npm install
```

## Running the App

**Backend** (from `backend/`):
```bash
npm run dev
```
Runs on `http://localhost:5000`.

**Frontend** (from `frontend/`):
```bash
npm run dev
```
Runs on `http://localhost:5173`.

Open `http://localhost:5173` in your browser once both are running.

## API Endpoints

| Method | Endpoint              | Description                          | Auth required |
|--------|------------------------|---------------------------------------|:--:|
| POST   | `/api/auth/register`   | Create a new account                  | No |
| POST   | `/api/auth/login`      | Log in, returns a JWT                 | No |
| GET    | `/api/auth/me`         | Get the logged-in user                | Yes |
| GET    | `/api/tasks`           | List my tasks (supports `?status=` & `?priority=`) | Yes |
| GET    | `/api/tasks/:id`       | Get a single task                     | Yes |
| POST   | `/api/tasks`           | Create a task (multipart, optional attachment) | Yes |
| PUT    | `/api/tasks/:id`       | Update a task                         | Yes |
| DELETE | `/api/tasks/:id`       | Delete a task                         | Yes |
| GET    | `/api/health`          | Health check                          | No |

## Author

Built by Turrab as part of a MERN stack internship project.