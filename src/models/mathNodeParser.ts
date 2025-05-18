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
      return createInlineContainer(nodes);
    }
  
    function parseExpression(): MathNode {
      // 1. Parse prescripts (left subscripts/superscripts)
      let subLeft: InlineContainerNode | undefined;
      let supLeft: InlineContainerNode | undefined;
    
      while (true) {
        const next = peek();
        if (!next || next.type !== "char") break;
    
        if (next.value === "_") {
          consume();
          subLeft = parseGroup() as InlineContainerNode;
        } else if (next.value === "^") {
          consume();
          supLeft = parseGroup() as InlineContainerNode;
        } else {
          break;
        }
      }
    
      // 2. Parse base
      const token = peek();
      if (!token) throw new Error("Unexpected end of input");
    
      let base: MathNode;
    
      if (token.type === "command") {
        const { name } = consume() as { type: "command"; name: string };
    
        if (name === "frac") {
          const numerator = parseGroup();
          const denominator = parseGroup();
          base = createFraction(numerator, denominator);
        } else if (name === "sqrt") {
          // your sqrt parsing logic here ...
          const radicand = parseGroup();
          base = { type: "root", radicand };
        } else if (name in decorationToLatexCommandInverse) {
          const child = parseGroup();
          base = createDecorated(
            decorationToLatexCommandInverse[name as keyof typeof decorationToLatexCommandInverse],
            child
          );
        } else if (symbolToLatexInverse[name]) {
          base = createTextNode(symbolToLatexInverse[name]);
        } else {
          base = createTextNode("\\" + name);
        }
      } else if (token.type === "brace_open") {
        base = parseGroup();
      } else if (token.type === "char") {
        base = createTextNode(consume().value);
      } else {
        throw new Error("Unexpected token");
      }

      //_{}^{}{x}_{}^{3}
      //
      //_{_{}^{}{}_{}^{}}^{_{}^{}{}_{}^{3}}{x}_{}^{}
    
      // 3. Parse postscripts (right subscripts/superscripts)
      let subRight: InlineContainerNode | undefined;
      let supRight: InlineContainerNode | undefined;
    
      while (true) {
        const next = peek();
        if (!next || next.type !== "char") break;
    
        if (next.value === "_") {
          consume();
          subRight = parseGroup() as InlineContainerNode;
        } else if (next.value === "^") {
          consume();
          supRight = parseGroup() as InlineContainerNode;
        } else {
          break;
        }
      }
    
      // 4. Return SubSup node if any scripts found, else just base
      if (subLeft || supLeft || subRight || supRight) {
        return createSubSup(base, subLeft, supLeft, subRight, supRight);
      }
      return base;
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
