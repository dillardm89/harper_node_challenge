import cliProgress from "cli-progress";
import { createDB } from "../db";
import { createFakeUser } from "./createFakeUser";
import { log } from "../utils/log";
import { NUM_RECORDS, DB_NAME, MAX_DIGITS } from "../utils/vars";
import { type User } from "../models/user";

// Config
const db = createDB<User>(DB_NAME);

/**
 * Seed db with fake user data
 * @returns {Promise<void>}
 */
async function seedDB(): Promise<void> {
  log.info(`Seeding ${NUM_RECORDS} users into LMDB using transactions...`);

  // Create progress bar
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(NUM_RECORDS, 0);

  try {
    const batchSize = 100;

    for (let i = 0; i < NUM_RECORDS; i += batchSize) {
      // Create array of users for batch loading
      const batch: User[] = Array.from({ length: Math.min(batchSize, NUM_RECORDS - i) }, (_, j) => {
        const paddedId = String(i + j + 1).padStart(MAX_DIGITS, "0");
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
    log.info(`Successfully seeded ${NUM_RECORDS} users.`);
  } catch (err) {
    bar.stop();
    log.error("Error seeding data:", err);
    throw err;
  }
}

// Call function
seedDB();
