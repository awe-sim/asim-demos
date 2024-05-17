import { State } from './state';
import { ActionFlags, Connection, Direction, Origin } from './types';

export class Action {
  private constructor(
    public readonly rank: number,
    public readonly label: string,
    public readonly flags: ActionFlags[],
    public readonly emailTemplateID: string,
    public readonly validStates: State[],
    public readonly validConnections: Connection[],
    public readonly validOrigins: Origin[],
    public readonly validDirections: Direction[],
    public readonly parent?: Action,
  ) {}
  get isReleaseAction() {
    return this.flags.includes(ActionFlags.RELEASE_ACTION);
  }
  get isEmailAction() {
    return this.flags.includes(ActionFlags.EMAIL_ACTION);
  }
  get savesState() {
    return this.flags.includes(ActionFlags.SAVE_STATE);
  }
  get restoresState() {
    return this.flags.includes(ActionFlags.RESTORE_STATE);
  }
  checkStates(states: State[]): boolean {
    return this.validStates.length === 0 || this.validStates.some(s => states.includes(s));
  }
  checkConnections(connections: Connection[]): boolean {
    return this.validConnections.length === 0 || this.validConnections.some(c => connections.includes(c));
  }
  checkOrigins(origins: Origin[]): boolean {
    return this.validOrigins.length === 0 || this.validOrigins.some(o => origins.includes(o));
  }
  checkDirections(directions: Direction[]): boolean {
    return this.validDirections.length === 0 || this.validDirections.some(d => directions.includes(d));
  }
  toString(): string {
    return `[${this.label}]`;
  }

  static readonly SEND_MIGRATION_LETTER = new Action(1, 'Send migration letter', [], '', [], [], [], []);
  static readonly SEND_MIGRATION_LETTER_AS2 = new Action(1, 'SEND_MIGRATION_LETTER_AS2', [ActionFlags.EMAIL_ACTION], 'MIGRATION_LETTER_AS2', [], [Connection.AS2], [], [], Action.SEND_MIGRATION_LETTER);
  static readonly SEND_MIGRATION_LETTER_SFTP = new Action(1, 'SEND_MIGRATION_LETTER_SFTP', [ActionFlags.EMAIL_ACTION], 'MIGRATION_LETTER_SFTP', [], [Connection.SFTP], [], [], Action.SEND_MIGRATION_LETTER);
  static readonly SEND_MIGRATION_LETTER_HTTP = new Action(1, 'SEND_MIGRATION_LETTER_HTTP', [ActionFlags.EMAIL_ACTION], 'MIGRATION_LETTER_HTTP', [], [Connection.HTTP], [], [], Action.SEND_MIGRATION_LETTER);
  static readonly SEND_MIGRATION_LETTER_VAN = new Action(1, 'SEND_MIGRATION_LETTER_VAN', [ActionFlags.EMAIL_ACTION], 'MIGRATION_LETTER_VAN', [], [Connection.VAN], [], [], Action.SEND_MIGRATION_LETTER);

  static readonly RECEIVE_ACKNOWLEDGEMENT_MIGRATION_LETTER = new Action(2.1, 'Receive acknowledgement', [], '', [], [], [Origin.INTERNAL], []);
  static readonly RECEIVE_CONNECTION_INFO = new Action(2.1, 'Receive connection info', [], '', [], [], [Origin.BOTH, Origin.EXTERNAL], []);

  static readonly MARK_CONNECTION_OK = new Action(3.1, 'Mark connection OK', [], '', [], [], [], []);
  static readonly MARK_CONNECTION_FAILED = new Action(3.2, 'Mark connection failed', [], '', [], [], [], []);

  static readonly SEND_REMINDER_MIGRATION_LETTER = new Action(4, 'Send reminder for migration letter', [], '', [], [], [], []);
  static readonly SEND_REMINDER_MIGRATION_LETTER_AS2 = new Action(4, 'SEND_REMINDER_MIGRATION_LETTER_AS2', [ActionFlags.EMAIL_ACTION], 'REMINDER_FOR_MIGRATION_LETTER_AS2', [], [Connection.AS2], [], [], Action.SEND_REMINDER_MIGRATION_LETTER);
  static readonly SEND_REMINDER_MIGRATION_LETTER_SFTP = new Action(4, 'SEND_REMINDER_MIGRATION_LETTER_SFTP', [ActionFlags.EMAIL_ACTION], 'REMINDER_FOR_MIGRATION_LETTER_SFTP', [], [Connection.SFTP], [], [], Action.SEND_REMINDER_MIGRATION_LETTER);
  static readonly SEND_REMINDER_MIGRATION_LETTER_HTTP = new Action(4, 'SEND_REMINDER_MIGRATION_LETTER_HTTP', [ActionFlags.EMAIL_ACTION], 'REMINDER_FOR_MIGRATION_LETTER_HTTP', [], [Connection.HTTP], [], [], Action.SEND_REMINDER_MIGRATION_LETTER);
  static readonly SEND_REMINDER_MIGRATION_LETTER_VAN = new Action(4, 'SEND_REMINDER_MIGRATION_LETTER_VAN', [ActionFlags.EMAIL_ACTION], 'REMINDER_FOR_MIGRATION_LETTER_VAN', [], [Connection.VAN], [], [], Action.SEND_REMINDER_MIGRATION_LETTER);

