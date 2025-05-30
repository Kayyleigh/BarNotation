import { createAccentedNode, createBigOperator, createInlineContainer, createNthRoot, createStyledNode, createTextNode } from '../models/nodeFactories';
import type { MathNode } from '../models/types';
import { decorationToLatexCommand, type NodeDecoration, type DecorationInfo } from '../utils/accentUtils';

export interface SpecialSequence {
  sequence: string;
  createNode: () => MathNode;
}

export const decoratedEntries: SpecialSequence[] = Object.entries(decorationToLatexCommand).map(
  ([decoration, decorationInfo]) => {
    // Assert or cast decorationInfo if necessary
    const info = decorationInfo as DecorationInfo;
    console.log(`decoration ${decoration}`)
    console.log(`decoration info ${decorationInfo.command}, ${decorationInfo.package}`)
    return {
      sequence: info.command,  // Explicit key-value pair
      createNode: () => createAccentedNode(createInlineContainer(), { type: 'predefined', decoration: decoration as NodeDecoration }),
    };
  }
);


export const stylingOptions: SpecialSequence[] = [
  {
    sequence: "\\text ",
    createNode: () => createStyledNode(
      createInlineContainer(),
      { fontFamily: "upright" }
    ),
  },
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

export const bigOperatorSequences: SpecialSequence[] = [
  {
    sequence: "\\sum ",
    createNode: () => createBigOperator(
      "Σ",
      createInlineContainer(),
      createInlineContainer(),
    ),
  },
  {
    sequence: "\\int ",
    createNode: () => createBigOperator(
      "∫",
      createInlineContainer(),
      createInlineContainer(),
    ),
  },
];

export const greekLetters: SpecialSequence[] = [
  // small
  { sequence: "\\alpha ", createNode: () => createTextNode("α") },
  { sequence: "\\beta ", createNode: () => createTextNode("β") },
  { sequence: "\\chi ", createNode: () => createTextNode("χ") },
  { sequence: "\\delta ", createNode: () => createTextNode("δ") },
  { sequence: "\\digamma ", createNode: () => createTextNode("ͷ") },
  { sequence: "\\epsilon ", createNode: () => createTextNode("ϵ") },
  { sequence: "\\eta ", createNode: () => createTextNode("η") },
  { sequence: "\\gamma ", createNode: () => createTextNode("γ") },
  { sequence: "\\iota ", createNode: () => createTextNode("ι") },
  { sequence: "\\kappa ", createNode: () => createTextNode("κ") },
  { sequence: "\\lambda ", createNode: () => createTextNode("λ") },
  { sequence: "\\mu ", createNode: () => createTextNode("µ") },
  { sequence: "\\nu ", createNode: () => createTextNode("ν") },
  { sequence: "\\omega ", createNode: () => createTextNode("ω") },
  { sequence: "\\phi ", createNode: () => createTextNode("φ") },
  { sequence: "\\pi ", createNode: () => createTextNode("π") },
  { sequence: "\\psi ", createNode: () => createTextNode("ψ") },
  { sequence: "\\rho ", createNode: () => createTextNode("ρ") },
  { sequence: "\\sigma ", createNode: () => createTextNode("σ") },
  { sequence: "\\tau ", createNode: () => createTextNode("τ") },
  { sequence: "\\theta ", createNode: () => createTextNode("θ") },
  { sequence: "\\upsilon ", createNode: () => createTextNode("υ") },
  { sequence: "\\varepsilon ", createNode: () => createTextNode("ε") },
  { sequence: "\\varkappa ", createNode: () => createTextNode("ϰ") },
  { sequence: "\\varphi ", createNode: () => createTextNode("ϕ") },
  { sequence: "\\varpi ", createNode: () => createTextNode("ϖ") },
  { sequence: "\\varrho ", createNode: () => createTextNode("ϱ") },
  { sequence: "\\varsigma ", createNode: () => createTextNode("ς") },
  { sequence: "\\vartheta ", createNode: () => createTextNode("ϑ") },
  { sequence: "\\xi ", createNode: () => createTextNode("ξ") },
  { sequence: "\\zeta ", createNode: () => createTextNode("ζ") },
  // Large
  { sequence: "\\Delta ", createNode: () => createTextNode("∆") },
  { sequence: "\\Gamma ", createNode: () => createTextNode("Γ") },
  { sequence: "\\Lambda ", createNode: () => createTextNode("Λ") },
  { sequence: "\\Omega ", createNode: () => createTextNode("Ω") },
  { sequence: "\\Phi ", createNode: () => createTextNode("Φ") },
  { sequence: "\\Pi ", createNode: () => createTextNode("Π") },
  { sequence: "\\Psi ", createNode: () => createTextNode("Ψ") },
  { sequence: "\\Sigma ", createNode: () => createTextNode("Σ") },
  { sequence: "\\Theta ", createNode: () => createTextNode("Θ") },
  { sequence: "\\Upsilon ", createNode: () => createTextNode("Υ") },
  { sequence: "\\Xi ", createNode: () => createTextNode("Ξ") },
];

export const hebrewLetters: SpecialSequence[] = [
  { sequence: "\\aleph ", createNode: () => createTextNode("ℵ") },
  { sequence: "\\beth ", createNode: () => createTextNode("ℶ") },
  { sequence: "\\daleth ", createNode: () => createTextNode("ℸ") },
  { sequence: "\\gimel ", createNode: () => createTextNode("ℷ") },
];

export const arrowSymbols: SpecialSequence[] = [
  { sequence: "\\uparrow ", createNode: () => createTextNode("↑") },
  { sequence: "\\downarrow ", createNode: () => createTextNode("↓") },
  { sequence: "\\leftarrow ", createNode: () => createTextNode("←") },
  { sequence: "\\rightarrow ", createNode: () => createTextNode("→") },
  { sequence: "\\to ", createNode: () => createTextNode("→") },
  { sequence: "\\Uparrow ", createNode: () => createTextNode("⇑") },
  { sequence: "\\Downarrow ", createNode: () => createTextNode("⇓") },
  { sequence: "\\Leftarrow ", createNode: () => createTextNode("⇐") },
  { sequence: "\\Rightarrow ", createNode: () => createTextNode("⇒") },
  { sequence: "\\leftrightarrow ", createNode: () => createTextNode("↔") },
  { sequence: "\\Leftrightarrow ", createNode: () => createTextNode("⇔") },
];

export const binaryOperators: SpecialSequence[] = [
  { sequence: "\\ast ", createNode: () => createTextNode("∗") },
  { sequence: "\\pm ", createNode: () => createTextNode("±") },
  { sequence: "\\cap ", createNode: () => createTextNode("∩") },
  { sequence: "\\setminus ", createNode: () => createTextNode("\\") },
  { sequence: "\\cup ", createNode: () => createTextNode("∪") },
  { sequence: "\\smallsetminus ", createNode: () => createTextNode("∖") },
  { sequence: "\\emptyset ", createNode: () => createTextNode("∅") },
  { sequence: "\\bigcap ", createNode: () => createTextNode("⋂") },
  { sequence: "\\bigcup ", createNode: () => createTextNode("⋃") },
  { sequence: "\\bigvee ", createNode: () => createTextNode("⋁") },
  { sequence: "\\bigwedge ", createNode: () => createTextNode("⋀") },
  { sequence: "\\bigsqcup ", createNode: () => createTextNode("⋓") },
  { sequence: "\\uplus ", createNode: () => createTextNode("⊎") },
  { sequence: "\\diamond ", createNode: () => createTextNode("⋄") },
  { sequence: "\\otimes ", createNode: () => createTextNode("⊗") },
  { sequence: "\\oplus ", createNode: () => createTextNode("⊕") },
  { sequence: "\\oslash ", createNode: () => createTextNode("⊘") },
  { sequence: "\\odot ", createNode: () => createTextNode("⊙") },
  { sequence: "\\circledcirc ", createNode: () => createTextNode("⊚") },
  { sequence: "\\circledast ", createNode: () => createTextNode("⊛") },
  { sequence: "\\ominus ", createNode: () => createTextNode("⊝") },
  { sequence: "\\boxplus ", createNode: () => createTextNode("⊞") },
  { sequence: "\\boxminus ", createNode: () => createTextNode("⊟") },
  { sequence: "\\boxtimes ", createNode: () => createTextNode("⊠") },
  { sequence: "\\boxdot ", createNode: () => createTextNode("⊡") },
  { sequence: "\\dotplus ", createNode: () => createTextNode("∔") },
  { sequence: "\\wr ", createNode: () => createTextNode("≀") },
  { sequence: "\\bowtie ", createNode: () => createTextNode("⋈") },
  { sequence: "\\models ", createNode: () => createTextNode("⊨") },
  { sequence: "\\vDash ", createNode: () => createTextNode("⊩") },
  { sequence: "\\Vdash ", createNode: () => createTextNode("⊫") },
  { sequence: "\\nvdash ", createNode: () => createTextNode("⊬") },
  { sequence: "\\nvDash ", createNode: () => createTextNode("⊭") },
  { sequence: "\\equiv ", createNode: () => createTextNode("≡") },
  { sequence: "\\cong ", createNode: () => createTextNode("≅") },
  { sequence: "\\approx ", createNode: () => createTextNode("≈") },
  { sequence: "\\sim ", createNode: () => createTextNode("∼") },
  { sequence: "\\simeq ", createNode: () => createTextNode("≃") },
  { sequence: "\\nsim ", createNode: () => createTextNode("≁") },
  { sequence: "\\neq ", createNode: () => createTextNode("≠") },
  { sequence: "\\doteq ", createNode: () => createTextNode("≐") },
  { sequence: "\\fallingdotseq ", createNode: () => createTextNode("≒") },
  { sequence: "\\risingdotseq ", createNode: () => createTextNode("≓") },
  { sequence: "\\propto ", createNode: () => createTextNode("∝") },
  { sequence: "\\lt ", createNode: () => createTextNode("<") },
  { sequence: "\\gt ", createNode: () => createTextNode(">") },
  { sequence: "\\nless ", createNode: () => createTextNode("≮") },
  { sequence: "\\ngtr ", createNode: () => createTextNode("≯") },
  { sequence: "\\ll ", createNode: () => createTextNode("≪") },
  { sequence: "\\gg ", createNode: () => createTextNode("≫") },
  { sequence: "\\lesssim ", createNode: () => createTextNode("≲") },
  { sequence: "\\gtrsim ", createNode: () => createTextNode("≳") },
  { sequence: "\\lessgtr ", createNode: () => createTextNode("≶") },
  { sequence: "\\gtrless ", createNode: () => createTextNode("≷") },
  { sequence: "\\lesseqgtr ", createNode: () => createTextNode("⋚") },
  { sequence: "\\gtreqless ", createNode: () => createTextNode("⋛") },
  { sequence: "\\leq ", createNode: () => createTextNode("≤") },
  { sequence: "\\geq ", createNode: () => createTextNode("≥") },
  { sequence: "\\leqq ", createNode: () => createTextNode("≦") },
  { sequence: "\\geqq ", createNode: () => createTextNode("≧") },
  { sequence: "\\leqslant ", createNode: () => createTextNode("⩽") },
  { sequence: "\\geqslant ", createNode: () => createTextNode("⩾") },
  { sequence: "\\subset ", createNode: () => createTextNode("⊂") },
  { sequence: "\\supset ", createNode: () => createTextNode("⊃") },
  { sequence: "\\subseteq ", createNode: () => createTextNode("⊆") },
  { sequence: "\\supseteq ", createNode: () => createTextNode("⊇") },
  { sequence: "\\nsubseteq ", createNode: () => createTextNode("⊈") },
  { sequence: "\\nsupseteq ", createNode: () => createTextNode("⊉") },
  { sequence: "\\subsetneq ", createNode: () => createTextNode("⊊") },
  { sequence: "\\supsetneq ", createNode: () => createTextNode("⊋") },
  { sequence: "\\sqsubset ", createNode: () => createTextNode("⊏") },
  { sequence: "\\sqsupset ", createNode: () => createTextNode("⊐") },
  { sequence: "\\sqsubseteq ", createNode: () => createTextNode("⊑") },
  { sequence: "\\sqsupseteq ", createNode: () => createTextNode("⊒") },
  { sequence: "\\preceq ", createNode: () => createTextNode("≼") },
  { sequence: "\\succeq ", createNode: () => createTextNode("≽") },
  { sequence: "\\prec ", createNode: () => createTextNode("≺") },
  { sequence: "\\succ ", createNode: () => createTextNode("≻") },
  { sequence: "\\precsim ", createNode: () => createTextNode("⋞") },
  { sequence: "\\succsim ", createNode: () => createTextNode("⋟") },
  { sequence: "\\vdash ", createNode: () => createTextNode("⊢") },
  { sequence: "\\dashv ", createNode: () => createTextNode("⊣") },
  { sequence: "\\lhd ", createNode: () => createTextNode("⋋") },
  { sequence: "\\rhd ", createNode: () => createTextNode("⋌") },
  { sequence: "\\triangleleft ", createNode: () => createTextNode("⊲") },
  { sequence: "\\triangleright ", createNode: () => createTextNode("⊳") },
  { sequence: "\\unlhd ", createNode: () => createTextNode("⊴") },
  { sequence: "\\unrhd ", createNode: () => createTextNode("⊵") },
  { sequence: "\\intercal ", createNode: () => createTextNode("⊺") },
  { sequence: "\\barwedge ", createNode: () => createTextNode("⊼") },
  { sequence: "\\veebar ", createNode: () => createTextNode("⊽") },
  { sequence: "\\curlyvee ", createNode: () => createTextNode("⊻") },
  { sequence: "\\curlywedge ", createNode: () => createTextNode("⊼") },
  { sequence: "\\doublebarwedge ", createNode: () => createTextNode("⧺") },
  { sequence: "\\perp ", createNode: () => createTextNode("⟂") },
  { sequence: "\\parallel ", createNode: () => createTextNode("∥") },
  { sequence: "\\nparallel ", createNode: () => createTextNode("∦") },
  { sequence: "\\mid ", createNode: () => createTextNode("∣") },
  { sequence: "\\nmid ", createNode: () => createTextNode("∤") },
  { sequence: "\\notin ", createNode: () => createTextNode("∉") },
  { sequence: "\\in ", createNode: () => createTextNode("∈") },
  { sequence: "\\ni ", createNode: () => createTextNode("∍") },
  { sequence: "\\therefore ", createNode: () => createTextNode("∴") },
  { sequence: "\\because ", createNode: () => createTextNode("∵") }
];

export const logicSymbols: SpecialSequence[] = [
  { sequence: "\\forall ", createNode: () => createTextNode("∀") },
  { sequence: "\\exists ", createNode: () => createTextNode("∃") },
  { sequence: "\\neg ", createNode: () => createTextNode("¬") },
  { sequence: "\\nexists ", createNode: () => createTextNode("∄") },
  { sequence: "\\varnothing ", createNode: () => createTextNode("∅") },
];

export const otherSymbols: SpecialSequence[] = [
  { sequence: "\\infty ", createNode: () => createTextNode("∞") },
  { sequence: "\\partial ", createNode: () => createTextNode("∂") },
];

export const standardFunctionNames: SpecialSequence[] = [
  { sequence: "\\arccos ", 
    createNode: () => createStyledNode(
      createTextNode("arccos"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\arcsin ", 
    createNode: () => createStyledNode(
      createTextNode("arcsin"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\arctan ", 
    createNode: () => createStyledNode(
      createTextNode("arctan"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\arg ", 
    createNode: () => createStyledNode(
      createTextNode("arg"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\argmax ", 
    createNode: () => createStyledNode(
      createTextNode("arg max"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\argmin ", 
    createNode: () => createStyledNode(
      createTextNode("arg min"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\cos ", 
    createNode: () => createStyledNode(
      createTextNode("cos"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\cosh ", 
    createNode: () => createStyledNode(
      createTextNode("cosh"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\cot ", 
    createNode: () => createStyledNode(
      createTextNode("cot"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\coth ", 
    createNode: () => createStyledNode(
      createTextNode("coth"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\csc ", 
    createNode: () => createStyledNode(
      createTextNode("csc"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\deg ", 
    createNode: () => createStyledNode(
      createTextNode("deg"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\det ", 
    createNode: () => createStyledNode(
      createTextNode("det"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\dim ", 
    createNode: () => createStyledNode(
      createTextNode("dim"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\exp ", 
    createNode: () => createStyledNode(
      createTextNode("exp"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\gcd ", 
    createNode: () => createStyledNode(
      createTextNode("gcd"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\hom ", 
    createNode: () => createStyledNode(
      createTextNode("hom"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\inf ", 
    createNode: () => createStyledNode(
      createTextNode("inf"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\ker ", 
    createNode: () => createStyledNode(
      createTextNode("ker"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\lg ", 
    createNode: () => createStyledNode(
      createTextNode("lg"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\lim ", 
    createNode: () => createStyledNode(
      createTextNode("lim"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\liminf ", 
    createNode: () => createStyledNode(
      createInlineContainer([createTextNode("lim inf")]), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\limsup ", 
    createNode: () => createStyledNode(
      createInlineContainer([createTextNode("lim sup")]), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\ln ", 
    createNode: () => createStyledNode(
      createTextNode("ln"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\log ", 
    createNode: () => createStyledNode(
      createTextNode("log"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\max ", 
    createNode: () => createStyledNode(
      createTextNode("max"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\min ", 
    createNode: () => createStyledNode(
      createTextNode("min"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\Pr ", 
    createNode: () => createStyledNode(
      createTextNode("Pr"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\sec ", 
    createNode: () => createStyledNode(
      createTextNode("sec"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\sin ", 
    createNode: () => createStyledNode(
      createTextNode("sin"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\sinh ", 
    createNode: () => createStyledNode(
      createTextNode("sinh"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\sup ", 
    createNode: () => createStyledNode(
      createTextNode("sup"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\tan ", 
    createNode: () => createStyledNode(
      createTextNode("tan"), 
      { fontFamily: "upright" }
    ),
  },
  { sequence: "\\tanh ", 
    createNode: () => createStyledNode(
      createTextNode("tanh"), 
      { fontFamily: "upright" }
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

export const symbolToLatexInverse = Object.fromEntries(
  Object.entries(symbolToLatex).map(([k, v]) => [v.replace(/^\\/, "").trimEnd(), k])
);
