export const nextjsStarter = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "betty-website",
          version: "0.1.0",
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "next lint",
          },
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
            next: "14.1.0",
            "lucide-react": "^0.330.0",
          },
          devDependencies: {
            autoprefixer: "^10.0.1",
            postcss: "^8",
            tailwindcss: "^3.3.0",
          },
        },
        null,
        2,
      ),
    },
  },
  "postcss.config.js": {
    file: {
      contents: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
    },
  },
  "tailwind.config.js": {
    file: {
      contents: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ca8a04', // yellow-600
        secondary: '#1f2937', // gray-800
      }
    },
  },
  plugins: [],
}`,
    },
  },
  "next.config.js": {
    file: {
      contents: `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig`,
    },
  },
  app: {
    directory: {
      "globals.css": {
        file: {
          contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 17, 24, 39; /* gray-900 */
  --background-end-rgb: 0, 0, 0;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}`,
        },
      },
      "layout.js": {
        file: {
          contents: `import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Betty Generated Site',
  description: 'Created with Gemini 3 Flash',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`,
        },
      },
      "page.js": {
        file: {
          contents: `import { Globe, ArrowRight, Code2, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-700 bg-gradient-to-b from-zinc-800/30 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-800/50 lg:p-4">
          Status: &nbsp;
          <code className="font-bold text-yellow-500">Systems Online</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            By <span className="font-bold text-2xl">BETTY</span>
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-yellow-600 before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-to-t after:from-yellow-100 after:via-yellow-600 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <h1 className="text-6xl font-bold tracking-tighter text-center">
          Web Presence <br />
          <span className="text-yellow-500">Initialized</span>
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-4">
        <div className="group rounded-lg border border-gray-700 px-5 py-4 transition-colors hover:border-yellow-600/50 hover:bg-gray-800/50">
          <h2 className="mb-3 text-2xl font-semibold flex items-center gap-2">
            <Globe className="h-6 w-6 text-yellow-500" />
            Modern
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Built with Next.js 14 App Router for ultimate performance.
          </p>
        </div>

        <div className="group rounded-lg border border-gray-700 px-5 py-4 transition-colors hover:border-yellow-600/50 hover:bg-gray-800/50">
          <h2 className="mb-3 text-2xl font-semibold flex items-center gap-2">
            <Code2 className="h-6 w-6 text-yellow-500" />
            Styled
          </h2>
          <p className={"m-0 max-w-[30ch] text-sm opacity-50"}>
            Tailwind CSS pre-configured. Just add classes.
          </p>
        </div>

        <div className="group rounded-lg border border-gray-700 px-5 py-4 transition-colors hover:border-yellow-600/50 hover:bg-gray-800/50">
          <h2 className="mb-3 text-2xl font-semibold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Fast
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Instant HMR and optimized production builds.
          </p>
        </div>
      </div>
    </main>
  )
}`,
        },
      },
    },
  },
  public: {
    directory: {
      "vercel.svg": {
        file: {
          contents: "", // Placeholder
        },
      },
    },
  },
  ".gitignore": {
    file: {
      contents: `node_modules
.next
.DS_Store
`,
    },
  },
};
