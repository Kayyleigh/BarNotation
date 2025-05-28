import { decorationToLatexCommand } from "../utils/accentUtils";
import { getCloseSymbol, getOpenSymbol } from "../utils/bracketUtils";
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
          const subLeft = `_{${node.subLeft ? nodeToLatex(node.subLeft) : ""}}`;
          const supLeft = `^{${node.supLeft ? nodeToLatex(node.supLeft) : ""}}`;
          const base = `{${nodeToLatex(node.base)}}`;
          const subRight = `_{${node.subRight ? nodeToLatex(node.subRight) : ""}}`;
          const supRight = `^{${node.supRight ? nodeToLatex(node.supRight) : ""}}`;
        
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
          const latexCommand = decorationToLatexCommand[node.accent.name];
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
  
export const latexToMathNode = (latex: string): MathNode => {
  return parseLatex(latex)
};