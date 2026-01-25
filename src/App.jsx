import React, { useState, useEffect, useRef } from "react";
import { useDirectorStore } from "./store";
import { useWebContainer } from "./hooks/useWebContainer";
import { GeminiService } from "./services/gemini";

const ApiKeyModal = () => {
  const { apiKey, setApiKey } = useDirectorStore();
  const [input, setInput] = useState("");

  if (apiKey) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-800 border border-yellow-600/50 p-6 rounded-lg max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-bold text-yellow-600 mb-4 uppercase tracking-tight">
          System Authentication
        </h2>
        <p className="text-gray-300 mb-4 text-sm leading-relaxed">
          Please enter your Google Gemini API Key to activate Betty's neural
          core and initialize the WebContainer VFS.
        </p>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-gray-100 focus:outline-none focus:border-yellow-600 mb-4 font-mono text-sm"
        />
        <button
          onClick={() => setApiKey(input)}
          disabled={!input}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold py-2 rounded transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Activate Core
        </button>
      </div>
    </div>
  );
};

const ChatInterface = () => {
  const { messages, addMessage, apiKey, setStatus, workingTask } =
    useDirectorStore();
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, workingTask]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey || isProcessing) return;

    const userMsg = input;
    setInput("");

    // Store message in the new content object format
    addMessage({ role: "user", parts: [{ text: userMsg }] });
    setIsProcessing(true);

    try {
      const service = new GeminiService(apiKey);
      // We pass the full history (which now includes thought signatures)
      const responseText = await service.sendMessage(userMsg, messages);

      addMessage({
        role: "model",
        parts: [{ text: responseText }],
      });
    } catch (error) {
      addMessage({
        role: "model",
        parts: [
          { text: "CRITICAL_ERROR: Reasoning chain broken. Please refresh." },
        ],
      });
      setStatus("Error: Service communication failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700">
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <h1 className="text-xl font-bold text-yellow-600 tracking-tighter">
          SLIDEBITS <span className="text-gray-100 font-light">BETTY</span>
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Gemini 3 Flash Agent
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-yellow-600 text-gray-900 font-medium"
                  : "bg-gray-800 text-gray-100 border border-gray-700"
              }`}
            >
              {msg.parts?.map((part, j) => (
                <div key={j}>
                  {/* Render Internal Monologue / Thinking */}
                  {part.thought && (
                    <div className="mb-2 pb-2 border-b border-gray-700/50 text-gray-400 italic text-xs leading-relaxed">
                      <span className="text-yellow-600/40 not-italic font-bold mr-1">
                        THOUGHT:
                      </span>
                      {part.text}
                    </div>
                  )}
                  {/* Render Main Text Output */}
                  {!part.thought && part.text && (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {part.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Action Indicator (Tool execution) */}
        {workingTask && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-2">
            <div className="bg-gray-800/40 border border-yellow-600/20 p-3 rounded-lg flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-500 animate-ping" />
              <div className="flex flex-col">
                <span className="text-[9px] text-yellow-600 font-bold uppercase tracking-tighter">
                  Executing: {workingTask.name}
                </span>
                <span className="text-xs text-gray-400 font-mono italic truncate max-w-[220px]">
                  {workingTask.summary}
                </span>
              </div>
            </div>
          </div>
        )}

        {isProcessing && !workingTask && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg px-5">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={apiKey ? "Command Betty..." : "Waiting for API Key..."}
            disabled={!apiKey || isProcessing}
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-gray-100 focus:outline-none focus:border-yellow-600 transition-all text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!apiKey || isProcessing}
            className="bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-2 rounded transition-all uppercase text-[10px] tracking-widest disabled:opacity-50"
          >
            {isProcessing ? "Processing" : "Run"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Stage = () => {
  const { status, previewUrl } = useDirectorStore();

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-none"
            title="Output"
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-yellow-600/10 border-t-yellow-600 rounded-full animate-spin" />
            <div className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">
              Awaiting_VFS_Build
            </div>
          </div>
        )}
      </div>

      <div className="h-14 bg-gray-900 border-t border-yellow-600/20 flex items-center px-6">
        <div className="flex items-center gap-4 w-full">
          <div className="h-2 w-2 rounded-full bg-yellow-600 shadow-[0_0_8px_rgba(202,138,4,0.6)]" />
          <div className="flex-1">
            <div className="text-[9px] text-yellow-600 font-bold uppercase tracking-wider mb-0.5">
              Betty Terminal Output
            </div>
            <div className="text-xs text-gray-400 font-mono truncate max-w-lg">
              {status}
            </div>
          </div>
          <div className="flex gap-2 opacity-50">
            <div className="text-[9px] font-mono text-gray-300 border border-gray-700 px-2 py-0.5 rounded uppercase">
              Thread_v3
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  useWebContainer();

  return (
    <div className="flex h-screen w-screen overflow-hidden text-gray-100 font-sans selection:bg-yellow-600/30">
      <ApiKeyModal />
      <div className="w-[400px] flex-shrink-0">
        <ChatInterface />
      </div>
      <div className="flex-1">
        <Stage />
      </div>
    </div>
  );
}

export default App;
