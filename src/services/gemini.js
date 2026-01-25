import { GoogleGenAI } from "@google/genai";
import { tools, executeTool } from "./tools";
import { useDirectorStore } from "../store";

export class GeminiService {
  constructor(apiKey) {
    // Gemini 3 uses the new unified SDK client
    this.ai = new GoogleGenAI({ apiKey });
  }

  async sendMessage(userMessage, chatHistory = []) {
    const store = useDirectorStore.getState();
    const { setStatus, setWorkingTask } = store;

    setStatus("Betty is thinking...");

    // We maintain a local copy of the turn history to handle signatures correctly
    let currentTurnHistory = [...chatHistory];
    currentTurnHistory.push({ role: "user", parts: [{ text: userMessage }] });

    try {
      // 1. Initial Content Generation with Thinking Config
      let response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: currentTurnHistory,
        config: {
          tools: [{ functionDeclarations: tools }],
          thinkingConfig: {
            thinkingLevel: "high", // Optimized for autonomous coding
            includeThoughts: true,
          },
        },
      });

      let candidate = response.candidates[0];
      let functionCalls = candidate.content.parts.filter((p) => p.functionCall);

      // 2. The Agentic Loop (Handles multi-step/sequential tool use)
      while (functionCalls && functionCalls.length > 0) {
        // IMPORTANT: Gemini 3 requires you to save the model's part
        // (which contains the thoughtSignature) back into history.
        currentTurnHistory.push(candidate.content);

        const toolParts = [];
        for (const call of functionCalls) {
          const { name, args } = call.functionCall;

          // Update HUD for the user
          const summary =
            name === "runCommand"
              ? args.command
              : `Writing to ${args.path || "system"}`;

          setWorkingTask({ name, summary });
          setStatus(`Executing: ${name}...`);

          // Execute logic in WebContainer
          const toolResult = await executeTool(name, args);

          // Build the function response part
          toolParts.push({
            functionResponse: {
              name,
              response: { content: toolResult },
            },
          });
        }

        // Add tool results to the history
        currentTurnHistory.push({ role: "tool", parts: toolParts });

        // Request next step (sequential reasoning)
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

      // 3. Finalization
      setWorkingTask(null);
      setStatus("Betty is awaiting instructions...");

      // Final response text
      const textPart = candidate.content.parts.find((p) => p.text);
      return textPart
        ? textPart.text
        : "Action completed without verbal response.";
    } catch (error) {
      console.error("Gemini 3 Service Error:", error);
      setWorkingTask(null);
      setStatus("Error: Neural core disconnect.");

      if (error.message?.includes("400")) {
        return "System Error (400): Thought Signature mismatch. Ensure history is preserved.";
      }
      return "I apologize, but I encountered a reasoning error while accessing my tools.";
    }
  }
}
