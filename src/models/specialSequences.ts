import { createAccentedNode, createBigOperator, createInlineContainer, createNthRoot, createStyledNode, createTextNode } from '../models/nodeFactories';
import type { InlineContainerNode, StructureNode, TextStyle } from '../models/types';
import { decorationToLatexCommand, type NodeDecoration, type DecorationInfo } from '../utils/accentUtils';

export interface SpecialSequence {
  sequence: string;
  createNode: () => StructureNode;
}

export const decoratedEntries: SpecialSequence[] = Object.entries(decorationToLatexCommand).map(
  ([decoration, decorationInfo]) => {
    // Assert or cast decorationInfo if necessary
    const info = decorationInfo as DecorationInfo;
    return {
      sequence: info.command,  // Explicit key-value pair
      createNode: () => createAccentedNode(createInlineContainer(), { type: 'predefined', decoration: decoration as NodeDecoration }),
    };
  }
);

const makeStyledSequence = (sequence: string, style: TextStyle): SpecialSequence => ({
  sequence,
  createNode: (
    child = createInlineContainer()
  ) => createStyledNode(child, style),
});

export const stylingOptions: SpecialSequence[] = [
  makeStyledSequence("\\text ", { fontStyling: { fontStyle: "upright" , fontStyleAlias: "\\text" } }),
  makeStyledSequence("\\mathrm ", { fontStyling: { fontStyle: "upright" , fontStyleAlias: "\\mathrm" } }),
  makeStyledSequence("\\operatorname ", { fontStyling: { fontStyle: "upright" , fontStyleAlias: "\\operatorname" } }),
  makeStyledSequence("\\mathbf ", { fontStyling: { fontStyle: "bold" , fontStyleAlias: "\\mathbf" } }),
  makeStyledSequence("\\mathbb ", { fontStyling: { fontStyle: "blackboard" , fontStyleAlias: "\\mathbb" } }),
  makeStyledSequence("\\boldsymbol ", { fontStyling: { fontStyle: "bold" , fontStyleAlias: "\\boldsymbol" } }),
  makeStyledSequence("\\mathcal ", { fontStyling: { fontStyle: "calligraphic" , fontStyleAlias: "\\mathcal" } }),
  //TODO add the rest of the existing \\math<...>
];

export const nodeTransformationSequences: SpecialSequence[] = [ //TODO: rename to relevant
  {
    sequence: "\\sqrt ",
    createNode: () => createNthRoot(
      createInlineContainer(),
      createInlineContainer(),
    ),
  },
]

const makeBigOp = (sequence: string, symbol: string): SpecialSequence => ({
  sequence,
  createNode: (
    lower = createInlineContainer(),
    upper = createInlineContainer()
  ) => createBigOperator(symbol, lower, upper),
});

export const bigOperatorSequences: SpecialSequence[] = [
  makeBigOp("\\sum ", "Σ"),
  makeBigOp("\\prod ", "Π"),
  makeBigOp("\\int ", "∫"),
  makeBigOp("\\iint ", "∫∫"),
  makeBigOp("\\iiint ", "∫∫∫"),
  makeBigOp("\\iiiint ", "∫∫∫∫"),
  makeBigOp("\\oint ", "∮"),
];

