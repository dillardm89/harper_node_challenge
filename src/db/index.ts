import { open, RootDatabase } from "lmdb";
import fs from "fs";
import { log } from "../utils/log";
import { DATA_DIR } from "../utils/vars";

/**
 * Create and return LMDB Store
 * @template T
 * @param {string} dbName
 * @returns {RootDatabase<T>}
 */
export function createDB<T>(dbName: string): RootDatabase<T> {
  // Configure data directory
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    log.error("Failed to create data directory:", err);
    throw err;
  }

  // Create LMDB store
  return open({
    path: DATA_DIR,
    name: dbName,
    compression: true,
  }) as RootDatabase<T>;
}
