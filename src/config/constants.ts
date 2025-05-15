// Constants for 3D generation and file operations
export const MODEL_OUTPUT_DIR = "generated-models";
export const VIEWER_OUTPUT_DIR = "generated-viewers";
export const DEFAULT_MODEL_FORMAT = "glb";
export const DEFAULT_MATERIAL = "PBR";
export const DEFAULT_QUALITY = "high";

// Debug mode flag
export const DEBUG = process.env.DEBUG === "true";

// Debug logger function to avoid polluting stdout/stderr
export function debugLog(...args: any[]): void {
  if (DEBUG) {
    console.error("[DEBUG]", ...args);
  }
}
