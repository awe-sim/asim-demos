import { XYPosition } from 'reactflow';
import { atom } from 'recoil';
import { ProcessConnection } from './types';

export const selectedNodeIdsState = atom<string[]>({
  key: 'selectedNodeIds',
  default: [],
});

export const selectedEdgeIdsState = atom<string[]>({
  key: 'selectedEdgeIds',
  default: [],
});

export const selectedEdgeLabelCoordsState = atom<XYPosition | undefined>({
  key: 'selectedEdgeLabelCoords',
  default: undefined,
});

export const selectedProcessConnectionState = atom<ProcessConnection | undefined>({
  key: 'selectedProcessConnection',
  default: undefined,
});

export const visitedIdsState = atom<Set<string>>({
  key: 'visitedIds',
  default: new Set(),
});

export const deadEndNodeIdsState = atom<Set<string>>({
  key: 'deadEndNodeIds',
  default: new Set(),
});

export enum Flag {
  FIRST_TIME = 'firstTime',
  STATE_CREATED = 'stateCreated',
  STATE_CONFIGURED = 'stateConfigured',
  ACTION_CREATED = 'actionCreated',
  ACTION_CONFIGURED = 'actionConfigured',
}

export const flagState = atom<Flag>({
  key: 'flag',
  default: Flag.FIRST_TIME,
});
