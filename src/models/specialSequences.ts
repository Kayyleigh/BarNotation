import { createDecorated, createTextNode } from '../models/nodeFactories';
import type { MathNode, TextNode } from '../models/types';
import { decorationToLatexCommand, type NodeDecoration } from '../utils/accentUtils';

export interface SpecialSequence {
  sequence: string;
  mathNode: MathNode;
}

// Build dynamic decorated nodes
export const decoratedEntries: SpecialSequence[] = Object.entries(decorationToLatexCommand).map(
  ([decoration, sequence]) => ({
    sequence,
    mathNode: createDecorated(decoration as NodeDecoration),
  })
);

export const greekLetters: SpecialSequence[] = [
  // small
  { sequence: "\\alpha ", mathNode: createTextNode("α") },
  { sequence: "\\beta ", mathNode: createTextNode("β") },
  { sequence: "\\chi ", mathNode: createTextNode("χ") },
  { sequence: "\\delta ", mathNode: createTextNode("δ") },
  { sequence: "\\digamma ", mathNode: createTextNode("ͷ") },
  { sequence: "\\epsilon ", mathNode: createTextNode("ϵ") },
  { sequence: "\\eta ", mathNode: createTextNode("η") },
  { sequence: "\\gamma ", mathNode: createTextNode("γ") },
  { sequence: "\\iota ", mathNode: createTextNode("ι") },
  { sequence: "\\kappa ", mathNode: createTextNode("κ") },
  { sequence: "\\lambda ", mathNode: createTextNode("λ") },
  { sequence: "\\mu ", mathNode: createTextNode("µ") },
  { sequence: "\\nu ", mathNode: createTextNode("ν") },
  { sequence: "\\omega ", mathNode: createTextNode("ω") },
  { sequence: "\\phi ", mathNode: createTextNode("φ") },
  { sequence: "\\pi ", mathNode: createTextNode("π") },
  { sequence: "\\psi ", mathNode: createTextNode("ψ") },
  { sequence: "\\rho ", mathNode: createTextNode("ρ") },
  { sequence: "\\sigma ", mathNode: createTextNode("σ") },
  { sequence: "\\tau ", mathNode: createTextNode("τ") },
  { sequence: "\\theta ", mathNode: createTextNode("θ") },
  { sequence: "\\upsilon ", mathNode: createTextNode("υ") },
  { sequence: "\\varepsilon ", mathNode: createTextNode("ε") },
  { sequence: "\\varkappa ", mathNode: createTextNode("ϰ") },
  { sequence: "\\varphi ", mathNode: createTextNode("ϕ") },
  { sequence: "\\varpi ", mathNode: createTextNode("ϖ") },
  { sequence: "\\varrho ", mathNode: createTextNode("ϱ") },
  { sequence: "\\varsigma ", mathNode: createTextNode("ς") },
  { sequence: "\\vartheta ", mathNode: createTextNode("ϑ") },
  { sequence: "\\xi ", mathNode: createTextNode("ξ") },
  { sequence: "\\zeta ", mathNode: createTextNode("ζ") },
  // Large
  { sequence: "\\Delta ", mathNode: createTextNode("∆") },
  { sequence: "\\Gamma ", mathNode: createTextNode("Γ") },
  { sequence: "\\Lambda ", mathNode: createTextNode("Λ") },
  { sequence: "\\Omega ", mathNode: createTextNode("Ω") },
  { sequence: "\\Phi ", mathNode: createTextNode("Φ") },
  { sequence: "\\Pi ", mathNode: createTextNode("Π") },
  { sequence: "\\Psi ", mathNode: createTextNode("Ψ") },
  { sequence: "\\Sigma ", mathNode: createTextNode("Σ") },
  { sequence: "\\Theta ", mathNode: createTextNode("Θ") },
  { sequence: "\\Upsilon ", mathNode: createTextNode("Υ") },
  { sequence: "\\Xi ", mathNode: createTextNode("Ξ") },
];

export const hebrewLetters: SpecialSequence[] = [
  { sequence: "\\aleph ", mathNode: createTextNode("ℵ") },
  { sequence: "\\beth ", mathNode: createTextNode("ℶ") },
  { sequence: "\\daleth ", mathNode: createTextNode("ℸ") },
  { sequence: "\\gimel ", mathNode: createTextNode("ℷ") },
];