  static readonly REQUEST_CONNECTION_INFO = new Action(5, 'Request connection info', [], '', [], [], [], []);
  static readonly REQUEST_CONNECTION_INFO_AS2 = new Action(5, 'REQUEST_CONNECTION_INFO_AS2', [ActionFlags.EMAIL_ACTION], 'CONNECTION_INFO_REQUEST_AS2', [], [Connection.AS2], [Origin.BOTH, Origin.EXTERNAL], [], Action.REQUEST_CONNECTION_INFO);
  static readonly REQUEST_CONNECTION_INFO_SFTP = new Action(5, 'REQUEST_CONNECTION_INFO_SFTP', [ActionFlags.EMAIL_ACTION], 'CONNECTION_INFO_REQUEST_SFTP', [], [Connection.SFTP], [Origin.EXTERNAL], [], Action.REQUEST_CONNECTION_INFO);
  static readonly REQUEST_CONNECTION_INFO_HTTP = new Action(5, 'REQUEST_CONNECTION_INFO_HTTP', [ActionFlags.EMAIL_ACTION], 'CONNECTION_INFO_REQUEST_HTTP', [], [Connection.HTTP], [], [], Action.REQUEST_CONNECTION_INFO);

  static readonly SEND_REMINDER_CONNECTION_INFO = new Action(5.1, 'Send reminder for connection info', [ActionFlags.EMAIL_ACTION], '', [], [], [], []);
  static readonly SEND_REMINDER_CONNECTION_INFO_AS2 = new Action(5.1, 'SEND_REMINDER_CONNECTION_INFO_AS2', [ActionFlags.EMAIL_ACTION], 'REMINDER_FOR_CONNECTION_INFO_AS2', [], [Connection.AS2], [], [], Action.SEND_REMINDER_CONNECTION_INFO);
  static readonly SEND_REMINDER_CONNECTION_INFO_SFTP = new Action(5.1, 'SEND_REMINDER_CONNECTION_INFO_SFTP', [ActionFlags.EMAIL_ACTION], 'REMINDER_FOR_CONNECTION_INFO_SFTP', [], [Connection.SFTP], [], [], Action.SEND_REMINDER_CONNECTION_INFO);
  static readonly SEND_REMINDER_CONNECTION_INFO_HTTP = new Action(5.1, 'SEND_REMINDER_CONNECTION_INFO_HTTP', [ActionFlags.EMAIL_ACTION], 'REMINDER_FOR_CONNECTION_INFO_HTTP', [], [Connection.HTTP], [], [], Action.SEND_REMINDER_CONNECTION_INFO);

  static readonly SUGGEST_CONNECTION_TEST_DATE = new Action(9, 'Suggest connection test date', [ActionFlags.EMAIL_ACTION], 'CONNECTION_TEST_DATE', [], [], [], []);
  static readonly CONFIRM_CONNECTION_TEST_DATE = new Action(9.1, 'Confirm connection test date', [], '', [], [], [], []);
  static readonly SEND_REMINDER_CONNECTION_TEST_DATE = new Action(9.2, 'Send reminder for connection test date', [ActionFlags.EMAIL_ACTION], 'REMINDER_FOR_CONNECTION_TEST_DATE', [], [], [], []);
  static readonly SEND_GOLIVE_T14_LETTER = new Action(12, 'Send GoLive T-14 letter', [ActionFlags.RELEASE_ACTION, ActionFlags.EMAIL_ACTION], 'GOLIVE_T14_LETTER', [], [], [], []);
  static readonly RECEIVE_ACKNOWLEDGEMENT = new Action(13, 'Receive Acknowledgement', [], '', [], [], [], []);
  static readonly SEND_GOLIVE_T5_LETTER = new Action(14, 'Send GoLive T-5 letter', [ActionFlags.RELEASE_ACTION, ActionFlags.EMAIL_ACTION], 'GOLIVE_T5_LETTER', [], [], [], []);
  static readonly SEND_GOLIVE_T1_LETTER = new Action(15, 'Send GoLive T-1 letter', [ActionFlags.RELEASE_ACTION, ActionFlags.EMAIL_ACTION], 'GOLIVE_T1_LETTER', [], [], [], []);
  static readonly MARK_GOLIVE = new Action(16, 'Mark GoLive', [], '', [], [], [], []);
  static readonly MARK_RELEASE_COMPLETE = new Action(17, 'Mark migration complete', [], '', [], [], [], []);
  static readonly SEND_REMINDER_GOLIVE_T14_LETTER = new Action(18, 'Send reminder for GoLive T-14 letter', [ActionFlags.EMAIL_ACTION], 'REMINFER_FOR_GOLIVE_T14_LETTER', [], [], [], []);
  static readonly SEND_REMINDER_GOLIVE_T5_LETTER = new Action(19, 'Send reminder for GoLive T-5 letter', [ActionFlags.EMAIL_ACTION], 'REMINFER_FOR_GOLIVE_T5_LETTER', [], [], [], []);
  static readonly SEND_REMINDER_GOLIVE_T1_LETTER = new Action(20, 'Send reminder for GoLive T-1 letter', [ActionFlags.EMAIL_ACTION], 'REMINFER_FOR_GOLIVE_T1_LETTER', [], [], [], []);
  static readonly SEND_GOLIVE_LOAD_LETTER = new Action(21, 'Send GoLive Load letter', [ActionFlags.EMAIL_ACTION], 'GOLIVE_LOAD_LETTER', [], [], [], []);
  static readonly SEND_REMINDER_GOLIVE_LOAD_LETTER = new Action(22, 'Send reminder for GoLive Load letter', [ActionFlags.EMAIL_ACTION], 'GOLIVE_LOAD_LETTER', [], [], [], []);

