// export type MathChildPosition = 'ul' | 'ur' | 'll' | 'lr';

// export type MathUnit = {
//     id: string;
//     type: 'char' | 'group';
//     value: string; // only for leaf nodes
//     children: Partial<Record<MathChildPosition, MathUnit>>;
  
//     // for type === 'expression'
//     units?: MathUnit[]; 
  
//     accent?: 'hat' | 'bar' | 'tilde';
//     decorations?: {
//       jointLine?: boolean;
//       angle?: boolean;
//     };
//   }

export type MathChildPosition = 'ul' | 'ur' | 'll' | 'lr';

export interface CharUnit {
    id: string;
    type: 'char';
    value: string;
    children: Partial<Record<MathChildPosition, MathUnit>>;
    accent?: string;
}

export interface GroupUnit {
    id: string;
    type: 'group';
    units: MathUnit[];
    children: Partial<Record<MathChildPosition, MathUnit>>;
    decorations?: {
      jointLine?: boolean;
      angle?: boolean;
    };
}

export type MathUnit = CharUnit | GroupUnit;