export const binaryOperators: SpecialSequence[] = [
  { sequence: "\\ast ", mathNode: createTextNode("∗") },
  { sequence: "\\pm ", mathNode: createTextNode("±") },
  { sequence: "\\cap ", mathNode: createTextNode("∩") },
  { sequence: "\\setminus ", mathNode: createTextNode("\\") },
  { sequence: "\\cup ", mathNode: createTextNode("∪") },
  { sequence: "\\smallsetminus ", mathNode: createTextNode("∖") },
  { sequence: "\\emptyset ", mathNode: createTextNode("∅") },
  { sequence: "\\bigcap ", mathNode: createTextNode("⋂") },
  { sequence: "\\bigcup ", mathNode: createTextNode("⋃") },
  { sequence: "\\bigvee ", mathNode: createTextNode("⋁") },
  { sequence: "\\bigwedge ", mathNode: createTextNode("⋀") },
  { sequence: "\\bigsqcup ", mathNode: createTextNode("⋓") },
  { sequence: "\\uplus ", mathNode: createTextNode("⊎") },
  { sequence: "\\diamond ", mathNode: createTextNode("⋄") },
  { sequence: "\\otimes ", mathNode: createTextNode("⊗") },
  { sequence: "\\oplus ", mathNode: createTextNode("⊕") },
  { sequence: "\\oslash ", mathNode: createTextNode("⊘") },
  { sequence: "\\odot ", mathNode: createTextNode("⊙") },
  { sequence: "\\circledcirc ", mathNode: createTextNode("⊚") },
  { sequence: "\\circledast ", mathNode: createTextNode("⊛") },
  { sequence: "\\ominus ", mathNode: createTextNode("⊝") },
  { sequence: "\\boxplus ", mathNode: createTextNode("⊞") },
  { sequence: "\\boxminus ", mathNode: createTextNode("⊟") },
  { sequence: "\\boxtimes ", mathNode: createTextNode("⊠") },
  { sequence: "\\boxdot ", mathNode: createTextNode("⊡") },
  { sequence: "\\dotplus ", mathNode: createTextNode("∔") },
  { sequence: "\\wr ", mathNode: createTextNode("≀") },
  { sequence: "\\bowtie ", mathNode: createTextNode("⋈") },
  { sequence: "\\models ", mathNode: createTextNode("⊨") },
  { sequence: "\\vDash ", mathNode: createTextNode("⊩") },
  { sequence: "\\Vdash ", mathNode: createTextNode("⊫") },
  { sequence: "\\nvdash ", mathNode: createTextNode("⊬") },
  { sequence: "\\nvDash ", mathNode: createTextNode("⊭") },
  { sequence: "\\equiv ", mathNode: createTextNode("≡") },
  { sequence: "\\cong ", mathNode: createTextNode("≅") },
  { sequence: "\\approx ", mathNode: createTextNode("≈") },
  { sequence: "\\sim ", mathNode: createTextNode("∼") },
  { sequence: "\\simeq ", mathNode: createTextNode("≃") },
  { sequence: "\\nsim ", mathNode: createTextNode("≁") },
  { sequence: "\\neq ", mathNode: createTextNode("≠") },
  { sequence: "\\doteq ", mathNode: createTextNode("=") },
  { sequence: "\\fallingdotseq ", mathNode: createTextNode("≒") },
  { sequence: "\\risingdotseq ", mathNode: createTextNode("≓") },
  { sequence: "\\propto ", mathNode: createTextNode("∝") },
  { sequence: "\\lt ", mathNode: createTextNode("<") },
  { sequence: "\\gt ", mathNode: createTextNode(">") },
  { sequence: "\\nless ", mathNode: createTextNode("≮") },
  { sequence: "\\ngtr ", mathNode: createTextNode("≯") },
  { sequence: "\\ll ", mathNode: createTextNode("≪") },
  { sequence: "\\gg ", mathNode: createTextNode("≫") },
  { sequence: "\\lesssim ", mathNode: createTextNode("≲") },
  { sequence: "\\gtrsim ", mathNode: createTextNode("≳") },
  { sequence: "\\lessgtr ", mathNode: createTextNode("≶") },
  { sequence: "\\gtrless ", mathNode: createTextNode("≷") },
  { sequence: "\\lesseqgtr ", mathNode: createTextNode("⋚") },
  { sequence: "\\gtreqless ", mathNode: createTextNode("⋛") },
  { sequence: "\\leq ", mathNode: createTextNode("≤") },
  { sequence: "\\geq ", mathNode: createTextNode("≥") },
  { sequence: "\\leqq ", mathNode: createTextNode("≦") },
  { sequence: "\\geqq ", mathNode: createTextNode("≧") },
  { sequence: "\\leqslant ", mathNode: createTextNode("⩽") },
  { sequence: "\\geqslant ", mathNode: createTextNode("⩾") },
  { sequence: "\\subset ", mathNode: createTextNode("⊂") },
  { sequence: "\\supset ", mathNode: createTextNode("⊃") },
  { sequence: "\\subseteq ", mathNode: createTextNode("⊆") },
  { sequence: "\\supseteq ", mathNode: createTextNode("⊇") },
  { sequence: "\\nsubseteq ", mathNode: createTextNode("⊈") },
  { sequence: "\\nsupseteq ", mathNode: createTextNode("⊉") },
  { sequence: "\\subsetneq ", mathNode: createTextNode("⊊") },
  { sequence: "\\supsetneq ", mathNode: createTextNode("⊋") },
  { sequence: "\\sqsubset ", mathNode: createTextNode("⊏") },
  { sequence: "\\sqsupset ", mathNode: createTextNode("⊐") },
  { sequence: "\\sqsubseteq ", mathNode: createTextNode("⊑") },
  { sequence: "\\sqsupseteq ", mathNode: createTextNode("⊒") },
  { sequence: "\\preceq ", mathNode: createTextNode("≼") },
  { sequence: "\\succeq ", mathNode: createTextNode("≽") },
  { sequence: "\\prec ", mathNode: createTextNode("≺") },
  { sequence: "\\succ ", mathNode: createTextNode("≻") },
  { sequence: "\\precsim ", mathNode: createTextNode("⋞") },
  { sequence: "\\succsim ", mathNode: createTextNode("⋟") },
  { sequence: "\\vdash ", mathNode: createTextNode("⊢") },
  { sequence: "\\dashv ", mathNode: createTextNode("⊣") },
  { sequence: "\\lhd ", mathNode: createTextNode("⋋") },
  { sequence: "\\rhd ", mathNode: createTextNode("⋌") },
  { sequence: "\\triangleleft ", mathNode: createTextNode("⊲") },
  { sequence: "\\triangleright ", mathNode: createTextNode("⊳") },
  { sequence: "\\unlhd ", mathNode: createTextNode("⊴") },
  { sequence: "\\unrhd ", mathNode: createTextNode("⊵") },
  { sequence: "\\intercal ", mathNode: createTextNode("⊺") },
  { sequence: "\\barwedge ", mathNode: createTextNode("⊼") },
  { sequence: "\\veebar ", mathNode: createTextNode("⊽") },
  { sequence: "\\curlyvee ", mathNode: createTextNode("⊻") },
  { sequence: "\\curlywedge ", mathNode: createTextNode("⊼") },
  { sequence: "\\doublebarwedge ", mathNode: createTextNode("⧺") },
  { sequence: "\\perp ", mathNode: createTextNode("⟂") },
  { sequence: "\\parallel ", mathNode: createTextNode("∥") },
  { sequence: "\\nparallel ", mathNode: createTextNode("∦") },
  { sequence: "\\mid ", mathNode: createTextNode("∣") },
  { sequence: "\\nmid ", mathNode: createTextNode("∤") },
  { sequence: "\\notin ", mathNode: createTextNode("∉") },
  { sequence: "\\in ", mathNode: createTextNode("∈") },
  { sequence: "\\ni ", mathNode: createTextNode("∍") },
  { sequence: "\\therefore ", mathNode: createTextNode("∴") },
  { sequence: "\\because ", mathNode: createTextNode("∵") }
];

export const logicSymbols: SpecialSequence[] = [
  { sequence: "\\forall ", mathNode: createTextNode("∀") },
  { sequence: "\\exists ", mathNode: createTextNode("∃") },
  { sequence: "\\neg ", mathNode: createTextNode("¬") },
  { sequence: "\\nexists ", mathNode: createTextNode("∄") },
  { sequence: "\\varnothing ", mathNode: createTextNode("∅") },
];

export const specialSequences: SpecialSequence[] = [
  ...greekLetters,
  ...hebrewLetters,
  ...binaryOperators,
  ...logicSymbols,
  ...decoratedEntries
];

export const symbolToLatex: Record<string, string> = Object.fromEntries(
  specialSequences
    .filter(e => e.mathNode.type === 'text')
    .map(e => [(e.mathNode as TextNode).content, e.sequence])
);

export const symbolToLatexInverse = Object.fromEntries(
  Object.entries(symbolToLatex).map(([k, v]) => [v.replace(/^\\/, ""), k])
);