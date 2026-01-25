import { create } from "zustand";

export const useDirectorStore = create((set) => ({
  // --- Gemini 3 Chat History ---
  // We now store the full "Content" objects rather than just strings.
  // This ensures Thought Signatures are preserved across the entire conversation.
  messages: [
    {
      role: "model",
      parts: [
        {
          text: "Hello, I'm Betty. Ready to direct your next high-performance video.",
        },
      ],
    },
  ],

  // Updated addMessage to handle complex Gemini 3 content parts
  addMessage: (contentObj) =>
    set((state) => ({
      messages: [...state.messages, contentObj],
    })),

  // --- WebContainer & Stage State ---
  webContainerInstance: null,
  setWebContainerInstance: (instance) =>
    set({ webContainerInstance: instance }),

  status: "Betty is initializing systems...",
  setStatus: (status) => set({ status }),

  workingTask: null, // e.g., { name: 'runCommand', summary: 'npm install' }
  setWorkingTask: (task) => set({ workingTask: task }),

  previewUrl: null,
  setPreviewUrl: (url) => set({ previewUrl: url }),

  // --- Gemini 3 Configuration ---
  // Note: We removed the standalone thoughtSignature state because
  // Gemini 3 signatures are now embedded directly within the message parts.

  apiKey: localStorage.getItem("gemini_api_key") || "",
  setApiKey: (key) => {
    localStorage.setItem("gemini_api_key", key);
    set({ apiKey: key });
  },

  // Helper to clear history
  clearHistory: () =>
    set({
      messages: [
        { role: "model", parts: [{ text: "Systems reset. How can I help?" }] },
      ],
    }),
}));
