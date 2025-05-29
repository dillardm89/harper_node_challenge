import cluster from "cluster";
import { createServer } from "./index";
import { log } from "../utils/log";
import { CLUSTER_COUNT, PORT } from "../utils/vars";

// Create cluster of servers
if (cluster.isPrimary) {
    log.info(`Max allowed worker count: ${CLUSTER_COUNT}`);
    log.info(`Master PID ${process.pid} is running`);

    for (let i = 0; i < CLUSTER_COUNT; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        log.error(`Worker ${worker.process.pid} exited (code: ${code}, signal: ${signal}). Restarting...`);
        cluster.fork();
    });
} else {
    const server = createServer();
    server.listen(PORT, () => {
        log.info(`Worker PID ${process.pid} is running on port ${PORT}`);
    });
}
