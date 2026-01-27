import { useDirectorStore } from "../store";

// --- Tool Definitions (Standardized for @google/genai) ---
export const tools = [
  {
    name: "readFile",
    description: "Reads the content of a file from the WebContainer VFS.",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The relative path to the file (e.g., 'src/data.json').",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "ls",
    description: "Lists files and directories in a specific path.",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The directory to list (e.g., 'src' or '.').",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "writeFile",
    description: "Writes content to a file. Overwrites if file exists.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to write to." },
        content: { type: "string", description: "Full code or JSON content." },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "runCommand",
    description: "Runs shell commands like 'npm install' or 'npm run dev'.",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "The shell command to run." },
      },
      required: ["command"],
    },
  },
];

// --- Tool Implementations ---
export const executeTool = async (name, args) => {
  const store = useDirectorStore.getState();
  const wc = store.webContainerInstance;

  if (!wc) return "Error: WebContainer is not booted yet.";

  // Normalize paths: remove leading slash if present, as WebContainer.fs uses relative paths from root
  const normalizePath = (path) => path.startsWith('/') ? path.slice(1) : path;

  try {
    switch (name) {
      case "readFile": {
        const path = normalizePath(args.path);
        const content = await wc.fs.readFile(path, "utf-8");
        return content;
      }

      case "ls": {
        const path = normalizePath(args.path || ".");
        const entries = await wc.fs.readdir(path, { withFileTypes: true });
        return entries
          .map((e) => `${e.isDirectory() ? "[DIR] " : "[FILE] "}${e.name}`)
          .join("\n");
      }

      case "writeFile": {
        const path = normalizePath(args.path);
        await wc.fs.writeFile(path, args.content);
        return `Successfully wrote ${path}.`;
      }

      case "runCommand": {
        const command = args.command.trim();
        
        // Guard against redundant server starts or project initialization
        if (
          command.startsWith("npm run dev") || 
          command.startsWith("npm start") || 
          command.startsWith("npm run start") || 
          command.startsWith("next dev") ||
          command.startsWith("npm run web") ||
          command.startsWith("expo start") ||
          command.includes("create-next-app") ||
          command.includes("create-expo-app") ||
          command.includes("create-vite") ||
          command.includes("npm init") ||
          command.includes("npm create") ||
          command.includes("npx create") ||
          command.startsWith("vite")
        ) {
          return "Notice: The project is already initialized and the development server is running. Do not try to recreate the project or start the server. You can directly edit the files in the VFS.";
        }

        // Simple command parser for WebContainer spawn
        const parts = command.split(" ");
        const cmd = parts[0];
        const cmdArgs = parts.slice(1);

        const process = await wc.spawn(cmd, cmdArgs);

        let output = "";
        process.output.pipeTo(
          new WritableStream({
            write(data) {
              output += data;
            },
          }),
        );

        const exitCode = await process.exit;
        return `Exit Code: ${exitCode}\nOutput: ${output || "(No output)"}`;
      }

      default:
        return `Error: Tool '${name}' not found.`;
    }
  } catch (error) {
    return `Execution Error: ${error.message}`;
  }
};
