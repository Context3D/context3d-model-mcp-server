import * as fsPromises from "fs/promises";
import { validatePath, searchFiles } from "../utils/file-system.js";
/**
 * Reads the contents of a file
 * @param path Path to the file to read
 * @returns The contents of the file as a string
 */
export async function readFile(path) {
    const validPath = await validatePath(path);
    return await fsPromises.readFile(validPath, "utf-8");
}
/**
 * Writes content to a file
 * @param path Path to the file to write
 * @param content Content to write to the file
 * @returns A success message
 */
export async function writeFile(path, content) {
    const validPath = await validatePath(path);
    await fsPromises.writeFile(validPath, content, "utf-8");
    return `File written successfully to: ${path}`;
}
/**
 * Lists the contents of a directory
 * @param path Path to the directory to list
 * @returns A formatted string listing the directory contents
 */
export async function listDirectory(path) {
    const validPath = await validatePath(path);
    const entries = await fsPromises.readdir(validPath, {
        withFileTypes: true,
    });
    return entries
        .map((entry) => `${entry.isDirectory() ? "[DIR]" : "[FILE]"} ${entry.name}`)
        .join("\n");
}
/**
 * Creates a new directory
 * @param path Path to the directory to create
 * @returns A success message
 */
export async function createDirectory(path) {
    const validPath = await validatePath(path);
    await fsPromises.mkdir(validPath, { recursive: true });
    return `Directory created: ${path}`;
}
/**
 * Searches for files matching a pattern
 * @param path Base directory to search from
 * @param pattern Search pattern (glob format)
 * @param excludePatterns Patterns to exclude from search (glob format)
 * @returns A list of matching files
 */
export async function searchForFiles(path, pattern, excludePatterns = []) {
    const validPath = await validatePath(path);
    return await searchFiles(validPath, pattern, excludePatterns);
}
