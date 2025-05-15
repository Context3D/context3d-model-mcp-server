import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as os from "os";
import * as path from "path";
import { execFile } from "child_process";
import * as util from "util";
import { minimatch } from "minimatch";
import { debugLog } from "../config/constants.js";

// Initialize promisify for exec
export const execFileAsync = util.promisify(execFile);

// Security utilities for file system operations
export function normalizePath(p: string): string {
  return path.normalize(p);
}

export function expandHome(filepath: string): string {
  if (filepath.startsWith("~/") || filepath === "~") {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

// Get allowed directories from environment or use default
export const allowedDirectories = process.env.ALLOWED_DIRECTORIES
  ? process.env.ALLOWED_DIRECTORIES.split(",").map((dir) =>
      normalizePath(path.resolve(expandHome(dir)))
    )
  : [
      normalizePath(path.resolve(os.homedir())),
      normalizePath(path.resolve(process.cwd())),
    ];

// Security validation function
export async function validatePath(requestedPath: string): Promise<string> {
  const expandedPath = expandHome(requestedPath);
  const absolute = path.isAbsolute(expandedPath)
    ? path.resolve(expandedPath)
    : path.resolve(process.cwd(), expandedPath);

  const normalizedRequested = normalizePath(absolute);

  // Check if path is within allowed directories
  const isAllowed = allowedDirectories.some((dir) =>
    normalizedRequested.startsWith(dir)
  );
  if (!isAllowed) {
    throw new Error(
      `Access denied - path outside allowed directories: ${absolute} not in ${allowedDirectories.join(
        ", "
      )}`
    );
  }

  // Handle symlinks by checking their real path
  try {
    const realPath = await fsPromises.realpath(absolute);
    const normalizedReal = normalizePath(realPath);
    const isRealPathAllowed = allowedDirectories.some((dir) =>
      normalizedReal.startsWith(dir)
    );
    if (!isRealPathAllowed) {
      throw new Error(
        "Access denied - symlink target outside allowed directories"
      );
    }
    return realPath;
  } catch (error) {
    // For new files that don't exist yet, verify parent directory
    const parentDir = path.dirname(absolute);
    try {
      const realParentPath = await fsPromises.realpath(parentDir);
      const normalizedParent = normalizePath(realParentPath);
      const isParentAllowed = allowedDirectories.some((dir) =>
        normalizedParent.startsWith(dir)
      );
      if (!isParentAllowed) {
        throw new Error(
          "Access denied - parent directory outside allowed directories"
        );
      }
      return absolute;
    } catch {
      throw new Error(`Parent directory does not exist: ${parentDir}`);
    }
  }
}

// OS path handling functions
export function getDesktopPath(): string {
  try {
    const home = os.homedir();
    const username = os.userInfo().username;

    // Use debug logging
    debugLog(`Detected username: ${username}`);
    debugLog(`Detected home directory: ${home}`);

    if (os.platform() === "win32") {
      // Windows - User profile desktop (C:\Users\Username\Desktop)
      const desktopPath = process.env.USERPROFILE
        ? path.join(process.env.USERPROFILE, "Desktop")
        : path.join("C:", "Users", username, "Desktop");

      debugLog(`Windows desktop path: ${desktopPath}`);

      // Verify the path exists
      if (fs.existsSync(desktopPath)) {
        return desktopPath;
      } else {
        debugLog(
          `Desktop path not found: ${desktopPath}, falling back to home`
        );
        return home;
      }
    } else if (os.platform() === "darwin") {
      // macOS
      const desktopPath = path.join(home, "Desktop");
      debugLog(`macOS desktop path: ${desktopPath}`);
      return desktopPath;
    } else {
      // Linux - Use XDG if available
      const xdgDesktop = process.env.XDG_DESKTOP_DIR;
      if (xdgDesktop && fs.existsSync(xdgDesktop)) {
        debugLog(`Linux XDG desktop path: ${xdgDesktop}`);
        return xdgDesktop;
      }
      const linuxDesktop = path.join(home, "Desktop");
      if (fs.existsSync(linuxDesktop)) {
        debugLog(`Linux desktop path: ${linuxDesktop}`);
        return linuxDesktop;
      }
      debugLog(`Using home directory: ${home}`);
      return home;
    }
  } catch (error) {
    console.error("Error detecting desktop path:", error);
    return os.homedir();
  }
}

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory "${dirPath}":`, error);
      throw error;
    }
  }
}

export async function saveImageWithProperPath(
  fileData: any,
  fileName: string
): Promise<{ savedPath: string }> {
  try {
    // Check if SAVE_TO_DESKTOP is true
    if (process.env.SAVE_TO_DESKTOP === "true") {
      // Original desktop saving logic
      const saveDir = path.join(getDesktopPath(), "3d-generated");

      // Use debugLog for logging
      debugLog(`Saving to desktop directory: ${saveDir}`);
      debugLog(`Platform: ${os.platform()}`);
      debugLog(`Home directory: ${os.homedir()}`);
      debugLog(`Username: ${os.userInfo().username}`);

      // Ensure save directory exists
      ensureDirectoryExists(saveDir);

      // Create full path and normalize for OS
      const outputPath = path.normalize(path.join(saveDir, fileName));

      const writer = fs.createWriteStream(outputPath);

      fileData.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(undefined)); // Resolve the promise when the stream finishes
        writer.on("error", reject);
      });

      return { savedPath: outputPath };
    } else {
      // Save locally in the server directory
      const serverDir = process.cwd();
      const outputDir = path.join(serverDir, "3d-generated");

      debugLog(`Saving to server directory: ${outputDir}`);

      // Ensure output directory exists
      ensureDirectoryExists(outputDir);

      // Create full path and normalize for OS
      const outputPath = path.normalize(path.join(outputDir, fileName));

      // Save the file
      fs.writeFileSync(outputPath, fileData);
      debugLog(`Model saved successfully to server path: ${outputPath}`);

      return { savedPath: outputPath };
    }
  } catch (error) {
    console.error("Error saving Model:", error);
    // Fallback to output directory
    const fallbackDir = path.join(process.cwd(), "output");
    ensureDirectoryExists(fallbackDir);
    const fallbackPath = path.join(fallbackDir, fileName);
    fs.writeFileSync(fallbackPath, fileData);
    debugLog(`Fallback save to: ${fallbackPath}`);
    return { savedPath: fallbackPath };
  }
}

export async function openInBrowser(filePath: string): Promise<void> {
  try {
    // Check for headless environment
    if (
      process.env.DISPLAY === undefined &&
      os.platform() !== "win32" &&
      os.platform() !== "darwin"
    ) {
      console.log("Headless environment detected, skipping browser open");
      return;
    }

    // Ensure path is properly formatted for the OS
    const normalizedPath = path.normalize(filePath);

    // Different commands for different OSes
    const command =
      os.platform() === "win32"
        ? "explorer"
        : os.platform() === "darwin"
        ? "open"
        : "xdg-open";

    const args = [normalizedPath];

    await execFileAsync(command, args);
    console.log(`Opened in browser: ${normalizedPath}`);
  } catch (error) {
    console.error("Error opening file in browser:", error);
    console.log(
      "Unable to open browser automatically. File saved at:",
      filePath
    );
  }
}

// File search utility
export async function searchFiles(
  rootPath: string,
  pattern: string,
  excludePatterns: string[] = []
): Promise<string[]> {
  const results: string[] = [];

  async function search(currentPath: string) {
    const entries = await fsPromises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      try {
        // Validate each path before processing
        await validatePath(fullPath);

        // Check if path matches any exclude pattern
        const relativePath = path.relative(rootPath, fullPath);
        const shouldExclude = excludePatterns.some((pattern) => {
          const globPattern = pattern.includes("*")
            ? pattern
            : `**/${pattern}/**`;
          return minimatch(relativePath, globPattern, { dot: true });
        });

        if (shouldExclude) {
          continue;
        }

        // Check if the path matches the search pattern
        if (minimatch(entry.name, pattern, { nocase: true })) {
          results.push(fullPath);
        }

        if (entry.isDirectory()) {
          await search(fullPath);
        }
      } catch (error) {
        // Skip invalid paths during search
        continue;
      }
    }
  }

  await search(rootPath);
  return results;
}
