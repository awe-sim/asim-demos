import { produce } from 'immer';
import { useCallback } from 'react';
import { Edge, Node, useReactFlow } from 'reactflow';
import { Action, FnRecipe, Stage } from './types';

export function useReactFlowHooks() {
  //
  const { setNodes, setEdges } = useReactFlow<Stage, Action>();

  const updateNode = useCallback(
    (id: string, recipe: FnRecipe<Node<Stage>>) => {
      setNodes(nodes =>
        nodes.map(node => {
          if (node.id !== id) return node;
          return produce(node, recipe);
        }),
      );
    },
    [setNodes],
  );

  const updateEdge = useCallback(
    (id: string, recipe: FnRecipe<Edge<Action>>) => {
      setEdges(edges =>
        edges.map(edge => {
          if (edge.id !== id) return edge;
          return produce(edge, recipe);
        }),
      );
    },
    [setEdges],
  );

  return { updateNode, updateEdge };
}
