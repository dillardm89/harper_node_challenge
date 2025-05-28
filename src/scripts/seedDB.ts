import cliProgress from "cli-progress";
import { createDB } from "../db";
import { createFakeUser } from "./createFakeUser";
import { log } from "../utils/logs/log";
import { type User } from "../models/user";

// Config
const NUM_RECORDS: number = parseInt(process.env.NUM_SEED_RECORDS || "200", 10);
const dbName = process.env.SEED_DB_NAME || "Users";
const db = createDB<User>(dbName);

// Calculate number of digits needed for zero-padding ID value
export const maxDigits: number = NUM_RECORDS.toString().length + 1;

/**
 * Function to seed db with dummy User data
 * @returns {Promise<void>}
 */
async function seedDB(): Promise<void> {
  console.log(`Seeding ${NUM_RECORDS} users into LMDB using transactions...`);

  // Create clip progress bar for large seeds
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(NUM_RECORDS, 0);

  try {
    const batchSize = 100;

    for (let i = 0; i < NUM_RECORDS; i += batchSize) {
      // Create array of users for batch loading
      const batch: User[] = Array.from({ length: Math.min(batchSize, NUM_RECORDS - 1) }, (_, j) => {
        const paddedId = String(i + j + 1).padStart(maxDigits, "0");
        return createFakeUser(paddedId)
      });

      // Execute batch as transaction
      db.transaction(() => {
        for (const newUser of batch) {
          const key = `user:${newUser.id}`;
          db.put(key, newUser);
        }
      });

      bar.update(Math.min(1 + batchSize, NUM_RECORDS));
    }

    bar.stop();
    console.log(`Successfully seeded ${NUM_RECORDS} users.`);
  } catch (err) {
    bar.stop();
    log.error("Error seeding data:", err);
    throw err;
  }
}

// Call funciton
seedDB();
