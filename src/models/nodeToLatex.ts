import { decorationToLatexCommand } from "../utils/accentUtils";
import { getOpenSymbol, getCloseSymbol } from "../utils/bracketUtils";
import { isEmptyNode } from "../utils/treeUtils";
import { bigOperatorToLatex } from "./specialSequences";
import type { MathNode } from "./types";

export const nodeToLatex = (node: MathNode, highlighted = false): string => {
    // Wrappers for highlighted vs raw output
    const wrapCmd = (s: string) => highlighted ? `<span class="latex-cmd">${s}</span>` : s;
    const wrapBracket = (s: string) => highlighted ? `<span class="latex-bracket">${s}</span>` : s;
    const wrapText = (s: string) => highlighted ? `<span class="latex-text">${s}</span>` : s;
    const wrapActsymb = (s: string) => highlighted ? `<span class="latex-actuarialsymbol">${s}</span>` : s;
    
    // Utility to wrap with package if needed (used in accent)
    function wrapWithPackage(latexCode: string, packageName?: string): string {
      if (!highlighted || !packageName) return latexCode;
      return `<span class="latex-${packageName}">${latexCode}</span>`;
    }
  
    switch (node.type) {
      case "root-wrapper": {
        return wrapCmd("\\[") + "\n"
          + nodeToLatex(node.child, highlighted) + "\n"
          + wrapCmd("\\]");
      }
  
      case "text": {
        return highlighted ? wrapText(node.inputAlias) : node.inputAlias;
      }
  
      case "multi-digit":
      case "command-input":
        return node.children.map(child => nodeToLatex(child, highlighted)).join("");
  
      case "styled": {
        const { color, fontSize, fontStyling } = node.style;
        const fontStyle = fontStyling?.fontStyleAlias;
        const child = nodeToLatex(node.child, highlighted);
  
        const wrappers: string[] = [];
  
        if (fontSize) {
          if (highlighted) {
            wrappers.push(`${wrapCmd('\\scalebox')}${wrapBracket('{')}${fontSize}${wrapBracket('}')}`);
          } else {
            wrappers.push(`\\scalebox{${fontSize}}`);
          }
        }
  
        if (color) {
          if (highlighted) {
            wrappers.push(`${wrapCmd('\\textcolor')}${wrapBracket('{')}${color}${wrapBracket('}')}`);
          } else {
            wrappers.push(`\\textcolor{${color}}`);
          }
        }
  
        if (fontStyle) {
          wrappers.push(highlighted ? wrapCmd(fontStyle) : fontStyle);
        }
  
        return wrappers.reduceRight(
          (acc, cmd) => highlighted
            ? `${cmd}${wrapBracket("{")}${acc}${wrapBracket("}")}`
            : `${cmd}{${acc}}`,
          child
        );
      }
  
      case "inline-container":
        return node.children.map(child => nodeToLatex(child, highlighted)).join("");
  
      case "group": {
        const openSymbol = getOpenSymbol(node.bracketStyle);
        const closeSymbol = getCloseSymbol(node.bracketStyle);
  
        if (highlighted && ['square', 'curly'].includes(node.bracketStyle)) {
          return wrapBracket(openSymbol) + nodeToLatex(node.child, highlighted) + wrapBracket(closeSymbol);
        }
        if (highlighted) {
          return wrapText(openSymbol) + nodeToLatex(node.child, highlighted) + wrapText(closeSymbol);
        }
        return openSymbol + nodeToLatex(node.child, highlighted) + closeSymbol;
      }
  
      case "fraction": {
        if (highlighted) {
          return wrapCmd("\\frac") + wrapBracket("{") +
            nodeToLatex(node.numerator, highlighted) + wrapBracket("}") +
            wrapBracket("{") + nodeToLatex(node.denominator, highlighted) + wrapBracket("}");
        }
        return `\\frac{${nodeToLatex(node.numerator, highlighted)}}{${nodeToLatex(node.denominator, highlighted)}}`;
      }
  
      case "nth-root": {
        if (node.index) {
          if (highlighted) {
            return wrapCmd("\\sqrt") + wrapBracket("[") +
              nodeToLatex(node.index, highlighted) + wrapBracket("]") + wrapBracket("{") +
              nodeToLatex(node.base, highlighted) + wrapBracket("}");
          }
          return `\\sqrt[${nodeToLatex(node.index, highlighted)}]{${nodeToLatex(node.base, highlighted)}}`;
        }
        if (highlighted) {
          return wrapCmd("\\sqrt") + wrapBracket("{") + nodeToLatex(node.base, highlighted) + wrapBracket("}");
        }
        return `\\sqrt{${nodeToLatex(node.base, highlighted)}}`;
      }
  
      case "big-operator": {
        const lower = node.lower
          ? (highlighted ? wrapText("_") + wrapBracket("{") + nodeToLatex(node.lower, highlighted) + wrapBracket("}") : `_{${nodeToLatex(node.lower, highlighted)}}`)
          : "";
        const upper = node.upper
          ? (highlighted ? wrapText("^") + wrapBracket("{") + nodeToLatex(node.upper, highlighted) + wrapBracket("}") : `^{${nodeToLatex(node.upper, highlighted)}}`)
          : "";
        const op = bigOperatorToLatex[node.operator];
        return highlighted ? wrapCmd(op) + lower + upper : `${op}${lower}${upper}`;
      }
  
      case "childed": {
        if (node.variant === "subsup") {
          const subLeft = !isEmptyNode(node.subLeft)
            ? (highlighted ? wrapText("_") + wrapBracket("{") + nodeToLatex(node.subLeft, highlighted) + wrapBracket("}") : `_{${nodeToLatex(node.subLeft, highlighted)}}`)
            : "";
          const supLeft = !isEmptyNode(node.supLeft)
            ? (highlighted ? wrapText("^") + wrapBracket("{") + nodeToLatex(node.supLeft, highlighted) + wrapBracket("}") : `^{${nodeToLatex(node.supLeft, highlighted)}}`)
            : "";
          const base = highlighted ? wrapBracket("{") + nodeToLatex(node.base, highlighted) + wrapBracket("}") : `{${nodeToLatex(node.base, highlighted)}}`;
          const subRight = !isEmptyNode(node.subRight)
            ? (highlighted ? wrapText("_") + wrapBracket("{") + nodeToLatex(node.subRight, highlighted) + wrapBracket("}") : `_{${nodeToLatex(node.subRight, highlighted)}}`)
            : "";
          const supRight = !isEmptyNode(node.supRight)
            ? (highlighted ? wrapText("^") + wrapBracket("{") + nodeToLatex(node.supRight, highlighted) + wrapBracket("}") : `^{${nodeToLatex(node.supRight, highlighted)}}`)
            : "";
          return subLeft + supLeft + base + subRight + supRight;
        } else {
          const subLeft = highlighted
            ? wrapBracket("[") + (node.subLeft ? nodeToLatex(node.subLeft, highlighted) : "") + wrapBracket("]")
            : node.subLeft ? nodeToLatex(node.subLeft, highlighted) : "";
          const supLeft = highlighted
            ? wrapBracket("[") + (node.supLeft ? nodeToLatex(node.supLeft, highlighted) : "") + wrapBracket("]")
            : node.supLeft ? nodeToLatex(node.supLeft, highlighted) : "";
          const base = highlighted
            ? wrapBracket("{") + nodeToLatex(node.base, highlighted) + wrapBracket("}")
            : nodeToLatex(node.base, highlighted);
          const subRight = highlighted
            ? wrapBracket("{") + (node.subRight ? nodeToLatex(node.subRight, highlighted) : "") + wrapBracket("}")
            : node.subRight ? nodeToLatex(node.subRight, highlighted) : "";
          const supRight = highlighted
            ? wrapBracket("[") + (node.supRight ? nodeToLatex(node.supRight, highlighted) : "") + wrapBracket("]")
            : node.supRight ? nodeToLatex(node.supRight, highlighted) : "";
  
          const content = wrapCmd("\\actsymb") + `${subLeft}${supLeft}${base}${subRight}${supRight}`;
          return highlighted ? wrapActsymb(content) : content;
        }
      }
  
      case "accented": {
        if (node.accent.type === 'predefined') {
          const decorationInfo = decorationToLatexCommand[node.accent.decoration];
          if (!decorationInfo) {
            throw new Error(`Unknown decoration: ${node.accent}`);
          }
          const latexCommand = decorationInfo.command;
          const packageName = decorationInfo.package;
  
          const latexContent =
            (highlighted ? wrapCmd(latexCommand) : latexCommand) +
            (highlighted ? wrapBracket("{") : "{") +
            nodeToLatex(node.base, highlighted) +
            (highlighted ? wrapBracket("}") : "}");
  
          return wrapWithPackage(latexContent, packageName);
        } else {
          const latexCommand = node.accent.position === 'above' ? (highlighted ? wrapCmd("\\overset") : "\\overset") : (highlighted ? wrapCmd("\\underset") : "\\underset");
          return latexCommand
            + (highlighted ? wrapBracket("{") : "{")
            + nodeToLatex(node.accent.content, highlighted)
            + (highlighted ? wrapBracket("}") : "}")
            + (highlighted ? wrapBracket("{") : "{")
            + nodeToLatex(node.base, highlighted)
            + (highlighted ? wrapBracket("}") : "}");
        }
      }
  
      case "matrix": {
        const start = highlighted ? wrapCmd("\\begin{bmatrix}") : "\\begin{bmatrix}";
        const end = highlighted ? wrapCmd("\\end{bmatrix}") : "\\end{bmatrix}";
        const rows = node.rows.map(row => row.map(r => nodeToLatex(r, highlighted)).join(" & ")).join(" \\\\ ");
        return start + rows + end;
      }
  
      case "vector": {
        const joined = node.elements.map(e => nodeToLatex(e, highlighted)).join(node.orientation === "horizontal" ? " & " : " \\\\ ");
        const env = "bmatrix";
        if (highlighted) {
          return wrapCmd("\\begin{" + env + "}") + joined + wrapCmd("\\end{" + env + "}");
        }
        return `\\begin{${env}}${joined}\\end{${env}}`;
      }
  
      default: {
        console.warn(`${node.type} has no case in nodeToLatex.`);
        return "";
      }
    }
  };
  