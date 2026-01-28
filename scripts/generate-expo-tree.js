import fs from "fs";
import path from "path";

const ROOT = path.resolve("./bolt-expo"); // path to your downloaded project

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const tree = {};

  for (const entry of entries) {
    if (entry.name === "node_modules") continue; // skip modules

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      tree[entry.name] = { directory: walk(fullPath) };
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      let contents = fs.readFileSync(fullPath, "utf8");

      // optional: encode binaries like images
      if ([".png", ".jpg", ".jpeg", ".ico"].includes(ext)) {
        contents = fs.readFileSync(fullPath).toString("base64");
      }

      tree[entry.name] = { file: { contents } };
    }
  }

  return tree;
}

const fsTree = walk(ROOT);

const output = `/** @type {import('@webcontainer/api').FileSystemTree} */
export const expoStarter = ${JSON.stringify(fsTree, null, 2)};`;

fs.writeFileSync("./expoStarter.js", output);

console.log("✅ FileSystemTree generated from local Bolt Expo project");
