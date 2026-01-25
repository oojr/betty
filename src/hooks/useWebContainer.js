import { useEffect, useRef } from "react";
import { WebContainer } from "@webcontainer/api";
import { useDirectorStore } from "../store";
import { remotionStarter } from "../templates/starter";

export const useWebContainer = () => {
  const { setWebContainerInstance, setStatus, setPreviewUrl } =
    useDirectorStore();
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const boot = async () => {
      try {
        setStatus("Initializing System...");
        const webcontainerInstance = await WebContainer.boot();
        setWebContainerInstance(webcontainerInstance);

        setStatus("Syncing Video Assets...");
        await webcontainerInstance.mount(remotionStarter);

        // --- Process 1: Installation (The Prerequisite) ---
        setStatus("Calibrating dependencies...");
        const installProcess = await webcontainerInstance.spawn("npm", [
          "install",
        ]);

        // Log installation output for debugging
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.debug(`[Install] ${data}`);
            },
          }),
        );

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) throw new Error("Calibration failed.");

        // --- Process 2: The Persistent Dev Server ---
        setStatus("Activating Remotion Studio...");

        // We don't 'await' the startProcess.exit because we want it to stay running!
        const startProcess = await webcontainerInstance.spawn("npm", ["start"]);

        startProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(`[Studio] ${data}`);
            },
          }),
        );

        // This is the "Bridge" that connects the background process to your UI iframe
        webcontainerInstance.on("server-ready", (port, url) => {
          console.info("🎬 Remotion Preview Live:", url);
          setPreviewUrl(url);
          setStatus("Betty is online. Directing permitted.");
        });
      } catch (error) {
        console.error("WebContainer Error:", error);
        setStatus("System Malfunction: Container failed.");
      }
    };

    boot();
  }, []);
};
