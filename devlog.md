# Actuarial Math Notation Tool
## Introduction
When not given access to lecture slides, students have to take notes in class. Doing so on paper is painful for students with chronic pain. Digital note-taking may help, but this is difficult when mathematical notation is involved. In particular, actuarial notation requires accents and sub-/superscripts that are often not available in tools such as {TODO}, or take long to find in menus (in e.g. Word) or type out (in e.g. Latex packages that enable actuarial notation).

This document describes and designs an application that enables the creation of mathematical notation, with a heavy focus on user freedom and ease-of-use. The goal is to enable math students with chronic pain to take lecture notes of math notation digitally, quick enough to not be restricted to physical writing when trying to keep up with the lecturers during class. The application focuses heavily on user freedom and minimal pain, always keeping in mind this use case. To avoid overcomplicating the app, it is meant to be used exclusively for math notation, meaning the user should still type surrounding textual lecture notes elsewhere.

The remainder of this document is structured as follows. First, background information is needed on chronic pain to find out what types of movements (i.e., drag/type/click) are beneficial or should be prioritized/avoided. Next, the building blocks of actuarial notation are examined, as this is necessary before deciding on the underlying data model(s) of the system. Afterwards, I look into existing tools for digital math notations to find out what conventions this application should follow as well as what features are missing in existing tools and should thus be included here. Next, I outline the requirements of the application.

## Background

### Chronic Pain
https://pubmed.ncbi.nlm.nih.gov/22270231/

### Actuarial Notation
sources:
- https://www.casact.org/sites/default/files/database/proceed_proceed49_49123.pdf (fancy, old, original)
- https://ctan.math.illinois.edu/macros/latex/contrib/actuarialsymbol/actuarialsymbol.pdf (best)
- https://ctan.math.illinois.edu/macros/latex/contrib/actuarialangle/actuarialangle.pdf (just the angle?)
- https://en.wikipedia.org/wiki/Actuarial_notation (probably where client got the image they sent in dc)

elements to add still:
- underline (accent?)

elements that are missing in 


### Existing Tools
Sources:
- Overleaf (or other latex editor but idk any). This is where the libraries from the actuarial notation subsection can be used. That takes a lot of writing (cuz you need to know the commands for these symbols, and esp. if you are in a new lecture you can get sth you never saw b4 and thus dunno the command)
- https://editor.codecogs.com/ (single-line text editor with buttons for sub-menus of clickable units that can be inserted. has to-latex parsing. And dragging! I think)
- https://www.mathkeyboards.com/custom-buttons (TODO if this is free then def check it out and see if custom can be made for actuarial. However, still has limitation of: if new symbol encountered in class, u ar fukt)
- https://math.typeit.org/ not good enough for actuarial
- https://www.imatheq.com/imatheq/com/imatheq/math-equation-editor-latex-mathml.html I think does not allow sub-/superscripts on the left side of symbols, but is a good source for types of units that should exist (e.g. matrices etc I have no thought abt much)
- https://www.geogebra.org/graphing?lang=en Geogebra my beloved, but sucks hard for this use case
- Word's built-in equation editor. Goated but takes a while to make the actuarial stuff, and esp. some of the symbols in the fav latex package may be impossible (the crosswordy ones)

https://www.reddit.com/r/OneNote/comments/12ejg2b/how_to_write_math_equations_in_onenote_answer/
https://www.reddit.com/r/OneNote/comments/qjx629/how_do_i_type_math_expressions_faster_in_onenote/

https://www.youtube.com/watch?v=FZT7V97nrQY LyX looks really cool

MathType is best (?) but not free

Best 2 solutions:
- continue with init plan; make super free canvas of broadening & deepening expression tree with no semantics. Good for complete freedom but to allow those diabolical ones, since it does not know semantics, I need to allow diabolical on all symbols. This will clutter the expansion options. (plus idk yet how to make that dispaly with proper spacing, and how to deal w e.g. matrices or multi-line stuff)
- make actual meaning, i.e. diff structures get diff underlying data model. So basically, like already existing stuff but WITH actuarial things, and enable dragging of predefined symbols/structures OR saved expressions OR sub-parts of the same expression (but not direct ancestor), into places. I am starting to prefer this option A LOT

## Planned Solution and Alternative Options
TODO rewrite: this section normally doesnt exist in tech writing but I include it cuz there are some design choices to be made, and if client hates current plan then its good they know there are other options and what tradeoffs they each have.

Basically: valid syntax w set structures, or complete WYSIWYG blank canvas that allows for structures that don't make sense at all in math. Former means I have to know all the stuff the client uses in their life; latter is way freer but harder to parse & display nicely

![alt text](image-8.png)

**Current plan**: focus on user freedom; workspace starts with a single place to type, and as soon as you type a character, you get access to a bunch of other locations in the canvas where you can add new characters. These are not restricted to valid mathematical semantics, but the possible locations are inspired by the locations that mathematical notation normally makes use of. Thus, a sweet spot between user freedom and parseability
**Alternative Solution #1**: TODO find out if possible: just have buttons for actuarial units and a parser to valid latex and/or word equations. Pros: very quick implementation; no need for storage; simple usage. Cons: no ability to add new structures when lectures introduce something unexpected; during note-taking need to switch betw the app and another (e.g. word, overleaf); if client likes a notation tool that does not support the ones I build parser for, the desired notation cannot be obtained.
**Alternative Solution #2**: alt solution #1 but add functionality to create and save own structures? TODO think about how that would be implemented (if possible). Kinda similar idea to current plan, but with latex writing instead of expanding UI? Con: still cannot take quick notes if encountering something completely new in class. 