  static readonly SEND_EMAIL = new Action(23, 'Send email', [ActionFlags.EMAIL_ACTION], 'BLANK_EMAIL', [], [], [], []);
  static readonly POSTPONE_MIGRATION = new Action(24, 'Postpone migration (accessible from RELEASE dialog only)', [ActionFlags.RELEASE_ACTION, ActionFlags.EMAIL_ACTION, ActionFlags.SAVE_STATE], 'MIGRATION_POSTPONED', [], [], [], []);
  static readonly RESTART_MIGRATION = new Action(25, 'Resume migration', [ActionFlags.RELEASE_ACTION, ActionFlags.EMAIL_ACTION, ActionFlags.RESTORE_STATE], 'MIGRATION_RESUMED', [], [], [], []);
  static readonly EJECT = new Action(25, 'Remove from release', [ActionFlags.EMAIL_ACTION], 'EJECTED', [], [], [], []);

  static readonly CHANGE_MIGRATION_DATE = new Action(26, 'Change migration date (accessible from RELEASE dialog only)', [ActionFlags.RELEASE_ACTION, ActionFlags.EMAIL_ACTION], 'MIGRATION_DATE_CHANGED', [], [], [], []);
}

export const ALL_ACTIONS = [
  //
  Action.SEND_MIGRATION_LETTER_AS2,
  Action.SEND_MIGRATION_LETTER_SFTP,
  Action.SEND_MIGRATION_LETTER_HTTP,
  Action.SEND_MIGRATION_LETTER_VAN,
  Action.SEND_MIGRATION_LETTER,
  Action.SEND_REMINDER_MIGRATION_LETTER_AS2,
  Action.SEND_REMINDER_MIGRATION_LETTER_SFTP,
  Action.SEND_REMINDER_MIGRATION_LETTER_HTTP,
  Action.SEND_REMINDER_MIGRATION_LETTER_VAN,
  Action.SEND_REMINDER_MIGRATION_LETTER,
  Action.REQUEST_CONNECTION_INFO_AS2,
  Action.REQUEST_CONNECTION_INFO_SFTP,
  Action.REQUEST_CONNECTION_INFO_HTTP,
  // Action.REQUEST_CONNECTION_INFO_VAN,
  Action.REQUEST_CONNECTION_INFO,
  Action.SEND_REMINDER_CONNECTION_INFO_AS2,
  Action.SEND_REMINDER_CONNECTION_INFO_SFTP,
  Action.SEND_REMINDER_CONNECTION_INFO_HTTP,
  // Action.SEND_REMINDER_CONNECTION_INFO_VAN,
  Action.RECEIVE_ACKNOWLEDGEMENT_MIGRATION_LETTER,
  Action.SEND_REMINDER_CONNECTION_INFO,
  Action.RECEIVE_CONNECTION_INFO,
  Action.MARK_CONNECTION_FAILED,
  Action.MARK_CONNECTION_OK,
  Action.SUGGEST_CONNECTION_TEST_DATE,
  Action.SEND_REMINDER_CONNECTION_TEST_DATE,
  Action.CONFIRM_CONNECTION_TEST_DATE,
  Action.SEND_GOLIVE_T14_LETTER,
  Action.SEND_REMINDER_GOLIVE_T14_LETTER,
  Action.SEND_GOLIVE_T5_LETTER,
  Action.SEND_REMINDER_GOLIVE_T5_LETTER,
  Action.SEND_GOLIVE_T1_LETTER,
  Action.SEND_REMINDER_GOLIVE_T1_LETTER,
  Action.RECEIVE_ACKNOWLEDGEMENT,
  Action.MARK_GOLIVE,
  Action.SEND_GOLIVE_LOAD_LETTER,
  Action.MARK_RELEASE_COMPLETE,
  Action.POSTPONE_MIGRATION,
  Action.RESTART_MIGRATION,
  Action.EJECT,
];
