import dotenv from "dotenv";
import os from "os";
import path from "path";

// Config
dotenv.config();

// Global Variables
const NUM_RECORDS: number = parseInt(process.env.NUM_SEED_RECORDS || "200", 10);
const PORT = parseInt(process.env.PORT || "3000", 10);
const DB_NAME = process.env.SEED_DB_NAME || "Users";
const DATA_DIR = process.env.LMDB_DATA_DIR || path.join(__dirname, "src/db/data");

// Calculate number of digits needed for zero-padding ID value
const MAX_DIGITS: number = NUM_RECORDS.toString().length + 1;

// Calculate cluster size
const numCPUs = os.cpus().length;
const CLUSTER_COUNT = Math.min(numCPUs, parseInt(process.env.CLUSTER_COUNT || "1", 10));

export { MAX_DIGITS, NUM_RECORDS, CLUSTER_COUNT, PORT, DB_NAME, DATA_DIR };
