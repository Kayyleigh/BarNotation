import { decorationToLatexCommand } from "../utils/accentUtils";
import { getCloseSymbol, getOpenSymbol } from "../utils/bracketUtils";
import { parseLatex } from "./mathNodeParser";
import { createDecorated, createFraction, createInlineContainer, createRootNode, createSubSup, createTextNode } from "./nodeFactories";
import { symbolToLatex } from "./specialSequences";
import type { MathNode } from "./types";

export const nodeToLatex = (node: MathNode): string => {
    switch (node.type) {
      case "text": {
        const fromMap = symbolToLatex[node.content]; // Revert special char back to latex sequence
        return fromMap ?? node.content;
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
  
      case "root": {
        if (node.degree) {
          return `\\sqrt[${nodeToLatex(node.degree)}]{${nodeToLatex(node.radicand)}}`;
        }
        return `\\sqrt{${nodeToLatex(node.radicand)}}`;
      }
  
      case "big-operator": {
        const lower = node.lowerLimit ? `_{${nodeToLatex(node.lowerLimit)}}` : "";
        const upper = node.upperLimit ? `^{${nodeToLatex(node.upperLimit)}}` : "";
        return `\\${node.operator}${lower}${upper}`;
      }
  
      case "subsup": {
        const subLeft = `_{${node.subLeft ? nodeToLatex(node.subLeft) : ""}}`;
        const supLeft = `^{${node.supLeft ? nodeToLatex(node.supLeft) : ""}}`;
        const base = `{${nodeToLatex(node.base)}}`;
        const subRight = `_{${node.subRight ? nodeToLatex(node.subRight) : ""}}`;
        const supRight = `^{${node.supRight ? nodeToLatex(node.supRight) : ""}}`;
      
        return `${subLeft}${supLeft}${base}${subRight}${supRight}`;
      }

      case "actsymb": {
        const subLeft = `${node.subLeft ? nodeToLatex(node.subLeft) : ""}`;
        const supLeft = `${node.supLeft ? nodeToLatex(node.supLeft) : ""}`;
        const base = `${nodeToLatex(node.base)}`;
        const subRight = `${node.subRight ? nodeToLatex(node.subRight) : ""}`;
        const supRight = `${node.supRight ? nodeToLatex(node.supRight) : ""}`;
      
        return `\\actsymb[${subLeft}][${supLeft}]{${base}}{${subRight}}[${supRight}]`;
      }
  
      case "decorated": {
        const latexCommand = decorationToLatexCommand[node.decoration];
        if (!latexCommand) throw new Error(`Unknown decoration: ${node.decoration}`);
        return `${latexCommand}{${nodeToLatex(node.child)}}`;
      }
  
      case "matrix": {
        return `\\begin{bmatrix}`
          + node.rows.map(row => row.map(nodeToLatex).join(" & ")).join(" \\\\ ")
          + `\\end{bmatrix}`;
      }
  
      case "vector": {
        const joined = node.items.map(nodeToLatex).join(
          node.orientation === "horizontal" ? " & " : " \\\\ "
        );
        const env = "bmatrix";
        return `\\begin{${env}}${joined}\\end{${env}}`;
      }
  
      default: {
        return "";
      }
    }
  };
  
export const latexToMathNode = (latex: string): MathNode => {
  return parseLatex(latex)
};