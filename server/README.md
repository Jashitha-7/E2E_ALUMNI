# Alumni Association Platform — Backend

Production-ready Node.js/Express API with MongoDB, JWT auth, Socket.io, and Dialogflow.

## Setup

```bash
cd server
npm install
```

## Environment variables

Create `.env` in server/ using `.env.example`:

- NODE_ENV
- PORT
- CLIENT_ORIGIN
- MONGO_URI
- JWT_SECRET
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- JWT_ACCESS_EXPIRES_IN
- JWT_REFRESH_EXPIRES_IN
- DIALOGFLOW_PROJECT_ID
- DIALOGFLOW_CLIENT_EMAIL
- DIALOGFLOW_PRIVATE_KEY

## Run

```bash
npm run dev
```

Server starts on `http://localhost:5000` (default).

## Seed data

```bash
npm run seed
```

Creates sample users/events/jobs:
- admin@alumni.com / Admin@1234
- alumni@alumni.com / Alumni@1234
- student@alumni.com / Student@1234

## API docs

Swagger UI:
- /api/v1/docs

## Notes

- API base: `/api/v1`
- Socket.io uses JWT access token via `auth.token` or `Authorization` header.
