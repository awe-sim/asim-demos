import { StateFlags } from "./types";

export class State {
  private constructor(
    public readonly label: string,
    public readonly flags: StateFlags[],
  ) {}
  get isAlongMainPath() {
    return this.flags.includes(StateFlags.ALONG_MAIN_PATH);
  }
  get isAwaitingReply() {
    return this.flags.includes(StateFlags.AWAITING_REPLY);
  }
  get isErrorState() {
    return this.flags.includes(StateFlags.ERROR_STATE);
  }
  get isStartState() {
    return this.flags.includes(StateFlags.START_STATE);
  }
  get isEndState() {
    return this.flags.includes(StateFlags.END_STATE);
  }
  get color(): undefined | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
    if (this.isErrorState) return 'error';
    if (this.isAwaitingReply) return 'warning';
    if (this.isAlongMainPath) return 'primary';
    // return 'default';
  }
  toString(): string {
    return this.label;
  }

  static readonly _SAME_ = new State('_SAME_', []);
  static readonly _DUMMY_ = new State('_DUMMY_', []);
  static readonly START = new State('Start', [StateFlags.START_STATE]);
  static readonly MIGRATION_LETTER_SENT = new State('Migration Letter Sent', [StateFlags.ALONG_MAIN_PATH, StateFlags.AWAITING_REPLY]);
  static readonly MIGRATION_LETTER_ACKNOWLEDGED = new State('Migration Letter Acknowledged', [StateFlags.ALONG_MAIN_PATH]);
  static readonly CONNECTION_INFO_REQUESTED = new State('Connection Info Requested', [StateFlags.AWAITING_REPLY]);
  static readonly CONNECTION_INFO_RECEIVED = new State('Connection Info Received', [StateFlags.ALONG_MAIN_PATH]);
  static readonly CONNECTION_FAILED = new State('Connection Failed', [StateFlags.ERROR_STATE]);
  static readonly CONNECTION_TEST_DATE_SUGGESTED = new State('Connection Test Date Suggested', [StateFlags.AWAITING_REPLY]);
  static readonly CONNECTION_TEST_DATE_CONFIRMED = new State('Connection Test Date Confirmed', []);
  static readonly CONNECTION_OK = new State('Connection OK', [StateFlags.ALONG_MAIN_PATH]);
  static readonly GOLIVE_T14_LETTER_SENT = new State('GoLive T-14 Letter Sent', [StateFlags.ALONG_MAIN_PATH, StateFlags.AWAITING_REPLY]);
  static readonly GOLIVE_T14_LETTER_ACKNOWLEDGED = new State('GoLive T-14 Letter Acknowledged', [StateFlags.ALONG_MAIN_PATH]);
  static readonly GOLIVE_T5_LETTER_SENT = new State('GoLive T-5 Letter Sent', [StateFlags.ALONG_MAIN_PATH, StateFlags.AWAITING_REPLY]);
  static readonly GOLIVE_T5_LETTER_ACKNOWLEDGED = new State('GoLive T-5 Letter Acknowledged', [StateFlags.ALONG_MAIN_PATH]);
  static readonly GOLIVE_T1_LETTER_SENT = new State('GoLive T-1 Letter Sent', [StateFlags.ALONG_MAIN_PATH, StateFlags.AWAITING_REPLY]);
  static readonly GOLIVE_T1_LETTER_ACKNOWLEDGED = new State('GoLive T-1 Letter Acknowledged', [StateFlags.ALONG_MAIN_PATH]);
  static readonly GOLIVE = new State('GoLive', [StateFlags.ALONG_MAIN_PATH]);
  static readonly GOLIVE_LOAD_LETTER_SENT = new State('GoLive Load Letter Sent', [StateFlags.AWAITING_REPLY]);
  static readonly MIGRATION_POSTPONED = new State('Migration Postponed', [StateFlags.ERROR_STATE]);
  static readonly MIGRATION_RESTARTED = new State('Migration Restarted', [StateFlags.AWAITING_REPLY]);
  static readonly EJECTED = new State('Ejected', [StateFlags.ERROR_STATE]);
  static readonly RELEASE_COMPLETE = new State('Release Complete', [StateFlags.ALONG_MAIN_PATH, StateFlags.END_STATE]);
}

export const ALL_STATES = [
  //
  State.START,
  State.MIGRATION_LETTER_SENT,
  State.CONNECTION_INFO_REQUESTED,
  State.CONNECTION_INFO_RECEIVED,
  State.CONNECTION_FAILED,
  State.CONNECTION_TEST_DATE_SUGGESTED,
  State.CONNECTION_TEST_DATE_CONFIRMED,
  State.CONNECTION_OK,
  State.GOLIVE_T14_LETTER_SENT,
  State.GOLIVE_T14_LETTER_ACKNOWLEDGED,
  State.GOLIVE_T5_LETTER_SENT,
  State.GOLIVE_T5_LETTER_ACKNOWLEDGED,
  State.GOLIVE_T1_LETTER_SENT,
  State.GOLIVE_T1_LETTER_ACKNOWLEDGED,
  State.GOLIVE,
  State.GOLIVE_LOAD_LETTER_SENT,
  State.MIGRATION_POSTPONED,
  State.MIGRATION_RESTARTED,
  State.EJECTED,
  State.RELEASE_COMPLETE,
];
