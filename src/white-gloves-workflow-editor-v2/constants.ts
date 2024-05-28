import { FSM } from './state-machine';
import { Action, ActionAutoCompleteOptions, Constraint, StageAutoCompleteOptions, StageType, TourAction, TourState } from './types';

export const STAGE_AUTOCOMPLETE_OPTIONS = [
  //
  StageAutoCompleteOptions.START,
  StageAutoCompleteOptions.MIGRATION_LETTER_SENT,
  StageAutoCompleteOptions.CONNECTION_INFO_RECEIVED,
  StageAutoCompleteOptions.CONNECTION_OK,
  StageAutoCompleteOptions.CONNECTION_FAILED,
  StageAutoCompleteOptions.CONNECTION_TEST_DATE_PROPOSED,
  StageAutoCompleteOptions.CONNECTION_TEST_DATE_CONFIRMED,
  StageAutoCompleteOptions.ADDITIONAL_CONNECTION_INFO_REQUESTED,
  StageAutoCompleteOptions.GOLIVE_T_14_LETTER_SENT,
  StageAutoCompleteOptions.GOLIVE_T_14_LETTER_ACKNOWLEDGED,
  StageAutoCompleteOptions.GOLIVE_T_5_LETTER_SENT,
  StageAutoCompleteOptions.GOLIVE_T_5_LETTER_ACKNOWLEDGED,
  StageAutoCompleteOptions.GOLIVE_T_1_LETTER_SENT,
  StageAutoCompleteOptions.GOLIVE_T_1_LETTER_ACKNOWLEDGED,
  StageAutoCompleteOptions.GOLIVE,
  StageAutoCompleteOptions.LIVE_LOAD_REQUESTED,
  StageAutoCompleteOptions.MIGRATION_COMPLETE,
];

export const STAGE_TYPES_LOOKUP: Record<StageAutoCompleteOptions, StageType> = {
  [StageAutoCompleteOptions.START]: StageType.START,
  [StageAutoCompleteOptions.MIGRATION_LETTER_SENT]: StageType.AWAITING_REPLY,
  [StageAutoCompleteOptions.CONNECTION_INFO_RECEIVED]: StageType.NORMAL,
  [StageAutoCompleteOptions.CONNECTION_OK]: StageType.NORMAL,
  [StageAutoCompleteOptions.CONNECTION_FAILED]: StageType.ERROR,
  [StageAutoCompleteOptions.CONNECTION_TEST_DATE_PROPOSED]: StageType.AWAITING_REPLY,
  [StageAutoCompleteOptions.CONNECTION_TEST_DATE_CONFIRMED]: StageType.NORMAL,
  [StageAutoCompleteOptions.ADDITIONAL_CONNECTION_INFO_REQUESTED]: StageType.AWAITING_REPLY,
  [StageAutoCompleteOptions.GOLIVE_T_14_LETTER_SENT]: StageType.AWAITING_REPLY,
  [StageAutoCompleteOptions.GOLIVE_T_14_LETTER_ACKNOWLEDGED]: StageType.NORMAL,
  [StageAutoCompleteOptions.GOLIVE_T_5_LETTER_SENT]: StageType.AWAITING_REPLY,
  [StageAutoCompleteOptions.GOLIVE_T_5_LETTER_ACKNOWLEDGED]: StageType.NORMAL,
  [StageAutoCompleteOptions.GOLIVE_T_1_LETTER_SENT]: StageType.AWAITING_REPLY,
  [StageAutoCompleteOptions.GOLIVE_T_1_LETTER_ACKNOWLEDGED]: StageType.NORMAL,
  [StageAutoCompleteOptions.GOLIVE]: StageType.NORMAL,
  [StageAutoCompleteOptions.LIVE_LOAD_REQUESTED]: StageType.AWAITING_REPLY,
  [StageAutoCompleteOptions.MIGRATION_COMPLETE]: StageType.DONE,
};

export const ACTION_AUTOCOMPLETE_OPTIONS: React.ReactNode[] = [
  //
  ActionAutoCompleteOptions.SEND_MIGRATION_LETTER,
  ActionAutoCompleteOptions.RECEIVE_CONNECTION_INFO,
  ActionAutoCompleteOptions.RECEIVE_ACKNOWLEDGEMENT,
  ActionAutoCompleteOptions.SEND_ACKNOWLEDGEMENT,
  ActionAutoCompleteOptions.MARK_CONNECTION_OK,
  ActionAutoCompleteOptions.MARK_CONNECTION_FAILED,
  ActionAutoCompleteOptions.PROPOSE_CONNECTION_TEST_DATE,
  ActionAutoCompleteOptions.SCHEDULE_CONNECTION_TEST,
  ActionAutoCompleteOptions.REQUEST_ADDITIONAL_CONNECTION_INFO,
  ActionAutoCompleteOptions.SEND_GOLIVE_T14_LETTER,
  ActionAutoCompleteOptions.SEND_GOLIVE_T5_LETTER,
  ActionAutoCompleteOptions.SEND_GOLIVE_T1_LETTER,
  ActionAutoCompleteOptions.MARK_GOLIVE,
  ActionAutoCompleteOptions.REQUEST_LIVE_LOAD,
  ActionAutoCompleteOptions.COMPLETE_MIGRATION,
];

