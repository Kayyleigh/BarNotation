import { decorationToLatexCommandInverse, type NodeDecoration } from "../utils/accentUtils";
import { bracketSymbols, getStyleFromSymbol, isOpeningBracket } from "../utils/bracketUtils";
import { nodeToLatex } from "./nodeToLatex";
import { createAccentedNode, createChildedNode, createFraction, createGroupNode, createInlineContainer, createNthRoot, createStyledNode, createTextNode } from "./nodeFactories";
import { getBigOpNodeFromAlias, getStyledNodeFromAlias, getSymbolNodeFromAlias, symbolToLatex } from "./specialSequences";
import type { GroupNode, InlineContainerNode, MathNode, StructureNode } from "./types";
import { ensureInContainerNode } from "./transformations";

type Token =
  | { type: "command", name: string }
  | { type: "brace_open" }
  | { type: "brace_close" }
  | { type: "char", value: string }
  | { type: "whitespace", value: string };


function debugLog(message: string, color: string = 'dodgerblue') {
  console.log(`%c[debug] %c${message}`, 'color: gray; font-weight: bold;', `color: ${color}`);
}

function print_token(token: Token): string {
  switch (token.type) {
    case "brace_open": return "brace_open";
    case "brace_close": return "brace_close";
    case "char": return `'${token.value}'`;
    case "command": return `\\${token.name}`;
    case "whitespace": return `whitespace (${token.value})`;
  }
}

function tokenToString(tok: Token): string {
  switch (tok.type) {
    case "command":
      return tok.name.startsWith("\\") ? tok.name : "\\" + tok.name;
    case "char":
    case "whitespace":
      return tok.value;
    case "brace_open":
      return "{";
    case "brace_close":
      return "}";
    default:
      return "";
  }
}

function tokensToString(tokens: Token[]): string {
  return tokens.map(tokenToString).join("");
}

