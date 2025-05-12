// MathUnitNode.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { MathUnit, MathChildPosition, CharUnit, GroupUnit } from '../types/MathUnit';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  unit: MathUnit;
  onSelfChange: (updated: MathUnit) => void;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  scale?: number;
  reportSize?: (id: string, size: { width: number; height: number }) => void;
}

const MathUnitNode: React.FC<Props> = ({
  unit,
  onSelfChange,
  selectedId,
  setSelectedId,
  hoveredId,
  setHoveredId,
  scale = 1, // Pass scale prop to each node, defaulting to 1 for root
  reportSize,
}) => {
  const [currentValue, setCurrentValue] = useState(
    unit.type === 'char' ? unit.value : ''
  );
  const isSelected = unit.id === selectedId;
  const isHovered =  unit.id === hoveredId;

  const boxRef = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });
  const [childSizes, setChildSizes] = useState<Record<string, { width: number; height: number }>>({});

  useEffect(() => {
    const updateSize = () => {
      if (boxRef.current) {
        const rect = boxRef.current.getBoundingClientRect();
  
        // Find max child extents, if present
        let childMaxWidth = 0;
        let childMaxHeight = 0;
  
        Object.entries(unit.children || {}).forEach(([_, child]) => {
          console.log(`child: ${child}`)
          const childSize = childSizes[child.id];
          if (childSize) {
            childMaxWidth = Math.max(childMaxWidth, childSize.width);
            childMaxHeight = Math.max(childMaxHeight, childSize.height);
          }
        });
  
        // Use the maximum extents of self and children
        const totalWidth = Math.max(rect.width, childMaxWidth + rect.width / 2);
        const totalHeight = rect.height + childMaxHeight;
  
        const newSize = { width: totalWidth, height: totalHeight };
  
        setBoxSize(newSize);
        reportSize?.(unit.id, newSize); // Report total size, not just self
      }
    };
  
    updateSize();
  
    const observer = new ResizeObserver(updateSize);
    if (boxRef.current) observer.observe(boxRef.current);
  
    return () => observer.disconnect();
  }, [childSizes, unit]);

  useEffect(() => {
    if (unit.type === 'char') {
      setCurrentValue(unit.value);
    }
  }, [unit]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);

    if (unit.type === 'char') {
      if (newValue.length > 1) {
        const groupUnit: GroupUnit = {
          id: uuidv4(),
          type: 'group',
          units: newValue.split('').map(char => ({
            id: uuidv4(),
            type: 'char',
            value: char,
            children: {}
          })),
          children: {}
        };
        onSelfChange({
          ...unit,  // Keep the parent structure
          type: 'group',  // Update the type to group
          value: newValue, // Set the value as part of the group if necessary
          units: groupUnit.units  // Replace this unit's children with the new group units
        });        
        console.log('Created group from multiple chars:', groupUnit);
        //here should auto select the empty box

      } else {
        onSelfChange({ ...unit, value: newValue });
        console.log('Updated single char value:', newValue);
      }
    }
  };

  const updateChild = (pos: MathChildPosition, updated: MathUnit) => {
    onSelfChange({
      ...unit,
      children: {
        ...unit.children,
        [pos]: updated
      }
    });
  };

  const handleChildSize = (id: string, size: { width: number; height: number }) => {
    setChildSizes(prev => {
      if (prev[id]?.width === size.width && prev[id]?.height === size.height) {
        return prev; // no update needed
      }
      return { ...prev, [id]: size };
    });
  };

  const renderCharInput = () => (
    <div>
      <input
        type="text"
        value={currentValue}
        onChange={handleValueChange}
        className="text text-center w-[1rem] h-[1rem] border border-gray-300"
      />
    </div>
  );

  const renderGroup = () => (
    <div className="flex items-center p-[.1rem] border border-gray-200">
      {unit.units.map((part, index) => {
        const prev = unit.units[index - 1];
        const marginLeft = index > 0 ? (childSizes[prev.id]?.width || 0) * 0.5 : 0;
  
        // Add marginLeft to ensure spacing to the right of any large children
        //const marginLeft = index > 0 ? Math.max(prevWidth * 0.1, 4) : 0;
  
        return (
          <div
            key={part.id}
            style={{
              marginLeft,
            }}
          >
            <MathUnitNode
              unit={part}
              onSelfChange={(updatedPart) => {
                const newUnits = unit.units.map(u =>
                  u.id === updatedPart.id ? updatedPart : u
                );
                onSelfChange({ ...unit, units: newUnits });
              }}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
              scale={scale}
              reportSize={(size) => {
                setChildSizes((prev) => ({
                  ...prev,
                  [part.id]: size, // ✅ Store per-part, not per-group
                }));
              }}
            />
          </div>
        );
      })}
      <input
        type="text"
        value=""
        placeholder=""
        className="w-[1rem] h-[1rem] text-center text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        onChange={(e) => {
          const val = e.target.value;
          if (val.trim()) {
            const newUnit: MathUnit = {
              id: uuidv4(),
              type: 'char',
              value: val,
              children: {}
            };
            onSelfChange({ ...unit, units: [...unit.units!, newUnit] });
          }
        }}
      />
    </div>
  );

  return (
    <div
      className={`relative flex flex-col items-center ${isHovered ? 'bg-yellow-100' : ''}`}
      onMouseEnter={() => setHoveredId(unit.id)}
      //onFocus={() => setHoveredId(unit.id)}
      onMouseLeave={() => setHoveredId(null)}
      //onBlur={() => setHoveredId(null)}
      >
      <div
        ref={boxRef}
        className={`relative flex items-center justify-center px-1 py-1`}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(unit.id);
        }}
      >
        {/* Children in corners */}
        {(['ul', 'll', 'ur', 'lr'] as MathChildPosition[]).map((pos) => {

          const translateX = boxSize.width * 1;
          const translateY = boxSize.height * 1;

          return (
            <div
              key={pos}
              className={`absolute`}
              style={{
                [pos.startsWith('l') ? 'top' : 'bottom']: '80%',
                [pos.endsWith('r') ? 'left' : 'right']: '80%',
                transform: `translate(${pos.endsWith('r') ? `-${translateX}` : `${translateX}`}, ${pos.startsWith('l') ? `${translateY}` : `-${translateY}`})`,
                transformOrigin: `${pos.startsWith('u') ? 'bottom' : 'top'} ${pos.endsWith('l') ? 'right' : 'left'}`,
                scale: 0.5, // reduce child node visual size
              }}
            >
              {unit.children?.[pos] ? (
                <MathUnitNode
                  unit={unit.children[pos]!}
                  onSelfChange={(u) => updateChild(pos, u)}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                  scale={scale * 2}
                  reportSize={handleChildSize}
                />
              ) : isHovered ? (
                <input
                  type="text"
                  className="text text-center w-[1rem] h-[1rem] border bg-green-200"
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (val) {
                      const newUnit: MathUnit = {
                        id: uuidv4(),
                        type: 'group',
                        units: [{
                          id: uuidv4(),
                          type: 'char',
                          value: val,
                          children: {}
                        }],
                        children: {}
                      };
                      updateChild(pos, newUnit);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : null}
            </div>
          );
        })}
        
        {/* Main content */}
        {unit.type === 'char' ? renderCharInput() : renderGroup()}
      </div>
    </div>
  );
};

export default MathUnitNode;