//NOTE TO SELF: sequence is what _I_ allow; alias is a unique identifier _I_ chose
// The fact that both are just LaTeX is "a complete coincidence?"
// When  
export const greekLetters: SpecialSequence[] = [
  // small
  { sequence: "\\alpha ", createNode: () => createTextNode("α", "\\alpha ") },
  { sequence: "\\beta ", createNode: () => createTextNode("β", "\\beta ") },
  { sequence: "\\chi ", createNode: () => createTextNode("χ", "\\chi ") },
  { sequence: "\\delta ", createNode: () => createTextNode("δ", "\\delta ") },
  { sequence: "\\digamma ", createNode: () => createTextNode("ͷ", "\\digamma ") },
  { sequence: "\\epsilon ", createNode: () => createTextNode("ϵ", "\\epsilon ") },
  { sequence: "\\eta ", createNode: () => createTextNode("η", "\\eta ") },
  { sequence: "\\gamma ", createNode: () => createTextNode("γ", "\\gamma ") },
  { sequence: "\\iota ", createNode: () => createTextNode("ι", "\\iota ") },
  { sequence: "\\kappa ", createNode: () => createTextNode("κ", "\\kappa ") },
  { sequence: "\\lambda ", createNode: () => createTextNode("λ", "\\lambda ") },
  { sequence: "\\mu ", createNode: () => createTextNode("µ", "\\mu ") },
  { sequence: "\\nu ", createNode: () => createTextNode("ν", "\\nu ") },
  { sequence: "\\omega ", createNode: () => createTextNode("ω", "\\omega ") },
  { sequence: "\\phi ", createNode: () => createTextNode("φ", "\\phi ") },
  { sequence: "\\pi ", createNode: () => createTextNode("π", "\\pi ") },
  { sequence: "\\psi ", createNode: () => createTextNode("ψ", "\\psi ") },
  { sequence: "\\rho ", createNode: () => createTextNode("ρ", "\\rho ") },
  { sequence: "\\sigma ", createNode: () => createTextNode("σ", "\\sigma ") },
  { sequence: "\\tau ", createNode: () => createTextNode("τ", "\\tau ") },
  { sequence: "\\theta ", createNode: () => createTextNode("θ", "\\theta ") },
  { sequence: "\\upsilon ", createNode: () => createTextNode("υ", "\\upsilon ") },
  { sequence: "\\varepsilon ", createNode: () => createTextNode("ε", "\\varepsilon ") },
  { sequence: "\\varkappa ", createNode: () => createTextNode("ϰ", "\\varkappa ") },
  { sequence: "\\varphi ", createNode: () => createTextNode("ϕ", "\\varphi ") },
  { sequence: "\\varpi ", createNode: () => createTextNode("ϖ", "\\varpi ") },
  { sequence: "\\varrho ", createNode: () => createTextNode("ϱ", "\\varrho ") },
  { sequence: "\\varsigma ", createNode: () => createTextNode("ς", "\\varsigma ") },
  { sequence: "\\vartheta ", createNode: () => createTextNode("ϑ", "\\vartheta ") },
  { sequence: "\\xi ", createNode: () => createTextNode("ξ", "\\xi ") },
  { sequence: "\\zeta ", createNode: () => createTextNode("ζ", "\\zeta ") },
  // Large
  { sequence: "\\Delta ", createNode: () => createTextNode("∆", "\\Delta ") },
  { sequence: "\\Gamma ", createNode: () => createTextNode("Γ", "\\Gamma ") },
  { sequence: "\\Lambda ", createNode: () => createTextNode("Λ", "\\Lambda ") },
  { sequence: "\\Omega ", createNode: () => createTextNode("Ω", "\\Omega ") },
  { sequence: "\\Phi ", createNode: () => createTextNode("Φ", "\\Phi ") },
  { sequence: "\\Pi ", createNode: () => createTextNode("Π", "\\Pi ") },
  { sequence: "\\Psi ", createNode: () => createTextNode("Ψ", "\\Psi ") },
  { sequence: "\\Sigma ", createNode: () => createTextNode("Σ", "\\Sigma ") },
  { sequence: "\\Theta ", createNode: () => createTextNode("Θ", "\\Theta ") },
  { sequence: "\\Upsilon ", createNode: () => createTextNode("Υ", "\\Upsilon ") },
  { sequence: "\\Xi ", createNode: () => createTextNode("Ξ", "\\Xi ") },
];

export const hebrewLetters: SpecialSequence[] = [
  { sequence: "\\aleph ", createNode: () => createTextNode("ℵ", "\\aleph ") },
  { sequence: "\\beth ", createNode: () => createTextNode("ℶ", "\\beth ") },
  { sequence: "\\daleth ", createNode: () => createTextNode("ℸ", "\\daleth ") },
  { sequence: "\\gimel ", createNode: () => createTextNode("ℷ", "\\gimel ") },
];

export const bracketSymbolSequences: SpecialSequence[] = [
  { sequence: "\\lfloor ", createNode: () => createTextNode("⌊", "\\lfloor ") },
  { sequence: "\\rfloor ", createNode: () => createTextNode("⌋", "\\rfloor ") },
  { sequence: "\\lceil ", createNode: () => createTextNode("⌈", "\\lceil ") },
  { sequence: "\\rceil ", createNode: () => createTextNode("⌉", "\\rceil ") },
];

