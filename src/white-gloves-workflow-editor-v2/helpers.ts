import { uniqueId } from 'lodash';
import { Edge, Node, XYPosition } from 'reactflow';
import { v4 } from 'uuid';
import { Action, HistoryItem, Stage, StageType } from './types';

export function makeNewNode(position: XYPosition, selected: boolean): Node<Stage> {
  return {
    id: v4(),
    data: {
      label: uniqueId('Stage #'),
      type: StageType.NORMAL,
    },
    position,
    type: 'CustomNode',
    selected,
  };
}

export function findTargetHandle(sourceNode: Node<Stage>, targetNode: Node<Stage>, invert: boolean): string {
  const deltaX = sourceNode.position.x - targetNode.position.x;
  const deltaY = sourceNode.position.y - targetNode.position.y;
  if (Math.abs(deltaY) > Math.abs(deltaX)) {
    if (deltaY > 0) {
      // if (deltaX < -50) return !invert ? 'dn_1_target' : 'dn_1_source';
      // if (deltaX > +50) return !invert ? 'dn_-1_target' : 'dn_-1_source';
      return !invert ? 'dn_0_target' : 'dn_0_source';
    } else {
      // if (deltaX < -50) return !invert ? 'up_1_target' : 'up_1_source';
      // if (deltaX > +50) return !invert ? 'up_-1_target' : 'up_-1_source';
      return !invert ? 'up_0_target' : 'up_0_source';
    }
  } else {
    if (deltaX > 0) {
      // if (deltaY < -50) return !invert ? 'rt_1_target' : 'rt_1_source';
      // if (deltaY > +50) return !invert ? 'rt_-1_target' : 'rt_-1_source';
      return !invert ? 'rt_0_target' : 'rt_0_source';
    } else {
      // if (deltaY < -50) return !invert ? 'lt_1_target' : 'lt_1_source';
      // if (deltaY > +50) return !invert ? 'lt_-1_target' : 'lt_-1_source';
      return !invert ? 'lt_0_target' : 'lt_0_source';
    }
  }
}

export function makeNewEdge(source: string, sourceHandle: string, target: string, targetHandle: string, selected: boolean): Edge<Action> {
  return {
    data: {
      isEmailAction: false,
      variants: [
        {
          label: '',
          emailTemplate: '',
          hasReminder: false,
          reminderEmailTemplate: '',
          hasConstraints: false,
          constraints: [],
        },
      ],
    },
    id: v4(),
    interactionWidth: 20,
    label: uniqueId('Action #'),
    source,
    sourceHandle,
    target,
    targetHandle,
    type: 'CustomEdge',
    selected,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMouseEvent(ev: any): ev is MouseEvent {
  return 'clientX' in ev && 'clientY' in ev;
}

export function isReactFlowPane(ev: React.MouseEvent<Element, MouseEvent>): boolean {
  return (ev.target as HTMLElement)?.classList?.contains?.('react-flow__pane');
}

export function areNodesEqual(node1: Node<Stage>, node2: Node<Stage>): boolean {
  if (node1.id !== node2.id) return false;
  if (node1.position.x !== node2.position.x) return false;
  if (node1.position.y !== node2.position.y) return false;
  if (node1.data.label !== node2.data.label) return false;
  if (node1.data.type !== node2.data.type) return false;
  return true;
}

export function areEdgesEqual(edge1: Edge<Action>, edge2: Edge<Action>): boolean {
  if (edge1.id !== edge2.id) return false;
  if (edge1.label !== edge2.label) return false;
  if (edge1.source !== edge2.source) return false;
  if (edge1.sourceHandle !== edge2.sourceHandle) return false;
  if (edge1.target !== edge2.target) return false;
  if (edge1.targetHandle !== edge2.targetHandle) return false;
  if (edge1.data?.isEmailAction !== edge2.data?.isEmailAction) return false;
  if (edge1.data?.variants?.length !== edge2.data?.variants?.length) return false;
  for (let i = 0; i < (edge1.data?.variants?.length ?? 0); i++) {
    if (edge1.data?.variants[i]?.label !== edge2.data?.variants[i]?.label) return false;
    if (edge1.data?.variants[i]?.emailTemplate !== edge2.data?.variants[i]?.emailTemplate) return false;
    if (edge1.data?.variants[i]?.hasReminder !== edge2.data?.variants[i]?.hasReminder) return false;
    if (edge1.data?.variants[i]?.reminderEmailTemplate !== edge2.data?.variants[i]?.reminderEmailTemplate) return false;
    if (edge1.data?.variants[i]?.hasConstraints !== edge2.data?.variants[i]?.hasConstraints) return false;
    if (edge1.data?.variants[i]?.constraints?.length !== edge2.data?.variants[i]?.constraints?.length) return false;
    for (let j = 0; j < (edge1.data?.variants[i]?.constraints?.length ?? 0); j++) {
      if (edge1.data?.variants[i]?.constraints[j] !== edge2.data?.variants[i]?.constraints[j]) return false;
    }
  }
  return true;
}

// Compares two history items
export function isHistoryEqual(history1: HistoryItem, history2: HistoryItem): boolean {
  if (history1.nodes.length !== history2.nodes.length) return false;
  if (history1.edges.length !== history2.edges.length) return false;
  if (history1.tourState !== history2.tourState) return false;
  for (let i = 0; i < history1.nodes.length; i++) {
    if (!areNodesEqual(history1.nodes[i], history2.nodes[i])) return false;
  }
  for (let i = 0; i < history1.edges.length; i++) {
    if (!areEdgesEqual(history1.edges[i], history2.edges[i])) return false;
  }
  return true;
}
