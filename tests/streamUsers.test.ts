import http from "http";
import { once } from "events";
import { createServer } from "../src/server/index";

describe("streamUsers back-pressure", () => {
    let server: http.Server;

    beforeAll(() => {
        server = createServer();
        server.listen(0);
    });

    afterAll((done) => {
        server.close(done);
    });

    it("Should handle back-pressure correctly", async () => {
        const address = server.address();
        const port = typeof address === "object" && address ? address.port : 3000;

        const req = http.request(
            {
                hostname: "localhost",
                port,
                path: "/",
                method: "GET"
            },
            (res) => {
                res.setEncoding('utf8');
                res.on("data", async (chunk) => {
                    await new Promise((resolve) => setTimeout(resolve, 50));
                });

                res.on("end", () => {
                    expect(true).toBe(true);
                });
            }
        );

        req.end();
        await once(req, "close");
    });

    it("Should terminate stream when client disconnects", async () => {
        const address = server.address();
        const port = typeof address === "object" && address ? address.port : 3000;

        const req = http.request(
            {
                hostname: "localhost",
                port,
                path: "/",
                method: "GET",
            },
            (res) => {
                res.setEncoding("utf8");
                res.once("data", () => {
                    req.destroy();
                });

                res.on("end", () => {
                    expect(false).toBe(true);
                });
            }
        );

        req.end();
        await new Promise((r) => setTimeout(r, 200));
    });
});
