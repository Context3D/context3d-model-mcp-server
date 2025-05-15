/**
 * Definition of all available tools in the MCP server
 */
export const availableTools = [
    // 3D model generation
    {
        name: "generate_model",
        description: "Initiates the 3D model generation process. This tool sends a request to create a 3D model based on the provided prompt and parameters. The response includes a main uuid and subscription_key, which must be saved to continue tracking progress through the check_status tool. When the request is successfully sent, the system returns a 'Submitted' message along with information about the uuid and created jobs. Note that the model generation process may take time.",
        inputSchema: {
            type: "object",
            properties: {
                prompt: {
                    type: "string",
                    description: "The prompt describing the 3D model to generate",
                },
                tier: {
                    type: "string",
                    enum: ["Regular", "Sketch", "Detail", "Smooth"],
                    description: "The tier of the model generation",
                },
                geometry_file_format: {
                    type: "string",
                    enum: ["glb", "usdz", "fbx", "obj", "stl"],
                    description: "The format of the generated model, default glb",
                },
                material: {
                    type: "string",
                    enum: ["PBR", "Shaded"],
                    description: "The material type for the model",
                },
                quality: {
                    type: "string",
                    enum: ["high", "medium", "low", "extra-low"],
                    description: "The quality of the generated model",
                },
                use_hyper: {
                    type: "boolean",
                    description: "Whether to use hyperboolean operations",
                },
                mesh_mode: {
                    type: "string",
                    enum: ["Quad", "Raw"],
                    description: "The mesh mode for the model",
                },
                mesh_simplify: {
                    type: "boolean",
                    description: "Whether to simplify the mesh",
                },
                mesh_smooth: {
                    type: "boolean",
                    description: "Whether to smooth the mesh",
                },
                addons: {
                    type: "array",
                    items: { type: "string" },
                    description: "Additional options for model generation",
                },
                seed: {
                    type: "number",
                    description: "Random seed for model generation",
                },
                condition_mode: {
                    type: "string",
                    enum: ["concat", "fuse"],
                    description: "Mode for multi-image processing",
                },
                TApose: {
                    type: "boolean",
                    description: "Control for human-like model generation",
                },
                bbox_condition: {
                    type: "array",
                    items: { type: "number" },
                    description: "ControlNet for maximum model size [Width, Height, Length]",
                },
                images: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of image paths to upload (max 5)",
                },
            },
            required: ["prompt"],
        },
    },
    {
        name: "download_model",
        description: "show file to browse",
        inputSchema: {
            type: "object",
            properties: {
                task_uuid: {
                    type: "string",
                    description: "show file to browse",
                },
            },
            required: ["task_uuid"],
        },
    },
    {
        name: "check_status",
        description: "Checks the status of the 3D model generation process using the subscription_key received from generate_model. This tool returns the status of all jobs related to the model. When all jobs have a 'Done' status, proceed to the download_model step to download the model. If any jobs are not completed (Generating, Waiting), notify the user to wait and check again later. Status can be: 'Done' (completed), 'Generating' (in progress), or 'Waiting' (queued).",
        inputSchema: {
            type: "object",
            properties: {
                subscriptionKey: {
                    type: "string",
                    description: "The subscriptionKey of the task to check status for",
                },
            },
            required: ["subscriptionKey"],
        },
    },
    // File system tools
    {
        name: "read_file",
        description: "Read the contents of a file",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "Path to the file to read",
                },
            },
            required: ["path"],
        },
    },
    {
        name: "write_file",
        description: "Write content to a file",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "Path to the file to write",
                },
                content: {
                    type: "string",
                    description: "Content to write to the file",
                },
            },
            required: ["path", "content"],
        },
    },
    {
        name: "list_directory",
        description: "List the contents of a directory",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "Path to the directory to list",
                },
            },
            required: ["path"],
        },
    },
    {
        name: "create_directory",
        description: "Create a new directory",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "Path to the directory to create",
                },
            },
            required: ["path"],
        },
    },
];