export const ACTIONS_LOOKUP: Record<ActionAutoCompleteOptions, Action> = {
  [ActionAutoCompleteOptions.SEND_MIGRATION_LETTER]: {
    isEmailAction: true,
    variants: [
      //
      { label: 'AS2', emailTemplate: 'migration-letter-as2.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-as2-reminder.html', hasConstraints: true, constraints: [Constraint.AS2] },
      { label: 'HTTP', emailTemplate: 'migration-letter-http.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-http-reminder.html', hasConstraints: true, constraints: [Constraint.HTTP] },
      { label: 'SFTP External', emailTemplate: 'migration-letter-sftp-ext.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-sftp-ext-reminder.html', hasConstraints: true, constraints: [Constraint.SFTP_EXTERNAL] },
      { label: 'SFTP Internal', emailTemplate: 'migration-letter-sftp-int.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-sftp-int-reminder.html', hasConstraints: true, constraints: [Constraint.SFTP_INTERNAL] },
      { label: 'VAN', emailTemplate: 'migration-letter-van.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-van-reminder.html', hasConstraints: true, constraints: [Constraint.VAN] },
      { label: 'Web Hook', emailTemplate: 'migration-letter-webhook.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-webhook-reminder.html', hasConstraints: true, constraints: [Constraint.WEBHOOK] },
    ],
  },
  [ActionAutoCompleteOptions.RECEIVE_CONNECTION_INFO]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: true, constraints: [Constraint.AS2, Constraint.HTTP, Constraint.SFTP_EXTERNAL] }],
  },
  [ActionAutoCompleteOptions.RECEIVE_ACKNOWLEDGEMENT]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: true, constraints: [Constraint.SFTP_INTERNAL, Constraint.VAN, Constraint.WEBHOOK] }],
  },
  [ActionAutoCompleteOptions.SEND_ACKNOWLEDGEMENT]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraints: [] }],
  },
  [ActionAutoCompleteOptions.MARK_CONNECTION_OK]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraints: [] }],
  },
  [ActionAutoCompleteOptions.MARK_CONNECTION_FAILED]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraints: [] }],
  },
  [ActionAutoCompleteOptions.PROPOSE_CONNECTION_TEST_DATE]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'connection-test-date.html', hasReminder: true, reminderEmailTemplate: 'connection-test-date-reminder.html', hasConstraints: false, constraints: [] }],
  },
  [ActionAutoCompleteOptions.SCHEDULE_CONNECTION_TEST]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraints: [] }],
  },
  [ActionAutoCompleteOptions.REQUEST_ADDITIONAL_CONNECTION_INFO]: {
    isEmailAction: true,
    variants: [
      { label: 'AS2', emailTemplate: 'additional-connection-info-as2.html', hasReminder: true, reminderEmailTemplate: 'additional-connection-info-as2-reminder.html', hasConstraints: true, constraints: [Constraint.AS2] },
      { label: 'HTTP', emailTemplate: 'additional-connection-info-http.html', hasReminder: true, reminderEmailTemplate: 'additional-connection-info-http-reminder.html', hasConstraints: true, constraints: [Constraint.HTTP] },
      { label: 'SFTP External', emailTemplate: 'additional-connection-info-sftp-ext.html', hasReminder: true, reminderEmailTemplate: 'additional-connection-info-sftp-ext-reminder.html', hasConstraints: true, constraints: [Constraint.SFTP_EXTERNAL] },
    ],
  },
  [ActionAutoCompleteOptions.SEND_GOLIVE_T14_LETTER]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'golive-t14-letter.html', hasReminder: true, reminderEmailTemplate: 'golive-t14-letter-reminder.html', hasConstraints: false, constraints: [] }],
  },
  [ActionAutoCompleteOptions.SEND_GOLIVE_T5_LETTER]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'golive-t5-letter.html', hasReminder: true, reminderEmailTemplate: 'golive-t5-letter-reminder.html', hasConstraints: false, constraints: [] }],
  },
  [ActionAutoCompleteOptions.SEND_GOLIVE_T1_LETTER]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'golive-t1-letter.html', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraints: [] }],
  },
  [ActionAutoCompleteOptions.MARK_GOLIVE]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'golive.html', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraints: [] }],
  },
  [ActionAutoCompleteOptions.REQUEST_LIVE_LOAD]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'live-load.html', hasReminder: true, reminderEmailTemplate: 'live-load-reminder.html', hasConstraints: false, constraints: [] }],
  },
  [ActionAutoCompleteOptions.COMPLETE_MIGRATION]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraints: [] }],
  },
};

