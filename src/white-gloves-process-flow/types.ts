import { Draft } from 'immer';

export enum Origin {
  INTERNAL = 'Internal',
  EXTERNAL = 'External',
  BOTH = 'Internal+External',
}

export enum Direction {
  INBOUND = 'Inbound',
  OUTBOUND = 'Outbound',
}

export enum Connection {
  AS2 = 'AS2',
  SFTP = 'SFTP',
  HTTP = 'HTTP',
  VAN = 'VAN',
}

export enum StateFlags {
  ALONG_MAIN_PATH,
  AWAITING_REPLY,
  ERROR_STATE,
  START_STATE,
  END_STATE,
}

export enum ActionFlags {
  RELEASE_ACTION,
  EMAIL_ACTION,
  SAVE_STATE,
  RESTORE_STATE,
}

export type FnRecipe<T> = (draft: Draft<T>) => void;
