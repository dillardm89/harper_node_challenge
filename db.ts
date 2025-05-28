import { open, RootDatabase } from "lmdb";
import path from "path";
import fs from "fs";

/**
 * Create LMDB Store
 * @param {string} name
 * @returns {RootDatabase<T>}
 */
export function createDB<T>(name: string = "Users"): RootDatabase<T> {
    // Configure data directory
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    // Create LMDB store
    return open({
        path: dataDir,
        name,
        compression: true
    }) as RootDatabase<T>;
}
