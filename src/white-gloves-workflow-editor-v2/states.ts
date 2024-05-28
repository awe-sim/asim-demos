import { XYPosition } from 'reactflow';
import { atom } from 'recoil';
import { Constraint, EditingId, TourState } from './types';

export const selectedIdsState = atom<Set<string>>({
  key: 'selectedIds_v3',
  default: new Set(),
});

export const editingIdState = atom<EditingId | undefined>({
  key: 'editingId_v3',
  default: undefined,
});

export const edgeLabelCoordsState = atom<XYPosition | undefined>({
  key: 'edgeLabelCoords_v3',
  default: undefined,
});

export const activeConstraintState = atom<Constraint | undefined>({
  key: 'activeConstraint_v3',
  default: undefined,
});

export const visitedIdsState = atom<Set<string>>({
  key: 'visitedIds_v3',
  default: new Set(),
});

export const deadEndNodeIdsState = atom<Set<string>>({
  key: 'deadEndNodeIds_v3',
  default: new Set(),
});

export const tourStateState = atom<TourState>({
  key: 'tourState_v3',
  default: TourState.INTRODUCTION,
});
