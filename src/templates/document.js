/** @type {import('@webcontainer/api').FileSystemTree} */
export const documentStarter = {
  "package.json": {    file: {
      contents: JSON.stringify(
        {
          name: "betty-document-editor",
          private: true,
          version: "0.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: {
            docx: "^8.5.0",
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
      contents: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Betty Document Processor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
    },
  },
  "postcss.config.js": {
    file: {
      contents: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`,
    },
  },
  "tailwind.config.js": {
    file: {
      contents: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`,
    },
  },
  src: {
    directory: {
      "main.jsx": {
        file: {
          contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
        },
      },
      "index.css": {
        file: {
          contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
    background-color: #f3f4f6;
    color: #1f2937;
}
`,
        },
      },
      "App.jsx": {
        file: {
          contents: `import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { FileText, Download, CheckCircle } from 'lucide-react';

const generateDocument = async (title, content) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
        new Paragraph({
          children: [new TextRun({ text: content, size: 24 })],
        }),
      ],
    }],
  });
  const blob = await Packer.toBlob(doc);
  const fileName = title.replace(/\s+/g, '_') + '.docx';
  saveAs(blob, fileName);
};

function App() {
  const [docTitle, setDocTitle] = useState("New Document");
  const [docContent, setDocContent] = useState("Betty is ready. Tell her what to write here.");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
        await generateDocument(docTitle, docContent);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-white border-b border-gray-100 p-6 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-full"><FileText className="text-yellow-600 w-6 h-6" /></div>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Document Processor</h1>
                <p className="text-sm text-gray-500">Edit the fields below or ask Betty to update them.</p>
            </div>
        </div>
        <div className="p-8 bg-gray-50 min-h-[400px]">
            <div className="bg-white shadow-sm border border-gray-200 p-12 max-w-[210mm] mx-auto min-h-[500px]">
                <input 
                    value={docTitle} 
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full text-3xl font-bold mb-6 border-none focus:ring-0"
                    placeholder="Document Title"
                />
                <textarea 
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    className="w-full h-[400px] resize-none border-none focus:ring-0 text-gray-700 leading-relaxed text-lg"
                    placeholder="Document content..."
                />
            </div>
        </div>
        <div className="bg-white border-t border-gray-100 p-6 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle className="w-4 h-4 text-green-500" /><span>Betty Sync Active</span></div>
            <button onClick={handleDownload} disabled={isGenerating} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all">
                {isGenerating ? "Processing..." : "Download .DOCX"}
            </button>
        </div>
      </div>
    </div>
  );
}
export default App;
`,
        },
      },
    },
  },
  "vite.config.js": {
    file: {
      contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
`,
    },
  },
};