export const arrowSymbols: SpecialSequence[] = [
  { sequence: "\\uparrow ", createNode: () => createTextNode("↑", "\\uparrow ") },
  { sequence: "\\downarrow ", createNode: () => createTextNode("↓", "\\downarrow ") },
  { sequence: "\\leftarrow ", createNode: () => createTextNode("←", "\\leftarrow ") },
  { sequence: "\\rightarrow ", createNode: () => createTextNode("→", "\\rightarrow ") },
  { sequence: "\\to ", createNode: () => createTextNode("→", "\\to ") },
  { sequence: "\\Uparrow ", createNode: () => createTextNode("⇑", "\\Uparrow ") },
  { sequence: "\\Downarrow ", createNode: () => createTextNode("⇓", "\\Downarrow ") },
  { sequence: "\\Leftarrow ", createNode: () => createTextNode("⇐", "\\Leftarrow ") },
  { sequence: "\\Rightarrow ", createNode: () => createTextNode("⇒", "\\Rightarrow ") },
  { sequence: "\\leftrightarrow ", createNode: () => createTextNode("↔", "\\leftrightarrow ") },
  { sequence: "\\Leftrightarrow ", createNode: () => createTextNode("⇔", "\\Leftrightarrow ") },

  // In LaTeX slightly different from Leftrightarrow and Rightarrow, but my app is not that fancy in rendering (yet) since I just use existing symbols
  { sequence: "\\iff ", createNode: () => createTextNode("⇔", "\\iff ") }, 
  { sequence: "\\implies ", createNode: () => createTextNode("⇒", "\\implies ") }, 
];

