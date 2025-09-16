import type { EditorState } from "../logic/editor-state";
import type { CellData, TextCellContent } from "../models/noteTypes";

// function computeDisplayTexts(
//     textContents: Record<string, TextCellContent>,
//     orderedIds: string[]
//   ): Record<string, string> {
//     const counters = [0, 0, 0];
//     const displayTexts: Record<string, string> = {};

//     for (const id of orderedIds) {
//       const cell = textContents[id];
//       switch (cell.type) {
//         case "section":
//           counters[0]++;
//           counters[1] = 0;
//           counters[2] = 0;
//           displayTexts[id] = `${counters[0]}. ${cell.text}`;
//           break;
//         case "subsection":
//           counters[1]++;
//           counters[2] = 0;
//           displayTexts[id] = `${counters[0]}.${counters[1]}. ${cell.text}`;
//           break;
//         case "subsubsection":
//           counters[2]++;
//           displayTexts[id] = `${counters[0]}.${counters[1]}.${counters[2]}. ${cell.text}`;
//           break;
//         default:
//           displayTexts[id] = cell.text;
//       }
//     }

//     return displayTexts;
//   }

export function reconstructCells(
  order: string[],
  editorStates: Record<string, EditorState>,
  textContents: Record<string, TextCellContent> = {}
): CellData[] {
  return order.map((id) => {
    if (editorStates[id]) {
      return { id, type: "math", content: editorStates[id] };
    } else if (textContents[id]) {
      return { id, type: "text", content: textContents[id] };
    } else {
      return { id, type: "text", content: { text: "", type: "plain" } };
    }
  });
}

export function computeDisplayNumbers(
  textContents: Record<string, TextCellContent>,
  orderedIds: string[]
): Record<string, string> {
  const counters = [0, 0, 0];
  const numbers: Record<string, string> = {};

  for (const id of orderedIds) {
    const cell = textContents[id];
    switch (cell.type) {
      case "section":
        counters[0]++;
        counters[1] = 0;
        counters[2] = 0;
        numbers[id] = `${counters[0]}.`;
        break;
      case "subsection":
        counters[1]++;
        counters[2] = 0;
        numbers[id] = `${counters[0]}.${counters[1]}.`;
        break;
      case "subsubsection":
        counters[2]++;
        numbers[id] = `${counters[0]}.${counters[1]}.${counters[2]}.`;
        break;
      default:
        numbers[id] = "";
    }
  }

  return numbers;
}