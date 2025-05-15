import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from "@modelcontextprotocol/sdk/types.js";
import { DEBUG } from "../config/constants.js";
import { allowedDirectories } from "../utils/file-system.js";
import { handleCheckStatus, handleCreateDirectory, handleDownload, handleGenerate3DModel, handleListDirectory, handleReadFile, handleWriteFile, } from "./tool-handlers.js";
import { availableTools } from "./tools.js";
/**
 * Initializes and configures the MCP server
 * @returns Configured MCP server instance
 */
export function createServer() {
    // Server initialization
    const server = new Server({
        name: "Context3D",
        version: "1.0.0",
    }, {
        capabilities: {
            tools: {},
        },
    });
    // Define available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: availableTools,
        };
    });
    // Handle tool execution
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const toolName = request.params.name;
        const args = request.params.arguments;
        try {
            switch (toolName) {
                case "generate_model":
                    return {
                        toolResult: await handleGenerate3DModel(args),
                    };
                case "check_status":
                    return {
                        toolResult: await handleCheckStatus(args),
                    };
                case "download_model":
                    return {
                        toolResult: await handleDownload(args),
                    };
                case "read_file":
                    return {
                        toolResult: await handleReadFile(args),
                    };
                case "write_file":
                    return {
                        toolResult: await handleWriteFile(args),
                    };
                case "list_directory":
                    return {
                        toolResult: await handleListDirectory(args),
                    };
                case "create_directory":
                    return {
                        toolResult: await handleCreateDirectory(args),
                    };
                default:
                    throw new McpError(ErrorCode.InternalError, `Unknown tool: ${toolName}`);
            }
        }
        catch (error) {
            console.error(`Error processing ${toolName}:`, error);
            if (error instanceof McpError) {
                throw error;
            }
            throw new McpError(ErrorCode.InternalError, `Error processing request: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
    return server;
}
/**
 * Starts the MCP server
 * @param server Server instance to start
 */
export async function startServer(server) {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Only log in debug mode
    if (DEBUG) {
        console.error("MCP 3D Model generate & Filesystem Server running");
        console.error(`Allowed directories: ${allowedDirectories.join(", ")}`);
    }
}
