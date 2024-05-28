import { Edge, Node, XYPosition } from 'reactflow';
import { Action, Stage, Type } from './types';
import { uniqueId } from 'lodash';
import { v4 } from 'uuid';
import { Draft, immerable, produce } from 'immer';

export function makeNewNode(position: XYPosition): Node<Stage> {
  return {
    id: v4(),
    data: {
      label: uniqueId('Stage #'),
      type: Type.NORMAL,
    },
    position,
    type: 'CustomNode',
    selected: true,
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

export function makeNewEdge(source: string, sourceHandle: string, target: string, targetHandle: string): Edge<Action> {
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
          constraintsConnectionsIn: [],
          constraintsConnectionsNotIn: [],
          constraintsDirectionsIn: [],
          constraintsDirectionsNotIn: [],
          constraintsOriginsIn: [],
          constraintsOriginsNotIn: [],
          constraintsStatesIn: [],
          constraintsStatesNotIn: [],
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
    if (edge1.data?.variants[i]?.constraintsConnectionsIn?.length !== edge2.data?.variants[i]?.constraintsConnectionsIn?.length) return false;
    for (let j = 0; j < (edge1.data?.variants[i]?.constraintsConnectionsIn?.length ?? 0); j++) {
      if (edge1.data?.variants[i]?.constraintsConnectionsIn[j] !== edge2.data?.variants[i]?.constraintsConnectionsIn[j]) return false;
    }
    if (edge1.data?.variants[i]?.constraintsConnectionsNotIn?.length !== edge2.data?.variants[i]?.constraintsConnectionsNotIn?.length) return false;
    for (let j = 0; j < (edge1.data?.variants[i]?.constraintsConnectionsNotIn?.length ?? 0); j++) {
      if (edge1.data?.variants[i]?.constraintsConnectionsNotIn[j] !== edge2.data?.variants[i]?.constraintsConnectionsNotIn[j]) return false;
    }
    if (edge1.data?.variants[i]?.constraintsDirectionsIn?.length !== edge2.data?.variants[i]?.constraintsDirectionsIn?.length) return false;
    for (let j = 0; j < (edge1.data?.variants[i]?.constraintsDirectionsIn?.length ?? 0); j++) {
      if (edge1.data?.variants[i]?.constraintsDirectionsIn[j] !== edge2.data?.variants[i]?.constraintsDirectionsIn[j]) return false;
    }
    if (edge1.data?.variants[i]?.constraintsDirectionsNotIn?.length !== edge2.data?.variants[i]?.constraintsDirectionsNotIn?.length) return false;
    for (let j = 0; j < (edge1.data?.variants[i]?.constraintsDirectionsNotIn?.length ?? 0); j++) {
      if (edge1.data?.variants[i]?.constraintsDirectionsNotIn[j] !== edge2.data?.variants[i]?.constraintsDirectionsNotIn[j]) return false;
    }
    if (edge1.data?.variants[i]?.constraintsOriginsIn?.length !== edge2.data?.variants[i]?.constraintsOriginsIn?.length) return false;
    for (let j = 0; j < (edge1.data?.variants[i]?.constraintsOriginsIn?.length ?? 0); j++) {
      if (edge1.data?.variants[i]?.constraintsOriginsIn[j] !== edge2.data?.variants[i]?.constraintsOriginsIn[j]) return false;
    }
    if (edge1.data?.variants[i]?.constraintsOriginsNotIn?.length !== edge2.data?.variants[i]?.constraintsOriginsNotIn?.length) return false;
    for (let j = 0; j < (edge1.data?.variants[i]?.constraintsOriginsNotIn?.length ?? 0); j++) {
      if (edge1.data?.variants[i]?.constraintsOriginsNotIn[j] !== edge2.data?.variants[i]?.constraintsOriginsNotIn[j]) return false;
    }
    if (edge1.data?.variants[i]?.constraintsStatesIn?.length !== edge2.data?.variants[i]?.constraintsStatesIn?.length) return false;
    for (let j = 0; j < (edge1.data?.variants[i]?.constraintsStatesIn?.length ?? 0); j++) {
      if (edge1.data?.variants[i]?.constraintsStatesIn[j] !== edge2.data?.variants[i]?.constraintsStatesIn[j]) return false;
    }
    if (edge1.data?.variants[i]?.constraintsStatesNotIn?.length !== edge2.data?.variants[i]?.constraintsStatesNotIn?.length) return false;
    for (let j = 0; j < (edge1.data?.variants[i]?.constraintsStatesNotIn?.length ?? 0); j++) {
      if (edge1.data?.variants[i]?.constraintsStatesNotIn[j] !== edge2.data?.variants[i]?.constraintsStatesNotIn[j]) return false;
    }
  }
  return true;
}

export class History<T> {
  [immerable] = true;
  readonly history: T[] = [];
  readonly future: T[] = [];
  readonly capacity: number;
  readonly fnEquals: (a: T, b: T) => boolean;
  constructor(initial: T, capacity: number, fnEquals: (a: T, b: T) => boolean) {
    this.history.push(initial);
    this.capacity = capacity;
    this.fnEquals = fnEquals;
  }
  push(value: T): History<T> {
    if (this.history.length > 0 && this.fnEquals(this.history[this.history.length - 1], value)) return this;
    return produce(this, draft => {
      draft.history.push(value as Draft<T>);
      draft.future.length = 0;
      if (draft.history.length > draft.capacity) draft.history.shift();
    });
  }
  get canUndo(): boolean {
    return this.history.length > 1;
  }
  get canRedo(): boolean {
    return this.future.length > 0;
  }
  undo(): [History<T>, T | undefined] {
    if (!this.canUndo) return [this, undefined];
    return [
      produce(this, draft => {
        draft.future.push(draft.history.pop() as Draft<T>);
      }),
      this.history[this.history.length - 2],
    ];
  }
  redo(): [History<T>, T | undefined] {
    if (!this.canRedo) return [this, undefined];
    return [
      produce(this, draft => {
        draft.history.push(draft.future.pop() as Draft<T>);
      }),
      this.future[this.future.length - 1],
    ];
  }
  clear(): History<T> {
    return produce(this, draft => {
      draft.history.length = 0;
      draft.future.length = 0;
    });
  }
}
