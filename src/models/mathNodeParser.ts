import { decorationToLatexCommandInverse, type NodeDecoration } from "../utils/accentUtils";
import { bracketSymbols, getStyleFromSymbol, isOpeningBracket } from "../utils/bracketUtils";
import { createAccentedNode, createChildedNode, createFraction, createGroupNode, createInlineContainer, createNthRoot, createStyledNode, createTextNode } from "./nodeFactories";
import { getBigOpNodeFromAlias, getStyledNodeFromAlias, getSymbolNodeFromAlias, symbolToLatex } from "./specialSequences";
import type { GroupNode, InlineContainerNode, MathNode, StructureNode } from "./types";

type Token =
  | { type: "command", name: string }
  | { type: "brace_open" }
  | { type: "brace_close" }
  | { type: "char", value: string }
  | { type: "whitespace", value: string };


export function parseLatex(input: string): MathNode {
    const tokens = tokenize(input);
    let i = 0;

    function peek(): Token | undefined {
      return tokens[i];
    }
  
    function consume(): Token {
      return tokens[i++];
    }

    function skipWhitespace() {
      while (peek()?.type === "whitespace") {
        consume();
      }
    }

    function parseBracketGroup(openBracket: string): GroupNode {
      const style = getStyleFromSymbol(openBracket);
      const expectedClose = style ? bracketSymbols[style].close : undefined;
      console.log(`parsing bracket group for ${openBracket}`)
      if (!expectedClose) {
        throw new Error(`Unknown bracket style for ${openBracket}`);
      }
    
      const children: StructureNode[] = [];
    
      let token;
      while ((token = peek()) && !(token.type === "char" && token.value === expectedClose)) {
        const child = parseExpression();
        if (child) {
          console.log(`pushing ${child.type}`)
          children.push(child as StructureNode);
        }
      }
    
      const close = consume();
      if (close.type !== "char" || close.value !== expectedClose) {
        throw new Error(`Expected closing bracket '${expectedClose}'`);
      }
    
      // Could wrap it in a special node if needed — for now InlineContainer is fine
      return createGroupNode(createInlineContainer(children), getStyleFromSymbol(openBracket));
    }   

    function parseChildScript(): InlineContainerNode {
      if (peek()?.type === "brace_open") {
        return parseGroup();
      } else {
        const next = peek();
        if (next?.type === "char" || next?.type === "command") {
          const token = consume();
          let node: StructureNode;
          if (token.type === "char") {
            node = createTextNode(token.value);
          } else if (token.type === "command"){
            // Get transformed node OR create text node with escaped sequence 
            node = getSymbolNodeFromAlias(token.name) || createTextNode(token.name, "\\" + token.name);
          } else {
            node = createTextNode("") //TODO this might be dumb
            console.log(`Am I dumb?`)
          }
          return createInlineContainer([node]);
        }
        throw new Error(`Invalid script target after _ or ^`);
      }
    }
    
    
    function expect(type: Token["type"]): Token {
      const token = consume();
      console.log(token)
      console.log(`Expect ${token.type}`)
      if (token.type !== type && (token.type === "char" || token.type === "whitespace")) console.log(`Value: ${token.value}`);
      if (token.type !== type) throw new Error(`Expected ${type}, got ${token.type}`);
      return token;
    }

    // Helper: parse optional bracket content as a string
    function parseOptionalBracketString(): string | undefined {
      const token = peek();
      if (token && token.type === "char" && token.value === "[") {
        consume(); // consume '['
        let str = "";

        let next;
        while ((next = peek()) && !(next.type === "char" && next.value === "]")) {
          const t = consume();
          if (t.type === "char") str += t.value;
          else if (t.type === "command") {
            if (t.name.startsWith("\\")) {
              // If already starting with backspace (i.e., escaped char): do not add another
              str += t.name; 
            } else {
              str += "\\" + t.name;              
            }
          }
          else if (t.type === "brace_open") str += "{";
          else if (t.type === "brace_close") str += "}";
        }
        if (next && next.type === "char" && next.value === "]") {
          consume(); // consume ']'
        } else {
          throw new Error("Expected closing ]");
        }
        console.log(`Optional Bracket String ${str}`)
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
  
    function parseExpression(): MathNode | undefined {
      // 1. Parse prescripts (left subscripts/superscripts)
      let subLeft: InlineContainerNode | undefined;
      let supLeft: InlineContainerNode | undefined;
    
      while (true) {
        const next = peek();
        if (!next || next.type !== "char") break;

        if (next.value === "_") {
          consume();
          subLeft = parseChildScript();
        } else if (next.value === "^") {
          consume();
          supLeft = parseChildScript();
        } else {
          break;
        }
      }
    
      // 2. Parse base
      const token = peek();
      console.log(`Looking at ${token?.type}`)
      if (token?.type === "char") {
        console.log(`Since its char: ${token.value}`)
      }
      if (token?.type === "command") {
        console.log(`Since its command: ${token.name}`)
      }

      if (!token) throw new Error("Unexpected end of input");
    
      let base: StructureNode;
      base = createTextNode("");
    
      if (token.type === "command") {
        const { name } = consume() as { type: "command"; name: string };
    
        if (name === "actsymb") {
          // Parse optional left scripts bracket, e.g. [m|]
          const subLeftStr = parseOptionalBracketString(); //TODO: if \actsymb[]{}{}[] is also valid (idk if is), then this may make wrong child?
          const supLeftStr = parseOptionalBracketString();

          // Make MathNode with valid input (empty InlineContainer if undefined)
          const subLeft = parseLatex("{" + (subLeftStr ? subLeftStr : "") + "}");
          const supLeft = parseLatex("{" + (supLeftStr ? supLeftStr : "") + "}");
      
          // Parse mandatory base group {A}
          const base = parseGroup();
      
          // Parse mandatory supRight group {x:\angl{n}}
          const subRight = parseGroup();
      
          // Parse optional right subscript bracket, e.g. [2]
          const supRightStr = parseOptionalBracketString();
          const supRight = parseLatex("{" + (supRightStr ? supRightStr : "") + "}");
        
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
          const indexString = parseOptionalBracketString();
          const index = parseLatex(indexString ? ("{" + indexString + "}")  : "{}") as InlineContainerNode;
          const radicand = parseGroup();
          base = createNthRoot(
            radicand,
            index,
          );
        } 
        else if (name in decorationToLatexCommandInverse) {
          const child = parseGroup();
          base = createAccentedNode(
            child,
            { 
              type: 'predefined',
              decoration: decorationToLatexCommandInverse[name] as NodeDecoration,
            },
          );
        } 
        else if (getStyledNodeFromAlias(name)) {
          // Parse child node that will receive styling
          const child = parseGroup();

          // Call styled node creation (wrap around child) with inferred styling from command name
          base = getStyledNodeFromAlias(name, child)
        }
        else if (getSymbolNodeFromAlias(name)) {
          base = getSymbolNodeFromAlias(name); // Call creatNode()

          if (symbolToLatex[name] && symbolToLatex[name].charAt(symbolToLatex[name].length - 1) === " ") {
            if (peek()?.type === "char" && peek()?.value === " ") {
              console.log(`SWALLOWED A SPACE AFTER ${name}`)
              consume(); // consume ' '
            } else console.log(`NOPE type is ${peek()?.type}`)
           }
        } 
        else if (getBigOpNodeFromAlias(name)) {
          // Parse optional subscript (lower limit)
          let lower: InlineContainerNode = createInlineContainer();
          let upper: InlineContainerNode = createInlineContainer();

          skipWhitespace();
          
          // Check if next token is '_' for lower limit
          let next = peek();
          if (next && next.type === "char" && next.value === "_") {
            consume(); // consume '_'
            skipWhitespace();
            lower = parseChildScript();
          }

          // Check if next token is '^' for upper limit
          next = peek();
          if (next && next.type === "char" && next.value === "^") {
            consume(); // consume '^'
            skipWhitespace();
            upper = parseChildScript();
          }
          const result = getBigOpNodeFromAlias(name, lower, upper);
          if (result != undefined) {
            base = result;
          } else throw new Error(`PROBLEM: COULD NOT MAKE THE BIG OP FROM ${name}!!`)          
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
        else if (name === 'left') {
          console.warn(`Not yet implemented: ${name}`)
        }
        else if (name === 'right') {
          console.warn(`Not yet implemented: ${name}`)
        }
        else if (name.startsWith("\\")) {
          // TODO: recognize when to turn into special spacing like \,

          console.warn(`Escape sequence: ${name}`)

          // Create text node where display text is the sequence after "\"
          base = createTextNode(name.slice(1), name);
        }
        else {
          console.log(`Name not found: '${name}'. Creating`)
          console.log(`creating \\${name} `)
          // Create text node with escaped sequence 
          base = createStyledNode(createTextNode("\\" + name, "\\" + name), { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } });
        }
      } 
      else if (token.type === "brace_open") {
        console.log(`Is this reached? I hope NOT`)
        base = createGroupNode(parseGroup());
      } 
      else if (token.type === "char") {
        if (isOpeningBracket(token.value)) {
          const open = token.value;
          consume();
      
          try {
            base = parseBracketGroup(open);
          } catch (err) {
            console.warn(`Cannot parse visual bracket group for ${open}: ${err}`);
            //TODO ensure no tokens are thrown away here??!
            base = createTextNode(open);
          }
        } else {
          consume();
          base = createTextNode(token.value);
        }
      }
      else if (token.type === "whitespace") {
        consume();
        //base = createTextNode(token.value);
        //return;
      } 
      else {
        throw new Error(`Unexpected token: ${token} ${token.type}`);
      }

      // 3. Parse postscripts (right subscripts/superscripts)
      let subRight: InlineContainerNode | undefined;
      let supRight: InlineContainerNode | undefined;
    
      while (true) {
        const next = peek();
        if (!next || next.type !== "char") {
          // console.log(`${next} is not a char (${next?.type})`)
          break;
        }
        if (next.value === "_") {
          consume();
          subRight = parseChildScript();
        } else if (next.value === "^") {
          consume();
          supRight = parseChildScript();
        } else {
          break;
        }
      }
    
      // 4. Return SubSup node if any scripts found, else just base
      if (subLeft || supLeft || subRight || supRight) {
        return createChildedNode(createInlineContainer([base]), 'subsup', subLeft, supLeft, subRight, supRight);
      }
      return base;
    }
  
    // Entry point
    const children: StructureNode[] = [];
    while (i < tokens.length) {
      const child = parseExpression() as StructureNode;
      if (child) {
        children.push(child);
      }
    }
    //TODO here ensure that not always nesting IC?
    return children.length === 1 ? children[0] : createInlineContainer(children);
  }

  function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < input.length) {
      const ch = input[i];
      if (ch === "\\") {
        i++;
        const next = input[i];
  
        if (!next) break;
  
        if (/[a-zA-Z]/.test(next)) {
          let name = "";
          while (/[a-zA-Z]/.test(input[i])) {
            name += input[i++];
          }
          tokens.push({ type: "command", name });
          console.log(`Pushed command: ${name}`)
        } else {
          // 🔥 Special character escaping
          tokens.push({ type: "command", name: "\\" + next });
          console.log(`Pushed command IN ELSE: \\${next}`)
          i++; // Advance past the escaped character
        }
      } else if (ch === "{") {
        tokens.push({ type: "brace_open" });
        console.log(`Pushed brace_open`)
        i++;
      } else if (ch === "}") {
        tokens.push({ type: "brace_close" });
        console.log(`Pushed brace_close`)
        i++;
      } else if (/\s/.test(ch)) {
        let ws = "";
        while (i < input.length && /\s/.test(input[i])) {
          ws += input[i++];
        }
        tokens.push({ type: "whitespace", value: ws });
        console.log(`Pushed whitespace`)

      } else {
        tokens.push({ type: "char", value: ch });
        console.log(`Pushed char ${ch}`)
        i++;
      }
    }
    return tokens;
  }
