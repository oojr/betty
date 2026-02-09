/** @type {import('@webcontainer/api').FileSystemTree} */
export const chartsStarter = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "betty-data-analysis",
          private: true,
          version: "0.0.1",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: {
            recharts: "^2.10.0",
            react: "^18.2.0",
            "react-dom": "^18.2.0",
            "lucide-react": "^0.330.0",
            clsx: "^2.1.0",
            "tailwind-merge": "^2.2.0",
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
    <title>Betty Data Analysis</title>
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
    background-color: #0f172a;
    color: #f8fafc;
}
`,
        },
      },
      "App.jsx": {
        file: {
          contents: `import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileSpreadsheet, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';

// -- AGENT INSTRUCTION: You MUST modify this App component to render charts based on user data. --
// 1. Use the 'data' state to populate the charts.
// 2. You can create new chart components or modify the existing ones.
// 3. Data will be provided via chat - modify the data array between the CHART DATA markers.
// -----------------------------------------------------------------------------------------------

function App() {
  // -- CHART DATA START (Keep this comment line) --
  const [data, setData] = useState([
    { name: 'Jan', value: 12 },
    { name: 'Feb', value: 19 },
    { name: 'Mar', value: 3 },
    { name: 'Apr', value: 5 },
    { name: 'May', value: 2 },
    { name: 'Jun', value: 3 },
  ]);
  // -- CHART DATA END (Keep this comment line) --

  const [chartType, setChartType] = useState('bar');

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-100 font-sans">
      <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-full"><BarChart3 className="text-blue-500 w-8 h-8" /></div>
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Data Analysis Core</h1>
                <p className="text-slate-400">Ask Betty to fetch and visualize your data.</p>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm min-h-[400px]">
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' && (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                labelStyle={{ color: '#f8fafc' }}
                            />
                            <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                            <Bar dataKey="value" fill="#3b82f6" name="Sales 2024" />
                        </BarChart>
                    )}
                    {chartType === 'line' && (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                labelStyle={{ color: '#f8fafc' }}
                            />
                            <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Sales 2024" />
                        </LineChart>
                    )}
                    {chartType === 'pie' && (
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => \`\${name}: \${(percent * 100).toFixed(0)}%\`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                labelStyle={{ color: '#f8fafc' }}
                            />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>

       <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> Control Panel</h3>
                <div className="space-y-2">
                    <button onClick={() => setChartType('bar')} className={\`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all \${chartType === 'bar' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-400'}\`}>
                        <BarChart3 className="w-4 h-4" /> Bar Chart
                    </button>
                    <button onClick={() => setChartType('line')} className={\`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all \${chartType === 'line' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-400'}\`}>
                        <LineChartIcon className="w-4 h-4" /> Line Chart
                    </button>
                    <button onClick={() => setChartType('pie')} className={\`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all \${chartType === 'pie' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-400'}\`}>
                        <PieChartIcon className="w-4 h-4" /> Pie Chart
                    </button>
                </div>
            </div>

            <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 border-dashed">
                <p className="text-sm text-slate-500 italic text-center">
                    "Betty, switch to a line chart and show me the growth trend..."
                </p>
            </div>
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
