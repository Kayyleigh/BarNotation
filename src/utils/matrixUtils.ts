import type { MatrixBracketStyle } from "../models/mathNodeTypes";

export const matrixEnvToBracketStyle: Record<string, MatrixBracketStyle> = {
    matrix: "none",
    pmatrix: "parenthesis",
    bmatrix: "square",
    Bmatrix: "curly",
    vmatrix: "vertical",
    Vmatrix: "double_vertical",
  };