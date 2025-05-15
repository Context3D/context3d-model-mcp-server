import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { debugLog } from "../config/constants.js";
import axios from "axios";
// Default API wrapper URL
const CONTEXT_3D_SERVICE_API = "http://localhost:3000";
/**
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleCheckRodinStatus(args) {
    try {
        const { subscriptionKey } = args;
        // Get API wrapper URL from args or use default
        debugLog("Handling check_status request:", {
            subscriptionKey,
            DEFAULT_API_WRAPPER_URL: CONTEXT_3D_SERVICE_API,
        });
        const response = await axios.post(`${CONTEXT_3D_SERVICE_API}/api/check-status`, {
            subscription_key: subscriptionKey,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const result = response.data;
        return {
            success: true,
            status: {
                progress: result.progress,
                message: result.message,
                finished: result.finished,
                failed: result.failed,
            },
            content: [
                {
                    type: "text",
                    text: `Status for task ${subscriptionKey} :\nProgress: ${result.progress}%\nMessage: ${result.message}\nFinished: ${result.finished}\nFailed: ${result.failed}`,
                },
            ],
            message: `Task status retrieved successfully`,
        };
    }
    catch (error) {
        console.error("Error checking Rodin status:", error);
        // Handle different types of errors
        if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status;
            const errorMessage = error.response?.data?.error || error.message;
            // Map HTTP status codes to appropriate error messages
            if (statusCode === 401) {
                throw new McpError(ErrorCode.InvalidRequest, `Authentication failed: ${errorMessage}`);
            }
            else if (statusCode === 403) {
                throw new McpError(ErrorCode.InvalidRequest, `Access denied: ${errorMessage}`);
            }
            else {
                throw new McpError(ErrorCode.InternalError, `API error: ${errorMessage}`);
            }
        }
        if (error instanceof Error) {
            throw new McpError(ErrorCode.InternalError, `Failed to check Rodin status: ${error.message}`);
        }
        throw new McpError(ErrorCode.InternalError, "An unexpected error occurred");
    }
}
/**
 * Handles the download_rodin_results_with_auth tool request
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleDownloadRodinResults(args) {
    try {
        const { taskUuid } = args;
        debugLog("Handling download_rodin_results_with_auth request:", {
            taskUuid,
        });
        const response = await axios.post(`${CONTEXT_3D_SERVICE_API}/api/download`, {
            task_uuid: taskUuid,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const result = response.data;
        // Format the download links
        const downloadLinks = result.list
            .map((item) => `${item.name}: ${item.url}`)
            .join("\n");
        return {
            success: true,
            downloadUrls: result.list,
            content: [
                {
                    type: "text",
                    text: `Download links for task ${taskUuid}:\n${downloadLinks}`,
                },
            ],
            message: `Found ${result.list.length} files for download`,
        };
    }
    catch (error) {
        console.error("Error downloading Rodin results:", error);
        // Handle different types of errors
        if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status;
            const errorMessage = error.response?.data?.error || error.message;
            // Map HTTP status codes to appropriate error messages
            if (statusCode === 401) {
                throw new McpError(ErrorCode.InvalidRequest, `Authentication failed: ${errorMessage}`);
            }
            else if (statusCode === 403) {
                throw new McpError(ErrorCode.InvalidRequest, `Access denied: ${errorMessage}`);
            }
            else {
                throw new McpError(ErrorCode.InternalError, `API error: ${errorMessage}`);
            }
        }
        if (error instanceof Error) {
            throw new McpError(ErrorCode.InternalError, `Failed to download Rodin results: ${error.message}`);
        }
        throw new McpError(ErrorCode.InternalError, "An unexpected error occurred");
    }
}
