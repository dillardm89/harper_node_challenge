import { IncomingMessage as Request } from "http";
import { parse } from "url";

// Type for parsed queries
interface ParsedQuery {
    startKey?: string;
    limit?: number;
}

/**
 * Parses query params and pads startKey to match key format
 * @param {Request} req - http request
 * @param {number} maxDigits - number of digits to pad user ID
 * @returns {ParsedQuery}
 */
export function parseQuery(req: Request, maxDigits: number): ParsedQuery {
    const urlParts = parse(req.url || "", true);
    const { startKey, limit } = urlParts.query;

    let paddedStartKey: string | undefined = undefined;
    if (typeof startKey === "string") {
        // Match format of "user:" followed by zero-padded number
        const match = startKey.match(/^user:(\d+)$/);
        if (match) {
            const userId = match[1];
            const paddedId = userId.padStart(maxDigits, "0");
            paddedStartKey = `user:${paddedId}`;
        } else {
            paddedStartKey = startKey;
        }
    }

    return {
        startKey: paddedStartKey,
        limit: typeof limit === "string" ? parseInt(limit, 10) : undefined,
    };
}
