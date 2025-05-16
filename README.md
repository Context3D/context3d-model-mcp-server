# Context3D - AI-Powered 3D Model Generation with MCP

<div align="center">
  <h3>Generating production-ready 3D models and PBR textures from text and images with MCP Integration</h3>
</div>

---

## 🔍 Overview

This repository contains the **Context3D MCP Server**, a specialized component that integrates the advanced Context3D AI-powered 3D asset generation capabilities with the Model Context Protocol (MCP). While the core Context3D services handle the complex process of generating production-ready 3D models from text prompts or reference images using proprietary diffusion models and extensive datasets, this MCP server provides a standardized interface to access these capabilities via MCP.

The core Context3D services leverage a multi-stage pipeline for 3D asset generation, including input processing, feature extraction, latent space modeling, and asset generation components. This results in high-quality, CG-friendly assets compatible with Unity, Unreal Engine, Maya, and other industry-standard platforms.

This repository's focus is the MCP server, which includes a secure authentication layer that can use blockchain technology to verify users based on their token holdings before allowing access to the underlying Context3D generation services.

### Key Features of the Context3D Platform:

- **Text-to-3D**: Generate detailed 3D models from text descriptions
- **Image-to-3D**: Convert reference images into 3D models with matching textures
- **Hyper-realistic PBR textures**: Auto-generated diffuse, normal, roughness, and metallic maps
- **Production-ready output**: Optimized topology and UV mapping for immediate use
- **Multi-platform compatibility**: Export to common formats (.fbx, .obj, .gltf, .usd)
- **Facial specialization**: Advanced capabilities for human facial asset generation

### Key Features of this MCP Server:

- **MCP Integration**: Full compatibility with the Model Context Protocol for accessing Context3D services.
- **Blockchain Authentication**: Secure access control based on token holdings for using the Context3D services via MCP.
- **File Management Tools**: Built-in MCP tools for managing generated assets.
- **Customization Options**: MCP interface for controlling core Context3D model generation parameters.

---

## 🏗️ Technical Architecture

This repository focuses on the MCP Server component, which interacts with the core Context3D Cloud Service.

### Core Context3D Cloud Service Pipeline (Detailed in plant.md)

The core Context3D Cloud Service utilizes a multi-stage pipeline:

```mermaid
graph TD
    A[Context3D Architecture] --> B[Input Processing]
    B --> C[Feature Extraction]
    C --> D[Latent Space Modeling]
    D --> E[Asset Generation]

    subgraph "Input Processing"
        B1[Text Input Processing]
        B2[Image Input Processing]
        B3[Parameter Config]
        B1 <--> B2
        B2 <--> B3
    end

    subgraph "Feature Extraction"
        C1[Semantic Encoder]
        C2[Visual Encoder]
        C3[Style Encoder]
        C1 <--> C2
        C2 <--> C3
    end

    subgraph "Latent Space Modeling"
        D1[3D Diffusion Model]
        D2[Multi-view Consistency]
        D3[Geometry Refinement]
        D1 <--> D2
        D2 <--> D3
    end

    subgraph "Asset Generation"
        E1[Mesh Generation]
        E2[Texture Generation]
        E3[UV Mapping]
        E4[Topology Optimization]
        E5[PBR Material Creation]
        E6[Export Pipeline]
        E1 <--> E2
        E2 <--> E3
        E1 <--> E4
        E2 <--> E5
        E3 <--> E6
        E4 <--> E5
        E5 <--> E6
    end

    B --> B1
    B --> B2
    B --> B3
    C --> C1
    C --> C2
    C --> C3
    D --> D1
    D --> D2
    D --> D3
    E --> E1
    E --> E2
    E --> E3
    E --> E4
    E --> E5
    E --> E6
```

_Note: This diagram represents the core Context3D Cloud Service pipeline, not the MCP Server in this repository._

### MCP Server Communication Flow

