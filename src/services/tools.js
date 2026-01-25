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

  try {
    switch (name) {
      case "readFile": {
        const content = await wc.fs.readFile(args.path, "utf-8");
        return content; // Return raw content; model will reason about it
      }

      case "ls": {
        const entries = await wc.fs.readdir(args.path, { withFileTypes: true });
        return entries
          .map((e) => `${e.isDirectory() ? "[DIR] " : "[FILE] "}${e.name}`)
          .join("\n");
      }

      case "writeFile": {
        await wc.fs.writeFile(args.path, args.content);
        return `Successfully wrote ${args.path}.`;
      }

      case "runCommand": {
        // Simple command parser for WebContainer spawn
        const parts = args.command.split(" ");
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
