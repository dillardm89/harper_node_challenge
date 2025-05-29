import { faker } from "@faker-js/faker";
import { type User } from '../models/user';

/**
 * Create fake users for seeding DB
 * @param {string} id
 * @returns {User}
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
