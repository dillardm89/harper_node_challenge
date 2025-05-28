import http, { IncomingMessage as Request, ServerResponse as Response } from "http";
import { User } from "./types";
import { createDB } from './db';

// Configuration
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Create LMDB store
const db = createDB<User>("Users");

// Create HTTP server
const server = http.createServer(async (req: Request, res: Response) => {
    // Handle requests to wrong path
    if (req.url !== '/') {
        res.writeHead(404);
        return res.end("Not Found");
    }

    // Set response header
    res.writeHead(200, { "Content-Type": "application/json" });

    let isFirst = true; // Flag for handling comma placement
    let connectionClosed = false; // Tracks if client disconnects

    // Listen for the "close" event
    req.on('close', () => {
        connectionClosed = true;
    })

    // Start JSON array
    res.write("[");

    // Create an async interator over LMDB entries
    const iterator = db.getRange();

    // Loop through all key-value pairs in db and append to response
    for await (const { key, value } of iterator) {
        // Stop if connection closed
        if (connectionClosed) {
            console.log('Connection closed by client. Stopping stream...');
            break
        }

        // Serialize as JSON
        const newEntry = JSON.stringify({ key, value });

        // Handle comma placement
        if (!isFirst) {
            res.write(",");
        } else {
            isFirst = false;
        }

        // Attempt to write to response or wait for "drain" event to handle back-pressure
        if (!res.write(newEntry)) {
            await new Promise<void>(resolve => res.once("drain", resolve));
        }
    }

    // Handle end of data stream
    if (!connectionClosed) {
        res.write("]");
        res.end();
        console.log('Finished JSON response stream');
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
