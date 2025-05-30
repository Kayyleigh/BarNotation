import { decorationToLatexCommand } from "../utils/accentUtils";
import { getCloseSymbol, getOpenSymbol } from "../utils/bracketUtils";
import { isEmptyNode } from "../utils/treeUtils";
import { parseLatex } from "./mathNodeParser";
import { bigOperatorToLatex, symbolToLatex } from "./specialSequences";
import type { MathNode } from "./types";

export const nodeToLatex = (node: MathNode): string => {
    switch (node.type) {
      case "root-wrapper": {
        return `\\[\n${nodeToLatex(node.child)}\n\\]`
      }

      case "text": {
        const fromMap = symbolToLatex[node.content]; // Revert special char back to latex sequence
        return fromMap ?? node.content;
      }

      case "multi-digit":
      case "command-input":
        return node.children.map(nodeToLatex).join("");

      case "styled": {
        //TODO: maybe here allow own styling to latex styling mapping too
        return nodeToLatex(node.child);
      }
  
      case "inline-container": {
        return node.children.map(nodeToLatex).join("");
      }
  
      case "group": {
        const openBracket = getOpenSymbol(node.bracketStyle)
        const closeBracket = getCloseSymbol(node.bracketStyle)
        return `${openBracket}${nodeToLatex(node.child)}${closeBracket}`; 
      }
  
      case "fraction": {
        return `\\frac{${nodeToLatex(node.numerator)}}{${nodeToLatex(node.denominator)}}`;
      }
  
      case "nth-root": {
        if (node.index) {
          return `\\sqrt[${nodeToLatex(node.index)}]{${nodeToLatex(node.base)}}`;
        }
        return `\\sqrt{${nodeToLatex(node.base)}}`;
      }
  
      case "big-operator": {
        const lower = node.lower ? `_{${nodeToLatex(node.lower)}}` : "";
        const upper = node.upper ? `^{${nodeToLatex(node.upper)}}` : "";
        return `${bigOperatorToLatex[node.operator]}${lower}${upper}`;
      }
      case "childed": {
        if (node.variant === "subsup") {
          const subLeft = `${!isEmptyNode(node.subLeft) ? ("_{" + nodeToLatex(node.subLeft) + "}") : ""}`;
          const supLeft = `${!isEmptyNode(node.supLeft) ? ("^{" + nodeToLatex(node.supLeft) + "}") : ""}`;
          const base = `{${nodeToLatex(node.base)}}`;
          const subRight = `${!isEmptyNode(node.subRight) ? ("_{" + nodeToLatex(node.subRight) + "}") : ""}`;
          const supRight = `${!isEmptyNode(node.supRight) ? ("^{" + nodeToLatex(node.supRight) + "}") : ""}`;      
          return `${subLeft}${supLeft}${base}${subRight}${supRight}`;
        } 
        else {
          const subLeft = `${node.subLeft ? nodeToLatex(node.subLeft) : ""}`;
          const supLeft = `${node.supLeft ? nodeToLatex(node.supLeft) : ""}`;
          const base = `${nodeToLatex(node.base)}`;
          const subRight = `${node.subRight ? nodeToLatex(node.subRight) : ""}`;
          const supRight = `${node.supRight ? nodeToLatex(node.supRight) : ""}`;
      
          return `\\actsymb[${subLeft}][${supLeft}]{${base}}{${subRight}}[${supRight}]`;
        }
      }
  
      case "accented": {
        // if predef then name (or improve), else \underset or \overset w the custom
        if (node.accent.type === 'predefined') {
          const latexCommand = decorationToLatexCommand[node.accent.decoration].command;
          if (!latexCommand) {
            throw new Error(`Unknown decoration: ${node.accent}`);
          }
          return `${latexCommand}{${nodeToLatex(node.base)}}`;
        }
        else {
          // Custom accent type
          const latexCommand = node.accent.position === 'above' ? '\\overset' : '\\underset'
          return `${latexCommand}{${nodeToLatex(node.accent.content)}}{${nodeToLatex(node.base)}}`;
        }
      }
  
      case "matrix": {
        return `\\begin{bmatrix}`
          + node.rows.map(row => row.map(nodeToLatex).join(" & ")).join(" \\\\ ")
          + `\\end{bmatrix}`;
      }
  
      case "vector": {
        const joined = node.elements.map(nodeToLatex).join(
          node.orientation === "horizontal" ? " & " : " \\\\ "
        );
        const env = "bmatrix";
        return `\\begin{${env}}${joined}\\end{${env}}`;
      }
  
      default: {
        console.warn(`${node.type} has no case in nodeToLatex.`)
        return "";
      }
    }
  };

  export const nodeToLatexHighlighted = (node: MathNode): string => {
    // Standard Latex styling
    const wrapCmd = (s: string) => `<span class="latex-cmd">${s}</span>`;
    const wrapBracket = (s: string) => `<span class="latex-bracket">${s}</span>`;
    const wrapText = (s: string) => `<span class="latex-text">${s}</span>`;

    // Extra packages styling
    const wrapActsymb = (s: string) => `<span class="latex-actuarialsymbol">${s}</span>`;


    switch (node.type) {
      case "root-wrapper": {
        return wrapCmd("\\[") + "\n"
          + nodeToLatexHighlighted(node.child) + "\n"
          + wrapCmd("\\]");
      }
  
      case "text": {
        const fromMap = symbolToLatex[node.content]; // revert special char to latex
        const content = fromMap ?? node.content;
        return wrapText(content);
      }
  
      case "multi-digit":
      case "command-input":
        // Join children, all text normally colored
        return node.children.map(nodeToLatexHighlighted).join("");
  
      case "styled": {
        return nodeToLatexHighlighted(node.child);
      }
  
      case "inline-container": {
        return node.children.map(nodeToLatexHighlighted).join("");
      }
  
      case "group": {
        if (['square', 'curly'].includes(node.bracketStyle)) {
          const openBracket = wrapBracket(getOpenSymbol(node.bracketStyle));
          const closeBracket = wrapBracket(getCloseSymbol(node.bracketStyle));
          return openBracket + nodeToLatexHighlighted(node.child) + closeBracket;
        }
        const openBracket = wrapText(getOpenSymbol(node.bracketStyle));
        const closeBracket = wrapText(getCloseSymbol(node.bracketStyle));
        return openBracket + nodeToLatexHighlighted(node.child) + closeBracket;
      }
  
      case "fraction": {
        return wrapCmd("\\frac") + wrapBracket("{") 
          + nodeToLatexHighlighted(node.numerator) + wrapBracket("}") + wrapBracket("{") 
          + nodeToLatexHighlighted(node.denominator) + wrapBracket("}");
      }
  
      case "nth-root": {
        if (node.index) {
          return wrapCmd("\\sqrt") + wrapBracket("[") 
            + nodeToLatexHighlighted(node.index) + wrapBracket("]") + wrapBracket("{") 
            + nodeToLatexHighlighted(node.base) + wrapBracket("}");
        }
        return wrapCmd("\\sqrt") + wrapBracket("{") + nodeToLatexHighlighted(node.base) + wrapBracket("}");
      }
  
      case "big-operator": {
        const lower = node.lower ? wrapText("_") + wrapBracket("{") + nodeToLatexHighlighted(node.lower) + wrapBracket("}") : "";
        const upper = node.upper ? wrapText("^") + wrapBracket("{") + nodeToLatexHighlighted(node.upper) + wrapBracket("}") : "";
        return wrapCmd(bigOperatorToLatex[node.operator]) + lower + upper;
      }
      
      case "childed": {
        if (node.variant === "subsup") {
          const subLeft = (!isEmptyNode(node.subLeft)) ? (wrapText("_") + wrapBracket("{") + nodeToLatexHighlighted(node.subLeft) + wrapBracket("}")) : "";
          const supLeft = (!isEmptyNode(node.supLeft)) ? (wrapText("^") + wrapBracket("{") + nodeToLatexHighlighted(node.supLeft) + wrapBracket("}")) : "";
          const base = wrapBracket("{") + nodeToLatexHighlighted(node.base) + wrapBracket("}");
          const subRight = (!isEmptyNode(node.subRight)) ? (wrapText("_") + wrapBracket("{") + nodeToLatexHighlighted(node.subRight) + wrapBracket("}")) : "";
          const supRight = (!isEmptyNode(node.supRight)) ? (wrapText("^") + wrapBracket("{") + nodeToLatexHighlighted(node.supRight) + wrapBracket("}")) : "";
          return subLeft + supLeft + base + subRight + supRight;
        } else {
          // Example for your custom command
          const subLeft = wrapBracket("[") + (node.subLeft ? nodeToLatexHighlighted(node.subLeft) : "") + wrapBracket("]");
          const supLeft = wrapBracket("[") + (node.supLeft ? nodeToLatexHighlighted(node.supLeft) : "") + wrapBracket("]");
          const base = wrapBracket("{") + nodeToLatexHighlighted(node.base) + wrapBracket("}");
          const subRight = wrapBracket("{") + (node.subRight ? nodeToLatexHighlighted(node.subRight) : "") + wrapBracket("}");
          const supRight = wrapBracket("[") + (node.supRight ? nodeToLatexHighlighted(node.supRight) : "") + wrapBracket("]");
          return wrapActsymb(wrapCmd("\\actsymb") + `${subLeft}${supLeft}${base}${subRight}${supRight}`);
        }
      }
  
      case "accented": {
        if (node.accent.type === 'predefined') {
          const decorationInfo  = decorationToLatexCommand[node.accent.decoration];
          if (!decorationInfo) {
            throw new Error(`Unknown decoration: ${node.accent}`);
          }
          const latexCommand = decorationInfo.command;
          const packageName = decorationInfo.package;

          const latexContent =
            wrapCmd(latexCommand) +
            wrapBracket("{") +
            nodeToLatexHighlighted(node.base) +
            wrapBracket("}");

          return wrapWithPackage(latexContent, packageName);
        }
        else {
          const latexCommand = node.accent.position === 'above' ? wrapCmd("\\overset") : wrapCmd("\\underset");
          return latexCommand + wrapBracket("{") + nodeToLatexHighlighted(node.accent.content) + wrapBracket("}") + wrapBracket("{") + nodeToLatexHighlighted(node.base) + wrapBracket("}");
        }
      }
  
      case "matrix": {
        return wrapCmd("\\begin{bmatrix}") 
          + node.rows.map(row => row.map(nodeToLatexHighlighted).join(" & ")).join(" \\\\ ") 
          + wrapCmd("\\end{bmatrix}");
      }
  
      case "vector": {
        const joined = node.elements.map(nodeToLatexHighlighted).join(
          node.orientation === "horizontal" ? " & " : " \\\\ "
        );
        const env = "bmatrix";
        return wrapCmd("\\begin{" + env + wrapBracket("}")) + joined + wrapCmd("\\end{" + env + wrapBracket("}"));
      }
  
      default: {
        console.warn(`${node.type} has no case in nodeToLatex.`);
        return "";
      }
    }
  };

  function wrapWithPackage(latexCode: string, packageName?: string): string {
    if (!packageName) return latexCode;
    // You can customize this wrapper as needed.
    return `<span class="latex-${packageName}">${latexCode}</span>`;
  }
  
  
export const latexToMathNode = (latex: string): MathNode => {
  return parseLatex(latex)
};