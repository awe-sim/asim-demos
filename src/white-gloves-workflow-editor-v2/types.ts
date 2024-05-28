import { Draft } from 'immer';
import { Edge, Node } from 'reactflow';

export enum StageType {
  START = 'START',
  NORMAL = 'NORMAL',
  AWAITING_REPLY = 'AWAITING_REPLY',
  ERROR = 'ERROR',
  DONE = 'DONE',
}

export enum Constraint {
  AS2 = 'AS2',
  SFTP_INTERNAL = 'SFTP_INTERNAL',
  SFTP_EXTERNAL = 'SFTP_EXTERNAL',
  HTTP = 'HTTP',
  VAN = 'VAN',
  WEBHOOK = 'WEBHOOK',
}

export type Stage = {
  label: string;
  type: StageType;
};

export type Action = {
  isEmailAction: boolean;
  variants: Variant[];
};

export type Variant = {
  label: string;
  emailTemplate: string;
  hasReminder: boolean;
  reminderEmailTemplate: string;
  hasConstraints: boolean;
  constraints: Constraint[];
};

export enum StageAutoCompleteOptions {
  START = 'Start',
  MIGRATION_LETTER_SENT = 'Migration letter sent',
  ADDITIONAL_CONNECTION_INFO_REQUESTED = 'Additional connection info requested',
  CONNECTION_INFO_RECEIVED = 'Connection info received',
  CONNECTION_OK = 'Connection OK',
  CONNECTION_FAILED = 'Connection failed',
  CONNECTION_TEST_DATE_PROPOSED = 'Connection test date proposed',
  CONNECTION_TEST_DATE_CONFIRMED = 'Connection test date confirmed',
  GOLIVE_T_14_LETTER_SENT = 'GoLive T-14 letter sent',
  GOLIVE_T_14_LETTER_ACKNOWLEDGED = 'GoLive T-14 letter acknowledged',
  GOLIVE_T_5_LETTER_SENT = 'GoLive T-5 letter sent',
  GOLIVE_T_5_LETTER_ACKNOWLEDGED = 'GoLive T-5 letter acknowledged',
  GOLIVE_T_1_LETTER_SENT = 'GoLive T-1 letter sent',
  GOLIVE_T_1_LETTER_ACKNOWLEDGED = 'GoLive T-1 letter acknowledged',
  GOLIVE = 'GoLive',
  LIVE_LOAD_REQUESTED = 'Live load requested',
  MIGRATION_COMPLETE = 'Migration complete',
}

export enum ActionAutoCompleteOptions {
  SEND_MIGRATION_LETTER = 'Send migration letter',
  RECEIVE_CONNECTION_INFO = 'Receive connection info',
  RECEIVE_ACKNOWLEDGEMENT = 'Receive acknowledgement',
  SEND_ACKNOWLEDGEMENT = 'Send acknowledgement',
  MARK_CONNECTION_OK = 'Mark connection OK',
  MARK_CONNECTION_FAILED = 'Mark connection failed',
  PROPOSE_CONNECTION_TEST_DATE = 'Propose connection test date',
  SCHEDULE_CONNECTION_TEST = 'Schedule connection test',
  REQUEST_ADDITIONAL_CONNECTION_INFO = 'Request additional connection info',
  SEND_GOLIVE_T14_LETTER = 'Send GoLive T-14 letter',
  SEND_GOLIVE_T5_LETTER = 'Send GoLive T-5 letter',
  SEND_GOLIVE_T1_LETTER = 'Send GoLive T-1 letter',
  MARK_GOLIVE = 'Mark GoLive',
  REQUEST_LIVE_LOAD = 'Request live load',
  COMPLETE_MIGRATION = 'Complete migration',
}

export type FnRecipe<T> = (draft: Draft<T>) => Draft<T> | void | undefined;

export enum TourState {
  INTRODUCTION = 'INTRODUCTION',
  HOW_TO_CONFIGURE_STAGE = 'HOW_TO_CONFIGURE_STAGE',
  HOW_TO_CONFIGURE_STAGE___WITH_ACTION = 'HOW_TO_CONFIGURE_STAGE___WITH_ACTION',
  HOW_TO_CREATE_ACTION = 'HOW_TO_CREATE_ACTION',
  HOW_TO_CREATE_ACTION_WITH_STAGE = 'HOW_TO_CREATE_ACTION_WITH_STAGE',
  HOW_TO_EDIT_ACTION = 'HOW_TO_EDIT_ACTION',
  HOW_TO_CONFIGURE_ACTION = 'HOW_TO_CONFIGURE_ACTION',
  HOW_TO_CONFIGURE_VARIANTS = 'HOW_TO_CONFIGURE_VARIANTS',
  CONTROL_BUTTONS = 'CONTROL_BUTTONS',
  CONSTRAINT_BUTTONS = 'CONSTRAINT_BUTTONS',
  DONE = 'DONE',
}
export enum TourAction {
  NEXT = 'NEXT',
  DONE = 'DONE',
  DISMISS = 'DISMISS',
  STAGE_CREATED = 'STAGE_CREATED',
  STAGE_CONFIGURED = 'STAGE_CONFIGURED',
  ACTION_CREATED = 'ACTION_CREATED',
  ACTION_CREATED_WITH_STAGE = 'ACTION_CREATED_WITH_STAGE',
  ACTION_EDITING = 'ACTION_EDITING',
  ACTION_CONFIGURED = 'ACTION_CONFIGURED',
  ACTION_CLOSED = 'ACTION_CLOSED',
}

export type HistoryItem = {
  nodes: Node<Stage>[];
  edges: Edge<Action>[];
  tourState: TourState;
};

export type EditingId = {
  id: string;
  type: 'node' | 'edge';
}
