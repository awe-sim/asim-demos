import { XYPosition } from 'reactflow';
import { atom, AtomEffect } from 'recoil';

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

type LocalStorageEffectConfig<T> = {
  key: string;
  parse?: (value: string) => T;
  stringify?: (value: T) => string;
};
export function localStorageEffect<T>({ key, parse, stringify }: LocalStorageEffectConfig<T>): AtomEffect<T> {
  return ({ onSet, resetSelf, setSelf }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue !== null) {
      setSelf(parse ? parse(savedValue) : JSON.parse(savedValue));
    } else {
      resetSelf();
    }
    onSet((newValue, _oldValue, isReset) => {
      if (isReset) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, stringify ? stringify(newValue) : JSON.stringify(newValue));
      }
    });
  };
}
