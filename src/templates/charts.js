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
            "chart.js": "^4.4.1",
            "react-chartjs-2": "^5.2.0",
            papaparse: "^5.4.1",
            xlsx: "^0.18.5",
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
import 'chart.js/auto'; // Automatically register all components

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
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Upload, FileSpreadsheet, BarChart3, PieChart, LineChart } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// -- AGENT INSTRUCTION: You MUST modify this App component to render charts based on user data. --
// 1. Use the 'chartData' state to populate the charts.
// 2. You can create new chart components or modify the existing ones.
// 3. You can parse uploaded files using the handleFileUpload function.
// -----------------------------------------------------------------------------------------------

function App() {
  // -- CHART DATA START (Keep this comment line) --
  const [data, setData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales 2024',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue-500
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  });
  // -- CHART DATA END (Keep this comment line) --

  const [chartType, setChartType] = useState('bar');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          complete: (results) => {
            console.log("CSV Parsed:", results);
            alert("CSV uploaded! Ask Betty to visualize this data.");
          }
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        console.log("Excel Parsed:", data);
        alert("Excel uploaded! Ask Betty to visualize this data.");
      }
    };
    
    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#cbd5e1' }
      },
      title: {
        display: true,
        text: 'Data Visualization Dashboard',
        color: '#f8fafc',
        font: { size: 16 }
      },
    },
    scales: {
        y: {
            grid: { color: '#334155' }, 
            ticks: { color: '#94a3b8' },
            beginAtZero: true
        },
        x: {
            grid: { color: '#334155' }, 
            ticks: { color: '#94a3b8' } 
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-100 font-sans">
      <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-full"><BarChart3 className="text-blue-500 w-8 h-8" /></div>
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Data Analysis Core</h1>
                <p className="text-slate-400">Upload data or ask Betty to fetch and visualize it.</p>
            </div>
        </div>
        <div className="flex gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-700">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Upload CSV/Excel</span>
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".csv, .xlsx, .xls" />
            </label>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm min-h-[400px]">
            <div className="h-[350px] w-full">
                {chartType === 'bar' && <Bar options={options} data={data} />}
                {chartType === 'line' && <Line options={options} data={data} />}
                {chartType === 'pie' && <div className="h-full flex justify-center"><Pie options={options} data={data} /></div>}
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
                        <LineChart className="w-4 h-4" /> Line Chart
                    </button>
                    <button onClick={() => setChartType('pie')} className={\`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all \${chartType === 'pie' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-400'}\`}>
                        <PieChart className="w-4 h-4" /> Pie Chart
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
