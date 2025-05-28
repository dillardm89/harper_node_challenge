import { faker } from "@faker-js/faker";
import { createDB } from './db';
import { type User } from "./types";

// Configuration
const NUM_RECORDS: number = parseInt(process.argv[2], 10) || 100;

// Create LMDB store
const db = createDB<User>("Users");

// Generate fake user
function createFakeUser(id: number): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const age = faker.number.int({ min: 18, max: 80 });
    const active = faker.datatype.boolean();

    return { id, firstName, lastName, email, age, active };
}

// Seed function
async function seedDB(): Promise<void> {
    console.log(`Seeding ${NUM_RECORDS} users into LMDB...`);

    try {
        for (let i = 1; i <= NUM_RECORDS; i++) {
            const newUser: User = createFakeUser(i);
            const key: string = `user:${newUser.id}`;
            await db.put(key, newUser);
        }

        console.log(`Successfully seeded ${NUM_RECORDS} users.`);
    } catch (err) {
        console.error('Error seeding data:', err);
    }
}

// Call function
seedDB();
