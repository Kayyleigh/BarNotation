// // Parses strings like "x^2" or "a/b" into MathNode trees

// import { MathNode, TextNode, PowerNode, FractionNode, SubscriptNode } from "./types";

// export function parseInputString(input: string): MathNode {
//     // Simple fraction: "a/b"
//     if (input.includes("/")) {
//         const [num, denom] = input.split("/", 2);
//         return new FractionNode(new TextNode(num), new TextNode(denom));
//     }

//     // Simple power: "x^2"
//     const powerMatch = input.match(/^(.+)\^(.+)$/);
//     if (powerMatch) {
//         return new PowerNode(new TextNode(powerMatch[1]), new TextNode(powerMatch[2]));
//     }

//     // Simple subscript: "x_1"
//     if (input.includes("_")) {
//         const [base, subscript] = input.split("_", 2);
//         return new SubscriptNode(new TextNode(base), new TextNode(subscript));
//     }

//   return new TextNode(input);
// }

// Parses simple strings like "x^2", "a/b", or "x_1" into MathNode trees

import {
    MathNode,
    CharacterNode,
    MultiCharacterNode,
    FractionNode,
    SubSupScriptedNode,
  } from "./types";
  
  export function parseInputString(input: string): MathNode {
    // Simple fraction: "a/b"
    if (input.includes("/")) {
      const [num, denom] = input.split("/", 2);
      return new FractionNode(
        new MultiCharacterNode(num),
        new MultiCharacterNode(denom)
      );
    }
  
    // Simple power: "x^2"
    const powerMatch = input.match(/^(.+)\^(.+)$/);
    if (powerMatch) {
      const base = new MultiCharacterNode(powerMatch[1]);
      const exponent = new MultiCharacterNode(powerMatch[2]);
      return new SubSupScriptedNode(
        base, 
        new MultiCharacterNode(""), 
        new MultiCharacterNode(""), 
        new MultiCharacterNode(""), 
        exponent);
    }
  
    // Simple subscript: "x_1"
    const subscriptMatch = input.match(/^(.+)\_(.+)$/);
    if (subscriptMatch) {
      const base = new MultiCharacterNode(subscriptMatch[1]);
      const sub = new MultiCharacterNode(subscriptMatch[2]);
      return new SubSupScriptedNode(
        base, 
        new MultiCharacterNode(""), 
        new MultiCharacterNode(""), 
        sub, 
        new MultiCharacterNode(""), 
      );
    }
  
    // Default fallback: interpret as multi-character text
    return new MultiCharacterNode(input);
  }
  