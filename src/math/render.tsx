// Renders the MathNode tree to JSX

import React from "react";
import {
  MathNode,
  CharacterNode,
  MultiCharacterNode,
  DecoratedNode,
  GroupNode,
  BigOperatorNode,
  FractionNode,
  RootNode,
  SubSupScriptedNode,
  MatrixNode,
  VectorNode,
} from "./types";


export function renderNode(node: MathNode): React.ReactNode {
  if (node instanceof CharacterNode) {
    return <span>{node.value}</span>;
  }

  if (node instanceof MultiCharacterNode) {
    return (
        <span className="multi-char">
          {node.children.map(renderNode)}
        </span>
    );
  }

  if (node instanceof GroupNode) {
    return (
        <span className="group">
          (<span>{node.children.map(renderNode)}</span>)
        </span>
    );
  }

  if (node instanceof DecoratedNode) {
    return (
      <span className="decorated">
        <span className={`decoration decoration-${node.decoration}`} />
        {renderNode(node.child)}
      </span>
    );
  }

  if (node instanceof BigOperatorNode) {
      return (
        <span className="big-operator">
          <span className="symbol">{node.operatorSymbol}</span>
          {node.lower && <sub>{renderNode(node.lower)}</sub>}
          {node.upper && <sup>{renderNode(node.upper)}</sup>}
          <span className="body">{renderNode(node.body)}</span>
        </span>
      );
  }

  if (node instanceof RootNode) {
    return (
        <span className="root">
          {node.index && <sup className="index">{renderNode(node.index)}</sup>}
          <span className="radicand">√{renderNode(node.radicand)}</span>
        </span>
      );
  }

  if (node instanceof SubSupScriptedNode) {
    return (
        <span className="subsup">
          {renderNode(node.base)}
          {node.ll && <sub>{renderNode(node.ll)}</sub>}
          {node.ul && <sup>{renderNode(node.ul)}</sup>}
          {node.lr && <span className="lr">{renderNode(node.lr)}</span>}
          {node.ur && <span className="ur">{renderNode(node.ur)}</span>}
        </span>
      );
  }

  if (node instanceof FractionNode) {
    return (
      <span>
        <sup>{renderNode(node.numerator)}</sup>⁄<sub>{renderNode(node.denominator)}</sub>
      </span>
    );
  }

  if (node instanceof MatrixNode) {
    return (
      <table className="matrix">
        <tbody>
          {node.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{renderNode(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (node instanceof VectorNode) {
    return (
      <div className={`vector vector-${node.orientation}`}>
        {node.children.map(renderNode)}
      </div>
    );
  }

  return <span style={{ color: "red" }}>Unknown Node</span>;
}
