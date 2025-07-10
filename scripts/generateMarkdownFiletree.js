import fs from "fs-extra";

const TREE_FILE = "docs/tree-output.txt";
const DESC_FILE = "docs/file-descriptions.json";
const OUTPUT_FILE = "docs/README_TREE.md";
const GITHUB_BASE_URL = "https://github.com/Kayyleigh/BarNotation/blob/main/";

const ignorePaths = [
  "zOutdated",
];

function normalizePath(path) {
  return path.replace(/\\/g, "/").replace(/\/+/g, "/");
}

function parseTreeOutput(lines) {
  const stack = [];
  const root = [];

  let i = 0;

  for (const line of lines) {
    i++;

    if (i < 3) continue; // Skip volume info or empty lines
    const trimmed = line.trim();
    if (!trimmed) continue;

    const level = (i === 3) ? 0 : ((line.match(/^[|\s]*/)?.[0].length) + 1 || 1);
    const name = (i === 3) ? "src" : trimmed.replace(/^[|+\\\- ]+/, "");

    const node = { name, children: [], level };

    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // console.log(node) //only very root
      root.push(node);
    } else {
      if (node.name !== "" && !ignorePaths.some(ignore => node.name.startsWith(ignore))) stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  }

  return root;
}

// function renderMarkdown(nodes, descriptions, prefix = "", indentLevel = 0) {
//   return nodes
//     .map(({ name, children }) => {
//       // Add trailing slash for folders
//       const isFolder = children.length > 0;
//       let displayName = isFolder ? name + "/" : name;

//       let path = `${prefix}${displayName}`;
//       console.log(path)

//       const desc = descriptions[path] || "";

//       if (isFolder) {
//         // Render children recursively
//         const innerMarkdown = renderMarkdown(children, descriptions, path, indentLevel + 1);

//         // Wrap children in collapsible details, indent everything properly
//         const detailsBlock = `<details>
//   <summary><code>${displayName}</code> — ${desc}<br></summary>

// ${innerMarkdown}

// </details>`;

//         return detailsBlock;
//       } else {
//         // Leaf file — just a bullet item with indent
//         return `●	\`${displayName}\` — ${desc}<br>`;
//       }
//     })
//     .join("");
// }

// const styleBlock = `<style>
// details {
//   margin-left: 2em;
// }
// summary {
//   margin-left: -2em;
// }
// </style>

// `;

function renderMarkdown(nodes, descriptions, prefix = "", indentLevel = 0) {
  const indent = "  ".repeat(indentLevel);

  return nodes
    .map(({ name, children }) => {
      const isFolder = children.length > 0;
      const displayName = isFolder ? `${name}/` : name;
      const path = normalizePath(`${prefix}${displayName}`); // Normalize for consistent keys and URLs
      const desc = descriptions[path] || "";

      const githubUrl = `${GITHUB_BASE_URL}${encodeURI(path)}`;

      if (indentLevel === 0 && isFolder) {
        const inner = renderMarkdown(children, descriptions, path, indentLevel + 1);
        return `<details><summary><code>${displayName}</code>${desc ? ` — ${desc}` : ""}</summary>\n\n${inner}\n</details>`;
      }

      const line = `${indent}- [\`${displayName}\`](${githubUrl})${desc ? ` — ${desc}` : " — #TODO"}`;
      if (!desc) {
        console.log(`"${path}": "",`);
      }

      if (isFolder) {
        const inner = renderMarkdown(children, descriptions, path, indentLevel + 1);
        return `${line}\n${inner}`;
      }

      return line;
    })
    .join("\n");
}


async function main() {
  try {
    const descriptions = fs.readJSONSync(DESC_FILE);
    const input = await fs.readFile(TREE_FILE, "utf16le");
    const lines = input.split(/\r?\n/);
    const tree = parseTreeOutput(lines);
    const markdown = renderMarkdown(tree, descriptions);

    // Prepend the style block to markdown
    // const outputContent = styleBlock + markdown.trimStart();
    const outputContent =  markdown.trimStart();

    await fs.writeFile(OUTPUT_FILE, outputContent);
    console.log(`✅ Generated ${OUTPUT_FILE} from ${TREE_FILE}`);
  } catch (err) {
    console.error("❌ Failed to generate tree:", err);
  }
}

main();
