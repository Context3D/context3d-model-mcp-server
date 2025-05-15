import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { debugLog } from "../config/constants.js";
import { createViewerHTML } from "../tools/models.js";
import { ensureDirectoryExists, openInBrowser, saveImageWithProperPath, } from "../utils/file-system.js";
export const API_BASE_URL = "https://api.context3d.ai";
/**
 * Generates a 3D model using the Rodin API
 * @param params Parameters for generating the model
 * @returns Response from the Rodin API
 */
export async function generate3DModel(data) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/generate`, {
            ...data,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        debugLog("Failed to generate:", { error });
        if (axios.isAxiosError(error)) {
            throw new Error(`Failed to generate: ${error.response?.data?.message || error.message}`);
        }
        else {
            console.error("An unexpected error occurred:", error);
            throw new Error("An unexpected error occurred during Rodin generation.");
        }
    }
}
/**
 * Check the status of a generation task
 * @param params Parameters for checking status
 * @returns Response with task status
 */
export async function checkStatus({ subscriptionKey, }) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/check-status`, {
            subscription_key: subscriptionKey,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error checking Rodin status:", error.message);
            console.error("Response data:", error.response?.data);
            throw new Error(`Failed to check Rodin status: ${error.response?.data?.message || error.message}`);
        }
        else {
            console.error("An unexpected error occurred:", error);
            throw new Error("An unexpected error occurred while checking status.");
        }
    }
}
/**
 * Downloads the results of a previously generated model
 * @param params Parameters for downloading the results
 * @returns Response with download URLs for the generated model
 */
export async function downloadResults({ task_uuid }) {
    try {
        // Download results
        const response = await axios.post(`${API_BASE_URL}/api/download`, {
            task_uuid,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const { url, fileName } = response.data;
        const fileResponse = await axios({
            method: "get",
            url,
            responseType: "stream", // Use stream to handle potentially large files
        });
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const outputFileName = `3d-model-${timestamp}.glb`;
        const { savedPath } = await saveImageWithProperPath(fileResponse.data, outputFileName);
        const html = createViewerHTML(url);
        const htmlFileName = `${outputFileName.replace(".glb", "")}_preview.html`;
        const htmlPath = path.join(path.dirname(savedPath), htmlFileName);
        ensureDirectoryExists(path.dirname(htmlPath));
        fs.writeFileSync(htmlPath, html, "utf8");
        try {
            await openInBrowser(htmlPath);
        }
        catch (error) {
            console.warn("Could not open browser automatically:", error);
        }
        return {
            toolResult: {
                success: true,
                modelPath: savedPath,
                content: [
                    {
                        type: "text",
                        text: `Model saved to: ${savedPath}\n`,
                    },
                    {
                        type: "text",
                        text: `view model link: https://www.context3d.ai/preview?url=${url}`,
                    },
                ],
                message: "3D Model generated and saved",
            },
        };
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error downloading Rodin results:", error.message);
            console.error("Response data:", error.response?.data);
            throw new Error(`Failed to download Rodin results: ${error.response?.data?.message || error.message}`);
        }
        else {
            console.error("An unexpected error occurred:", error);
            throw new Error("An unexpected error occurred during Rodin download.");
        }
    }
}