export const binaryOperators: SpecialSequence[] = [
  { sequence: "\\cdot ", createNode: () => createTextNode("⋅", "\\cdot ") },
  { sequence: "\\times ", createNode: () => createTextNode("×", "\\times ") },  
  { sequence: "\\ast ", createNode: () => createTextNode("∗", "\\ast ") },
  { sequence: "\\pm ", createNode: () => createTextNode("±", "\\pm ") },
  { sequence: "\\cap ", createNode: () => createTextNode("∩", "\\cap ") },
  { sequence: "\\setminus ", createNode: () => createTextNode("\\", "\\setminus ") },
  { sequence: "\\cup ", createNode: () => createTextNode("∪", "\\cup ") },
  { sequence: "\\wedge ", createNode: () => createTextNode("∧", "\\wedge ") },
  { sequence: "\\land ", createNode: () => createTextNode("∧", "\\land ") },
  { sequence: "\\vee ", createNode: () => createTextNode("∨", "\\vee ") },
  { sequence: "\\lor ", createNode: () => createTextNode("∨", "\\lor ") },
  { sequence: "\\smallsetminus ", createNode: () => createTextNode("∖", "\\smallsetminus ") },
  { sequence: "\\emptyset ", createNode: () => createTextNode("∅", "\\emptyset ") },
  { sequence: "\\bigcap ", createNode: () => createTextNode("⋂", "\\bigcap ") },
  { sequence: "\\bigcup ", createNode: () => createTextNode("⋃", "\\bigcup ") },
  { sequence: "\\bigvee ", createNode: () => createTextNode("⋁", "\\bigvee ") },
  { sequence: "\\bigwedge ", createNode: () => createTextNode("⋀", "\\bigwedge ") },
  { sequence: "\\bigsqcup ", createNode: () => createTextNode("⋓", "\\bigsqcup ") },
  { sequence: "\\uplus ", createNode: () => createTextNode("⊎", "\\uplus ") },
  { sequence: "\\diamond ", createNode: () => createTextNode("⋄", "\\diamond ") },
  { sequence: "\\otimes ", createNode: () => createTextNode("⊗", "\\otimes ") },
  { sequence: "\\oplus ", createNode: () => createTextNode("⊕", "\\oplus ") },
  { sequence: "\\oslash ", createNode: () => createTextNode("⊘", "\\oslash ") },
  { sequence: "\\odot ", createNode: () => createTextNode("⊙", "\\odot ") },
  { sequence: "\\circledcirc ", createNode: () => createTextNode("⊚", "\\circledcirc ") },
  { sequence: "\\circledast ", createNode: () => createTextNode("⊛", "\\circledast ") },
  { sequence: "\\ominus ", createNode: () => createTextNode("⊝", "\\ominus ") },
  { sequence: "\\boxplus ", createNode: () => createTextNode("⊞", "\\boxplus ") },
  { sequence: "\\boxminus ", createNode: () => createTextNode("⊟", "\\boxminus ") },
  { sequence: "\\boxtimes ", createNode: () => createTextNode("⊠", "\\boxtimes ") },
  { sequence: "\\boxdot ", createNode: () => createTextNode("⊡", "\\boxdot ") },
  { sequence: "\\dotplus ", createNode: () => createTextNode("∔", "\\dotplus ") },
  { sequence: "\\wr ", createNode: () => createTextNode("≀", "\\wr ") },
  { sequence: "\\bowtie ", createNode: () => createTextNode("⋈", "\\bowtie ") },
  { sequence: "\\models ", createNode: () => createTextNode("⊨", "\\models ") },
  { sequence: "\\vDash ", createNode: () => createTextNode("⊩", "\\vDash ") },
  { sequence: "\\Vdash ", createNode: () => createTextNode("⊫", "\\Vdash ") },
  { sequence: "\\nvdash ", createNode: () => createTextNode("⊬", "\\nvdash ") },
  { sequence: "\\nvDash ", createNode: () => createTextNode("⊭", "\\nvDash ") },
  { sequence: "\\equiv ", createNode: () => createTextNode("≡", "\\equiv ") },
  { sequence: "\\cong ", createNode: () => createTextNode("≅", "\\cong ") },
  { sequence: "\\approx ", createNode: () => createTextNode("≈", "\\approx ") },
  { sequence: "\\sim ", createNode: () => createTextNode("∼", "\\sim ") },
  { sequence: "\\simeq ", createNode: () => createTextNode("≃", "\\simeq ") },
  { sequence: "\\nsim ", createNode: () => createTextNode("≁", "\\nsim ") },
  { sequence: "\\neq ", createNode: () => createTextNode("≠", "\\neq ") },
  { sequence: "\\doteq ", createNode: () => createTextNode("≐", "\\doteq ") },
  { sequence: "\\fallingdotseq ", createNode: () => createTextNode("≒", "\\fallingdotseq ") },
  { sequence: "\\risingdotseq ", createNode: () => createTextNode("≓", "\\risingdotseq ") },
  { sequence: "\\propto ", createNode: () => createTextNode("∝", "\\propto ") },
  { sequence: "\\lt ", createNode: () => createTextNode("<", "\\lt ") },
  { sequence: "\\gt ", createNode: () => createTextNode(">", "\\gt ") },
  { sequence: "\\nless ", createNode: () => createTextNode("≮", "\\nless ") },
  { sequence: "\\ngtr ", createNode: () => createTextNode("≯", "\\ngtr ") },
  { sequence: "\\ll ", createNode: () => createTextNode("≪", "\\ll ") },
  { sequence: "\\gg ", createNode: () => createTextNode("≫", "\\gg ") },
  { sequence: "\\lesssim ", createNode: () => createTextNode("≲", "\\lesssim ") },
  { sequence: "\\gtrsim ", createNode: () => createTextNode("≳", "\\gtrsim ") },
  { sequence: "\\lessgtr ", createNode: () => createTextNode("≶", "\\lessgtr ") },
  { sequence: "\\gtrless ", createNode: () => createTextNode("≷", "\\gtrless ") },
  { sequence: "\\lesseqgtr ", createNode: () => createTextNode("⋚", "\\lesseqgtr ") },
  { sequence: "\\gtreqless ", createNode: () => createTextNode("⋛", "\\gtreqless ") },
  { sequence: "\\leq ", createNode: () => createTextNode("≤", "\\leq ") },
  { sequence: "\\geq ", createNode: () => createTextNode("≥", "\\geq ") },
  { sequence: "\\leqq ", createNode: () => createTextNode("≦", "\\leqq ") },
  { sequence: "\\geqq ", createNode: () => createTextNode("≧", "\\geqq ") },
  { sequence: "\\leqslant ", createNode: () => createTextNode("⩽", "\\leqslant ") },
  { sequence: "\\geqslant ", createNode: () => createTextNode("⩾", "\\geqslant ") },
  { sequence: "\\subset ", createNode: () => createTextNode("⊂", "\\subset ") },
  { sequence: "\\supset ", createNode: () => createTextNode("⊃", "\\supset ") },
  { sequence: "\\subseteq ", createNode: () => createTextNode("⊆", "\\subseteq ") },
  { sequence: "\\supseteq ", createNode: () => createTextNode("⊇", "\\supseteq ") },
  { sequence: "\\nsubseteq ", createNode: () => createTextNode("⊈", "\\nsubseteq ") },
  { sequence: "\\nsupseteq ", createNode: () => createTextNode("⊉", "\\nsupseteq ") },
  { sequence: "\\subsetneq ", createNode: () => createTextNode("⊊", "\\subsetneq ") },
  { sequence: "\\supsetneq ", createNode: () => createTextNode("⊋", "\\supsetneq ") },
  { sequence: "\\sqsubset ", createNode: () => createTextNode("⊏", "\\sqsubset ") },
  { sequence: "\\sqsupset ", createNode: () => createTextNode("⊐", "\\sqsupset ") },
  { sequence: "\\sqsubseteq ", createNode: () => createTextNode("⊑", "\\sqsubseteq ") },
  { sequence: "\\sqsupseteq ", createNode: () => createTextNode("⊒", "\\sqsupseteq ") },
  { sequence: "\\preceq ", createNode: () => createTextNode("≼", "\\preceq ") },
  { sequence: "\\succeq ", createNode: () => createTextNode("≽", "\\succeq ") },
  { sequence: "\\prec ", createNode: () => createTextNode("≺", "\\prec ") },
  { sequence: "\\succ ", createNode: () => createTextNode("≻", "\\succ ") },
  { sequence: "\\precsim ", createNode: () => createTextNode("⋞", "\\precsim ") },
  { sequence: "\\succsim ", createNode: () => createTextNode("⋟", "\\succsim ") },
  { sequence: "\\vdash ", createNode: () => createTextNode("⊢", "\\vdash ") },
  { sequence: "\\dashv ", createNode: () => createTextNode("⊣", "\\dashv ") },
  { sequence: "\\lhd ", createNode: () => createTextNode("⋋", "\\lhd ") },
  { sequence: "\\rhd ", createNode: () => createTextNode("⋌", "\\rhd ") },
  { sequence: "\\triangleleft ", createNode: () => createTextNode("⊲", "\\triangleleft ") },
  { sequence: "\\triangleright ", createNode: () => createTextNode("⊳", "\\triangleright ") },
  { sequence: "\\unlhd ", createNode: () => createTextNode("⊴", "\\unlhd ") },
  { sequence: "\\unrhd ", createNode: () => createTextNode("⊵", "\\unrhd ") },
  { sequence: "\\intercal ", createNode: () => createTextNode("⊺", "\\intercal ") },
  { sequence: "\\barwedge ", createNode: () => createTextNode("⊼", "\\barwedge ") },
  { sequence: "\\veebar ", createNode: () => createTextNode("⊽", "\\veebar ") },
  { sequence: "\\curlyvee ", createNode: () => createTextNode("⊻", "\\curlyvee ") },
  { sequence: "\\curlywedge ", createNode: () => createTextNode("⊼", "\\curlywedge ") },
  { sequence: "\\doublebarwedge ", createNode: () => createTextNode("⧺", "\\doublebarwedge ") },
  { sequence: "\\perp ", createNode: () => createTextNode("⟂", "\\perp ") },
  { sequence: "\\parallel ", createNode: () => createTextNode("∥", "\\parallel ") },
  { sequence: "\\nparallel ", createNode: () => createTextNode("∦", "\\nparallel ") },
  { sequence: "\\mid ", createNode: () => createTextNode("∣", "\\mid ") },
  { sequence: "\\nmid ", createNode: () => createTextNode("∤", "\\nmid ") },
  { sequence: "\\notin ", createNode: () => createTextNode("∉", "\\notin ") },
  { sequence: "\\in ", createNode: () => createTextNode("∈", "\\in ") },
  { sequence: "\\ni ", createNode: () => createTextNode("∍", "\\ni ") },
  { sequence: "\\therefore ", createNode: () => createTextNode("∴", "\\therefore ") },
  { sequence: "\\because ", createNode: () => createTextNode("∵", "\\because ") }
];

