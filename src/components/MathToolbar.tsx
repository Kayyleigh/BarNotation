// import React from "react";
// import { ActuarialNode, MathNode } from "../math/types";
// import { TextNode, FractionNode, PowerNode, SubscriptNode } from "../math/types";
// // SubscriptNode, SummationNode, IntegralNode, MatrixNode 
// type ToolbarProps = {
//   onInsert: (node: MathNode) => void;
// };

// export const MathToolbar: React.FC<ToolbarProps> = ({ onInsert }) => {
//   const structures = [
//     { label: "Fraction", create: () => new FractionNode(new TextNode("a"), new TextNode("b")) },
//     { label: "Power", create: () => new PowerNode(new TextNode("x"), new TextNode("2")) },
//     { label: "Subscript", create: () => new SubscriptNode(new TextNode("x"), new TextNode("i")) },
//     { label: "Actuarial", create: () => new ActuarialNode(new TextNode("A"), new TextNode("m|"), new TextNode("2"), new TextNode("x:n"), new TextNode("1")) },
//     { label: "Integral", create: () => new IntegralNode(new TextNode("0"), new TextNode("∞"), new TextNode("f(x)dx")) },
//     { label: "Matrix", create: () => new MatrixNode([[new TextNode("m|"), new TextNode("2")], [new TextNode("x:n"), new TextNode("1")]]) },
//   ];

//   return (
//     <div style={{ display: "flex", gap: "12px", padding: "10px", borderBottom: "1px solid #ccc" }}>
//       {structures.map((s, index) => (
//         <button key={index} onClick={() => onInsert(s.create())}>
//           {s.label}
//         </button>
//       ))}
//     </div>
//   );
// };

import React from "react";
import {
  MathNode,
  CharacterNode,
  MultiCharacterNode,
  FractionNode,
  RootNode,
  BigOperatorNode,
  MatrixNode,
  VectorNode,
  SubSupScriptedNode,
  GroupNode,
  DecoratedNode,
} from "../math/types";

type ToolbarProps = {
  onInsert: (node: MathNode) => void;
};

export const MathToolbar: React.FC<ToolbarProps> = ({ onInsert }) => {
  const structures = [
    {
      label: "Fraction",
      create: () => new FractionNode(
        new MultiCharacterNode("a"),
        new MultiCharacterNode("b")
      ),
    },
    {
      label: "Root",
      create: () => new RootNode(new MultiCharacterNode("x+1"), new CharacterNode("3")),
    },
    {
      label: "Superscript",
      create: () => new SubSupScriptedNode(
        new CharacterNode("x"),
        new CharacterNode(""),
        new CharacterNode(""),
        new CharacterNode(""),
        new CharacterNode("2")
      ),
    },
    {
      label: "Subscript",
      create: () => new SubSupScriptedNode(
        new CharacterNode("x"),
        new CharacterNode(""),
        new CharacterNode(""),
        new CharacterNode("i"),
        new CharacterNode("")
      ),
    },
    {
      label: "Actuarial",
      create: () => new SubSupScriptedNode(
        new DecoratedNode("bar", new CharacterNode("A")),
        new MultiCharacterNode("m|"),
        new CharacterNode("2"),
        new MultiCharacterNode(
          [
            new DecoratedNode("itop", new CharacterNode("x")),
            new CharacterNode(":"), 
            new DecoratedNode("angl", new CharacterNode("n"))
          ]),
        new CharacterNode(""),
      ),
    },
    {
      label: "Group",
      create: () => new GroupNode([
        new CharacterNode("a"),
        new CharacterNode("+"),
        new CharacterNode("b"),
      ]),
    },
    {
      label: "Decorated (hat)",
      create: () => new DecoratedNode("hat", new CharacterNode("x")),
    },
    {
      label: "Summation",
      create: () => new BigOperatorNode(
        "∑",
        new MultiCharacterNode("i=1"),
        new CharacterNode("n"),
        new MultiCharacterNode([
          new SubSupScriptedNode(
            new CharacterNode("x"),
            new MultiCharacterNode(""),
            new MultiCharacterNode(""),
            new CharacterNode("i"),
            new MultiCharacterNode(""),
          ),
        ])
      ),
    },
    {
      label: "Integral",
      create: () => new BigOperatorNode(
        "∫",
        new CharacterNode("0"),
        new CharacterNode("∞"),
        new MultiCharacterNode("f(x)dx")
      ),
    },
    {
      label: "Matrix",
      create: () => new MatrixNode([
        [new CharacterNode("a"), new CharacterNode("b")],
        [new CharacterNode("c"), new CharacterNode("d")],
      ]),
    },
    {
      label: "Vector",
      create: () => new VectorNode(
        [new CharacterNode("x"), new CharacterNode("y"), new CharacterNode("z")],
        "column"
      ),
    },
  ];

  return (
    <div style={{ display: "flex", gap: "12px", padding: "10px", borderBottom: "1px solid #ccc" }}>
      {structures.map((s, index) => (
        <button key={index} onClick={() => onInsert(s.create())}>
          {s.label}
        </button>
      ))}
    </div>
  );
};