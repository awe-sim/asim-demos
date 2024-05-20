import { immerable, produce } from 'immer';
import { v4 } from 'uuid';

let id = 0;
function uniqueId(prefix?: string): string {
  return `${prefix}${++id}`;
}

export enum EUser {
  SYSTEM = 'SYSTEM',
  PLQ = 'PLQ',
  PARTNER = 'PARTNER',
}

export enum EState {
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS',
  REJECTED = 'REJECTED',
  REQUESTED = 'REQUESTED',
  REVERTED = 'REVERTED',
  REVERTING = 'REVERTING',
  SCHEDULED = 'SCHEDULED',
  SUCCESS = 'SUCCESS',
}

export enum EAction {
  CANCEL = 'CANCEL',
  REOPEN = 'REOPEN',
  REJECT = 'REJECT',
  REQUEST = 'REQUEST',
  RETRY_NOW = 'RETRY_NOW',
  RETRY_LATER = 'RETRY_LATER',
  REVERT_NOW = 'REVERT_NOW',
  REVERT_LATER = 'REVERT_LATER',
  RUN_NOW = 'RUN_NOW',
  RUN_LATER = 'RUN_LATER',
  SYSTEM_FAIL = 'SYSTEM_FAIL',
  SYSTEM_OK = 'SYSTEM_OK',
  SYSTEM_RUN = 'SYSTEM_RUN',
}

export const STATE_LABELS: Record<EState, string> = {
  [EState.CANCELLED]: 'Cancelled',
  [EState.FAILED]: 'Failed',
  [EState.IN_PROGRESS]: 'In Progress',
  [EState.REJECTED]: 'Rejected',
  [EState.REQUESTED]: 'Requested',
  [EState.REVERTED]: 'Reverted',
  [EState.REVERTING]: 'Reverting',
  [EState.SCHEDULED]: 'Scheduled',
  [EState.SUCCESS]: 'Success',
};

export const ACTION_LABELS: Record<EAction, string> = {
  [EAction.CANCEL]: 'Cancel',
  [EAction.REJECT]: 'Reject',
  [EAction.REOPEN]: 'Reopen',
  [EAction.REQUEST]: 'Request',
  [EAction.RETRY_NOW]: 'Retry Now',
  [EAction.RETRY_LATER]: 'Retry Later',
  [EAction.REVERT_NOW]: 'Revert Now',
  [EAction.REVERT_LATER]: 'Revert Later',
  [EAction.RUN_NOW]: 'Run Now',
  [EAction.RUN_LATER]: 'Run Later',
  [EAction.SYSTEM_FAIL]: 'Fail',
  [EAction.SYSTEM_OK]: 'OK',
  [EAction.SYSTEM_RUN]: 'Run',
};

export type StateMachine = Map<EState, UserTransitions>;
export type UserTransitions = {
  [EUser.SYSTEM]?: Map<EAction, EState>;
  [EUser.PLQ]?: Map<EAction, EState>;
  [EUser.PARTNER]?: Map<EAction, EState>;
};
export type Transitions = Map<EAction, EState>;

export const STATE_MACHINE: StateMachine = new Map([
  // CANCELLED
  [
    EState.CANCELLED,
    {
      [EUser.SYSTEM]: new Map(),
      [EUser.PLQ]: new Map(),
      [EUser.PARTNER]: new Map(),
    },
  ],

  // FAILED
  [
    EState.FAILED,
    {
      [EUser.SYSTEM]: new Map(),
      [EUser.PLQ]: new Map([
        // [EAction.RETRY_NOW, EState.IN_PROGRESS],
        // [EAction.RETRY_LATER, EState.SCHEDULED],
      ]),
      [EUser.PARTNER]: new Map(),
    },
  ],

  // IN_PROGRESS
  [
    EState.IN_PROGRESS,
    {
      [EUser.SYSTEM]: new Map([
        [EAction.SYSTEM_OK, EState.SUCCESS],
        [EAction.SYSTEM_FAIL, EState.FAILED],
      ]),
      [EUser.PLQ]: new Map(),
      [EUser.PARTNER]: new Map(),
    },
  ],

  // REJECTED
  [
    EState.REJECTED,
    {
      [EUser.SYSTEM]: new Map(),
      [EUser.PLQ]: new Map(),
      [EUser.PARTNER]: new Map([
        //
        [EAction.REOPEN, EState.REQUESTED],
        [EAction.CANCEL, EState.CANCELLED],
      ]),
    },
  ],

  // REQUESTED
  [
    EState.REQUESTED,
    {
      [EUser.SYSTEM]: new Map(),
      [EUser.PLQ]: new Map([
        [EAction.RUN_NOW, EState.IN_PROGRESS],
        [EAction.RUN_LATER, EState.SCHEDULED],
        [EAction.REJECT, EState.REJECTED],
      ]),
      [EUser.PARTNER]: new Map([[EAction.CANCEL, EState.CANCELLED]]),
    },
  ],

  // REVERTED
  [
    EState.REVERTED,
    {
      [EUser.SYSTEM]: new Map(),
      [EUser.PLQ]: new Map(),
      [EUser.PARTNER]: new Map(),
    },
  ],

  // REVERTING
  [
    EState.REVERTING,
    {
      [EUser.SYSTEM]: new Map([
        [EAction.SYSTEM_OK, EState.REVERTED],
        [EAction.SYSTEM_FAIL, EState.FAILED],
      ]),
      [EUser.PLQ]: new Map(),
      [EUser.PARTNER]: new Map(),
    },
  ],

  // SCHEDULED
  [
    EState.SCHEDULED,
    {
      [EUser.SYSTEM]: new Map([[EAction.SYSTEM_RUN, EState.IN_PROGRESS]]),
      [EUser.PLQ]: new Map([
        [EAction.CANCEL, EState.CANCELLED],
        [EAction.RUN_NOW, EState.IN_PROGRESS],
      ]),
      [EUser.PARTNER]: new Map(),
    },
  ],

  // SUCCESS
  [
    EState.SUCCESS,
    {
      [EUser.SYSTEM]: new Map(),
      [EUser.PLQ]: new Map([
        [EAction.REVERT_NOW, EState.REVERTING],
        [EAction.REVERT_LATER, EState.SCHEDULED],
      ]),
      [EUser.PARTNER]: new Map(),
    },
  ],
]);

