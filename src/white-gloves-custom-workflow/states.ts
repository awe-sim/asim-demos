import { XYPosition } from 'reactflow';
import { atom, selector } from 'recoil';
import { ConnectionStatus, ProcessConnection } from './types';

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

export const selectedProcessConnectionsState = atom<ConnectionStatus>({
  key: 'selectedProcessConnections',
  default: {
    [ProcessConnection.AS2]: false,
    [ProcessConnection.SFTP_INTERNAL]: false,
    [ProcessConnection.SFTP_EXTERNAL]: false,
    [ProcessConnection.HTTP]: false,
    [ProcessConnection.VAN]: false,
    [ProcessConnection.WEBHOOK]: false,
  },
});
export const anySelectedProcessConnectionState = selector<boolean>({
  key: 'anySelectedProcessConnection',
  get: ({ get }) => {
    const selectedProcessConnections = get(selectedProcessConnectionsState);
    return Object.values(selectedProcessConnections).some(Boolean);
  },
});
export const noneSelectedProcessConnectionsState = selector<boolean>({
  key: 'noneSelectedProcessConnections',
  get: ({ get }) => {
    const selectedProcessConnections = get(selectedProcessConnectionsState);
    return Object.values(selectedProcessConnections).every(v => !v);
  },
});
export const allSelectedProcessConnectionsState = selector<boolean>({
  key: 'allSelectedProcessConnections',
  get: ({ get }) => {
    const selectedProcessConnections = get(selectedProcessConnectionsState);
    return Object.values(selectedProcessConnections).every(Boolean);
  },
});

export const visitedIdsState = atom<Set<string>>({
  key: 'visitedIds',
  default: new Set(),
});
