import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { API_BASE_URL } from "../../config/constants.js";
/**
 * Generates a 3D model using the Rodin API
 * @param params Parameters for generating the model
 * @returns Response from the Rodin API
 */
export async function generateRodin({ images, prompt, tier = "Regular", // Default from docs
geometry_file_format = "glb", // Default from docs
material = "PBR", // Default from docs
quality = "medium", // Default from docs
use_hyper = false, // Default from docs
mesh_mode = "Quad", // Default from docs
mesh_simplify = true, // Default from docs
mesh_smooth = true, // Default from docs
addons = [], // Default from docs
seed, condition_mode = "concat", // Default from docs
TApose = false, // Default from docs
bbox_condition, }) {
    const formData = new FormData();
    // Add prompt for both Image-to-3D and Text-to-3D generation
    formData.append("prompt", prompt);
    // Add images if provided (up to 5 images)
    if (images && images.length > 0) {
        // Add each image to the form data
        for (const imagePath of images.slice(0, 5)) {
            // Limit to max 5 images
            formData.append("images", fs.createReadStream(imagePath));
        }
        // Add condition_mode for multi-image generation
        if (images.length > 1) {
            formData.append("condition_mode", condition_mode);
        }
    }
    // Add all parameters
    formData.append("tier", tier);
    formData.append("geometry_file_format", geometry_file_format);
    formData.append("material", material);
    formData.append("quality", quality);
    formData.append("use_hyperboolean", use_hyper.toString()); // Correct parameter name from docs
    formData.append("mesh_mode", mesh_mode);
    formData.append("mesh_simplify", mesh_simplify.toString());
    formData.append("mesh_smooth", mesh_smooth.toString());
    // Add optional parameters if provided
    if (seed !== undefined) {
        formData.append("seed", seed.toString());
    }
    if (TApose !== undefined) {
        formData.append("TApose", TApose.toString());
    }
    if (bbox_condition && bbox_condition.length === 3) {
        formData.append("bbox_condition", JSON.stringify(bbox_condition));
    }
    if (addons.length > 0) {
        // According to docs, should be formatted like this for array parameters
        formData.append("addons", JSON.stringify(addons));
    }
    try {
        const response = await axios.post(`${API_BASE_URL}/api/generate`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error);
            console.error("Error generating Rodin:", error.message);
            console.error("Response data:", error.response?.data);
            throw new Error(`Failed to generate Rodin: ${error.response?.data?.message || error.message}`);
        }
        else {
            console.error("An unexpected error occurred:", error);
            throw new Error("An unexpected error occurred during Rodin generation.");
        }
    }
}
/**
 * Check the status of a Rodin generation task
 * @param params Parameters for checking status
 * @returns Response with task status
 */
export async function checkRodinStatus({ subscriptionKey, }) {
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
 * Downloads the results of a previously generated Rodin model
 * @param params Parameters for downloading the results
 * @returns Response with download URLs for the generated model
 */
export async function downloadRodinResults({ taskUuid }) {
    try {
        // Download results
        const response = await axios.post(`${API_BASE_URL}/api/download`, {
            task_uuid: taskUuid,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        // Get list of files to download
        const fileList = response.data.list;
        if (!fileList || fileList.length === 0) {
            throw new Error("No files available for download");
        }
        return {
            list: fileList.map((file) => ({
                url: file.url,
                name: file.name,
            })),
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
