export enum Type {
  START = 'START',
  NORMAL = 'NORMAL',
  AWAITING_REPLY = 'AWAITING_REPLY',
  ERROR = 'ERROR',
  DONE = 'DONE',
}

export enum ProcessConnection {
  AS2 = 'AS2',
  SFTP_INTERNAL = 'SFTP_INTERNAL',
  SFTP_EXTERNAL = 'SFTP_EXTERNAL',
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
  variants: Variant[];
};

export type Variant = {
  label: string;
  emailTemplate: string;
  hasReminder: boolean;
  reminderEmailTemplate: string;
  hasConstraints: boolean;
  constraintsConnectionsIn: ProcessConnection[];
  constraintsConnectionsNotIn: ProcessConnection[];
  constraintsOriginsIn: ProcessOrigin[];
  constraintsOriginsNotIn: ProcessOrigin[];
  constraintsDirectionsIn: ProcessDirection[];
  constraintsDirectionsNotIn: ProcessDirection[];
  constraintsStatesIn: string[];
  constraintsStatesNotIn: string[];
};

export type ConnectionStatus = Record<ProcessConnection, boolean>;