TODO rewrite: these solutions lead to wildly different applications. I will be assuming the current plan for the remainder of this doc. Maybe add images of how the remaining options could look, to give the client a choice to abort everything and go for an alternative if that is what they prefer.

## Requirements of the Application
TODO rough req elicitation process:
- (that one discord msg 
- conclusions from background section) 

TODO mention that these reqs are flexible cuz custom app so client can request changes to this section

Requirements are often formatted as user stories (TODO cite). For example, a user story could state: "as a student with chronic pain, I want to use tabbing to navigate the UI to minimize pain due to mouse movements". I believe that my knowledge of chronic pain as well as actuarial math are insufficient to make any assumptions about the user's needs. Therefore, I format the requirements from my own perspective, explicitly stating the assumptions I make as well as the rationale behind them. 

### Functional Requirements
Functional requirements describe the behavior or functions of the system. They essentially represent the features that are present in the application. I prioritize the functional requirements according to the MoSCoW method (TODO cite?). This method splits the requirements into four levels: (1) Must-haves, which make up the Minimum Usable Subset; (2) Should-haves, which are important but not critical; (3) Could-haves, which would improve, e.g., user experience; and (4) Won't-haves, which are left out of the current development despite being desirable. While the MoSCoW method is primarily useful when budgets and time constaints are present, I follow it for this project to define clear intervention points (i.e., after each category) where the system can be reflected upon. Moreover, due to the lack of a deadline, the _Won't-have_ category contains desirable features that I do not yet know how to implement, but may be explored after "deployment". The following functional requirements are identified:

**MUST HAVE**:
- todo: any expression that is in that fav source (the latex package)
- any expression that is in my own prob & stats notes
- any expression that is in my own calculus notes (may be limited cuz idk wtf is calc II and III, I had 1 course)
- any expression in my own lin alg notes
- any expression in my own Game Theory notes (only 1 lecture but it was huge)
- simple textual notes field for each expression? Seems useful, after checking my own notes

**SHOULD HAVE**:
- todo

**COULD HAVE**:
- todo

**WANT TO HAVE BUT WON'T HAVE (YET)**:
- todo

### Non-Functional Requirements 
Non-functional requirements specify criteria that the application should meet regarding e.g. usability, scalability, and performance. The application can still function without these, but for the purpose of this specific application, it is crucial to keep in mind usability in each step of the development process. The following non-functional requirements are relevant:
- todo
-
-



## Description of the Application 
TODO keep moving this stuff to reqs

The following UI/UX functionality is needed:
-
-
-



Later, the following functionality will be added to the app to allow proper integration into the life of a student who uses it repeatedly when taking lecture notes:

1. **Saving notations**: notations should be saved with some metadata, including a title and the time that the notation was saved. These will enable the user to look back at their lecture notes later. Saved notations will be visible in a menu on the right side of the page at all times (perhaps collapsible). Selecting a saved notation should load it into the current canvas, enabling editing and deletion. 
1. **Unsaved notations**: If the user opens a saved notation while the canvas in not empty, the user should be prompted whether they want to throw away their current canvas or save it as a new notation first.
1. **Drag saved into canvas**: Dragging a saved notation into the current canvas will deep-copy the notation as a new math unit and place it at the node where it is dropped into the current canvas. 
 
2. **Parsing**: Parser to Latex (or other). This function is separate from the UI as it only depends on the data model. However, this will require extra consideration into the precedence rules of my loosely defined "math", and how to deal with ambiguity. Freedom should always be prioritized over semantic validity, because the main goal of the app is to allow speedy note-taking comparable to writing on paper, where anything is possible.
2. **Parser output**: The UI should contain a (collapsible?) box at the bottom, where Latex (or other; if more formats are implemented, these will be mutually-exclusively selectible using e.g. tabs inside this specific UI box) is parsed. While parsing would ideally be done in real-time, the way that I define math most likely means that the majority of notations are invalid or ambiguous mid-editing. To avoid unnecessary pressure on the user to fix the validity of their notations, a having to press a button to parse it may be preferred. This way, the application may also feel less like a latex-parser and more like the free canvas it was designed to be.

1. **Save to image**: TODO

The following functionality would be really cool, but is not my priority (yet) due to implementation complexity or uncertainty of whether added functionality may slow down usage too much (which would go against the purpose of the app):
1. **Tags on saved notations**: the user may want to add tags to their notations, e.g. to indicate that the notation is part of a certain course. These tags should then be possible to filter on, in the UI element that holds saved notations.
2. **Parser feedback**: On parse failures, the parser could tell the user why the failure happens and what they could change to make their notation valid for parsing.


Design choices that the client may want to have the final decision on:
- 

