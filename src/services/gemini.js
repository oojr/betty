import { GoogleGenAI } from "@google/genai";
import { tools, executeTool } from "./tools";
import { useDirectorStore } from "../store";

export class GeminiService {
  constructor(apiKey) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async *sendMessage(userMessage, chatHistory = []) {
    const store = useDirectorStore.getState();
    const { setStatus, setWorkingTask, projectType } = store;

    // Emit init event
    yield {
      type: "init",
      timestamp: new Date().toISOString(),
      model: "gemini-3-flash-preview",
      session_id: Date.now().toString(), // Simple session ID
    };

    setStatus("Betty is thinking...");

    const getProjectTypeInstructions = (type) => {
      switch (type) {
        case "video":
          return "You are working on a Remotion project. Files are in 'src/'. 'Root.jsx' and 'Composition.jsx' are key entry points. Focus on video generation tasks.";
        case "web":
          return "You are working on a Next.js project (Page Router/App Router as provided) with Tailwind CSS. Use the 'app/' directory for files. Focus on web development tasks.";
        case "mobile":
          return `You are working on an Expo (React Native) project using Expo Router (file-based routing). Use the 'app/ directory for files. Focus on react native tasks.
  
          CRITICAL STRUCTURE:
          - 'app/' directory contains all routes (file-based routing)
          - 'app/_layout.tsx' is the root layout wrapper
          - 'app/index.tsx' is the home screen
          - Each .tsx file in 'app/' becomes a route
  
          MUST FOLLOW:
          - Use ONLY React Native core components: View, Text, ScrollView, TextInput, Button, TouchableOpacity, Image, FlatList
          - Style using StyleSheet.create() - NO Tailwind, NO web CSS
          - All styles must be objects: {flex: 1, backgroundColor: '#000'}
          - Use flexbox for layouts (flexDirection, justifyContent, alignItems)
          - Import components: import { View, Text, StyleSheet } from 'react-native'
        
          EXAMPLE PATTERN:
          import { View, Text, StyleSheet } from 'react-native';
          export default function Screen() {
            return <View style={styles.container}><Text>Hello</Text></View>;
          }
          const styles = StyleSheet.create({ container: { flex: 1, padding: 20 } });
          
          Focus on mobile app development tasks. ALWAYS use StyleSheet for styling.`;
        case "word":
          return `You are working on a Document project using the 'docx' library.

          CRITICAL: Modify the 'generateDocument' function in App.jsx directly.

          REQUIRED PATTERN - Update this function:

          \`\`\`javascript
          import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
          import { saveAs } from "file-saver";

          const generateDocument = () => {
            const doc = new Document({
              sections: [{
                properties: {},
                children: [
                  new Paragraph({
                    text: "Document Title",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 200 }
                  }),
                  new Paragraph({
                    text: "This is body text content.",
                    spacing: { after: 100 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Bold text", bold: true }),
                      new TextRun({ text: " and normal text." })
                    ]
                  }),
                  new Paragraph({
                    text: "Another heading",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ 
                        text: "Styled text example: ",
                        size: 24 
                      }),
                      new TextRun({ 
                        text: "italic, ",
                        italics: true 
                      }),
                      new TextRun({ 
                        text: "underlined, ",
                        underline: {} 
                      }),
                      new TextRun({ 
                        text: "colored",
                        color: "FF0000" 
                      })
                    ]
                  })
                ]
              }]
            });
            
            Packer.toBlob(doc).then(blob => {
              saveAs(blob, "document.docx");
            });
          };
          \`\`\`

          COMMON ELEMENTS:

          Headings:
          \`\`\`javascript
          new Paragraph({
            text: "Heading Text",
            heading: HeadingLevel.HEADING_1, // or HEADING_2, HEADING_3, etc.
            spacing: { after: 200 }
          })
          \`\`\`

          Lists:
          \`\`\`javascript
          new Paragraph({
            text: "Bullet point item",
            bullet: { level: 0 }
          })
          \`\`\`

          Text Styling:
          \`\`\`javascript
          new TextRun({
            text: "Styled text",
            bold: true,
            italics: true,
            underline: {},
            color: "FF0000", // hex color without #
            size: 24, // half-points (24 = 12pt)
            font: "Arial"
          })
          \`\`\`

          Spacing:
          \`\`\`javascript
          spacing: { 
            before: 200,  // space before paragraph
            after: 100    // space after paragraph
          }
          \`\`\`

          TASK EXECUTION:
          - To add content: Add new Paragraph objects to the children array
          - To modify text: Edit existing Paragraph/TextRun objects
          - To change styling: Update TextRun properties (bold, color, size, etc.)
          - To reorder: Rearrange items in the children array

          DO NOT use 'src/content.json' unless specifically refactoring.
          All changes must be made directly in the generateDocument function in App.jsx.`;
        case "slides":
          return `You are working on a Presentation Maker using 'pptxgenjs'.

          You must ONLY modify the 'generatePresentation' function in App.jsx.
          DO NOT create or use any other slide tools, frameworks, or platforms.
          ALL slide output must be via pptxgenjs inside that function.

          CRITICAL: Modify the 'generatePresentation' function in App.jsx directly.

          REQUIRED PATTERN - Update this function:

          \`\`\`javascript
          import PptxGenJS from 'pptxgenjs';

          const generatePresentation = async (title, subtitle, content) => {
            const pptx = new PptxGenJS();
            
            // Slide 1: Title Slide
            const slide1 = pptx.addSlide();
            slide1.addText(title, { 
              x: 1, y: 1, w: '80%', h: 1, 
              fontSize: 36, align: 'center', bold: true, color: '363636' 
            });
            slide1.addText(subtitle, { 
              x: 1, y: 2.5, w: '80%', h: 1, 
              fontSize: 24, align: 'center', color: '666666' 
            });

            // Slide 2: Content Slide
            const slide2 = pptx.addSlide();
            slide2.addText("Slide Title", { 
              x: 0.5, y: 0.5, w: '90%', h: 1, 
              fontSize: 24, bold: true, color: '363636' 
            });
            
            // Add bullet points
            const bullets = content.split('\\n').map(line => ({
              text: line.trim(),
              options: { fontSize: 18, color: '444444', breakLine: true }
            }));
            
            slide2.addText(bullets, { 
              x: 1, y: 1.5, w: '80%', h: 4, 
              bullet: true 
            });

            await pptx.writeFile({ fileName: 'Presentation.pptx' });
          };
          \`\`\`

          COMMON ELEMENTS:

          Adding a Slide:
          \`\`\`javascript
          const slide = pptx.addSlide();
          // Optional: Add master slide layout
          // const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' }); 
          \`\`\`

          Adding Text:
          \`\`\`javascript
          slide.addText("Hello World", {
            x: 1, // inches from left
            y: 1, // inches from top
            w: '80%', // width
            h: 1, // height
            fontSize: 24,
            color: '0088CC',
            align: 'center', // left, center, right
            bold: true,
            italic: false
          });
          \`\`\`

          Adding Shapes:
          \`\`\`javascript
          slide.addShape(pptx.ShapeType.rect, {
            x: 0.5, y: 0.5, w: 9, h: 0.5,
            fill: { color: '0088CC' }
          });
          \`\`\`

          Adding Tables:
          \`\`\`javascript
          const rows = [
            ["Header 1", "Header 2"],
            ["Cell 1", "Cell 2"]
          ];
          slide.addTable(rows, {
            x: 1, y: 2, w: 8,
            colW: [4, 4],
            border: { pt: 1, color: 'BBBBBB' }
          });
          \`\`\`

          TASK EXECUTION:
          - Always instantiate \`new PptxGenJS()\` inside the function.
          - Use \`x, y, w, h\` for positioning (default is inches).
          - Colors are hex strings WITHOUT '#'.
          - Use \`await pptx.writeFile()\` at the end.
          - Everything must be hardcoded in \`generatePresentation\`.
          `;
        case "excel":
          return `You are working on a Data Analysis Dashboard using 'recharts'.

          CRITICAL RULES:
          1. Update 'src/App.jsx' DIRECTLY - DO NOT create new component files
          2. Modify ONLY the data between the comment markers: \`// -- CHART DATA START\` and \`// -- CHART DATA END\`
          3. Keep those comment lines intact
          4. You CAN change the chart type by modifying the chartType state initialization

          REQUIRED PATTERN - Modify the data state variable:

          \`\`\`javascript
          // In src/App.jsx, find this section:
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

          // To change the default chart type, modify this line:
          const [chartType, setChartType] = useState('bar'); // Options: 'bar', 'line', 'pie'
          \`\`\`

          DATA FORMAT FOR RECHARTS:
          - Data is an array of objects
          - Each object represents one data point
          - Use 'name' for labels (x-axis or pie slices)
          - Use descriptive keys for data values (e.g., 'value', 'sales', 'revenue')

          EXAMPLES:

          Change to quarterly data with line chart:
          \`\`\`javascript
          const [data, setData] = useState([
            { quarter: 'Q1', revenue: 45000 },
            { quarter: 'Q2', revenue: 52000 },
            { quarter: 'Q3', revenue: 48000 },
            { quarter: 'Q4', revenue: 61000 },
          ]);

          const [chartType, setChartType] = useState('line');
          \`\`\`

          Pie chart with market share:
          \`\`\`javascript
          const [data, setData] = useState([
            { name: 'Product A', value: 35 },
            { name: 'Product B', value: 25 },
            { name: 'Product C', value: 20 },
            { name: 'Product D', value: 20 },
          ]);

          const [chartType, setChartType] = useState('pie');
          \`\`\`

          Multiple data series (comparison):
          \`\`\`javascript
          const [data, setData] = useState([
            { month: 'Jan', sales2024: 12, sales2023: 8 },
            { month: 'Feb', sales2024: 19, sales2023: 11 },
            { month: 'Mar', sales2024: 15, sales2023: 13 },
            { month: 'Apr', sales2024: 25, sales2023: 17 },
            { month: 'May', sales2024: 22, sales2023: 19 },
          ]);

          const [chartType, setChartType] = useState('bar');
          \`\`\`

          IMPORTANT NOTES FOR MULTIPLE SERIES:
          - When adding multiple data series, you'll also need to update the chart components
          - For BarChart: Add multiple <Bar> components with different dataKey props
          - For LineChart: Add multiple <Line> components with different dataKey props
          - Example for comparison chart:
          \`\`\`javascript
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales2024" fill="#3b82f6" name="Sales 2024" />
            <Bar dataKey="sales2023" fill="#ef4444" name="Sales 2023" />
          </BarChart>
          \`\`\`

          COLOR OPTIONS (hex codes):
          \`\`\`javascript
          // Blue
          fill="#3b82f6"

          // Red
          fill="#ef4444"

          // Green
          fill="#22c55e"

          // Purple
          fill="#a855f7"

          // Cyan
          fill="#06b6d4"

          // Yellow
          fill="#eab308"

          // Orange
          fill="#f97316"

          // Pink
          fill="#ec4899"
          \`\`\`

          PIE CHART COLORS:
          Pie charts use the COLORS array defined in App.jsx:
          \`\`\`javascript
          const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
          \`\`\`

          TASK EXECUTION STEPS:
          1. Read the current 'src/App.jsx' file
          2. Locate the \`// -- CHART DATA START\` marker
          3. Replace the data state initialization between START and END markers
          4. If user wants a specific chart type, modify the chartType useState line
          5. If adding multiple data series, also update the corresponding chart component (BarChart, LineChart, etc.) to include additional <Bar> or <Line> components
          6. Keep the comment lines intact
          7. Do NOT modify file upload handlers or UI components (unless specifically requested)

          WHAT YOU CAN MODIFY:
          ✅ data array - the array of objects with name/value pairs
          ✅ object keys - use descriptive names (e.g., 'sales', 'revenue', 'users')
          ✅ chartType initial value - 'bar', 'line', or 'pie'
          ✅ Chart components (BarChart, LineChart, PieChart) - to add multiple series or customize

          WHAT NOT TO MODIFY:
          ❌ handleFileUpload function
          ❌ ResponsiveContainer wrapper
          ❌ UI components or buttons (unless specifically requested)
          ❌ The control panel buttons logic
          ❌ COLORS array (unless adding more colors)
          ❌ Anything outside the CHART DATA markers (except chartType useState and chart components if needed)

          Users can also manually switch chart types using the Control Panel buttons in the UI.`;

        default:
          return "You are working on a project with an unspecified type. Proceed with general development tasks.";
      }
    };

    const projectInstructions = getProjectTypeInstructions(projectType);

    const systemPrompt = `
      You are Betty, a high-performance AI agent powered by Gemini 3 Flash. 
      Your current task is to assist the user with a project of type: ${projectType.toUpperCase()}.
      
      Your environment:
      - You can read files, write files, list directories.
      
      Project-specific instructions:
      - ${projectInstructions}

      General instructions:
      - THE PROJECT IS ALREADY INITIALIZED. DO NOT run setup commands like 'npm init', 'npm create', 'npx create-...', or 'vite init'.
      - NEVER run interactive commands that wait for user input.
      - ALWAYS check file content before overwriting if you are unsure.
      - NEVER run 'npm run dev', 'npm start', or 'npm run web' after editing files. The server is already running and will HOT-RELOAD automatically.
      - Be concise in your verbal responses.
    `;

    let currentTurnHistory = chatHistory.map(({ role, parts }) => ({
      role,
      parts,
    }));

    const lastMsg = chatHistory[chatHistory.length - 1];
    const userMsgAlreadyInHistory =
      lastMsg &&
      lastMsg.role === "user" &&
      lastMsg.parts[0].text === userMessage;

    if (!userMsgAlreadyInHistory) {
      currentTurnHistory.push({ role: "user", parts: [{ text: userMessage }] });
      yield {
        type: "message",
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      let response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        systemInstruction: systemPrompt,
        contents: currentTurnHistory,
        config: {
          tools: [{ functionDeclarations: tools }],
          thinkingConfig: {
            thinkingLevel: "high",
            includeThoughts: true,
          },
        },
      });

      let candidate = response.candidates[0];
      let functionCalls = candidate.content.parts.filter((p) => p.functionCall);

      while (functionCalls && functionCalls.length > 0) {
        currentTurnHistory.push(candidate.content);

        const toolParts = [];
        for (const call of functionCalls) {
          const { name, args } = call.functionCall;

          yield {
            type: "tool_use",
            tool_name: name,
            tool_id: `${name}-${Date.now()}`,
            parameters: args,
            timestamp: new Date().toISOString(),
          };

          const summary = args.file_path
            ? `Editing ${args.file_path}...`
            : args.command
              ? `Running: ${args.command}`
              : `Processing with ${name}...`;

          setWorkingTask({ name, summary });
          setStatus(`Executing: ${name}...`);

          const toolResult = await executeTool(name, args);

          toolParts.push({
            functionResponse: {
              name,
              response: { content: toolResult },
            },
          });

          yield {
            type: "tool_result",
            tool_id: `${name}-${Date.now()}`, // Re-using id for simplicity, could map
            status: toolResult.startsWith("Error:") ? "error" : "success",
            output: toolResult,
            timestamp: new Date().toISOString(),
          };
        }

        currentTurnHistory.push({ role: "tool", parts: toolParts });

        response = await this.ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: currentTurnHistory,
          config: {
            tools: [{ functionDeclarations: tools }],
            thinkingConfig: { includeThoughts: true },
          },
        });

