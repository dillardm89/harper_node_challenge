import http from "http";
import { createServer } from "../src/server/index";
import { streamUsers } from '../src/server/streamUsers';
import * as dbModule from '../src/db/index';

// Mock streamUsers
jest.mock("../src/server/streamUsers", () => ({
    streamUsers: jest.fn()
}));

// Mock createDB
const mockDB = { getRange: jest.fn() } as any;
jest.spyOn(dbModule, "createDB").mockReturnValue(mockDB);


// Simulate HTTP request/response
function mockRequestResponse(url: string, method = "GET") {
    const req = new http.IncomingMessage(null as any);
    const res = new http.ServerResponse(req);

    req.url = url;
    req.method = method;

    res.write = jest.fn();
    res.end = jest.fn();
    res.writeHead = jest.fn();

    return { req, res };
}

describe("createServer", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should handle Get / and call streamUsers", async () => {
        const { req, res } = mockRequestResponse("/");

        const server = createServer();
        server.emit("request", req, res);

        await new Promise(process.nextTick);
        expect(res.writeHead).toHaveBeenCalledWith(200, { "Content-Type": "application/json" });
        expect(streamUsers).toHaveBeenCalledWith(mockDB, req, res);
    });

    it("Should return 404 for unsupported routes", async () => {
        const { req, res } = mockRequestResponse("/invalid");

        const server = createServer();
        server.emit("request", req, res);

        await new Promise(process.nextTick);

        expect(res.writeHead).toHaveBeenCalledWith(404, { "Content-Type": "text/plain" });
        expect(res.end).toHaveBeenCalledWith("Not Found");
        expect(streamUsers).not.toHaveBeenCalled();
    });

    it("Should return 404 for unsupported methods", async () => {
        const { req, res } = mockRequestResponse("/", "POST");

        const server = createServer();
        server.emit("request", req, res);

        await new Promise(process.nextTick);

        expect(res.writeHead).toHaveBeenCalledWith(404, { "Content-Type": "text/plain" });
        expect(res.end).toHaveBeenCalledWith("Not Found");
        expect(streamUsers).not.toHaveBeenCalled();
    });

    it("Should handle internal errors and return 500", async () => {
        const { req, res } = mockRequestResponse("/");

        // Force streamUsers to throw
        (streamUsers as jest.Mock).mockImplementationOnce(() => {
            throw new Error("Test error");
        });

        const server = createServer();
        server.emit("request", req, res);

        await new Promise(process.nextTick);

        expect(res.writeHead).toHaveBeenCalledWith(500, { "Content-Type": "text/plain" });
        expect(res.end).toHaveBeenCalledWith("Internal Server Error");
    });
});
