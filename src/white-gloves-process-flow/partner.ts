import { immerable, produce } from 'immer';
import { uniq } from 'lodash';
import { Process } from './process';
import { State } from './state';
import { FnRecipe } from './types';

export class Partner {
  [immerable] = true;
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly checked: boolean,
    public readonly processes: Process[],
  ) {}
  toString(): string {
    return `${this.id}`;
  }
  hasAnyProcess(partnerProcess: Process[]): boolean {
    return !!this.processes.find(process => !partnerProcess.find(p => p.id === process.id));
  }
  hasProcess(partnerProcess: Process): boolean {
    return !!this.processes.find(process => process.id === partnerProcess.id);
  }
  getEjectedProcesses(): Process[] {
    return this.processes.filter(process => process.state === State.EJECTED);
  }
  getStates(): State[] {
    const states = this.processes.map(process => process.state);
    const uniqueStates = uniq(states);
    return uniqueStates;
  }
  update(recipe: FnRecipe<Partner>): Partner {
    return produce(this, recipe);
  }
  updateProcess(processID: string, recipe: FnRecipe<Process>): Partner {
    return this.update(draft => {
      draft.processes = draft.processes.map(process => {
        if (process.id !== processID) return process;
        return process.update(recipe);
      });
    });
  }
  setState(state: State): Partner {
    return this.update(draft => {
      draft.processes = draft.processes.map(process => process.setState(state));
    });
  }
  setChecked(checked: boolean): Partner {
    return this.update(draft => {
      draft.checked = checked;
    });
  }
  setProcessState(partnerProcess: Process, state: State): Partner {
    return this.update(draft => {
      draft.processes = draft.processes.map(process => {
        if (process.id !== partnerProcess.id) return process;
        return process.setState(state);
      });
    });
  }
  purgeEjectedProcesses(): Partner {
    return this.update(draft => {
      draft.processes = draft.processes.filter(process => process.state !== State.EJECTED);
    });
  }
  // get actions(): Action[] {

  // }
}
