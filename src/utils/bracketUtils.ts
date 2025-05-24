// bracketUtils.ts

// TODO: ensure latex compatibility of symbols (used in latexParser). See https://tug.ctan.org/info/short-math-guide/short-math-guide.pdf

  export const bracketSymbols: Record<string, { open: string; close: string }> = {
    round: { open: "(", close: ")" },
    square: { open: "[", close: "]" },
    curly: { open: "{", close: "}" },
    chevron: { open: "⟨", close: "⟩" },
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
  
  export function getOpenSymbol(style: BracketStyle): string | undefined {
    return bracketSymbols[style]?.open;
  }
  
  export function getCloseSymbol(style: BracketStyle): string | undefined {
    return bracketSymbols[style]?.close;
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