export class Root {
  [immerable] = true;
  readonly migrations: Migration[];
  readonly history: Root[] = [];
  constructor(migrations: Migration[]) {
    this.migrations = migrations;
  }
  requestMigration(): Root {
    return produce(this, draft => {
      draft.migrations.push(new Migration(v4(), uniqueId('Migration '), EUser.PARTNER, EState.REQUESTED));
      draft.history.push(this);
    });
  }
  scheduleMigration(): Root {
    return produce(this, draft => {
      draft.migrations.push(new Migration(v4(), uniqueId('Migration '), EUser.PLQ, EState.SCHEDULED));
      draft.history.push(this);
    });
  }
  runMigration(user: EUser): Root {
    return produce(this, draft => {
      draft.migrations.push(new Migration(v4(), uniqueId('Migration '), user, EState.IN_PROGRESS));
      draft.history.push(this);
    });
  }
  execute(id: string, user: EUser, action: EAction): Root {
    return produce(this, draft => {
      const index = draft.migrations.findIndex(m => m.id === id);
      const migration = draft.migrations[index];
      if (!migration) {
        throw new Error(`Migration with id ${id} not found`);
      }
      const nextState = STATE_MACHINE.get(migration.state)?.[user]?.get(action);
      if (!nextState) {
        throw new Error(`Invalid action ${action} for user ${user} in state ${migration.state}`);
      }
      switch (action) {
        case EAction.CANCEL:
        case EAction.REJECT:
        case EAction.REQUEST:
        case EAction.RUN_NOW:
        case EAction.RUN_LATER:
        case EAction.SYSTEM_OK:
        case EAction.SYSTEM_FAIL:
        case EAction.SYSTEM_RUN:
          draft.migrations[index].state = nextState;
          break;
          case EAction.REOPEN:
          draft.migrations[index].state = nextState;
          draft.migrations[index].name = `${migration.name} (Reopened)`
          // draft.migrations.push(new Migration(v4(), `${migration.name} (Reopened)`, migration.user, nextState));
          break;
        case EAction.RETRY_NOW:
        case EAction.RETRY_LATER:
          draft.migrations.push(new Migration(v4(), `${migration.name} (Retry)`, migration.user, nextState));
          break;
        case EAction.REVERT_NOW:
        case EAction.REVERT_LATER:
          draft.migrations.push(new Migration(v4(), `${migration.name} (Revert)`, migration.user, nextState));
          break;
      }
      draft.history.push(this);
    });
  }
  get canUndo(): boolean {
    return this.history.length > 0;
  }
  undo(): Root {
    return this.history[this.history.length - 1];
  }
}

export class Migration {
  [immerable] = true;
  readonly id: string;
  readonly name: string;
  readonly user: EUser;
  readonly state: EState;
  constructor(id: string, name: string, user: EUser, state: EState) {
    this.id = id;
    this.name = name;
    this.user = user;
    this.state = state;
  }
  getActions(user: EUser): EAction[] {
    return Array.from(STATE_MACHINE.get(this.state)?.[user]?.keys() ?? []);
  }
}
