import { faker } from "@faker-js/faker";
import { type User } from '../models/user';

/**
 * Function to create fake users when seeding DB
 * @param {string} id - unique id for the user
 * @returns {User} - fake user
 */
export function createFakeUser(id: string): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const age = faker.number.int({ min: 18, max: 80 });
    const active = faker.datatype.boolean();

    const newUser: User = { id, firstName, lastName, email, age, active };
    return newUser;
}
