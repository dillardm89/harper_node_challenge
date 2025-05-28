import { open, RootDatabase } from "lmdb";
import path from "path";
import fs from "fs";
import { log } from '../utils/logs/log';

// Root directory for all LMDB data files, can be changed via LMDB_DATA_DIR in env variables
const dataDir = process.env.LMDB_DATA_DIR || path.join(__dirname, "data");

/**
 * Create and return LMDB Store
 * @template T - type of the values stored in the db
 * @param {string} name - name of db
 * @returns {RootDatabase<T>} - typed RootDatabase instance
 */
export function createDB<T>(name: string): RootDatabase<T> {
  // Configure data directory
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err) {
    log.error("Failed to create data directory:", err);
    throw err;
  }

  // Create LMDB store
  return open({
    path: dataDir,
    name,
    compression: true,
  }) as RootDatabase<T>;
}

export { dataDir };