This diagram illustrates the communication flow between an MCP client and the server, including interaction with the core Context3D Cloud Service:

```mermaid
sequenceDiagram
    participant Client as MCP Client
    participant Server as Context3D MCP Server
    participant CloudService as Context3D Cloud Service

    Client->>+Server: Execute generate_3d_model tool
    Server->>Server: Perform Authentication/Verification (if enabled)
    Server->>+CloudService: Forward generation request to Cloud Service API Gateway
    CloudService->>CloudService: Process Generation (Input, Feature, Latent, Asset stages)
    CloudService-->>-Server: Return task UUID and status
    Server-->>-Client: Return confirmation with task UUID

    alt With Blockchain Authentication
        Client->>+Server: Execute generate_rodin_model_with_auth tool
        Server->>Server: Verify Ethereum signature & token balance
        Server->>+CloudService: Forward authenticated request to Cloud Service API Gateway
        CloudService->>CloudService: Process Authenticated Generation
        CloudService-->>-Server: Return authenticated response
        Server-->>-Client: Return confirmation with task UUID
    end

    Client->>+Server: Execute download_rodin_results_with_auth tool
    Server->>Server: Verify Ethereum signature & token balance
    Server->>+CloudService: Request download URLs from Cloud Service API Gateway
    CloudService->>CloudService: Retrieve Download URLs
    CloudService-->>-Server: Return authenticated URLs
    Server-->>-Client: Return download links
```

### Authentication Flow (within MCP Server)

The blockchain authentication process within the MCP Server works as follows:

```mermaid
graph TD
    A[User Signs Message] --> B[Generate Ethereum Signature]
    B --> C[Send Request with x-api-key Header to MCP Server]
    C --> D[MCP Server Verifies Signature]
    D --> E[Recover Ethereum Address]
    E --> F[Check Token Balance on Blockchain]
    F --> G{Sufficient Balance?}
    G -- Yes --> H[Proceed with Request to Cloud Service]
    G -- No --> I[Return Error: Insufficient Tokens]
```

---

## MCP Integration Guide

### Adding the MCP Server to Claude Desktop

Follow these steps to integrate the Context3D MCP server with Claude Desktop:

1. **Install Claude Desktop**:
   - Download the latest version of Claude Desktop from the official website ([https://claude.ai/download](https://claude.ai/download))
   - Follow the installation prompts for your operating system (Windows, macOS, or Linux)
   - Complete the installation and launch Claude Desktop
   - Sign in with your Anthropic account credentials if prompted

2. **Configure Claude Desktop**:
   - Install Node.js (version 16 or higher) from https://nodejs.org
   - Clone the Context3D MCP server repository:
     ```bash
     git clone https://github.com/Context3D/context3d-model-mcp-server
     cd context3d-model-mcp-server
     ```
   - Install dependencies using your preferred package manager:
     ```bash
     npm install
     # or
     pnpm install
     # or
     yarn install
     ```
   - Build the MCP server:
     ```bash
     pnpm build
     ```
   - Create or update the Claude configuration file. On Windows, this is typically located at `%APPDATA%\Claude\config.json`. On macOS, it's at `~/Library/Application Support/Claude/config.json`. On Linux, it's at `~/.config/Claude/config.json`.
   - Add the following JSON configuration, making sure to replace the path with your actual build directory path:
     ```json
     {
       "mcpServers": {
         "filesystem": {
           "command": "node",
           "args": [
             "/full/path/to/context3d-model-mcp-server/build/index.js"
           ],
           "env": {
             "SAVE_TO_DESKTOP": "true"
           }
         }
       }
     }
     ```
   - Save the configuration file and restart Claude Desktop
   - Verify the MCP server is running by checking for the Context3D tools in the tools panel

3. **Using the Server**:

  - https://x.com/Context3D/status/1922998936219873558




  ---

<div align="center">
  <p>© 2025 Context3D AI | <a href="https://context3d.ai">https://context3d.ai</a></p>
</div>
