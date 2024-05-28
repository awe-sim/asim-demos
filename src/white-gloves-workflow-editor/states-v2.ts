import { atom } from "recoil";

export const selectedNodeIdState = atom<string | undefined>({
  key: "selectedNodeId_v2",
  default: undefined,
});

export const selectedNodeIdsState = atom<Set<string>>({
  key: "selectedNodeIds_v2",
  default: new Set(),
});

export const selectedEdgeIdsState = atom<Set<string>>({
  key: "selectedEdgeIds_v2",
  default: new Set(),
});

export const editingNodeIdState = atom<string | undefined>({
  key: "editingNodeId_v2",
  default: undefined,
});
