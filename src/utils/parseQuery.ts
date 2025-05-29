import { IncomingMessage as Request } from "http";
import { parse } from "url";

// Type for parsed queries
interface ParsedQuery {
    startKey?: string;
    limit?: number;
    filters?: {
        ageMin?: number;
        ageMax?: number;
    };
}

/**
 * Parses query params and pads startKey to match db key format
 * @param {Request} req
 * @param {number} maxDigits
 * @returns {ParsedQuery}
 */
export function parseQuery(req: Request, maxDigits: number): ParsedQuery {
    const urlParts = parse(req.url || "", true);
    const { startKey, limit, ageMin, ageMax } = urlParts.query;

    // Pad id with leading zero's for db getRange
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

    // Set filter params
    const filters: ParsedQuery["filters"] = {};
    if (typeof ageMin === "string" && !isNaN(Number(ageMin))) {
        filters.ageMin = parseInt(ageMin, 10);
    }

    if (typeof ageMax === "string" && !isNaN(Number(ageMax))) {
        filters.ageMax = parseInt(ageMax, 10);
    }

    return {
        startKey: paddedStartKey,
        limit: typeof limit === "string" ? parseInt(limit, 10) : undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
}
