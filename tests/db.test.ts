import fs from "fs";
import * as lmdb from "lmdb";
import { createDB } from "../src/db/index"
import { log } from "../src/utils/log";
import { DATA_DIR } from "../src/utils/vars";

// Mock logging to silence during tests
jest.mock("../src/utils/log", () => ({
    log: {
        error: jest.fn(),
        info: jest.fn()
    },
}));

// Mock LMDB module's `open` method to return a fake db instance
jest.mock("lmdb", () => {
    const actual = jest.requireActual("lmdb");
    return {
        ...actual,
        open: jest.fn(() => ({
            put: jest.fn(),
            get: jest.fn(),
            transaction: jest.fn()
        }))
    };
});

describe("createDB", () => {
    const testDBName = "TestDB";

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should create a DB when data directory already exists", () => {
        jest.spyOn(fs, "existsSync").mockReturnValue(true);

        const db = createDB(testDBName);

        expect(fs.existsSync).toHaveBeenCalledWith(DATA_DIR);

        expect(lmdb.open).toHaveBeenLastCalledWith({
            path: DATA_DIR,
            name: testDBName,
            compression: true
        });

        expect(db).toHaveProperty("put");
    });

    it("Shoulder create the data directory if it does not exit", () => {
        jest.spyOn(fs, "existsSync").mockReturnValue(false);

        const mkdirSpy = jest.spyOn(fs, "mkdirSync").mockImplementation(() => DATA_DIR);

        createDB(testDBName);

        expect(mkdirSpy).toHaveBeenLastCalledWith(DATA_DIR, { recursive: true });
    });

    it("Should log and throw an error if directory creation fails", () => {
        jest.spyOn(fs, "existsSync").mockReturnValue(false);

        const errorMessage = "Permission denied";
        const mkdirError = new Error(errorMessage);
        jest.spyOn(fs, "mkdirSync").mockImplementation(() => {
            throw mkdirError;
        });

        expect(() => createDB(testDBName)).toThrow(errorMessage);
        expect(log.error).toHaveBeenLastCalledWith("Failed to create data directory:", mkdirError);
    });
});
