import { useCustomCommands } from "../../hooks/customCommands/useCustomCommands";
import { replaceCommandWithNode } from "../../logic/insertion";
import type { CommandInputNode } from "../../models/mathNodeTypes";
import { specialSequences } from "../../models/specialSequences";
import { cloneTreeWithNewIds } from "../../utils/treeUtils";
import { CommandInputNodeComponent } from "./CommandInputNodeComponent";
import type { CoreRenderProps } from "./MathRenderer";

interface CommandInputRendererProps {
    node: CommandInputNode;
    baseProps: CoreRenderProps;
    Renderer: React.NamedExoticComponent<CoreRenderProps>;
  }
  
  export const CommandInputRenderer: React.FC<CommandInputRendererProps> = ({ node, baseProps, Renderer }) => {
    const { commandMap } = useCustomCommands();
    const isSelected = baseProps.cursor?.containerId === node.id;
  
    const handleSelectSuggestion = (sequence: string) => {
      const specialMatch = specialSequences.find(seq => seq.sequence === sequence);
      let transformedNode = specialMatch?.createNode();
  
      if (!transformedNode && commandMap[sequence]) {
        transformedNode = cloneTreeWithNewIds(commandMap[sequence].node);
    }
      if (!transformedNode) return;
  
      const updatedState = replaceCommandWithNode(baseProps.editorState, node.id, transformedNode);
      baseProps.updateEditorState(updatedState);
  
      setTimeout(() => {
        baseProps.editorRef?.current?.focus();
      }, 0);
    };
  
    return (
      <CommandInputNodeComponent
        node={node}
        isSelected={isSelected}
        onSelectSuggestion={handleSelectSuggestion}
        baseProps={baseProps}
        Renderer={Renderer}
      />
    );
  };
  