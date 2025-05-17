import { decorationToLatexCommandInverse } from "../utils/accentUtils";
import { createDecorated, createFraction, createInlineContainer, createSubSup, createTextNode } from "./nodeFactories";
import { symbolToLatexInverse } from "./specialSequences";
import type { InlineContainerNode, MathNode } from "./types";

type Token =
  | { type: "command", name: string }
  | { type: "brace_open" }
  | { type: "brace_close" }
  | { type: "char", value: string };


export function parseLatex(input: string): MathNode {
    const tokens = tokenize(input);
    let i = 0;
  
    function peek(): Token | undefined {
      return tokens[i];
    }
  
    function consume(): Token {
      return tokens[i++];
    }
  
    function expect(type: Token["type"]): Token {
      const token = consume();
      if (token.type !== type) throw new Error(`Expected ${type}`);
      return token;
    }
  
    function parseGroup(): MathNode {
      expect("brace_open");
      const nodes: MathNode[] = [];
      while (peek() && peek()!.type !== "brace_close") {
        nodes.push(parseExpression());
      }
      expect("brace_close");
      return nodes.length === 1 ? nodes[0] : createInlineContainer(nodes);
    }
  
    function parseExpression(): MathNode {
      const token = peek();
      if (!token) throw new Error("Unexpected end of input");
  
      if (token.type === "command") {
        const { name } = consume() as { type: "command"; name: string };
  
        if (name === "frac") {
          const numerator = parseGroup();
          const denominator = parseGroup();
          return createFraction(numerator, denominator);
        }
  
        if (name === "sqrt") { //TODO
          let degree: MathNode | undefined = undefined;
          if (peek()?.type === "brace_open") {
            degree = undefined;
            const radicand = parseGroup();
            return { type: "root", radicand };
          } else if (peek()?.type === "char" && peek()!.value === "[") {
            throw new Error("Optional sqrt degree parsing not implemented here");
          } else {
            const radicand = parseGroup();
            return { type: "root", radicand };
          }
        }
  
        if (name in decorationToLatexCommandInverse) {
          const child = parseGroup();
          return createDecorated(
            decorationToLatexCommandInverse[name as keyof typeof decorationToLatexCommandInverse],
            child
          );
        }
  
        if (symbolToLatexInverse[name]) {
          return createTextNode(symbolToLatexInverse[name]);
        }
  
        return createTextNode("\\" + name);
      }
  
      if (token.type === "brace_open") {
        return parseGroup();
      }
  
      if (token.type === "char") {
        const char = (consume() as { type: "char"; value: string }).value;
  
        // Handle superscript or subscript //TODO maybe this does not work for pre?
        if (char === "_") {
          const base = parseExpression() as InlineContainerNode;
          const subRight = parseExpression() as InlineContainerNode;
          return createSubSup(base, undefined, undefined, subRight, undefined);
        }
  
        if (char === "^") {
            const base = parseExpression() as InlineContainerNode;
            const supRight = parseExpression() as InlineContainerNode;
            return createSubSup(base, undefined, undefined, undefined, supRight);
        }
  
        return createTextNode(char);
      }
  
      throw new Error("Unexpected token");
    }
  
    // Entry point
    const children: MathNode[] = [];
    while (i < tokens.length) {
      children.push(parseExpression());
    }
    return children.length === 1 ? children[0] : createInlineContainer(children);
  }

  function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < input.length) {
      const ch = input[i];
      if (ch === "\\") {
        i++;
        let name = "";
        while (/[a-zA-Z]/.test(input[i])) name += input[i++];
        tokens.push({ type: "command", name });
      } else if (ch === "{") {
        tokens.push({ type: "brace_open" });
        i++;
      } else if (ch === "}") {
        tokens.push({ type: "brace_close" });
        i++;
      } else {
        tokens.push({ type: "char", value: ch });
        i++;
      }
    }
    return tokens;
  }