        candidate = response.candidates[0];
        functionCalls = candidate.content.parts.filter((p) => p.functionCall);
      }

      setWorkingTask(null);
      setStatus("Betty is awaiting instructions...");

      const textPart = candidate.content.parts.find((p) => p.text);
      if (textPart) {
        yield {
          type: "message",
          role: "assistant",
          content: textPart.text,
          delta: false, // Not a delta, it's the full final response
          timestamp: new Date().toISOString(),
        };
      }

      yield {
        type: "result",
        status: "success",
        stats: {}, // Placeholder for actual stats
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Gemini 3 Service Error:", error);
      setWorkingTask(null);
      setStatus("Error: Neural core disconnect.");

      yield {
        type: "error",
        message: error.message || "An unknown error occurred.",
        timestamp: new Date().toISOString(),
      };

      if (error.message?.includes("400")) {
        yield {
          type: "message",
          role: "assistant",
          content:
            "System Error (400): Thought Signature mismatch. Ensure history is preserved.",
          timestamp: new Date().toISOString(),
        };
      } else {
        yield {
          type: "message",
          role: "assistant",
          content:
            "I apologize, but I encountered a reasoning error while accessing my tools.",
          timestamp: new Date().toISOString(),
        };
      }

      yield {
        type: "result",
        status: "error",
        stats: {}, // Placeholder
        timestamp: new Date().toISOString(),
      };
    }
  }
}
