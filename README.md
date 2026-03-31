# Alumni Association Platform

A full-stack alumni networking platform with role-based dashboards, jobs, events, chat, notifications, and an AI chatbot.

## Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- Three.js (`@react-three/fiber`, `@react-three/drei`)
- Socket.IO client

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Socket.IO
- Dialogflow integration
- Swagger API docs

## Core Features
- Role-based authentication (`admin`, `alumni`, `student`)
- Separate dashboard pages for each user type
- Job posting and job applications
- Event management
- Realtime chat and message models
- Notification system
- AI chatbot (Dialogflow)

## Project Structure

```text
.
|- src/                 # Frontend app (React + TypeScript)
|- server/              # Backend API (Express + MongoDB)
|- public/              # Static assets
|- package.json         # Root scripts (run client + server)
```

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB instance (local or cloud)

## Environment Setup

### 1) Backend env
Create `server/.env` from `server/.env.example`.

Required values:
- `NODE_ENV`
- `PORT`
- `CLIENT_ORIGIN`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `DIALOGFLOW_PROJECT_ID`
- `DIALOGFLOW_CLIENT_EMAIL`
- `DIALOGFLOW_PRIVATE_KEY`

### 2) Frontend env (optional)
You can set `VITE_API_URL` for custom API URL routing. If not set, the app uses sensible defaults from `src/lib/apiBase.ts`.

## Install

Install dependencies in both root and server folders:

```bash
npm install
npm --prefix server install
```

## Run (Development)

Start frontend + backend together:

```bash
npm run dev
```

Default URLs:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Swagger docs: http://localhost:5000/api/v1/docs

## Available Scripts

### Root (`package.json`)
- `npm run dev` - Run client and server concurrently
- `npm run dev:client` - Run frontend only
- `npm run dev:server` - Run backend only
- `npm run build` - Build frontend
- `npm run preview` - Preview production build

### Server (`server/package.json`)
- `npm --prefix server run dev` - Run backend with watch mode
- `npm --prefix server run start` - Run backend in normal mode
- `npm --prefix server run seed` - Seed sample data

## Seed Data

```bash
npm --prefix server run seed
```

Sample accounts created by the seed script:
- `admin@alumni.com` / `Admin@1234`
- `alumni@alumni.com` / `Alumni@1234`
- `student@alumni.com` / `Student@1234`

## API Base
- Base path: `/api/v1`

## Notes
- Vite dev proxy forwards `/api` traffic to `http://localhost:5000`.
- Socket auth uses JWT tokens.
