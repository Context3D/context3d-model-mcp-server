import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { debugLog } from "../config/constants.js";
import { checkStatus, downloadResults, generate3DModel, } from "../services/api.js";
import { createDirectory, listDirectory, readFile, writeFile, } from "../tools/file-system.js";
/**
 * Handles the generate_3d_model tool request
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleGenerate3DModel(args) {
    try {
        debugLog("Handling generate_3d_model request:", { args });
        const result = await generate3DModel(args);
        const taskUuid = result.uuid;
        const subscriptionKey = result.jobs.subscription_key;
        return {
            success: true,
            taskUuid,
            subscriptionKey,
            content: [
                {
                    type: "text",
                    text: `generating 3d model :${taskUuid}:\n check_status when all jobs success then exec download_model`,
                },
            ],
            message: "3D Model generating",
        };
    }
    catch (error) {
        console.error("Error generating 3D model:", error);
        if (error instanceof Error) {
            throw new McpError(ErrorCode.InternalError, `Failed to generate 3D model: ${error.message}`);
        }
        throw new McpError(ErrorCode.InternalError, "An unexpected error occurred");
    }
}
/**
 * Handles the check status request
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleCheckStatus(args) {
    try {
        debugLog("Handling check status:");
        const result = await checkStatus(args);
        return {
            success: true,
            result,
            content: [
                {
                    type: "text",
                    text: `if all jobs status is Done, exec download_model`,
                },
            ],
            message: "Check job status",
        };
    }
    catch (error) {
        console.error("Check status:", error);
        if (error instanceof Error) {
            throw new McpError(ErrorCode.InternalError, `Failed to Check status:: ${error.message}`);
        }
        throw new McpError(ErrorCode.InternalError, "An unexpected error occurred");
    }
}
/**
 * Handles handle Download model
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleDownload(args) {
    try {
        debugLog("Handling generate_3d_model request:");
        const result = await downloadResults(args);
        return result;
    }
    catch (error) {
        console.error("handle Download model:", error);
        if (error instanceof Error) {
            throw new McpError(ErrorCode.InternalError, `Failed Download: ${error.message}`);
        }
        throw new McpError(ErrorCode.InternalError, "An unexpected error occurred");
    }
}
/**
 * Handles the read_file tool request
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleReadFile(args) {
    try {
        const content = await readFile(args.path);
        return {
            success: true,
            content: [{ type: "text", text: content }],
            message: `File read successfully from: ${args.path}`,
        };
    }
    catch (error) {
        console.error("Error reading file:", error);
        throw new McpError(ErrorCode.InternalError, `Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Handles the write_file tool request
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleWriteFile(args) {
    try {
        const message = await writeFile(args.path, args.content);
        return {
            success: true,
            content: [{ type: "text", text: message }],
            message: `File saved to: ${args.path}`,
        };
    }
    catch (error) {
        console.error("Error writing file:", error);
        throw new McpError(ErrorCode.InternalError, `Failed to write file: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Handles the list_directory tool request
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleListDirectory(args) {
    try {
        const formatted = await listDirectory(args.path);
        return {
            success: true,
            content: [{ type: "text", text: formatted }],
            message: `Listed directory: ${args.path}`,
        };
    }
    catch (error) {
        console.error("Error listing directory:", error);
        throw new McpError(ErrorCode.InternalError, `Failed to list directory: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Handles the create_directory tool request
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleCreateDirectory(args) {
    try {
        const message = await createDirectory(args.path);
        return {
            success: true,
            content: [{ type: "text", text: message }],
            message: `Created directory: ${args.path}`,
        };
    }
    catch (error) {
        console.error("Error creating directory:", error);
        throw new McpError(ErrorCode.InternalError, `Failed to create directory: ${error instanceof Error ? error.message : String(error)}`);
    }
}
