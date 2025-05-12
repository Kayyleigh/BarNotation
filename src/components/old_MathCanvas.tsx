// MathCanvas.tsx
import React, { useState } from 'react';
import type { MathUnit } from '../types/MathUnit';
import MathUnitNode from './old_MathUnitNode';
import { v4 as uuidv4 } from 'uuid';

const createInitialUnit = (): MathUnit => ({
  id: uuidv4(),
  type: 'group',
  units: [{
    id: uuidv4(),
    type: 'char',
    value: '',
    children: {}
  }],
  children: {}
});

const MathCanvas: React.FC = () => {
  const [root, setRoot] = useState<MathUnit>(createInitialUnit());
  const [selectedId, setSelectedId] = useState<string | null>(null); // <-- Track selection
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="p-4 rounded shadow w-full max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-2">Math Input</h2>
      <MathUnitNode
        unit={root}
        onSelfChange={setRoot}
        selectedId={selectedId} // <-- Pass down
        setSelectedId={setSelectedId}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
      />
    </div>
  );
};

export default MathCanvas;