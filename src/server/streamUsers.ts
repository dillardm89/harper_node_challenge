import { RootDatabase } from 'lmdb';
import { IncomingMessage as Request, ServerResponse as Response } from "http";
import { log } from "../utils/logs/log";
import { parseQuery } from '../utils/parseQuery';
import { UserSchema, type User } from '../models/user';

// Config
const NUM_RECORDS: number = parseInt(process.env.NUM_SEED_RECORDS || "200", 10);

// Calculate number of digits needed for zero-padding ID value
export const maxDigits: number = NUM_RECORDS.toString().length + 1;

/**
 * Function to stream users from db,
 * handles back-pression and connection closure
 * @param {RootDatabase<User>} db - instance of user db
 * @param {Request} req - incoming http request
 * @param {Response} res - outgoing http response
 */
export async function streamUsers(db: RootDatabase<User>, req: Request, res: Response): Promise<void> {
    const { startKey, limit } = parseQuery(req, maxDigits);

    let isFirst = true; // Flag for handling comma placement
    let connectionClosed = false; // Tracks if client disconnects

    // Listen for the "close" event
    req.on("close", () => {
        connectionClosed = true;
    });

    // Start JSON array
    res.write("[");

    // Create an async interator over LMDB entries based on url query
    const iterator = db.getRange({
        start: startKey,
        limit
    });

    // Loop through all key-value pairs in db and append to response
    for await (const { key, value } of iterator) {
        // Stop if connection closed
        if (connectionClosed) {
            log.info("Connection closed by client. Stopping stream...");
            break;
        }

        // Check data against user schema
        const result = UserSchema.safeParse(value);
        if (!result.success) {
            log.error(`Schema validation failed for key ${String(key)}:`, result.error.issues);
            continue;
        }

        // Serialize validated user data
        const newEntry = JSON.stringify({ key, value: result.data });

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
}
