import http, { IncomingMessage as Request, ServerResponse as Response } from "http";
import { parse } from "url";
import { createDB } from "../db";
import { streamUsers } from './streamUsers';
import { log } from "../utils/log";
import { DB_NAME, PORT } from "../utils/vars";
import { type User } from "../models/user";

/**
 * Create http server with Get "/" endpoint for streaming users from db
 * @returns {http.Server}
 */
export function createServer(): http.Server {
  const db = createDB<User>(DB_NAME);

  // Create HTTP server
  const server: http.Server = http.createServer(async (req: Request, res: Response) => {
    try {
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

  return server;
}

// Start the server if running directly
if (require.main === module) {
  const server = createServer();
  server.listen(PORT, () => {
    log.info(`Server is running at http://localhost:${PORT}`);
  });
}
