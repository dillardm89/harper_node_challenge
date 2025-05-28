import http, { IncomingMessage as Request, ServerResponse as Response } from "http";
import { parse } from "url";
import { createDB } from "../db";
import { streamUsers } from './streamUsers';
import { log } from "../utils/logs/log";
import { type User } from "../models/user";

// Config
const PORT: number = parseInt(process.env.PORT || "3000", 10);
const dbName = process.env.SEED_DB_NAME || "Users";
const db = createDB<User>(dbName);

// Create HTTP server
const server: http.Server = http.createServer(async (req: Request, res: Response) => {
  try {
    // Parse pathname
    const { pathname } = parse(req.url || "", true);

    if (pathname === "/" && req.method === "GET") {
      // Set response header
      res.writeHead(200, { "Content-Type": "application/json" });

      // Stream Users
      await streamUsers(db, req, res);
    } else {
      // Handle invalid request method and route
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  } catch (error) {
    log.error("Unhandled error in server:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
    }
    res.end("Internal Server Error");
  }
});

// Start the server
server.listen(PORT, () => {
  log.info(`Server is running at http://localhost:${PORT}`);
});