Notes on parsing to what? 
- latex
- word? Uses MathML (https://www.w3.org/Math/whatIsMathML.html)
- obsidian? Uses latex
- other?

## Requirements
Things to mention:
- this is an offline tool. No auth, no conn protocols, etc. All notation is locally stored. This is because there is no reason to make it fancy when all you need is a notation tool. 


## Design of the Math Notation Tool

### Definition of "Mathematical Notation"
TODO insert stuff abt this from other place I typed it. Also add a flowchart(?) of this design, showing an example notation vs its representation in my system, where all types of MathUnits are utilized

This mathematical notation tool is meant for actuarial math students with chronic pain. The application must enable complex math notation, including actuarial symbols. Since the application is not meant as a parser of valid math, but rather a tool to restrict the user as little as possible while promoting speed (following reasonable restrictions within mathematical notation), I define "math" more loosely: 
TODO maybe put picture instead of the data model; put data model in Design? or picture too
- A mathematical unit can be a **group** of mathematical units, or a **single unit** (i.e. a leaf). 
- A mathematical unit can have up to 4 children, which are also math units. These children are called `ul`, `ur`, `ll` and `lr`, representing **super- and subscripts** on the left and right side of the main symbol. 
- Math units can be **decorated**: a group can have: a "joint" decoration XOR a "angl" decoration (but more options may be added later); and a leaf can have an accent ("tilde", "bar", etc.; there will be a list of possible options here).


### Software Architecture Design Choices
- React?
- database stuff =? 
- here put data model?

### User Interface Design Choices

- pictures of the current version
- UI design of the final version (make it clear that it is not exisitng yet)

## Testing the Math Notation Tool
### Testing the Code Quality
I'll think about it :)
### User Testing
Only client can do that


Notes:
- Github is used by myself, itll be on private for now
- Maybe no unit testing because I do not enjoy it AT ALL, so yeah the application may fail
- If this all ends up existing, I recommend user testing w client at least once before actually using it irl. It'll be iterative-ish procedure where every time something breaks, I'll fix it? 

## Ethics, Safety, Privacy, Blabla
- Privacy concerns when making the github public cuz this doc is talking about "actuarial math students with chronic pain who do not get access to lecture slides" - getting kinda specific?
- No issues except make sure the user does not think I am giving them virus or sth 
- Be clear abt offline tool = no issues; no auth etc so no passwords, yadayada
- Misuse of the application only disadvantages yourself

## Conclusion and Final Notes
- short summary of all this
- notes on that I am just human and this will all change and maybe be in the bin and maybe when user will try it out, the UI will be super duper fucked and weird, etc.
- Basically end with the question of whether the client is even interested in this

---
# Dev-log

## First version (5/8/25-8/8/25)

### 05/05/2025 
Made initial version. It cannot do operators yet, but the boxes are working (using buttons on hover)

Current biggest issues:
- Enable tree broadening by typing >1 char in node. Current plan would expect operators, but perhaps there is no harm in accepting any? I am not building a language, and want to avoid restricting the user by adding unnecessary complex procedures for continuing expansion of the tree.
- Enable tree broadening to the left as well, e.g. when you have "A" and you try to make it "+A" because you are aiming for "1+A"

Next steps:
- Fix spacing of initial node's children (should always be right next to the symbol - in the places where sub- and superscripts normally go)
- Fix positioning of children
- Make children ~half the size of the parent (in case of sub/supscripts; NOT in expressions)
- Boxes should show on hover of the place where you expect the child, rather than clicking a button
- Only allow child creation when parent is not empty

Next stage:
- Ctr+z should undo box creation 
- Add options for \joint xor \angl (non-single math units)
- Add options for accents (single math units)
- Summations, "{", etc. 

Later Stages:
- Latex parsing
- Save images
- Drag & drop saved 
- Shortcuts for characters that are not on keyboard (as alternative to selecting or dragging from a menu)
- dark mode

### 06/05/2025
- Now allowig children only on hover by adding `{unit.value !== '' && hovered && (`
- Decent boxes now; still with buttons but the boxes shrink with tree lvl and only start overlapping after triple nested in certain places

![alt text](image.png)

- made child boxes creation in loop for minimal hardcoding

Current problems (/solutions):
- If child box selected, should not disappear on stop hover
- If 1 char typed, do not de-select (should allow typing "x+1" without clicks) --> by default, the "add new" box should be selected
- should not delete children of singles when turned into group
- length of child box should anchor to corresponding corner (i.e., LR and UL should expand to the right)
- background color not working
- when splitting into group, afterwards you cannot split further into sub-groups. fix it

Changed translations of percentages to .5rem to make sure length of child does not influence distance from parent

![alt text](image-1.png)

Next steps:
- enable adding on-level anywhere (not just at very right)
- make split-into-group auto select the adder
- make init box a group box to ensure children are not shared when adding a sibling
- accents and decorations

Current progress (23:54):
![alt text](image-2.png)

Next steps:
- do the thing with the group feeling like text input (insert anywhere, etc)
- ability to drag units? I would like to enable at least dragging a leaf from a size-2 group to a different leaf (e.g. in its parent), such that the other leaf and the dragged item become a group, and the size-2 group is reverted back to a leaf
- multi-selection of nodes should enable wrapping into a group

### 07/05/2025

Current implementation also allows e.g.:
![alt text](image-3.png)

Brackets are not dealt with in any sophisticated way:
![alt text](image-4.png)
This is the freedom/parsability trade-off. The current implementation allows stuff like this: 
![alt text](image-5.png) 
... which you probably don't need, but for a math notation tool the goal is to enable the user to type out notation as freely as possible, just as they are allowed on paper. There is no benefit here in restricting the user to type in valid math, except in parsing, which is not the main functionality this application aims for because restrictions likely increase difficulty of usage

Found out that tailwind wasnt working at all, fixed it by doing @import "tailwindcss";. Now it looks more usable but the child boxes are fucked

Little less fucked but must ensure either child position depends on its size, or siblings are shifted to avoid extreme overlap

Fixed sizing of children

![alt text](image-6.png)

When allowing accents and decorations, also allow adding a decoration on a leaf (and turning it into a group in the process!)

next steps:
(DONE) switch all l&r, u&l because atm the corners are exactly wrong 
- The thing where it takes sibling length is fucked. Change it. It's exactly working on the type of situations where I do not need it. I should have the width be done automatically somehow if possible; really not good to be passing these recursive shits all over.
- enable grouping neighbors in flex on some multi-selection 
- drag, & allow in any idx
- make length depend on children
Only after that:
- accents and decorations
- parse normal nodes to `_{LL}^{UL}{Symbol}_{LR}^{UR}`
- parse group nodes to just the symbols next to each other, or in brackets?
- math canvas should not overflow
- Should have option to decrease size of math text (keep in mind e.g. partial-screen use)

Perhaps after that start making the functionality for saving (and loading prev) notations
After that: summations and special cases
Then go for amazing kerboard controlling & shortcuts

---
Switched order or children on tabbing: now UL -> LL -> UR -> LR. But think again about how it usually would work, I think I based it on chemistry now

![alt text](image-7.png)

Switched order again cuz felt better

Would like to make the bg color of children of hovered green, but probably complicated

keyboard stuff:
- if at end or start of box and right or left arrow (resp.), leave box, go to the next insertion position (unless sth changes when implementing that).
- if drag item, allow drop in any position except any of its own descendants. 
- if backspace on empty box with no children, destroy. EXCEPT in last box; then backspace should send you to prev box  

tradeoffs to consider:
- make `^` and `_` send you to child boxes? (Good for speed?) Leads to inability to type these characters normally in the notation
- should `/` make it a fraction? (would require extra stuff w. brackets for proper rendering) 

### 08/05/2025
Gotta refactor everything maybe because this is going in the bin.

## Proper Design (08/08-??)

### 08/05/2025
Added a section to the start of this document, outlining the application design properly (similar to how it is taught in my uni).

Thought on matrices: I currently define groups as left-to-right stuffs. Is it not just best to define grid instead? That fixes the issue with that one actuarial symbol that looks like a crossword or sth, and simultaneously enables matrices (and actual crosswords LOL)

Current plan:
1. 
2. Make an Overleaf for the actual "report" (potentially to show client)
3. 

MathML (does not work for Word... but works in md lol):
<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mrow><msup> <mi>x</mi> <mn>2</mn> </msup> <mo>+</mo><mrow><mn>4</mn><mo>&InvisibleTimes;</mo><mi>x</mi></mrow><mo>+</mo><mn>4</mn></mrow><mo>=</mo><mn>0</mn></mrow></math>

Going to re-define math. So far I have been caring abt only 2 types of structures. MathML docs explain nicely how they do it, so I can easily see what important structures I am missing. Let's design the whole thing before re-implementing it. By first going over the MathML docs and then over the docs of the Actuarial notation Latex to see what is missing 

angln in mathml: (not working)
<math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>a</mi><mrow><menclose notation='actuarial'><mi>n</mi></menclose><mo>&#x2063;<!--INVISIBLE SEPARATOR--></mo><mi>i</mi></mrow></msub></math>

note:
any left bracket should create a right bracket to the right side of the last selected character (if none selected then that means cursor) (and left bracket to the left ofc). Except if there is an un-opened closing bracket?

structure types:
- central + max 4 children
- horizontal rows
- vertical stacks
is it possible to have everything always be a grid, where you can expand up/down/left/right, as well as deeper/shallower (resp. for sub-grouping, and jumping to sibling), and 4 optional children? Sounds like too many directions for proper usability, esp. w also accents and deco. Also how to ever parse to latex

Tomorrow: start over with the alternative solution (i.e. math with semantics). Start by taking some diabolical examples from the actuarial package and other math notation expected in actuarial science. Draw out the tree for each example. see what data models I'll need. Then ask chatGPT if it is physically possible to implement it in such a way that structures are draggable and the spacing is clean. If so, implement an initial version. After that, the 2 solutions can be compared and it's possible to ask the client if they are interested in either. And esp ask if they tried existing solutions; and if the proposed solution(s) solve the problems encountered w existing ones. And at some point ask about struggles related to the pain cuz hard to find info when googling. Googling about mouse usage with FM leads to animal experiments; everyone else only cares about brain fog or Speech-to-Text; all actual stuff I found on FM + HCI issues is for old people (and often only women) with only percentages, not actual differences betw options such as keyboard shortcuts and dragging blabla which seems very important to the client so is good to know more abt their personal experience cuz this is an opportunity to make a completely custom tool that is exactly designed to be as painless as possible for the client

### 09/05/2025
Started Overleaf 
Made first version of extremely incomplete semantic-aware version
Is very bad, cannot handle nested?!
Can handle nested now
Also may have some starting point for dragging

Next steps:
- bring back the input fields in render blocks by putting stuff from MathNodeView.tsx to render.tsx.
- Add bracket node
- add operator (/expression) node
- find out if Integral and Summation are best in same node, with some enum? or separate?
- make "insert" (i.e. click menu) not replace all

### 10/05/2025

Need the sweet spot in generalization of underlying data types
Things to consider:

e.g. when typing an integral: 
1. the system could be aware that it is an integral and already place "d⬚" -> notations are made with minimal typing
2. Alternatively it could just be a symbol that you insert, and the d⬚ is your own responsibility -> notations are made with minimal moving around (or in other words, you don't get thrown into restrictions due to the semantic validity)

For this app:
- all notation should exist; i.e., the graphical layout of math should be represented rather than its semantics (user is taking lecture notes; semantics are their responsibility similarly to how handwritten is)
- underlying data model should be designed in such a way that it can also be disambiguated into Latex, preferably 

The integral is especially a good example here cuz ideally, latex would take "\," before dx for a tiny space.

some random source I found on latex math: https://www.cmor-faculty.rice.edu/~heinken/latex/symbols.pdf
I will now categorize it all into how many children:

0 children (= Leaf):
- any mathematical character, operator, etc
- any common function name (e.g. sin, cos, deg)

1 child:
- overline
- underline
- widehat
- widetilde
- ...
- underbrace
- ANY accent

2 children:
- frac
- sqrt\[n\]

many chidlren:
- \begin{array}{cols} row1 \\ row2 \\ . . . rowm \end{array}

From this, it seems that all I need is: 
- normal typing of leaves (+ menu containing characters that don't exist on keyboard)
- single-child nodes for accents and decorations
- double-child nodes for fractions and roots
- 



1. BaseNode
Purpose: Base class for all nodes.
Children: None

2. MultiCharacterNode
Purpose: Represents multi-character terms like variables, numbers, and operators.
Children: List of CharacterNode.
UI Behavior: Handles typing expressions like x+5, allows easy manipulation and transformation into other node types.
3. CharacterNode
Purpose: Represents a single character.
Children: None.
UI Behavior: Displays a single character, allows accents or transformations.
4. DecoratedNode
Purpose: Applies an accent or decoration to a single child node.
Children: 1 child (CharacterNode or MultiCharacterNode).
UI Behavior: Allows user to apply decorations like \hat{}, \bar{}, etc.
5. GroupNode
Purpose: Groups sub-expressions, enabling transformations or operations on them.
Children: 1 or more nodes (could be MultiCharacterNode, OperatorNode, etc.).
UI Behavior: Makes sub-expressions into a group (e.g., x + 5 could turn into (x + 5)).
6. BigOperatorNode (Previously SummationIntegralNode)
Purpose: Represents any large operator (like summation, integration, or others).
Children: 1 child for the expression (e.g., summand, integrand), Optional LimitNode for the lower and upper bounds.
UI Behavior: Handles both summation (∑) and integral (∫) notation, but can be extended to other big operators.
7. SubSupScriptedNode
Purpose: Represents a node that can have subscript, superscript, or actuarial notation.
Children: 4 optional children:
Base Node (the core element, like x in x^2 or x_1).
Subscript (optional, for subscript notation).
Superscript (optional, for exponent notation).
Actuarial/Other Accents (optional, for notation like hats or bars on characters).
UI Behavior: Flexible UI that lets users apply subscripts, superscripts, and accents on a single node.
8. LimitNode
Purpose: Represents limits, used with BigOperatorNode (or other large operators).
Children: CharacterNode (the limit value).
UI Behavior: Represents the limit in an expression.
9. MatrixNode
Purpose: Represents a matrix.
Children: List of MatrixRowNode (each row contains multiple elements).
UI Behavior: Lets users add rows/columns to a matrix.
10. VectorNode
Purpose: Represents a vector.
Children: List of VectorElementNode.
UI Behavior: Allows vector expansion or modification.
11. FractionNode
Purpose: Represents a fraction.
Children: 2 children (NumeratorNode, DenominatorNode).
UI Behavior: Allows creating fractions by dragging and dropping.
12. AccentNode
Purpose: Represents an accent on a character.
Children: 1 child (CharacterNode or MultiCharacterNode).
UI Behavior: Applies accents like \hat{}, \bar{} on individual nodes.

![alt text](image-9.png)
Have something that "works" but it's super unusable

### 11/05/2025 
Found out that Actuarial needs to change; there is no UR child. All characters and groups should be allowed to have a number (at least 1, 2, 3) as decoration

Also I should really fix the way that typing works. Like omg at least allow the user to type more than 1 char without being de-selected

Did some stuff related to decorations. There are now decorations for i,ii,iiitop- and bottom, and some others but have not tested all. They also light up on hover for testing purposes.

![alt text](image-10.png)
So now Actuarial does not have UR child :)

### 12/05/2025
I have a working editor that is not even that fucked, like omg it actually enables typing with some perceived affordance and feeling like a text editor even though I do not use input fields. 

![alt text](image-11.png)

Next steps:
- fix that problem w right arrow on non-text
- do not wait for Dead+^, but rather shift plus 6?
- enable deletion of subsup "wrap" on backspace when all are empty (but maybe only on the "first" child and have the others be like leftarrow cuz all 4 children always exist if 1 exists, but it shouold not feel that way for the user)
- make text size fit the node type
- put line betw fraction
- fix positioning, esp of 4 children
- re-implement drag functionality 
- allow grouping and un-grouping/spplitting of nodes
- enable decorations
- enable bigoperator 
- ...
- nice UI esp for toolbar plz

### 13/05/2025
CSS is now pretty for fractions and subsup

![alt text](image-13.png)

fixed some navigational issues
![alt text](image-14.png)

Must fix the nesting of IC. Like, gotta really think of when to use IC and when to use textNode. 

Must add spatial intuition to fractions and subsup

dirty-fixed shift+6 by doing Shift + e.code=Digit6, so now it does not make sense for people with keyboards that are different than mine in the way that "^" is reached. But it was a good way imo to match how underscore reacts. These are used for subsup, left and right dep on if control or shift

I think I fixed the deletion of subsup by not checking if we are currently in a child

If ever need to change arrownav order of 4 children. need to change in more than 1 place. omg idk even where. keeping it for now cuz too much drama

First version of parser to/from Latex !!!
Maybe good way to identify flaws in my data model is by perfecting the from-latex parser and keep trying examples from my playground overleaf doc until I have successfully parsed them all into my app
But that way my app assumes latex === math 
What I want is not only latex, also some of the stuff in actuarialsymbol 
Either way I have to rigorously define the scope of (visual) math in terms of latex-completeness I guess?
Makes sense cuz the examples I have in playground are based on the branches of math that I mention in the requirements of the application (calc, linalg, etc). So the examples are some test cases for the requirements. Passing all test cases does not guarantee that I can indeed represent all math!!

### 14/05/2025

It still breaks when I try to type sth after deleting everything
At least after deleting fraction
latex to mathnode is scuffed cuz of things like ordering and I fogot how to deal with brackets maybe?

It should be keeping track of open bracket pairs 
like `\frac{{4}+3}...` should have {4}+3 rather than  everything until the final bracket of the expression

SOme important next steps for usability:
- hover should change bg of nodes that can be edited
- delete numerator should just be empty numerator (until 2nd press?)
- up/down arrow keys should work on subsup children to navigate 
- drag-and-drop yay
- toolbar finally
- for debugging/testing (esp video), could print current pressed key in some other UI element


Re-evaluating all math structures based on the latex examples I am using to guide the testing. I will now look over all of them to decide whether subsup is enough for all special cases like that, or if I should split into diff types. Also will note on the ways to parse.

- `a_x` should parse even though it is not `_{}^{}{a}_{x}^{}`
- `f^{-1}` should put -1 as "exponent" of f

\actsymb should not be the same as subsup if parsing to valid latex with actuarialsymbol package enabled. Two reasons:
1. The left-side subscrips don't anchor to the base symbol
2. subsup allows right-side superscript (UR). So does \actsymb, but in a situation where the user wants to do \itop they might use UR, and get confused if they want to move it to the next char in LR. However, a disadvantage of removing UR is that `\actsymb[n][2]{A}{x}[(m)]` (apart from needing special parsing logic) will be rendered above "x", not necessarily anchored to the principal symbol if the precedence number (which in my design is allowed to be any string, not only "1", "2" or "3") is longer than the first character of the lower-right child. That is, assuming I will have precedence numbers and their corresponding parent centered.

The actsymb doc actually mentions the clash betw RU and precedences: 
> In such rare circumstances, one needs to insert a strut (an invisible vertical rule) in the subscript to push it downward as needed

Therefore I think my final decision is:
- actsymb should have 4 children
- actsymb is not subsup UNLESS THERE IS A GOOD REASON WHY subsup DOES NOT NEED TO EXIST ANYMORE. I think the main reason would be the alignment on the left, visualization-wise. I think that is a bad reason to keep it. However, it is a good idea maybe to think about the consequences of forcing the user to use \actuarialsymbol. If I have a notation that is just "x^2", it's a little strange to parse it to an actuarialsymbol. Thus, tradeoff between: (1) having 1:n mapping from visual representation to valid latex; and (2) following the simplest (built-in) latex conventions whenever possible.

Things to still consider:
- should precedence numbers only be allowed inside of actsymb? Not even sure if that is possible when I start allowing drag functionality. Prioritize user freedom over semantic validity?
- actsymb (if not same type as subsup) should intuitively not have navigation say that arrow up on LR jumps to UR. Instead, need to have up-arrow and down-arrow jump to add precedence numbers (or rather, precedence MathNode? again, freedom-validity tradeoff). In fact, if precedences are allowed anywhere then up and down should always lead to that (but do require a non-empty parent!).

Potential ways to decrease confusion caused by 1:n mapping of visualizations to valid semantics of subsup-like MathNodes (use at least 1 in final app, preferable more?):
1. Different shortcuts/actions needed to generate the MathNode
2. On hover, show button (or tooltip + some shortcut) to transform subsup to actsymb and vice versa
3. When user tries arrow-up (or whatever else is going to normally lead to precedence number) on subsup, show a warning to the user that they are not inside an actsymb (and instructions on how to fix it).

Whether precedences should be allowed outside of actsymb? Depends if it is ever needed elsewhere. Also before I forget again and ponder this yet again: this approach does not have 1:n mapping from visualisation to valid syntax. If it did, I would have thought precedence + its parent, versus Vector. But I think vector would center vertically while precedences look kinda like accents (location-wise).

In the previous iteration of the design of this application, I assumed that \itop, \iitop, ... \iiibottom would all be accent options. Instead, I will assume that something like PrecedencedNode could exist and have it somehow check if it is inside of actsymb before allowing its creation?

So my current preferred idea (personally) is:
- actsymb gets own MathNode type
- actsymb gets 4 children (just like subsup)
- precedence gets own MathNode type (similar to accent (or deco - do check if ever on >1 symbol!))
- actsymb's LR child is by default a precedence node
- precedence nodes are not allowed anywhere else
- actsymb gets own creation shortcut
- subsup can be converted to actsymb at any time by pressing a button that appears on hover
- actsymb can be converted to subsup if no node in LR has a precedence. Else it should warn, and allow forceful conversion that would throw away the precedences.

Note to self: before precedences can be implemented (assuming they are like accents, not deco), I need accents to exist. Need to strictly define accent vs deco! That in turn requires re-consideration of my way of dealing with IC vs TextNode...

Before thinking more deeply this is my thought: everything should always become separate TextNodes inside an IC. When brackets are inserted, it should make a group with TextNodes inside (or wrap in IC but atm implementation has just TextNode list). When a transformation is called, the node it will apply it on will be either the previous TextNode, or the previous GroupNode if the prev node is a GroupNode. 
It should be possible to create new groups by bulk-selecting sibling nodes and then pressing "(". 
Accents can go on TextNode
Deco can go on IC (or the fake-or-maybe-soon-literal IC inside of GroupNode)

Maybe the IC -> TextNodes mechanism, instead of simple max-1 length, should detect at least that numbers next to each other should stay together (so a TextNode is a unit holding a letter, a number, or a special symbol of any kind). Implication: cannot use bar notation on numbers.

Enable group explosion and multi-select grouping of siblings. Possible? I'll think about it soon.

Why Group and IC should both exist: if only IC, then would need to teach the user an action that they would need to apply to make the nested IC. Since current plan would split into TextNode as the user types. Advantage of that approach would be that 1+((2+3)/4) would be representable without brackets, just like in physical writing. But the action required for nesting would be essentially a hidden bracket, which may decrease usability of the app due to the allowed actions of groups being more strict than in physical writing (because the latter is complete freedom), and which groups exist would be visible on e.g. hover. Instead, brackets can show possibilities much better as it already follows conventions used in calculators and other online tools.
Why not only Group? Well I think anyway group is a wrapper around IC, meaning IC also exists. But why not only define group with a list of nodes, and have no IC? Because implicitly that is just IC with brackets all over the place. When does it make a difference? When a new node layer is made, i.e., the root (so the first state that the user experiences) and the children of subsup-like nodes.

Is it safe to keep both? When drag-and-drop is enabled, and you have e.g. (1+2)/3, the app allows the replacement of (1+2) with e.g. 1+2. I may be wrong but I think that is harmless because the brackets serve as a way to notify the transformation logic which node to take to the new MathNode. In drag-and-drop logic, the MathNode is already there. Therefore, such behavior will lead to safe deletion of brackets, which may even be nice for the user to clean up unwanted brackets after the expression tree is already in shape.

Why not merge Group into IC and have it render brackets only when the parent is also an IC? Or perhaps better: only when the user was the one to type the bracket? For the latter: not sure yet, sounds like a decent option but might get messy especially in parsers. For the former: would not allow (1+2)^3, because the parent is a subsup. Brackets make sense to render in any visual math structure where the size and alignment match its parent's. That is: IC in IC, IC in subsup-like node, ...?

No brackets needed around:
- IC in RootNode (assuming root will be rendered with a line above)
- IC in subsup's child
- IC in fraction
- IC in decorated (assuming the decoration already covers the group visually)

Still have to think about BigOperator. I think I need to re-define that one to not have a "body" or whatever. Better to just treat it as a special symbol with 2 children: lower and upper. Use it inside an IC. If you want to make it look semantically valid, explicitly use brackets. But my app does not need to know what to "apply" the operator to, since it's purely visual and latex does not care either.

I have not yet thought about Vector and Matrix.
Also I still need to add support for multi-line things, like cases?
Also lim(...)

Trying to think of a logical IC vs Group ruleset:
- IC on start
- IC on children of nodes created by shortcuts
- Group (wrapping an IC) on manually defined bracket

(1+2)/3 can only be made using brackets because else the system does not know that 1+2 is supposed to be a group. Thus, (1+2)/3 will be shown with brackets even though the system could be aware that this is redundant. For the first version of the app I will keep it simple (i.e. keep brackets) but later on I can look into automatic bracket removal on transform, or some cleanup button that allows the user to choose to remove all redundant brackets at once.

What about when the user types "1a"? "1" and "a" are separate TextNodes.
At least one potential issue with all this: operators would be allowed to have accents. I think that is ok; latex may also allow it?

Summary:
- **ActSymbNode**: actsymb gets own MathNode type
- actsymb gets 4 children (just like subsup)
- precedence gets own MathNode type **PrecedenceNode** (similar to accent (or deco - do check if ever on >1 symbol!))
- ActSymbNode's LR child is by default a PrecedenceNode
- precedence nodes are not allowed anywhere else
- actsymb gets own creation shortcut
- subsup can be converted to actsymb at any time by pressing a button that appears on hover
- actsymb can be converted to subsup if no node in LR has a precedence. Else it should warn, and allow forceful conversion that would throw away the precedences.
- **GroupNode** created when user puts brackets. Is just wrap around InlineContainerNode
- **BigOperatorNode** should not have a body

Afterwards, rough idea:
LimNode should have only 1 child. It should be either created by always checking if the text "lim" is there, or by some safer combination like \lim. Latter is cleaner but requires new functionality regarding parsing of the input (in latex-like way).
Accent vs Deco: DecoratedNode should wrap an InlineContainer

Accents/Decorations:
- tilde `\tilde{}`
- hat `\hat{}`
- widehat `\widehat{}`
- bar `\bar{}`
- double dots `\ddot{}`
- circle `\mathring{}`
- angl `\angl{}` -> requires actuarial angle
- underline `\underline{}`
- overline/joint `\joint{}` -> looks a lot like \bar{} tbh but still good to have both supported

I think AccentNode does not have to exist at all! Latex allows decoration on anything

Next steps: 
Go over all the points in my recent summary and implement all the changes on parts that currently will break the system 

Definitely first step is whatever I need to do to ensure that everything is always a separate TextNode 

### 15/05/2025

I will not be working on this in the morning and afternoon due to actual responsibilities piling up.
I did play around in the train for a few seconds and noticed that subsup still does not get reverted to textnode on deletion of all children.

Did some writing in the train :)

### 16/05/2025

At some point should send sth like this to the potential client:
> Some time ago there was a conversation here about your struggles with chronic pain and taking lecture notes on paper due to the lack of actuarial notation in existing software. I really enjoy and miss software engineering, so I started working on a tool that might help. It's very early in implementation, but the design is ready. So this is where I believe that the whole thing is achievable, but it's early enough for any feedback to be properly taken into account. If you are interested, I'd like to involve you in further development so it can actually become a custom solution for your exact situation (e.g. most comfortable keyboard/mouse usage for less pain, but also finding the right balance between visual expressiveness versus semantic validity). "Involvement" here just means: I write stuff about assumptions -> you correct me if I am wrong; I mention alternative design choices -> you pick your preference or give your opinion. (I write the whole design rationale in a technical report anyway so all I have to do is say which paragraphs are relevant) If you'd rather not, that's totally fine of course, I might continue making it anyway because it's really fun and existing tools do indeed suck for no good reason. Either way I will slow down until the end of June because I have been neglecting uni.

I think ctrl+- and control+6 should lead to Actuarial instead of subsup left (and for both, if +shift then left side), because realistically you would never have to use those slots in subsup without also using right-hand sides. OR maybe even ever. Except in chemistry. In actuarial, it is used, and while it is not the main one to start with semantically (cuz the lower right should be the most important?), in math note taking one might read left-to-right and want to start the note-taking on the left. 

Now looking into how to make textnodes appear in a good way instead of always having the user choose when to end the textnode

These are all characters that are sent to the adder:
```a-zA-Z0-9=:;\'\"\`~|?.,<>?+!@#$%&*()\[\]\{\}\-```
Note: brackets are wrong, at least opening brackets don't count here and closing maybe.
I think GroupNode maker will have to know when it is unclosed and look for the next matching closing bracket. So for now I will assume I have to turn them into separate textnodes.

Cases:
1. if current node's (old) content contains "\", check if match with any specialSequence. If so, transform to the result of said sequence. Otherwise, append to the same TextNode.
2. `0-9` -> check if curr content also 0-9 and if so, append. Else new textnode
3. `a-zA-Z` -> gets own new TextNode
4. other -> new TextNode

Idea: if typed shortcuts (with '\') will have 1 child, allow wraparound on select of a node when typing '\'? Still need to think about how to deal with invalid ones

Damnit I just realised that even though my "keep digits together" is important for transformations, it disables the cursor-like functionality so if you type a long number and want to change the first digit, you have to remove all the others first. I want to fix it, but I think it's something to add later rather than change the whole approach

chatgpt fucked up so bad, todo ask it to take into acc editorstate and cursor in all the /logic/ files

ok I fixed it kinda but still big problem w anything mroe than just 1st level inline 
but 1st lvl inline has: 
- cursor
- move cursor on click (but should still change the cursor type to caret)
- move cursor on arrows
- backspace
And apparently even selecting mult w mouse (but no copy paste stuff, but that feels like it should so now I have to implement that as well at some point!)

### 17/05/2025
Fixed the fraction problem w ability to type!! it is awesome now :DD just no deletion yet 
But when clicking back into the parent container, it will not let you back in using arrows
Must fix deletion of inlinecontainer when textnode is last one (or rather textnode if only one in container)

Now going to put back the 4 insert cases into the current insertion logic
Note: in the future, specialSequences will contain:
- all no-child symbols in https://www.cmor-faculty.rice.edu/~heinken/latex/symbols.pdf. These are put in TextNode
- perhaps more, with 1 child. Must be careful not to build another latex parser (or do so but properly and on purpose)

Fixed the cases I think! Current progress:
![alt text](image-15.png)

I think later on I might regret the way numbers are 1 textnode. Maybe it should be a group somehow. But for now this is clean enough to continue I hope 

Either way, Group is the next logical thing to implement
perhaps after fixing the deletion logic of fractions


Finding out how markdown deals with brackets:

Opening:
() - if end of container then make both
(8 - if start of nonempty, only opening
8(9 - if middle, only opening

Closing:
) -> if end of container, only closing
8)9 -> if middle, only closing
89) -> if end, only closing

closing after opening:
(8)

opening after closing:
(8) -> if at start, take existing closing
89(w87r}) -> crap, this one can deal with intruders
8()) -> if next to existing closing, make new pair 

8)]]

Reduce to clean ruleset for my app:
Opening bracket:
1. if no more non-bracket after in container -> make pair with empty containernode
2. if matching closing bracket textNode later in node -> transform all betw into GroupNode with contents wrapped in its IC
3. else only opening bracket in textnode (normal insertion behavior)

Closing bracket:
1. if matching opening bracket textNode earlier in node -> transform all betw into GroupNode with contents wrapped in its IC
2. else only closing bracket in textNode (normal insertion behavior)

Some test cases for me to think about how to break my own idea:
ab{cd)} -> 
I think it will be ok, else I will fix it later

OMGGGGG
![alt text](image-16.png)

I think it's actually decent omg. Just expanding and prettifying now. Until it's bit more usable to know what else to do

For every node type, add in these:
- directionalChildOrder in navigation utils
- renderer in MathRenderers
- case in MathRenderer
- stuff in treeutils
- shortcut handling in handle-keydown
- latex parse in latexparser
- creator in Nodefactories

Next bug to fix is line 109 in the deletion, it should be poss to delete fully empty node
but curr failsafe already exists, can go right arr and remove whole thing anyway

![alt text](image-17.png)