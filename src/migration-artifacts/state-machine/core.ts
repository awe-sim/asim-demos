import { immerable, produce } from 'immer';
import { v4 } from 'uuid';

let id = 0;
function uniqueId(prefix?: string): string {
  return `${prefix}${++id}`;
}

export enum EUser {
  SYSTEM = 'System',
  PLQ = 'PLQ',
  PARTNER = 'Partner',
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
  CANCEL = 'Cancel',
  REOPEN = 'Reopen',
  REJECT = 'Reject',
  REQUEST = 'Request',
  RETRY_NOW = 'Retry',
  RETRY_LATER = 'Schedule retry',
  REVERT_NOW = 'Revert',
  REVERT_LATER = 'Schedule revert',
  RUN_NOW = 'Run',
  RUN_LATER = 'Schedule',
  SYSTEM_FAIL = 'Fail',
  SYSTEM_OK = 'Complete',
  SYSTEM_RUN = 'Invoke',
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
  [EAction.RETRY_LATER]: 'Schedule Retry',
  [EAction.REVERT_NOW]: 'Revert Now',
  [EAction.REVERT_LATER]: 'Schedule Revert',
  [EAction.RUN_NOW]: 'Run Now',
  [EAction.RUN_LATER]: 'Schedule',
  [EAction.SYSTEM_FAIL]: 'Fail',
  [EAction.SYSTEM_OK]: 'OK',
  [EAction.SYSTEM_RUN]: 'Run',
};

export const CLONE_MIGRATIONS_FOR: Record<EAction, boolean> = {
  [EAction.CANCEL]: false,
  [EAction.REJECT]: false,
  [EAction.REOPEN]: true,
  [EAction.REQUEST]: false,
  [EAction.RETRY_NOW]: true,
  [EAction.RETRY_LATER]: true,
  [EAction.REVERT_NOW]: true,
  [EAction.REVERT_LATER]: true,
  [EAction.RUN_NOW]: false,
  [EAction.RUN_LATER]: false,
  [EAction.SYSTEM_FAIL]: false,
  [EAction.SYSTEM_OK]: false,
  [EAction.SYSTEM_RUN]: false,
};
export const CLONE_MIGRATION_NAME: Record<EAction, (name: string) => string> = {
  [EAction.CANCEL]: name => name,
  [EAction.REJECT]: name => name,
  [EAction.REOPEN]: name => `${name} (Reopened)`,
  [EAction.REQUEST]: name => name,
  [EAction.RETRY_NOW]: name => `${name} (Retry)`,
  [EAction.RETRY_LATER]: name => `${name} (Retry)`,
  [EAction.REVERT_NOW]: name => `${name} (Revert)`,
  [EAction.REVERT_LATER]: name => `${name} (Revert)`,
  [EAction.RUN_NOW]: name => name,
  [EAction.RUN_LATER]: name => name,
  [EAction.SYSTEM_FAIL]: name => name,
  [EAction.SYSTEM_OK]: name => name,
  [EAction.SYSTEM_RUN]: name => name,
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
      draft.migrations.push(new Migration(v4(), uniqueId('Migration '), EUser.PARTNER, EState.REQUESTED, [`${EUser.PARTNER} → ${EAction.REQUEST}`]));
      draft.history.push(this);
    });
  }
  scheduleMigration(): Root {
    return produce(this, draft => {
      draft.migrations.push(new Migration(v4(), uniqueId('Migration '), EUser.PLQ, EState.SCHEDULED, [`${EUser.PLQ} → ${EAction.RUN_LATER}`]));
      draft.history.push(this);
    });
  }
  runMigration(user: EUser): Root {
    return produce(this, draft => {
      draft.migrations.push(new Migration(v4(), uniqueId('Migration '), user, EState.IN_PROGRESS, [`${user} → ${EAction.RUN_NOW}`]));
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
      if (CLONE_MIGRATIONS_FOR[action]) {
        draft.migrations.push(new Migration(v4(), CLONE_MIGRATION_NAME[action](migration.name), user, nextState, [`${user} → ${action}`]));
      } else {
        draft.migrations[index].state = nextState;
        draft.migrations[index].history.push(`${user} → ${action}`);
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
  readonly history: string[] = [];
  constructor(id: string, name: string, user: EUser, state: EState, history: string[] = []) {
    this.id = id;
    this.name = name;
    this.user = user;
    this.state = state;
    this.history = history;
  }
  getActions(user: EUser): EAction[] {
    return Array.from(STATE_MACHINE.get(this.state)?.[user]?.keys() ?? []);
  }
}
