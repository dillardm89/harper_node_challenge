import { RootDatabase } from "lmdb";
import { IncomingMessage as Request, ServerResponse as Response } from "http";
import { log } from "../utils/log";
import { parseQuery } from "../utils/parseQuery";
import { MAX_DIGITS } from "../utils/vars";
import { UserSchema, type User } from "../models/user";

/**
 * Stream users from db, handling back-pressure and connection closure
 * @param {RootDatabase<User>} db
 * @param {Request} req
 * @param {Response} res
 */
export async function streamUsers(db: RootDatabase<User>, req: Request, res: Response): Promise<void> {
    const { startKey, limit, filters } = parseQuery(req, MAX_DIGITS);

    let isFirst = true; // Flag for handling comma placement
    let connectionClosed = false; // Tracks if client disconnects

    // Create an async interator over LMDB entries based on url query
    const iterator = db.getRange({
        start: startKey,
        limit
    }) as unknown as AsyncIterableIterator<{ key: string; value: User }>;

    // Listen for the "close" event
    req.on("close", () => {
        connectionClosed = true;
        iterator.return?.();
        log.info("Connection closed by client. Stream ended.");
    });

    // Start JSON array
    res.write("[");

    try {
        // Loop through all key-value pairs in db and append to response
        for await (const { key, value } of iterator) {
            // Stop if connection closed
            if (connectionClosed) {
                break;
            }

            // Check data against user schema
            const result = UserSchema.safeParse(value);
            if (!result.success) {
                log.error(`Schema validation failed for key ${String(key)}:`, result.error.issues);
                continue;
            }

            // Filter user data
            const user = result.data;
            if (filters) {
                if (filters.ageMin !== undefined && user.age < filters.ageMin) {
                    continue;
                }

                if (filters.ageMax !== undefined && user.age > filters.ageMax) {
                    continue;
                }
            }

            // Serialize validated user data
            const newEntry = JSON.stringify({ key, value: user });

            // Handle comma placement
            if (!isFirst) {
                res.write(",");
            } else {
                isFirst = false;
            }

            // Attempt to write to response or wait for "drain" event to handle back-pressure
            if (!res.write(newEntry)) {
                await new Promise<void>((resolve) => res.once("drain", resolve));
            }
        }

        // Handle end of data stream
        if (!connectionClosed) {
            res.write("]");
            res.end();
            log.info("Finished JSON response stream");
        }
    } catch (err) {
        log.error("Error during streaming:", err);
        if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
        }
    }
}
