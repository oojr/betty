import { useEffect, useRef } from "react";
import { WebContainer } from "@webcontainer/api";
import { useDirectorStore } from "../store";
import { remotionStarter } from "../templates/starter";
import { nextjsStarter } from "../templates/nextjs";
import { expoStarter } from "../templates/expo";
import { documentStarter } from "../templates/document";
import { presentationStarter } from "../templates/presentation";

// Persist the boot promise on the window object to survive HMR
const getBootPromise = () => {
  if (typeof window !== 'undefined') {
    if (!window.__BETTY_BOOT_PROMISE__) {
      window.__BETTY_BOOT_PROMISE__ = WebContainer.boot();
    }
    return window.__BETTY_BOOT_PROMISE__;
  }
  return null;
};

export const useWebContainer = () => {
  const {
    setWebContainerInstance,
    setStatus,
    setPreviewUrl,
    projectType,
    webContainerInstance,
    addLog,
  } = useDirectorStore();
  
  const loadingProject = useRef(false);

  useEffect(() => {
    // 1. Boot phase: Use the window-persisted promise
    const boot = async () => {
      if (webContainerInstance) return;

      try {
        setStatus("Initializing Neural Core...");
        const promise = getBootPromise();
        if (!promise) return;

        addLog("System: Awaiting WebContainer boot...");
        const instance = await promise;
        setWebContainerInstance(instance);
        addLog("System: Neural Core Online.");
      } catch (error) {
        console.error("Boot Error:", error);
        setStatus("Core Initialization Failed.");
        addLog(`Critical: Boot error - ${error.message}`);
        // Reset promise on failure to allow retry
        if (typeof window !== 'undefined') window.__BETTY_BOOT_PROMISE__ = null;
      }
    };

    boot();
  }, [webContainerInstance, setStatus, setWebContainerInstance, addLog]);

  useEffect(() => {
    // 2. Mount phase: Reacts to projectType changes
    if (!webContainerInstance || !projectType) return;

    const loadProject = async () => {
      if (loadingProject.current) return;
      loadingProject.current = true;

      try {
        setStatus(`Initializing ${projectType.toUpperCase()} Environment...`);
        addLog(`System: Preparing ${projectType} template...`);
        
        // Select Template based on projectType
        let template;
        if (projectType === "video") {
          template = remotionStarter;
        } else if (projectType === "web") {
          template = nextjsStarter;
        } else if (projectType === "mobile") {
          template = expoStarter;
        } else if (projectType === "word") {
          template = documentStarter;
        } else if (projectType === "slides") {
          template = presentationStarter;
        } else {
          // Mock template for other types
          template = {
            "package.json": {
              file: {
                contents: JSON.stringify({
                  name: "placeholder",
                  version: "1.0.0",
                  scripts: { start: "node server.js" },
                }),
              },
            },
            "server.js": {
              file: {
                contents: `
                    const http = require('http');
                    const server = http.createServer((req, res) => {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end('<div style="display:flex;height:100%;align-items:center;justify-content:center;background:#111;color:#ca8a04;font-family:sans-serif;"><h1>Project type ${projectType.toUpperCase()} is coming soon!</h1></div>');
                    });
                    server.listen(3111, () => {
                        console.log('Server running on 3111');
                    });
                 `,
              },
            },
          };
        }

        setStatus("Syncing Assets...");
        await webContainerInstance.mount(template);
        addLog("System: VFS Sync Complete.");

        if (projectType === "video" || projectType === "web" || projectType === "mobile" || projectType === "word" || projectType === "slides") {
          // --- Process 1: Installation ---
          setStatus("Calibrating dependencies...");
          addLog("Process: Running 'npm install' (optimized)...");
          
          // Use --no-package-lock and --prefer-offline for speed and stability in VFS
          const installProcess = await webContainerInstance.spawn("npm", [
            "install",
            "--no-package-lock",
            "--no-audit",
            "--no-fund",
            "--no-optional",
            "--legacy-peer-deps"
          ]);

          installProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                addLog(`[Install] ${data}`);
              },
            }),
          );

          const exitCode = await installProcess.exit;
          if (exitCode !== 0) {
            addLog(`Error: Installation failed with exit code ${exitCode}. Check logs above.`);
            throw new Error("Calibration failed.");
          }
          addLog("System: Dependencies calibrated successfully.");

          // --- Process 2: Start Server ---
          let statusMsg = "";
          let startCommand = "start";

          if (projectType === "video") {
            statusMsg = "Activating Remotion Studio...";
          } else if (projectType === "web") {
            statusMsg = "Starting Next.js Dev Server...";
            startCommand = "dev";
          } else if (projectType === "mobile") {
            statusMsg = "Starting Expo Web Console...";
            startCommand = "web";
          } else if (projectType === "word") {
            statusMsg = "Initializing Document Processor...";
            startCommand = "dev"; // Vite uses 'dev'
          } else if (projectType === "slides") {
            statusMsg = "Initializing Presentation Maker...";
            startCommand = "dev";
          }

          setStatus(statusMsg);
          addLog(`Process: Executing 'npm run ${startCommand}'...`);
          
          const startProcess = await webContainerInstance.spawn("npm", [
            "run",
            startCommand,
          ]);

          startProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                addLog(`[Server] ${data}`);
              },
            }),
          );

          webContainerInstance.on("server-ready", (port, url) => {
            setPreviewUrl(url);
            setStatus("Betty is online. Directing permitted.");
            addLog(`System: Preview active at ${url}`);
          });
        } else {
          setStatus("Activating Mock Environment...");
          addLog("Process: Starting Mock Server...");
          const startProcess = await webContainerInstance.spawn("npm", [
            "start",
          ]);

          webContainerInstance.on("server-ready", (port, url) => {
            setPreviewUrl(url);
            setStatus("Mock Environment Ready.");
            addLog(`System: Mock Server live.`);
          });
        }
      } catch (error) {
        console.error("Project Load Error:", error);
        setStatus("System Malfunction: Load failed.");
        addLog(`Critical Error: ${error.message}`);
      } finally {
        loadingProject.current = false;
      }
    };

    loadProject();
  }, [webContainerInstance, projectType, setStatus, setPreviewUrl, addLog]);
};
