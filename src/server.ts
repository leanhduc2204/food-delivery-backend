import app from "./app";
import dotenv from "dotenv";
import { createServer } from "http";

dotenv.config();

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
