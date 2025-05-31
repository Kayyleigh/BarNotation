// bracketUtils.ts

// TODO: ensure latex compatibility of symbols (used in latexParser). See https://tug.ctan.org/info/short-math-guide/short-math-guide.pdf

  export const bracketSymbols: Record<string, { open: string; close: string }> = {
    parentheses: { open: "(", close: ")" },
    square: { open: "[", close: "]" },
    curly: { open: "{", close: "}" },
    angle: { open: "⟨", close: "⟩" },
    vertical: { open: "|", close: "|" }, //TODO include once I allow nice render of lonely vertical lines (not red)
    floor: { open: "⌊", close: "⌋" },
    ceil: { open: "⌈", close: "⌉" },
  };

  // Extract keys as a union type of styles:
  export type BracketStyle = keyof typeof bracketSymbols;
  
  const symbolToStyleMap: Record<string, string> = Object.entries(bracketSymbols)
    .flatMap(([style, { open, close }]) => [
      [open, style],
      [close, style],
    ])
    .reduce((acc, [symbol, style]) => {
      acc[symbol] = style;
      return acc;
    }, {} as Record<string, string>);
  
  export function getStyleFromSymbol(symbol: string): BracketStyle | undefined {
    return symbolToStyleMap[symbol];
  }
  
  export function getOpenSymbol(style: BracketStyle): string {
    return bracketSymbols[style]?.open || "" ;
  }
  
  export function getCloseSymbol(style: BracketStyle): string {
    return bracketSymbols[style]?.close || "" ;
  }
  
  export const openingBrackets = new Set(
    Object.values(bracketSymbols).map(({ open }) => open)
  );
  
  export function isOpeningBracket(symbol: string): boolean {
    return openingBrackets.has(symbol);
  }

  export const closingBrackets = new Set(
    Object.values(bracketSymbols).map(({ close }) => close)
  );
  
  export function isClosingBracket(symbol: string): boolean {
    return closingBrackets.has(symbol);
  }