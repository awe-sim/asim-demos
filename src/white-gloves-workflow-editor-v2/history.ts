import { Draft, immerable, produce } from 'immer';

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
