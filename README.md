# Food Delivery Backend

Backend API for the food delivery application (Express, TypeScript, Prisma, PostgreSQL).

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, and optional vars.
2. Install: `npm install`
3. Database: `npx prisma migrate deploy` (or `npx prisma migrate dev` in development)
4. Seed (optional): `npx prisma db seed`
5. Run: `npm run dev` (or `npm run build && npm start`)

## Tests

- `npm test` — runs Jest integration tests.
- Tests require a running database and `DATABASE_URL` in `.env`. Health check test does not need DB.

## API docs

- Swagger UI: [http://localhost:3001/api-docs](http://localhost:3001/api-docs) when the server is running.

## Deployment

- Use `npx prisma migrate deploy` to apply migrations (do not use `db push` or `migrate reset` in production).
- Ensure `DATABASE_URL` and `JWT_SECRET` are set in the deployment environment.
