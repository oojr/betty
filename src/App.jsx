import React, { useState, useEffect, useRef } from "react";
import { useDirectorStore } from "./store";
import { useWebContainer } from "./hooks/useWebContainer";
import { GeminiService } from "./services/gemini";
import BettyImage from "./assets/slidebits-betty.jpg";

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

const ProjectSelectionModal = () => {
  const { apiKey, projectType, setProjectType, clearHistory } =
    useDirectorStore();

  if (!apiKey || projectType) return null;

  const projects = [
    {
      id: "slides",
      title: "Presentation Slides",
      desc: "Create stunning slide decks with markdown and AI-generated visuals.",
      icon: "📊",
      greeting:
        "Betty is ready to draft your presentation. What is the topic of your slides?",
    },
    {
      id: "mobile",
      title: "Mobile Application",
      desc: "Prototype React Native Expo apps with interactive previews.",
      icon: "📱",
      greeting:
        "Mobile systems active. What kind of app are we building today?",
    },
    {
      id: "web",
      title: "Responsive Website",
      desc: "Make a responsive website with Next.js and Tailwind CSS.",
      icon: "🌐",
      greeting:
        "Alright, let's create a responsive website with Next.js and Tailwind CSS. What is the main purpose or topic of the site?",
    },
    {
      id: "video",
      title: "Motion Video",
      desc: "Programmatic video creation using Remotion. React-based animation.",
      icon: "🎬",
      greeting:
        "Hello, I'm Betty. Ready to direct your next high-performance video.",
    },
    {
      id: "excel",
      title: "Data Analysis",
      desc: "Upload Excel sheets for deep insights and visualization dashboards.",
      icon: "📈",
      greeting:
        "Data analytics core online. Please provide the data you'd like me to analyze.",
    },
    {
      id: "word",
      title: "Word Documents",
      desc: "Generate professional reports, contracts, and letters.",
      icon: "📝",
      greeting:
        "Document processor ready. What kind of report or contract should we draft?",
    },
  ];

  const handleSelect = (p) => {
    // Set project type FIRST so modal closes
    setProjectType(p.id);
    // Initialize chat history IMMEDIATELY
    clearHistory(p.greeting);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-800 border border-yellow-600/30 p-8 rounded-xl max-w-4xl w-full shadow-2xl">
        <img
          src={BettyImage}
          alt="Betty Agent"
          className="mx-auto mb-6 h-40 object-cover border-2 border-yellow-600/50 shadow-lg"
        />
        <h2 className="text-2xl font-bold text-yellow-600 mb-2 uppercase tracking-tight text-center">
          Select Mission Profile
        </h2>
        <p className="text-gray-400 mb-8 text-center text-sm">
          Betty is ready. Choose a directive to initialize the appropriate
          neural pathways.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className="group flex flex-col items-start p-4 bg-gray-900/50 border border-gray-700 hover:border-yellow-600 rounded-lg transition-all hover:bg-gray-800 text-left"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {p.icon}
              </div>
              <h3 className="text-yellow-500 font-bold uppercase text-xs tracking-wider mb-1 group-hover:text-yellow-400">
                {p.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChatInterface = () => {
  const {
    messages,
    addMessage,
    apiKey,
    setStatus,
    workingTask,
    setProjectType,
    setWorkingTask,
  } = useDirectorStore();
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

    addMessage({ role: "user", parts: [{ text: userMsg }] });
    setIsProcessing(true);

    try {
      const cli = new GeminiService(apiKey);
      const projectType = useDirectorStore.getState().projectType;

      let currentAssistantText = "";

      for await (const event of cli.sendMessage(userMsg, messages)) {
        switch (event.type) {
          case "message":
            if (event.role === "assistant") {
              currentAssistantText += event.content || "";
            }
            break;

          case "tool_use":
            setWorkingTask({
              name: event.tool_name,
              summary: `Betty is running: ${event.tool_name}...`,
            });
            setStatus(`Executing ${event.tool_name}...`);
            break;

          case "tool_result":
            setWorkingTask(null);
            setStatus("Betty finished a task.");
            break;

          case "error":
            addMessage({
              role: "model",
              parts: [{ text: `System Error: ${event.message}` }],
            });
            break;

          case "result":
            if (currentAssistantText) {
              addMessage({
                role: "model",
                parts: [{ text: currentAssistantText }],
              });
            }
            if (event.status === "success") {
              setStatus("Betty is awaiting instructions...");
            } else {
              setStatus("Betty encountered an issue.");
            }
            break;
        }
      }
    } catch (error) {
      addMessage({
        role: "model",
        parts: [{ text: `CRITICAL_ERROR: ${error.message}` }],
      });
      setStatus("Error: Reasoning engine failure.");
    } finally {
      setIsProcessing(false);
      setWorkingTask(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700">
      <div className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
        <div>
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
        <button
          onClick={() => setProjectType(null)}
          title="Reset Mission Profile"
          className="text-gray-500 hover:text-yellow-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
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

const LogTerminal = () => {
  const { logs, clearLogs, status } = useDirectorStore();
  const [isOpen, setIsOpen] = useState(false);
  const logEndRef = useRef(null);

  // Auto-open on error
  useEffect(() => {
    if (
      status &&
      (status.includes("Error") ||
        status.includes("Failed") ||
        status.includes("Malfunction"))
    ) {
      setIsOpen(true);
    }
  }, [status]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div
      className={`absolute bottom-14 left-0 right-0 bg-black/95 border-t border-yellow-600/30 transition-all duration-300 ease-in-out z-20 ${
        isOpen ? "h-64" : "h-0"
      } overflow-hidden`}
    >
      <div className="flex justify-between items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
        <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-600 animate-pulse" />
          System_VFS_Output
        </span>
        <div className="flex gap-4">
          <button
            onClick={clearLogs}
            className="text-[9px] text-gray-500 hover:text-gray-300 uppercase tracking-tighter"
          >
            Clear_Buffer
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[9px] text-gray-400 hover:text-white uppercase"
          >
            Close
          </button>
        </div>
      </div>
      <div className="p-4 font-mono text-[11px] text-gray-300 h-[calc(100%-36px)] overflow-y-auto selection:bg-yellow-600/30">
        {logs.map((log, i) => (
          <div key={i} className="mb-1 break-all whitespace-pre-wrap">
            <span className="text-yellow-900 mr-2">
              [{i.toString().padStart(3, "0")}]
            </span>
            {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Toggle Button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute -top-8 right-4 bg-gray-900 border border-yellow-600/30 px-3 py-1 rounded-t text-[10px] text-yellow-600 font-bold uppercase hover:bg-gray-800 transition-colors"
        >
          View_Logs
        </button>
      )}
    </div>
  );
};

const Stage = () => {
  const { status, previewUrl, logs } = useDirectorStore();
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : "Initializing...";

  return (
    <div className="flex flex-col h-full bg-gray-800 relative">
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-none"
            title="Output"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="w-10 h-10 border-2 border-yellow-600/10 border-t-yellow-600 rounded-full animate-spin" />
            <div className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">
              Awaiting_VFS_Build
            </div>
            {/* Show last log line here for better visibility */}
            <div className="max-w-md text-yellow-600/70 font-mono text-[10px] truncate animate-pulse">
              {lastLog.replace("System: ", "").replace("Process: ", "")}
            </div>
          </div>
        )}
      </div>

      <div className="h-14 bg-gray-900 border-t border-yellow-600/20 flex items-center px-6 relative z-30">
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
      <ProjectSelectionModal />
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
