export type FSMTransition<FSMState, FSMAction> = [FSMState, FSMAction, FSMState];
export type FSM<FSMState, FSMAction> = FSMTransition<FSMState, FSMAction>[];

export function executeFSM<FSMState, FSMAction>(fsm: FSM<FSMState, FSMAction>, state: FSMState, action: FSMAction): FSMState {
  for (const [from, act, to] of fsm) {
    if (from === state && act === action) {
      console.log(`Transitioning from ${from} to ${to} via ${act}`);
      return to;
    }
  }
  console.error(`Invalid transition from ${state} via ${action}`);
  return state;
}

export function getNextStateFSM<FSMState, FSMAction>(fsm: FSM<FSMState, FSMAction>, state: FSMState, action: FSMAction): FSMState {
  for (const [from, act, to] of fsm) {
    if (from === state && act === action) {
      return to;
    }
  }
  return state;
}

export function canExecuteFSM<FSMState, FSMAction>(fsm: FSM<FSMState, FSMAction>, state: FSMState, action: FSMAction): boolean {
  for (const [from, act] of fsm) {
    if (from === state && act === action) {
      return true;
    }
  }
  return false;
}
