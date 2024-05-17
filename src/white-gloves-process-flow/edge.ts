import { Action } from './action';
import { State } from './state';

export class Edge {
  constructor(
    public readonly state: State,
    public readonly action: Action,
    public readonly nextState: State,
  ) {}
}
