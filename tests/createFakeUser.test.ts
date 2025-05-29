import { createFakeUser } from "../src/scripts/createFakeUser";
import { expectedUserShape } from './helpers/expectedUserShape';

describe("createFakeUser", () => {
    const id = "0001";

    it("Should create a user with expected fields", () => {
        const user = createFakeUser(id);

        expect(user).toMatchObject(expectedUserShape);
        expect(user.id).toBe(id);
        expect(user.age).toBeGreaterThanOrEqual(18);
        expect(user.age).toBeLessThanOrEqual(80);
    });

    it("Generates 100 valid users with consistent structure and valid values", () => {
        const users = Array.from({ length: 100 }, (_, i) =>
            createFakeUser(i.toString().padStart(4, "0"))
        );

        for (const user of users) {
            expect(user).toMatchObject(expectedUserShape);
            expect(user.age).toBeGreaterThanOrEqual(18);
            expect(user.age).toBeLessThanOrEqual(80);
        }
    });

    it("Creates 10,000 users under 500ms", () => {
        const start = Date.now();
        Array.from({ length: 10000 }, (_, i) => createFakeUser(i.toString()));
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(500);
    });
});
