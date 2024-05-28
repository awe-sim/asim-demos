export type FSMState = string;
export type FSMAction = string;
export type FSMTransition = [FSMState, FSMAction, FSMState];
export type FSM = FSMTransition[];
export function executeFSM(fsm: FSM, state: FSMState, action: FSMAction): FSMState {
  for (const [from, act, to] of fsm) {
    if (from === state && act === action) {
      return to;
    }
  }
  return state;
}
