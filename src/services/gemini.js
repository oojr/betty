import { GoogleGenAI } from "@google/genai";
import { tools, executeTool } from "./tools";
import { useDirectorStore } from "../store";

export class GeminiService {
  constructor(apiKey) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async *sendMessage(userMessage, chatHistory = []) {
    const store = useDirectorStore.getState();
    const { setStatus, setWorkingTask, projectType } = store;

    // Emit init event
    yield {
      type: "init",
      timestamp: new Date().toISOString(),
      model: "gemini-3-flash-preview",
      session_id: Date.now().toString(), // Simple session ID
    };

    setStatus("Betty is thinking...");

    const getProjectTypeInstructions = (type) => {
      switch (type) {
        case "video":
          return "You are working on a Remotion project. Files are in 'src/'. 'Root.jsx' and 'Composition.jsx' are key entry points. Focus on video generation tasks.";
        case "web":
          return "You are working on a Next.js project (Page Router/App Router as provided) with Tailwind CSS. Use the 'app/' directory for files. Focus on web development tasks.";
        case "mobile":
          return "You are working on an Expo (React Native) project. 'App.js' is the main entry point. Use standard React Native components. Focus on mobile app development tasks.";
        case "word":
          return "You are working on a Document Processor. It uses the 'docx' library to generate files. You MUST update 'src/App.jsx' to change the document structure, content, or generation logic. DO NOT use 'src/content.json' unless you are specifically refactoring. Focus on document generation and manipulation tasks.";
        case "slides":
          return "You are working on a Presentation Maker. It uses 'pptxgenjs' to generate PowerPoint files. You MUST update 'src/App.jsx' to change the slide layout, design, or content. Modify the 'generatePresentation' function to add/remove slides or change styles. There are NO input fields in the UI, so everything must be hardcoded in the generation logic by you.";
case 'excel':
          return "You are working on a Data Analysis Dashboard. It uses 'react-chartjs-2' and 'chart.js' for visualization. You MUST update 'src/App.jsx' DIRECTLY to change the chart data, type, or layout. Modify the 'chartLabels', 'chartDatasetLabel', and 'chartDatasetData' state variables in 'src/App.jsx' to reflect user requests. DO NOT create new component files. All code should reside in 'src/App.jsx' for this mission. You can also handle CSV/Excel file uploads. Focus on data visualization tasks.";
        default:
          return "You are working on a project with an unspecified type. Proceed with general development tasks.";
      }
    };

    const projectInstructions = getProjectTypeInstructions(projectType);

    const systemPrompt = `
      You are Betty, a high-performance AI agent powered by Gemini 3 Flash. 
      Your current task is to assist the user with a project of type: ${projectType.toUpperCase()}.
      
      Your environment:
      - You have full access to a WebContainer VFS.
      - You can read files, write files, list directories, and run shell commands.
      - The user sees a live preview of the project in an iframe.
      
      Project-specific instructions:
      - ${projectInstructions}

      General instructions:
      - THE PROJECT IS ALREADY INITIALIZED. DO NOT run setup commands like 'npm init', 'npm create', 'npx create-...', or 'vite init'.
      - NEVER run interactive commands that wait for user input.
      - ALWAYS check file content before overwriting if you are unsure.
      - NEVER run 'npm run dev', 'npm start', or 'npm run web' after editing files. The server is already running and will HOT-RELOAD automatically.
      - Be concise in your verbal responses.
    `;

    let currentTurnHistory = [...chatHistory];

    const lastMsg = chatHistory[chatHistory.length - 1];
    const userMsgAlreadyInHistory =
      lastMsg &&
      lastMsg.role === "user" &&
      lastMsg.parts[0].text === userMessage;

    if (!userMsgAlreadyInHistory) {
      currentTurnHistory.push({ role: "user", parts: [{ text: userMessage }] });
      yield {
        type: "message",
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      let response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        systemInstruction: systemPrompt,
        contents: currentTurnHistory,
        config: {
          tools: [{ functionDeclarations: tools }],
          thinkingConfig: {
            thinkingLevel: "high",
            includeThoughts: true,
          },
        },
      });

      let candidate = response.candidates[0];
      let functionCalls = candidate.content.parts.filter((p) => p.functionCall);

      while (functionCalls && functionCalls.length > 0) {
        currentTurnHistory.push(candidate.content);

        const toolParts = [];
        for (const call of functionCalls) {
          const { name, args } = call.functionCall;

          yield {
            type: "tool_use",
            tool_name: name,
            tool_id: `${name}-${Date.now()}`,
            parameters: args,
            timestamp: new Date().toISOString(),
          };

          const summary = args.file_path
            ? `Editing ${args.file_path}...`
            : args.command
              ? `Running: ${args.command}`
              : `Processing with ${name}...`;

          setWorkingTask({ name, summary });
          setStatus(`Executing: ${name}...`);

          const toolResult = await executeTool(name, args);

          toolParts.push({
            functionResponse: {
              name,
              response: { content: toolResult },
            },
          });

          yield {
            type: "tool_result",
            tool_id: `${name}-${Date.now()}`, // Re-using id for simplicity, could map
            status: toolResult.startsWith("Error:") ? "error" : "success",
            output: toolResult,
            timestamp: new Date().toISOString(),
          };
        }

        currentTurnHistory.push({ role: "tool", parts: toolParts });

        response = await this.ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: currentTurnHistory,
          config: {
            tools: [{ functionDeclarations: tools }],
            thinkingConfig: { includeThoughts: true },
          },
        });

        candidate = response.candidates[0];
        functionCalls = candidate.content.parts.filter((p) => p.functionCall);
      }

      setWorkingTask(null);
      setStatus("Betty is awaiting instructions...");

      const textPart = candidate.content.parts.find((p) => p.text);
      if (textPart) {
        yield {
          type: "message",
          role: "assistant",
          content: textPart.text,
          delta: false, // Not a delta, it's the full final response
          timestamp: new Date().toISOString(),
        };
      }

      yield {
        type: "result",
        status: "success",
        stats: {}, // Placeholder for actual stats
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Gemini 3 Service Error:", error);
      setWorkingTask(null);
      setStatus("Error: Neural core disconnect.");

      yield {
        type: "error",
        message: error.message || "An unknown error occurred.",
        timestamp: new Date().toISOString(),
      };

      if (error.message?.includes("400")) {
        yield {
          type: "message",
          role: "assistant",
          content:
            "System Error (400): Thought Signature mismatch. Ensure history is preserved.",
          timestamp: new Date().toISOString(),
        };
      } else {
        yield {
          type: "message",
          role: "assistant",
          content:
            "I apologize, but I encountered a reasoning error while accessing my tools.",
          timestamp: new Date().toISOString(),
        };
      }

      yield {
        type: "result",
        status: "error",
        stats: {}, // Placeholder
        timestamp: new Date().toISOString(),
      };
    }
  }
}
