import { decorationToLatexCommandInverse } from "../utils/accentUtils";
import { createAccentedNode, createChildedNode, createFraction, createInlineContainer, createTextNode } from "./nodeFactories";
import { symbolToLatexInverse } from "./specialSequences";
import type { InlineContainerNode, MathNode, StructureNode } from "./types";

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

    // Helper: parse optional bracket content as a string
    function parseOptionalBracketString(): string | undefined {
      if (peek()?.type === "char" && peek()?.value === "[") {
        consume(); // consume '['
        let str = "";
        while (peek() && !(peek()?.type === "char" && peek()?.value === "]")) {
          const t = consume();
          if (t.type === "char") str += t.value;
          else if (t.type === "command") str += "\\" + t.name;
          else if (t.type === "brace_open") str += "{";
          else if (t.type === "brace_close") str += "}";
        }
        if (peek()?.type === "char" && peek()?.value === "]") {
          consume(); // consume ']'
        } else {
          throw new Error("Expected closing ]");
        }
        return str;
      }
      return undefined;
    }
  
    function parseGroup(): InlineContainerNode {
      expect("brace_open");
      const nodes: StructureNode[] = [];
      while (peek() && peek()!.type !== "brace_close") {
        nodes.push(parseExpression() as StructureNode);
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
    
      let base: InlineContainerNode;
    
      if (token.type === "command") {
        const { name } = consume() as { type: "command"; name: string };
    
        if (name === "actsymb") {
          // Parse optional left scripts bracket, e.g. [m|]
          const subLeftStr = parseOptionalBracketString(); //TODO: if \actsymb[]{}{}[] is also valid (idk if is), then this may make wrong child?
          const supLeftStr = parseOptionalBracketString();

          // Make MathNode with valid input (empty InlineContainer if undefined)
          const subLeft = parseLatex(subLeftStr ? subLeftStr : "{}");
          const supLeft = parseLatex(supLeftStr ? supLeftStr : "{}");
      
          // Parse mandatory base group {A}
          const base = parseGroup();
      
          // Parse mandatory supRight group {x:\angl{n}}
          const subRight = parseGroup();
      
          // Parse optional right subscript bracket, e.g. [2]
          const supRightStr = parseOptionalBracketString();
          const supRight = parseLatex(supRightStr ? supRightStr : "{}");
        
          return createChildedNode(
            base as InlineContainerNode, 
            'actsymb',
            subLeft as InlineContainerNode,
            supLeft as InlineContainerNode,
            subRight as InlineContainerNode,
            supRight as InlineContainerNode,
          );

        }
        else if (name === "frac") {
          const numerator = parseGroup();
          const denominator = parseGroup();
          base = createFraction(numerator, denominator);
        } 
        else if (name === "sqrt") {
          // your sqrt parsing logic here ...
          const radicand = parseGroup();
          base = { type: "root", radicand };
        } 
        else if (name in decorationToLatexCommandInverse) {
          const child = parseGroup();
          base = createAccentedNode(
            child,
            { 
              type: 'predefined',
              name: decorationToLatexCommandInverse[name as keyof typeof decorationToLatexCommandInverse],
            },
            
          );
        } 
        else if (symbolToLatexInverse[name]) {
          base = createTextNode(symbolToLatexInverse[name]);
        } 
        else if (name === 'overset') {
          const accentContent = parseGroup();
          const child = parseGroup();
          base = createAccentedNode(child, { type: 'custom', content: accentContent, position: 'above' } )
        }
        else if (name === 'underset') {
          const accentContent = parseGroup();
          const child = parseGroup();
          base = createAccentedNode(child, { type: 'custom', content: accentContent, position: 'below' } )
        }
        else {
          console.log(`Name not found: '${name}'`)
          base = createTextNode("\\" + name);
        }
      } 
      else if (token.type === "brace_open") {
        base = parseGroup();
      } 
      else if (token.type === "char") {
        base = createTextNode(consume().value);
      } 
      else {
        throw new Error(`Unexpected token: ${token}`);
      }

      //_{}^{}{x}_{}^{3}
      //
      //_{_{}^{}{}_{}^{}}^{_{}^{}{}_{}^{3}}{x}_{}^{}
    
      // 3. Parse postscripts (right subscripts/superscripts)
      let subRight: InlineContainerNode | undefined;
      let supRight: InlineContainerNode | undefined;
    
      while (true) {
        const next = peek();
        if (!next || next.type !== "char") {
          console.log(`${next} is not a char`)
          break;
        }
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
        return createChildedNode(base, subLeft, supLeft, subRight, supRight, 'subsup');
      }
      return base;
    }
  
    // Entry point
    const children: StructureNode[] = [];
    while (i < tokens.length) {
      children.push(parseExpression() as StructureNode);
    }
    //TODO here ensure that not always nesting IC?
    // Spaces should be ignored
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
