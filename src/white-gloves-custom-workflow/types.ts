export enum Type {
  START = 'START',
  NORMAL = 'NORMAL',
  AWAITING_REPLY = 'AWAITING_REPLY',
  ERROR = 'ERROR',
  DONE = 'DONE',
}

export enum ProcessConnection {
  AS2 = 'AS2',
  SFTP = 'SFTP',
  HTTP = 'HTTP',
  VAN = 'VAN',
  WEBHOOK = 'WEBHOOK',
}

export enum ProcessOrigin {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum ProcessDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export type State = {
  label: string;
  type: Type;
  isEditing: boolean;
  isToolbarShowing: boolean;
};

export type Action = {
  isEmailAction: boolean;
  // subActions: SubAction[];
  variants: Variant[];
};

export type SubAction = {
  label: string;
  emailTemplate: string;
  hasReminder: boolean;
  reminderEmailTemplate: string;
  constraintsConnectionsIn: ProcessConnection[];
  constraintsConnectionsNotIn: ProcessConnection[];
  constraintsOriginsIn: ProcessOrigin[];
  constraintsOriginsNotIn: ProcessOrigin[];
  constraintsDirectionsIn: ProcessDirection[];
  constraintsDirectionsNotIn: ProcessDirection[];
  constraintsStatesIn: string[];
  constraintsStatesNotIn: string[];
};

export type Variant = {
  label: string;
  emailTemplate: string;
  hasReminder: boolean;
  reminderEmailTemplate: string;
  constraintsConnectionsIn: ProcessConnection[];
  constraintsConnectionsNotIn: ProcessConnection[];
  constraintsOriginsIn: ProcessOrigin[];
  constraintsOriginsNotIn: ProcessOrigin[];
  constraintsDirectionsIn: ProcessDirection[];
  constraintsDirectionsNotIn: ProcessDirection[];
  constraintsStatesIn: string[];
  constraintsStatesNotIn: string[];
};
