export type NodeID = string;

export abstract class MathNode {
    id: NodeID = crypto.randomUUID();
    abstract children: MathNode[];
    abstract cloneWithChildren(children: MathNode[]): MathNode;
}

export class CharacterNode extends MathNode {
    readonly type = "CharacterNode";
    value: string;

    constructor(value: string) {
        super();
        if (value.length !== 1) {
            console.log(value)
            //throw new Warning("CharacterNode must be a single character.");
            this.value = "@";
        }
        this.value = value;
    }

    children: MathNode[] = [];

    cloneWithChildren(_: MathNode[]): MathNode {
        return new CharacterNode(this.value);
    }
}

export class MultiCharacterNode extends MathNode {
    readonly type = "MultiCharacterNode";

    items: MathNode[];

    constructor(content: string | MathNode[]) {
        super();
        if (typeof content === "string") {
            this.items = content.split("").map(ch => new CharacterNode(ch));
        } else {
            // Flatten any nested MultiCharacterNodes
            this.items = content.flatMap(node => 
                node instanceof MultiCharacterNode ? node.items : [node]
            );
        }
    }

    get children(): MathNode[] {
        return this.items;
    }

    set children(children: MathNode[]) {
        this.items = children.flatMap(child => {
            if (child instanceof MultiCharacterNode) {
                return child.items;
            }
            return [child];
        });
    }

    cloneWithChildren(children: MathNode[]): MathNode {
        return new MultiCharacterNode(children);
    }
}

// Node to decorate a character with accents
export class DecoratedNode extends MathNode {
    readonly type = "DecoratedNode";
    decoration: string;
    child: MathNode;

    constructor(decoration: string, child: MathNode) {
        super();
        this.decoration = decoration;
        this.child = child;
    }

    get children() {
        return [this.child];
    }

    set children(children: MathNode[]) {
        if (children.length !== 1) {
            throw new Error("DecoratedNode expects exactly one child.");
        }
        this.child = children[0];
    }

    cloneWithChildren(children: MathNode[]): MathNode {
        return new DecoratedNode(this.decoration, children[0]);
    }
}

// Node for grouping expressions (e.g. parentheses)
export class GroupNode extends MathNode {
    readonly type = "GroupNode";
    groupChildren: MathNode[];

    constructor(groupChildren: MathNode[]) {
        super();
        this.groupChildren = groupChildren;
    }

    get children() {
        return this.groupChildren;
    }

    set children(children: MathNode[]) {
        this.groupChildren = children;
    }

    cloneWithChildren(children: MathNode[]): MathNode {
        return new GroupNode(children);
    }
}

// Node for large operators like sum or integral
export class BigOperatorNode extends MathNode {
    readonly type = "BigOperatorNode";
    operatorSymbol: string;
    lower: MathNode | null;
    upper: MathNode | null;
    body: MathNode;

    constructor(operatorSymbol: string, lower: MathNode | null, upper: MathNode | null, body: MathNode) {
        super();
        this.operatorSymbol = operatorSymbol;
        this.lower = lower;
        this.upper = upper;
        this.body = body;
    }

    get children() {
        return [this.lower, this.upper, this.body].filter((n): n is MathNode => n !== null);
    }

    set children(children: MathNode[]) {
        if (children.length !== 3) {
            throw new Error("BigOperatorNode expects exactly two children.");
        }
        this.lower = children[0];
        this.upper = children[1];
        this.body = children[2];
    }

    cloneWithChildren(children: MathNode[]): MathNode {
        const [lower, upper, body] = children;
        return new BigOperatorNode(this.operatorSymbol, lower ?? null, upper ?? null, body);
    }
}

// Node for fractions
export class FractionNode extends MathNode {
    readonly type = "FractionNode";
    numerator: MathNode;
    denominator: MathNode;

    constructor(numerator: MathNode, denominator: MathNode) {
        super();
        this.numerator = numerator;
        this.denominator = denominator;
    }

    get children() {
        return [this.numerator, this.denominator];
    }

    set children(children: MathNode[]) {
        if (children.length !== 2) {
            throw new Error("FractionNode expects exactly two children.");
        }
        this.numerator = children[0];
        this.denominator = children[1];
    }

    cloneWithChildren(children: MathNode[]): MathNode {
        return new FractionNode(children[0], children[1]);
    }
}

export class RootNode extends MathNode {
    readonly type = "RootNode";
    radicand: MathNode;
    index?: MathNode;

    constructor(radicand: MathNode, index?: MathNode) {
        super();
        this.radicand = radicand;
        this.index = index;
    }

    get children() {
        return this.index ? [this.index, this.radicand] : [this.radicand];
    }

    set children(children: MathNode[]) {
        if (children.length === 1) {
            this.radicand = children[0];
            this.index = undefined;
        } else if (children.length === 2) {
            [this.index, this.radicand] = children;
        } else {
            throw new Error("RootNode expects one or two children.");
        }
    }

    cloneWithChildren(children: MathNode[]): MathNode {
        return new RootNode(children[children.length - 1], children.length === 2 ? children[0] : undefined);
    }
}

// Node for subscripts, superscripts, and actuarial-style notation
export class SubSupScriptedNode extends MathNode {
    readonly type = "SubSupScriptedNode";
    base: MathNode;
    ll?: MathNode;
    ul?: MathNode;
    lr?: MathNode;
    ur?: MathNode;

    constructor(base: MathNode, ll?: MathNode, ul?: MathNode, lr?: MathNode, ur?: MathNode) {
        super();
        this.base = base;
        this.ll = ll;
        this.ul = ul;
        this.lr = lr;
        this.ur = ur;
    }

    get children(): MathNode[] {
        return [this.base, this.ll, this.ul, this.lr, this.ur].filter((c): c is MathNode => c !== undefined);
    }

    set children(children: MathNode[]) {
        this.base = children[0];
        this.ll = children[1];
        this.ul = children[2];
        this.lr = children[3];
        this.ur = children[4];
    }

    cloneWithChildren(children: MathNode[]): MathNode {
        return new SubSupScriptedNode(
            children[0],
            children[1],
            children[2],
            children[3],
            children[4]
        );
    }
}

// Node representing a matrix
export class MatrixNode extends MathNode {
    readonly type = "MatrixNode";
    rows: MathNode[][];

    constructor(rows: MathNode[][]) {
        super();
        this.rows = rows;
    }

    get children(): MathNode[] {
        return this.rows.flat();
    }

    set children(children: MathNode[]) {
        throw new Error("Use rows property directly to update MatrixNode content.");
    }

    cloneWithChildren(children: MathNode[]): MathNode {
        const rowLength = this.rows[0]?.length || 1;
        const newRows: MathNode[][] = [];
        for (let i = 0; i < children.length; i += rowLength) {
            newRows.push(children.slice(i, i + rowLength));
        }
        return new MatrixNode(newRows);
    }
}

// Optional: simple vector representation
export class VectorNode extends MathNode {
    readonly type = "VectorNode";
    elements: MathNode[];
    orientation: 'row' | 'column';

    constructor(elements: MathNode[], orientation: 'row' | 'column' = 'column') {
        super();
        this.elements = elements;
        this.orientation = orientation;
    }

    get children(): MathNode[] {
        return this.elements;
    }

    set children(children: MathNode[]) {
        this.elements = children;
    }

    cloneWithChildren(children: MathNode[]): MathNode {
        return new VectorNode(children, this.orientation);
    }
}
