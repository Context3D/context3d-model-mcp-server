import dotenv from "dotenv";
import { DEBUG, debugLog } from "./config/constants.js";
import { createServer, startServer } from "./server/server.js";
// Load environment variables
dotenv.config();
async function main() {
    try {
        // Create and start the server
        const server = createServer();
        await startServer(server);
        if (DEBUG) {
            debugLog("Server started successfully");
        }
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
// Start the server
main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
});
