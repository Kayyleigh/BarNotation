import { createDecorated, createFraction, createInlineContainer, createRootNode, createSubSup, createTextNode } from "./nodeFactories";
import type { MathNode } from "./types";

export const nodeToLatex = (node: MathNode): string => {
    switch (node.type) {
      case "text": {
        return node.content;
      }
  
      case "inline-container": {
        return node.children.map(nodeToLatex).join("");
      }
  
      case "group": {
        return `\\left(${node.children.map(nodeToLatex).join("")}\\right)`;
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
        return `\\${node.operator}${lower}${upper} ${nodeToLatex(node.body)}`;
      }
  
      case "subsup": {
        const subLeft = `_{${node.subLeft ? nodeToLatex(node.subLeft) : ""}}`;
        const supLeft = `^{${node.supLeft ? nodeToLatex(node.supLeft) : ""}}`;
        const base = `{${nodeToLatex(node.base)}}`;
        const subRight = `_{${node.subRight ? nodeToLatex(node.subRight) : ""}}`;
        const supRight = `^{${node.supRight ? nodeToLatex(node.supRight) : ""}}`;
      
        return `{${subLeft}${supLeft}${base}${subRight}${supRight}}`;
      }
  
      case "decorated": {
        const decoMap: Record<typeof node.decoration, string> = {
          hat: "\\hat",
          bar: "\\bar",
          angl: "\\angle"
        };
        return `${decoMap[node.decoration]}{${nodeToLatex(node.base)}}`;
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
  // Utility to trim outer braces
  const stripBraces = (str: string): string =>
    str.startsWith("{") && str.endsWith("}") ? str.slice(1, -1) : str;

  // Handle sub/sup combinations (can be expanded for full control)
  const subsupMatch = latex.match(/^\{_\{(.*?)\}^\{(.*?)\}\{(.*?)\}_\{(.*?)\}^\{(.*?)\}\}$/);
  console.log(subsupMatch ? "subsup" : "")
  if (subsupMatch) {
    const [, subLeft, supLeft, base, subRight, supRight] = subsupMatch.map(x =>
      x ? stripBraces(x) : undefined
    );

    return createSubSup(
      latexToMathNode(base!),
      subLeft ? latexToMathNode(subLeft) : undefined,
      supLeft ? latexToMathNode(supLeft) : undefined,
      subRight ? latexToMathNode(subRight) : undefined,
      supRight ? latexToMathNode(supRight) : undefined
    );
  }

  // Handle fractions
  const fracMatch = latex.match(/^\\frac\{(.+?)\}\{(.+?)\}$/);
  if (fracMatch) {
    return createFraction(
      latexToMathNode(fracMatch[1]),
      latexToMathNode(fracMatch[2])
    );
  }

  // Handle roots
  const rootMatch = latex.match(/^\\sqrt(?:\[(.+?)\])?\{(.+?)\}$/);
  if (rootMatch) {
    const [, degree, radicand] = rootMatch;

    return degree
    ? createRootNode(latexToMathNode(radicand), latexToMathNode(degree))
    : createRootNode(latexToMathNode(radicand));
  }

  // Handle decorated nodes like \hat{x}, \bar{x}, etc
  const decoMatch = latex.match(/^\\(hat|bar|angle)\{(.+?)\}$/);
  if (decoMatch) {
    return createDecorated(
      decoMatch[1] as "hat" | "bar" | "angl",
      latexToMathNode(decoMatch[2])
    );
  }

  // Fallback: inline-container if multiple children
  if (latex.includes(" ")) {
    return createInlineContainer(
      latex.split(" ").map(latexToMathNode)
    );
  }

  // Plain text fallback
  return createTextNode(
    latex
  );
};