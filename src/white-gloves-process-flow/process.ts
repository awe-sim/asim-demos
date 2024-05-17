import { immerable, produce } from 'immer';
import { State } from './state';
import { Connection, Direction, FnRecipe, Origin } from './types';
import { Release } from './release';
import { Partner } from './partner';

export class Process {
  [immerable] = true;
  readonly savedState: State = State.START;
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly state: State,
    public readonly connection: Connection,
    public readonly direction: Direction,
    public readonly origin: Origin,
  ) {
    this.id = id;
    this.name = name;
    this.state = state;
  }
  toString(): string {
    return `${this.id}`;
  }
  update(recipe: FnRecipe<Process>): Process {
    return produce(this, recipe);
  }
  setState(state: State): Process {
    return this.update(draft => {
      draft.state = state;
    });
  }
  findPartner(release: Release): Partner | undefined {
    return release.partners.find(partner => partner.hasProcess(this));
  }
}