export const CONSTRAINTS: Constraint[] = [
  //
  Constraint.AS2,
  Constraint.HTTP,
  Constraint.SFTP_EXTERNAL,
  Constraint.SFTP_INTERNAL,
  Constraint.VAN,
  Constraint.WEBHOOK,
];

export const CONSTRAINTS_LOOKUP: Record<Constraint, string> = {
  [Constraint.AS2]: 'AS2',
  [Constraint.HTTP]: 'HTTP',
  [Constraint.SFTP_EXTERNAL]: 'SFTP External',
  [Constraint.SFTP_INTERNAL]: 'SFTP Internal',
  [Constraint.VAN]: 'VAN',
  [Constraint.WEBHOOK]: 'Webhook',
};

export const TOUR_FSM: FSM<TourState, TourAction> = [
  [TourState.INTRODUCTION, TourAction.STAGE_CREATED, TourState.HOW_TO_CONFIGURE_STAGE],
  [TourState.INTRODUCTION, TourAction.ACTION_CREATED, TourState.HOW_TO_CONFIGURE_ACTION],
  [TourState.INTRODUCTION, TourAction.ACTION_CREATED_WITH_STAGE, TourState.HOW_TO_CONFIGURE_STAGE___WITH_ACTION],

  [TourState.HOW_TO_CONFIGURE_STAGE, TourAction.STAGE_CONFIGURED, TourState.HOW_TO_CREATE_ACTION],
  [TourState.HOW_TO_CONFIGURE_STAGE, TourAction.ACTION_CREATED, TourState.HOW_TO_CONFIGURE_ACTION],
  [TourState.HOW_TO_CONFIGURE_STAGE, TourAction.ACTION_CREATED_WITH_STAGE, TourState.HOW_TO_CONFIGURE_ACTION],

  // [TourState.HOW_TO_CREATE_ACTION, TourAction.ACTION_CREATED, TourState.HOW_TO_CREATE_ACTION_ALTERNATE_WAY],

  // [TourState.HOW_TO_CREATE_ACTION_ALTERNATE_WAY, TourAction.ACTION_CREATED_ALTERNATE_WAY, TourState.HOW_TO_EDIT_ACTION],

  // [TourState.HOW_TO_EDIT_ACTION, TourAction.ACTION_EDITING, TourState.HOW_TO_CONFIGURE_ACTION],

  // [TourState.HOW_TO_CONFIGURE_ACTION, TourAction.ACTION_CONFIGURED, TourState.HOW_TO_CONFIGURE_VARIANTS],

  // [TourState.HOW_TO_CONFIGURE_VARIANTS, TourAction.ACTION_CLOSED, TourState.CONTROL_BUTTONS],

  // [TourState.CONTROL_BUTTONS, TourAction.NEXT, TourState.CONSTRAINT_BUTTONS],

  // [TourState.CONSTRAINT_BUTTONS, TourAction.NEXT, TourState.DONE],




  [TourState.INTRODUCTION, TourAction.DISMISS, TourState.DONE],
  [TourState.HOW_TO_CONFIGURE_STAGE, TourAction.DISMISS, TourState.DONE],
  [TourState.HOW_TO_CONFIGURE_STAGE___WITH_ACTION, TourAction.DISMISS, TourState.DONE],
  [TourState.HOW_TO_CREATE_ACTION, TourAction.DISMISS, TourState.DONE],
  [TourState.HOW_TO_CREATE_ACTION_WITH_STAGE, TourAction.DISMISS, TourState.DONE],
  [TourState.HOW_TO_EDIT_ACTION, TourAction.DISMISS, TourState.DONE],
  [TourState.HOW_TO_CONFIGURE_ACTION, TourAction.DISMISS, TourState.DONE],
  [TourState.HOW_TO_CONFIGURE_VARIANTS, TourAction.DISMISS, TourState.DONE],
  [TourState.CONTROL_BUTTONS, TourAction.DISMISS, TourState.DONE],
  [TourState.CONSTRAINT_BUTTONS, TourAction.DISMISS, TourState.DONE],
];