export const logicSymbols: SpecialSequence[] = [
  { sequence: "\\forall ", createNode: () => createTextNode("∀", "\\forall ") },
  { sequence: "\\exists ", createNode: () => createTextNode("∃", "\\exists ") },
  { sequence: "\\neg ", createNode: () => createTextNode("¬", "\\neg ") },
  { sequence: "\\nexists ", createNode: () => createTextNode("∄", "\\nexists ") },
  { sequence: "\\varnothing ", createNode: () => createTextNode("∅", "\\varnothing ") },
  { sequence: "\\top ", createNode: () => createTextNode("⊤", "\\top ") },
  { sequence: "\\bot ", createNode: () => createTextNode("⊥", "\\bot ") },
];

export const otherSymbols: SpecialSequence[] = [
  { sequence: "\\infty ", createNode: () => createTextNode("∞", "\\infty ") },
  { sequence: "\\partial ", createNode: () => createTextNode("∂", "\\partial ") },
  { sequence: "\\nabla ", createNode: () => createTextNode("∇", "\\nabla ") },   
];

export const standardFunctionNames: SpecialSequence[] = [

  // Custom (Valid inputs in my app, NOT in latex!!)

  // Note: `\\arg\\max` means that copying back into the editor splits it into 2 nodes.
  // Only way to prevent that is by mapping it back to my own accepted `\\argmax`
  // This would be confusing because by definition in this file, "sequence" tells what sequence is accepted
  // ... and `\\arg\\max` is not one of the sequences. It's two of them! So this behavior is expected and acceptable imo. 
  { sequence: "\\argmax ", 
    createNode: () => createStyledNode(
      createTextNode("arg max", "\\arg\\max"), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\argmin ", 
    createNode: () => createStyledNode(
      createTextNode("arg min", "\\arg\\min"), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\Var ", 
    createNode: () => createStyledNode(
      createTextNode("Var", "\\operatorname{Var}"), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
    
  // Valid in latex

  { sequence: "\\arccos ", 
    createNode: () => createStyledNode(
      createTextNode("arccos", "\\arccos "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\arcsin ", 
    createNode: () => createStyledNode(
      createTextNode("arcsin", "\\arcsin "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\arctan ", 
    createNode: () => createStyledNode(
      createTextNode("arctan", "\\arctan "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\arg ", 
    createNode: () => createStyledNode(
      createTextNode("arg", "\\arg "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\cos ", 
    createNode: () => createStyledNode(
      createTextNode("cos", "\\cos "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\cosh ", 
    createNode: () => createStyledNode(
      createTextNode("cosh", "\\cosh "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\cot ", 
    createNode: () => createStyledNode(
      createTextNode("cot", "\\cot "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\coth ", 
    createNode: () => createStyledNode(
      createTextNode("coth", "\\coth "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\csc ", 
    createNode: () => createStyledNode(
      createTextNode("csc", "\\csc "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\deg ", 
    createNode: () => createStyledNode(
      createTextNode("deg", "\\deg "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\det ", 
    createNode: () => createStyledNode(
      createTextNode("det", "\\det "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\dim ", 
    createNode: () => createStyledNode(
      createTextNode("dim", "\\dim "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\exp ", 
    createNode: () => createStyledNode(
      createTextNode("exp", "\\exp "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\gcd ", 
    createNode: () => createStyledNode(
      createTextNode("gcd", "\\gcd "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\hom ", 
    createNode: () => createStyledNode(
      createTextNode("hom", "\\hom "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\inf ", 
    createNode: () => createStyledNode(
      createTextNode("inf", "\\inf "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\ker ", 
    createNode: () => createStyledNode(
      createTextNode("ker", "\\ker "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\lg ", 
    createNode: () => createStyledNode(
      createTextNode("lg", "\\lg "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\lim ", 
    createNode: () => createStyledNode(
      createTextNode("lim", "\\lim "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\liminf ", 
    createNode: () => createStyledNode(
      createInlineContainer([createTextNode("lim inf", "\\liminf ")]), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\limsup ", 
    createNode: () => createStyledNode(
      createInlineContainer([createTextNode("lim sup", "\\limsup ")]), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\ln ", 
    createNode: () => createStyledNode(
      createTextNode("ln", "\\ln "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\log ", 
    createNode: () => createStyledNode(
      createTextNode("log", "\\log "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\max ", 
    createNode: () => createStyledNode(
      createTextNode("max", "\\max "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\min ", 
    createNode: () => createStyledNode(
      createTextNode("min", "\\min "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\Pr ", 
    createNode: () => createStyledNode(
      createTextNode("Pr", "\\Pr "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\sec ", 
    createNode: () => createStyledNode(
      createTextNode("sec", "\\sec "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\sin ", 
    createNode: () => createStyledNode(
      createTextNode("sin", "\\sin "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\sinh ", 
    createNode: () => createStyledNode(
      createTextNode("sinh", "\\sinh "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },    
  { sequence: "\\sup ", 
    createNode: () => createStyledNode(
      createTextNode("sup", "\\sup "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\tan ", 
    createNode: () => createStyledNode(
      createTextNode("tan", "\\tan "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
  { sequence: "\\tanh ", 
    createNode: () => createStyledNode(
      createTextNode("tanh", "\\tanh "), 
      { fontStyling: { fontStyle: "upright", fontStyleAlias: "" } }
    ),
  },
]

const specialSymbols: SpecialSequence[] = [
  ...greekLetters,
  ...hebrewLetters,
  ...binaryOperators,
  ...logicSymbols,
  ...otherSymbols,
  ...standardFunctionNames,
  ...arrowSymbols,
  ...bracketSymbolSequences,
]

export const specialSequences: SpecialSequence[] = [
  ...specialSymbols,
  ...decoratedEntries,
  ...stylingOptions, 
  ...bigOperatorSequences,
  ...nodeTransformationSequences,
];
//TODO merge bigop into nodetransf
export const bigOperatorToLatex: Record<string, string> = Object.fromEntries(
  bigOperatorSequences
    .map(e => {
      const node = e.createNode();
      if (node.type === 'big-operator') {
        return [node.operator, e.sequence];
      }
      return null;
    })
    .filter((entry): entry is [string, string] => entry !== null)
);

export const symbolToLatex: Record<string, string> = Object.fromEntries(
  specialSymbols
    .map(e => {
      const node = e.createNode();
      if (node.type === 'text') {
        return [node.content, e.sequence];
      }
      else if (node.type === 'styled') {
        return [node.child.content, e.sequence];
      }
      return null;
    })
    .filter((entry): entry is [string, string] => entry !== null)
);

const normalizeCommand = (cmd: string) => cmd.trim().replace(/^\\/, "");

// Symbol (no arguments)

export const inputAliasToSymbolNodeFactory: Record<string, () => StructureNode> = Object.fromEntries(
  specialSymbols.map(({ sequence, createNode }) => [normalizeCommand(sequence), createNode])
);

export function getSymbolNodeFromAlias(command: string): StructureNode | undefined {
  return inputAliasToSymbolNodeFactory[command]?.();
};

// Big Operator

export const inputAliasToBigOpNodeFactory: Record<string, (lower?: InlineContainerNode, upper?: InlineContainerNode) => StructureNode> = Object.fromEntries(
  bigOperatorSequences.map(({ sequence, createNode }) => [normalizeCommand(sequence), createNode])
);

export function getBigOpNodeFromAlias(command: string, lower?: InlineContainerNode, upper?: InlineContainerNode): StructureNode | undefined {
  return inputAliasToBigOpNodeFactory[command]?.(lower, upper);
};

// Styled

export const inputAliasToStyledNodeFactory: Record<string, (child?: InlineContainerNode) => StructureNode> = Object.fromEntries(
  stylingOptions.map(({ sequence, createNode }) => [normalizeCommand(sequence), createNode])
);

export function getStyledNodeFromAlias(command: string, child?: InlineContainerNode): StructureNode | undefined {
  return inputAliasToStyledNodeFactory[command]?.(child);
};
