import fs from "fs-extra";

const TREE_FILE = "docs/tree-output.txt";
const DESC_FILE = "docs/file-descriptions.json";
const OUTPUT_FILE = "docs/README_TREE.md";

function parseTreeOutput(lines) {
  const stack = [];
  const root = [];

  let i = 0;

  for (const line of lines) {
    i++;

    // Skip volume info lines
    if (i < 3) {
      continue;
    };

    const trimmed = line.trim();
    if (!trimmed) continue;

    const level = (i === 3) ? 0 : ((line.match(/^[|\s]*/)?.[0].length) + 1 || 0);
    let name =  (i === 3) ? "src" : trimmed.replace(/^[|+\\\- ]+/, "");

    // Add trailing slash to folder names only if they have children
    // But we don't know children here yet, so just add trailing slash in render step

    const node = { name, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
      stack.push({ ...node, level });
    } else {
      const parent = stack[stack.length - 1];
      if (node.name !== "") {  // skip empty lines
        parent.children.push(node);
        stack.push({ ...node, level });
      }
    }
  }
  return root;
}

function renderMarkdown(nodes, descriptions, prefix = "", indentLevel = 0) {
  return nodes
    .map(({ name, children }) => {
      // Add trailing slash for folders
      const isFolder = children.length > 0;
      let displayName = isFolder ? name + "/" : name;

      let path = `${prefix}${displayName}`;
      console.log(path)

      const desc = descriptions[path] || "";

      if (isFolder) {
        // Render children recursively
        const innerMarkdown = renderMarkdown(children, descriptions, path, indentLevel + 1);

        // Wrap children in collapsible details, indent everything properly
        const detailsBlock = `<details>
  <summary><code>${displayName}</code> — ${desc}<br></summary>

${innerMarkdown}

</details>`;

        return detailsBlock;
      } else {
        // Leaf file — just a bullet item with indent
        return `●	\`${displayName}\` — ${desc}<br>`;
      }
    })
    .join("");
}

const styleBlock = `<style>
details {
  margin-left: 2em;
}
summary {
  margin-left: -2em;
}
</style>

`;

async function main() {
  try {
    const descriptions = fs.readJSONSync(DESC_FILE);
    const input = await fs.readFile(TREE_FILE, "utf16le");
    const lines = input.split(/\r?\n/);
    const tree = parseTreeOutput(lines);
    const markdown = renderMarkdown(tree, descriptions);

    // Prepend the style block to markdown
    const outputContent = styleBlock + markdown.trimStart();

    await fs.writeFile(OUTPUT_FILE, outputContent);
    console.log(`✅ Generated ${OUTPUT_FILE} from ${TREE_FILE}`);
  } catch (err) {
    console.error("❌ Failed to generate tree:", err);
  }
}

main();