function tokensEqual(a: Token, b: Token): boolean {
  if (a.type !== b.type) return false;
  switch (a.type) {
    case "command":
      return (b as typeof a).name === a.name;
    case "char":
    case "whitespace":
      return (b as typeof a).value === a.value;
    case "brace_open":
    case "brace_close":
      return true; // no payload to compare
    default:
      return false;
  }
}

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

  function parseDelimitedGroup(openIndex: number, open: Token, close: Token): MathNode {
    const closeIndex = findMatchingCloseTokenIndex(tokens, openIndex, open, close);
    if (closeIndex === null) {
      throw new Error(`Unmatched delimiter: ${tokenToString(open)}`);
      //TODO: sth with {}
    }
  
    const innerTokens = tokens.slice(openIndex + 1, closeIndex); // skip brackets
    const result = parseLatex(` ${tokensToString(innerTokens)} `);
    i = closeIndex + 1; // Advance past closing token
    debugLog(`res is ${nodeToLatex(result)}, i=${i}, tokens=${tokensToString(tokens)}`)
    return result;
  }

  function parseGroup(): InlineContainerNode {
    const open = expect("brace_open");
    const node = parseDelimitedGroup(i - 1, open, { type: "brace_close" });
    if (node.type === "inline-container") {
      return node;
    }
    else {
      return createInlineContainer([node]);
    }
  }

  function parseBracketGroup(openBracket: string): GroupNode {
    const style = getStyleFromSymbol(openBracket);
    const expectedClose = style ? bracketSymbols[style].close : undefined;
    if (!expectedClose) {
      throw new Error(`Unknown bracket style for ${openBracket}`);
    }
  
    const node = parseDelimitedGroup(i - 1, { type: "char", value: openBracket }, { type: "char", value: expectedClose });
    if (node.type === "inline-container") {
      return createGroupNode(node, style);
    }
    else {
      return createGroupNode(createInlineContainer([node]), style);
    }
  }

  function findMatchingCloseTokenIndex(
    tokens: Token[],
    startIndex: number,
    open: Token,
    close: Token
  ): number | null {
    let depth = 0;
    const sameBracket = open === close;
    debugLog(`${sameBracket} that ${tokenToString(open)} === ${tokenToString(close)}. Also, we have ${tokensToString(tokens)}`)

    for (let j = startIndex; j < tokens.length; j++) {
      const tok = tokens[j];
      if (tokensEqual(tok, open)) {
        if (sameBracket) {
          // toggle depth: if 0 => 1 (open), else => 0 (close)
          if (depth === 0) {
            depth = 1;
          } else {
            depth = 0;
            return j; // found matching close
          }
        } else {
          depth++;
        }
      } else if (tokensEqual(tok, close) && !sameBracket) {
        depth--;
        if (depth === 0) return j;
      }
    }
    return null;
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
        } else if (token.type === "command") {
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
    console.log(`Expect ${type}, got ${token.type}`)
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

  function parseExpression(): MathNode | undefined {
    skipWhitespace();
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

    let base: MathNode;
    // base = createTextNode("");
    base = createInlineContainer();
    if (token) {
      // if (token.type === "command") {
      //   const { name } = consume() as { type: "command"; name: string };

      //   if (name === "actsymb") {
      //     // Parse optional left scripts bracket, e.g. [m|]
      //     const subLeftStr = parseOptionalBracketString(); //TODO: if \actsymb[]{}{}[] is also valid (idk if is), then this may make wrong child?
      //     const supLeftStr = parseOptionalBracketString();

      //     // Make MathNode with valid input (empty InlineContainer if undefined)
      //     const subLeft = parseLatex(" " + (subLeftStr ? subLeftStr : "") + " ");
      //     const supLeft = parseLatex(" " + (supLeftStr ? supLeftStr : "") + " ");

      //     // Parse mandatory base group {A}
      //     const base = parseGroup();

      //     // Parse mandatory supRight group {x:\angl{n}}
      //     const subRight = parseGroup();

      //     // Parse optional right subscript bracket, e.g. [2]
      //     const supRightStr = parseOptionalBracketString();
      //     const supRight = parseLatex(" " + (supRightStr ? supRightStr : "") + " ");

      //     return createChildedNode(
      //       base as InlineContainerNode,
      //       'actsymb',
      //       subLeft as InlineContainerNode,
      //       supLeft as InlineContainerNode,
      //       subRight as InlineContainerNode,
      //       supRight as InlineContainerNode,
      //     );

      //   }
      //   else if (name === "frac") {
      //     const numerator = parseGroup();
      //     const denominator = parseGroup();
      //     base = createFraction(numerator, denominator);
      //   }
      //   else if (name === "sqrt") {
      //     // your sqrt parsing logic here ...
      //     const indexString = parseOptionalBracketString();
      //     const indexNode = parseLatex(indexString ? (" " + indexString + "") : " ");
      //     const index = indexNode.type === "inline-container" ? indexNode : createInlineContainer([indexNode as StructureNode])
      //     console.log(`index is ${index.type}`)
      //     const radicand = parseGroup();
      //     base = createNthRoot(
      //       radicand,
      //       index,
      //     );
      //   }
      //   else if (name in decorationToLatexCommandInverse) {
      //     const child = parseGroup();
      //     base = createAccentedNode(
      //       child,
      //       {
      //         type: 'predefined',
      //         decoration: decorationToLatexCommandInverse[name] as NodeDecoration,
      //       },
      //     );
      //   }
      //   else if (getStyledNodeFromAlias(name)) {
      //     // Parse child node that will receive styling
      //     const child = parseGroup();

      //     // Call styled node creation (wrap around child) with inferred styling from command name
      //     base = getStyledNodeFromAlias(name, child)
      //   }
      //   else if (getSymbolNodeFromAlias(name)) {
      //     base = getSymbolNodeFromAlias(name); // Call creatNode()


      //     // if latex string exists ??
      //     if (specialSymbols[name + " "]) {
      //     // if (symbolToLatex[name] && symbolToLatex[name].charAt(symbolToLatex[name].length - 1) === " ") {
      //       if (peek()?.type === "char" && peek()?.value === " ") {
      //         console.log(`SWALLOWED A SPACE AFTER ${name}`)
      //         consume(); // consume ' '
      //       } else console.log(`NOPE type is ${peek()?.type}`)
      //     } else console.warn(name)
      //   }
      //   else if (getBigOpNodeFromAlias(name)) {
      //     // Parse optional subscript (lower limit)
      //     let lower: InlineContainerNode = createInlineContainer();
      //     let upper: InlineContainerNode = createInlineContainer();

      //     skipWhitespace();

      //     // Check if next token is '_' for lower limit
      //     let next = peek();
      //     if (next && next.type === "char" && next.value === "_") {
      //       consume(); // consume '_'
      //       skipWhitespace();
      //       lower = parseChildScript();
      //     }

      //     // Check if next token is '^' for upper limit
      //     next = peek();
      //     if (next && next.type === "char" && next.value === "^") {
      //       consume(); // consume '^'
      //       skipWhitespace();
      //       upper = parseChildScript();
      //     }
      //     const result = getBigOpNodeFromAlias(name, lower, upper);
      //     if (result != undefined) {
      //       base = result;
      //     } else throw new Error(`PROBLEM: COULD NOT MAKE THE BIG OP FROM ${name}!!`)
      //   }

      //   else if (name === 'overset') {
      //     const accentContent = parseGroup();
      //     const child = parseGroup();
      //     base = createAccentedNode(child, { type: 'custom', content: accentContent, position: 'above' })
      //   }
      //   else if (name === 'underset') {
      //     const accentContent = parseGroup();
      //     const child = parseGroup();
      //     base = createAccentedNode(child, { type: 'custom', content: accentContent, position: 'below' })
      //   }
      //   else if (name === 'left') {
      //     console.warn(`Not yet implemented: ${name}`)
      //   }
      //   else if (name === 'right') {
      //     console.warn(`Not yet implemented: ${name}`)
      //   }
      //   else if (name.startsWith("\\")) {
      //     // TODO: recognize when to turn into special spacing like \,

      //     console.warn(`Escape sequence: ${name}`)

      //     if (name === "\\,") {
      //       base = createTextNode(" ", name);
      //     }
      //     else {
      //       // Create text node where display text is the sequence after "\"
      //       base = createTextNode(name.slice(1), name);
      //     }
      //   }
      //   else {
      //     console.log(`Name not found: '${name}'. Creating`)
      //     console.log(`creating \\${name} `)
      //     // Create text node with escaped sequence 
      //     base = createStyledNode(createTextNode("\\" + name, "\\" + name), { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } });
      //   }
      // }
      if (token.type === "command") {
        const { name } = consume() as { type: "command"; name: string };
      
        if (name === "actsymb") {
          const subLeftStr = parseOptionalBracketString();
          const supLeftStr = parseOptionalBracketString();
      
          const subLeft = parseLatex(" " + (subLeftStr ?? "") + " ");
          const supLeft = parseLatex(" " + (supLeftStr ?? "") + " ");
      
          const base = parseGroup();
          const subRight = parseGroup();
      
          const supRightStr = parseOptionalBracketString();
          const supRight = parseLatex(" " + (supRightStr ?? "") + " ");
      
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
          const indexString = parseOptionalBracketString();
          const indexNode = parseLatex(indexString ? ` ${indexString} ` : " ");
          const index = indexNode.type === "inline-container"
            ? indexNode
            : createInlineContainer([indexNode as StructureNode]);
      
          const radicand = parseGroup();
          base = createNthRoot(radicand, index);
        }
      
        else if (name in decorationToLatexCommandInverse) {
          const child = parseGroup();
          base = createAccentedNode(child, {
            type: 'predefined',
            decoration: decorationToLatexCommandInverse[name] as NodeDecoration,
          });
        }
      
        else if (getStyledNodeFromAlias(name)) {
          const child = parseGroup();
          base = getStyledNodeFromAlias(name, child);
        }
      
        else if (getSymbolNodeFromAlias(name)) {
          const nextToken = peek();
        
          // LaTeX rule: only treat as full command if next token is not a letter (char a-zA-Z)
          const isTerminated =
            !nextToken || 
            nextToken.type !== "char" || 
            !/^[a-zA-Z]$/.test(nextToken.value);
        
          if (!isTerminated) {
            // Don't consume as symbol — fallback below will handle
            console.warn(`Command \\${name} not terminated properly; not a match`);
          } else {
            base = getSymbolNodeFromAlias(name);
        
            // Optional trailing space swallow
            const rawSeq = symbolToLatex[base?.type === "text" ? base.content : ""] ?? "";
            const hadTrailingSpace = rawSeq.endsWith(" ");
        
            if (hadTrailingSpace) {
              const next = peek();
              if (next?.type === "char" && next.value === " ") {
                console.log(`SWALLOWED A SPACE AFTER \\${name}`);
                consume();
              } else {
                console.log(`NOPE type is ${next?.type}`);
              }
            }
          }
        }
      
        else if (getBigOpNodeFromAlias(name)) {
          let lower: InlineContainerNode = createInlineContainer();
          let upper: InlineContainerNode = createInlineContainer();
      
          skipWhitespace();
      
          let next = peek();
          if (next?.type === "char" && next.value === "_") {
            consume();
            skipWhitespace();
            lower = parseChildScript();
          }
      
          next = peek();
          if (next?.type === "char" && next.value === "^") {
            consume();
            skipWhitespace();
            upper = parseChildScript();
          }
      
          const result = getBigOpNodeFromAlias(name, lower, upper);
          if (result !== undefined) {
            base = result;
          } else {
            throw new Error(`PROBLEM: COULD NOT MAKE THE BIG OP FROM ${name}!!`);
          }
        }
      
        else if (name === 'overset') {
          const accentContent = parseGroup();
          const child = parseGroup();
          base = createAccentedNode(child, {
            type: 'custom',
            content: accentContent,
            position: 'above'
          });
        }
      
        else if (name === 'underset') {
          const accentContent = parseGroup();
          const child = parseGroup();
          base = createAccentedNode(child, {
            type: 'custom',
            content: accentContent,
            position: 'below'
          });
        }
      
        else if (name === 'left' || name === 'right') {
          console.warn(`Not yet implemented: ${name}`);
        }
      
        else if (name.startsWith("\\")) {
          console.warn(`Escape sequence: ${name}`);
          if (name === "\\,") {
            base = createTextNode(" ", name);
            //TODO fix here: make even escaped brackets parse as bracketed group
          } else {
            base = createTextNode(name.slice(1), name);
          }
        }
      
        else {
          console.log(`Name not found: '${name}'. Creating fallback text node`);
          base = createStyledNode(
            createTextNode("\\" + name, "\\" + name),
            { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
          );
        }
      }
      
      else if (token.type === "brace_open") {
        const group = parseGroup();
        if (group.children.length === 1) {
          console.log(`Preventing deep nesting: base is now ${nodeToLatex(group.children[0])}`)
          base = group.children[0];
        } else {
          base = group;
        }
      }
      else if (token.type === "char") {
        if (isOpeningBracket(token.value)) {
          const open = token.value;
          consume();
          const j = i; // save i in case of failure
          try {
            base = parseBracketGroup(open);
          } catch (err) {
            console.warn(`Cannot parse visual bracket group for ${open}: ${err}`);
            console.log(`${i} back to ${j}. We have ${tokens.slice(j, i).map(t => print_token(t))}`)
            i = j;
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
        consume();
        console.warn(`Unexpected token: ${token} ${token.type}`);
      }
    }
    else {
      console.warn("Unexpected end of input");
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
    skipWhitespace();

    // 4. Return SubSup node if any scripts found, else just base
    if (subLeft || supLeft || subRight || supRight) {
      return createChildedNode(ensureInContainerNode(base), 'subsup', subLeft, supLeft, subRight, supRight);
    }
    return base;
  }

  // Entry point
  const children: StructureNode[] = [];
  while (i < tokens.length) {
    const child = parseExpression();
    if (child) {
      children.push(child as StructureNode);
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
        while (i < input.length && /[a-zA-Z]/.test(input[i])) {
          name += input[i++];
        }
        console.log(`Push command: ${name}`)
        tokens.push({ type: "command", name });
      } else {
        // 🔥 Special character escaping
        console.log(`Push command IN ELSE: \\${next}`)
        tokens.push({ type: "command", name: "\\" + next });
        i++; // Advance past the escaped character
      }
    } else if (ch === "{") {
      console.log(`Push brace_open`)
      tokens.push({ type: "brace_open" });
      i++;
    } else if (ch === "}") {
      console.log(`Push brace_close`)
      tokens.push({ type: "brace_close" });
      i++;
    } else if (/\s/.test(ch)) {
      let ws = "";
      while (i < input.length && /\s/.test(input[i])) {
        console.log(`ws ${input[i]}`)
        ws += input[i++];
      }
      console.log(`Push whitespace`)
      tokens.push({ type: "whitespace", value: ws });
    } else {
      console.log(`Push char ${ch}`)
      tokens.push({ type: "char", value: ch });
      i++;
    }
  }
  return tokens;
}
