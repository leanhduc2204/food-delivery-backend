import app from "./app";
import dotenv from "dotenv";
import { createServer } from "http";

dotenv.config();

const requiredEnv = ["DATABASE_URL", "JWT_SECRET"] as const;
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.warn(
    `Warning: missing env vars: ${missing.join(", ")}. Set them in .env (see .env.example).`
  );
}

const PORT = process.env.PORT || 3000;

// Create HTTP server (allows for socket.io upgrade later)
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
