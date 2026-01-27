/** @type {import('@webcontainer/api').FileSystemTree} */
export const presentationStarter = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "betty-presentation-maker",
          private: true,
          version: "0.0.1",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: {
            pptxgenjs: "^3.12.0",
            "file-saver": "^2.0.5",
            react: "^18.2.0",
            "react-dom": "^18.2.0",
            "lucide-react": "^0.330.0",
          },
          devDependencies: {
            "@types/react": "^18.2.43",
            "@types/react-dom": "^18.2.17",
            "@vitejs/plugin-react": "^4.2.1",
            vite: "^5.0.8",
            autoprefixer: "^10.4.16",
            postcss: "^8.4.32",
            tailwindcss: "^3.4.0",
          },
        },
        null,
        2,
      ),
    },
  },
  "index.html": {
    file: {
      contents:
        '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Betty Presentation Maker</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n',
    },
  },
  "postcss.config.js": {
    file: {
      contents:
        "export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n",
    },
  },
  "tailwind.config.js": {
    file: {
      contents:
        '/** @type {import(\'tailwindcss\').Config} */\nexport default {\n  content: [\n    "./index.html",\n    "./src/**/*.{js,ts,jsx,tsx}",\n  ],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}\n',
    },
  },
  src: {
    directory: {
      "main.jsx": {
        file: {
          contents:
            "import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.jsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)\n",
        },
      },
      "index.css": {
        file: {
          contents:
            "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n    background-color: #f3f4f6;\n    color: #1f2937;\n}\n",
        },
      },
      "App.jsx": {
        file: {
          contents:
            'import React, { useState } from \'react\';\nimport PptxGenJS from \'pptxgenjs\';\nimport { Presentation, Download, CheckCircle, Wand2 } from \'lucide-react\';\n\nconst generatePresentation = async (title, subtitle, content) => {\n  try {\n    console.log("Initializing PptxGenJS...");\n    const pptx = new PptxGenJS();\n    \n    // -- AGENT INSTRUCTION: Modify this function to change slides. --\n    // Use pptx.addSlide(), slide.addText(), slide.addImage()\n    // -------------------------------------------------------------\n\n    // Slide 1: Title\n    const slide1 = pptx.addSlide();\n    slide1.addText(title, { x: 1, y: 1, w: \'80%\', h: 1, fontSize: 36, align: \'center\', bold: true, color: \'363636\' });\n    slide1.addText(subtitle, { x: 1, y: 2.5, w: \'80%\', h: 1, fontSize: 24, align: \'center\', color: \'666666\' });\n    \n    // Slide 2: Info\n    const slide2 = pptx.addSlide();\n    slide2.addText("How to Edit", { x: 0.5, y: 0.5, w: \'90%\', h: 1, fontSize: 24, bold: true, color: \'363636\', align: \'left\' });\n    \n    // Simple split by newline\n    const lines = content.split(\'\\n\');\n    const bullets = lines.filter(l => l.trim()).map(text => ({\n        text: text.trim(), \n        options: { fontSize: 18, color: \'444444\', breakLine: true } \n    }));\n    \n    if (bullets.length > 0) {\n        slide2.addText(bullets, { x: 1, y: 1.5, w: \'80%\', h: 4, bullet: true });\n    }\n\n    console.log("Writing file...");\n    await pptx.writeFile({ fileName: title.replace(/\\s+/g, \'_\') + \'.pptx\' });\n    console.log("Done.");\n  } catch (e) {\n    console.error("PPTX Generation Error:", e);\n    alert("Failed to generate PPTX. See console.");\n  }\n};\n\nfunction App() {\n  // Simple strings with escaped newlines\n  const [title] = useState("Betty\'s Presentation Core");\n  const [subtitle] = useState("Your automated slide deck is ready.");\n  const [content] = useState("Ask Betty to change the theme\\nRequest new slides with specific data\\nChange layouts via AI command");\n  const [isGenerating, setIsGenerating] = useState(false);\n\n  const handleDownload = async () => {\n    setIsGenerating(true);\n    await generatePresentation(title, subtitle, content);\n    setIsGenerating(false);\n  };\n\n  return (\n    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">\n      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg border border-gray-200">\n        <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between">\n            <div className="flex items-center gap-4">\n                <div className="bg-orange-100 p-3 rounded-full"><Presentation className="text-orange-600 w-6 h-6" /></div>\n                <div>\n                    <h1 className="text-2xl font-bold text-gray-800">Presentation Maker</h1>\n                    <p className="text-sm text-gray-500">The slides below are generated programmatically by Betty.</p>\n                </div>\n            </div>\n            <div className="hidden md:flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">\n                <Wand2 className="w-4 h-4 text-yellow-600" />\n                <span className="text-xs font-bold text-yellow-700 uppercase tracking-tighter">AI Controlled</span>\n            </div>\n        </div>\n        \n        <div className="p-8 bg-gray-50 min-h-[400px]">\n            <div className="max-w-2xl mx-auto space-y-8">\n                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">\n                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Live Slide Preview</h3>\n                    \n                    {/* Slide 1 Preview */}\n                    <div className="aspect-[16/9] w-full bg-white shadow-inner mb-4 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-gray-100 rounded">\n                        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>\n                        <h2 className="text-xl text-gray-500">{subtitle}</h2>\n                    </div>\n                    \n                    {/* Slide 2 Preview */}\n                    <div className="aspect-[16/9] w-full bg-white shadow-inner p-8 relative overflow-hidden border border-gray-100 rounded">\n                        <h3 className="text-lg font-bold text-gray-800 mb-4">How to Edit</h3>\n                        <ul className="list-disc pl-5 space-y-2">\n                            {content.split(\'\\n\').map((line, i) => (\n                                <li key={i} className="text-sm text-gray-600">{line}</li>\n                            ))}\n                        </ul>\n                    </div>\n                </div>\n\n                <div className="text-center">\n                    <p className="text-sm text-gray-400 italic">"Betty, add a third slide about market trends..."</p>\n                </div>\n            </div>\n        </div>\n\n        <div className="bg-white border-t border-gray-100 p-6 flex justify-between items-center">\n            <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle className="w-4 h-4 text-green-500" /><span>Betty Neural Sync Active</span></div>\n            <div className="flex gap-4">\n                <button onClick={handleDownload} disabled={isGenerating} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg">\n                    {isGenerating ? "Processing..." : "Download .PPTX"} <Download className="w-4 h-4" />\n                </button>\n            </div>\n        </div>\n      </div>\n    </div>\n  );\n}\nexport default App;\n',
        },
      },
    },
  },
};
