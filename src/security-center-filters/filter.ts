import { Draft, immerable, produce } from 'immer';
import { atom, AtomEffect } from 'recoil';
import { v4 } from 'uuid';

export enum LogicType {
  AND = 'AND',
  OR = 'OR',
}

export enum ConditionType {
  GROUP,
  RULE,
}

export enum FieldType {
  PROCESS_CODE = 'PROCESS_CODE',
  PROCESS_NAME = 'PROCESS_NAME',
  TYPE = 'TYPE',
  STATUS = 'STATUS',
  TRANSACTION_AMOUNT = 'TRANSACTION_AMOUNT',
  LOCATION = 'LOCATION',
}
export const FIELD_LABELS = {
  [FieldType.PROCESS_CODE]: 'Process Code',
  [FieldType.PROCESS_NAME]: 'Process Name',
  [FieldType.TYPE]: 'Type',
  [FieldType.STATUS]: 'Status',
  [FieldType.TRANSACTION_AMOUNT]: 'Transaction Amount',
  [FieldType.LOCATION]: 'Location',
};
export const FIELD_TYPES: FieldType[] = [FieldType.PROCESS_CODE, FieldType.PROCESS_NAME, FieldType.TYPE, FieldType.STATUS, FieldType.TRANSACTION_AMOUNT, FieldType.LOCATION];

export enum OperatorType {
  EQUALS = '=',
  NOT_EQUALS = '<>',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  STRING_EQUALS = 'EQ',
  STRING_NOT_EQUALS = 'NE',
  STRING_CONTAINS = 'CONTAINS',
  STRING_DOES_NOT_CONTAIN = 'NOT_CONTAINS',
  IS_EMPTY = 'IS_EMPTY',
  IS_NOT_EMPTY = 'NOT_EMPTY',
  IS_ANY_OF = 'IN',
  IS_NONE_OF = 'NOT_IN',
}
export const OPERATOR_LABELS = {
  [OperatorType.EQUALS]: '=',
  [OperatorType.NOT_EQUALS]: '!=',
  [OperatorType.GREATER_THAN]: '>',
  [OperatorType.GREATER_THAN_OR_EQUAL]: '≥',
  [OperatorType.LESS_THAN]: '<',
  [OperatorType.LESS_THAN_OR_EQUAL]: '≤',
  [OperatorType.STRING_EQUALS]: 'equals',
  [OperatorType.STRING_NOT_EQUALS]: 'does not equal',
  [OperatorType.STRING_CONTAINS]: 'contains',
  [OperatorType.STRING_DOES_NOT_CONTAIN]: 'does not contain',
  [OperatorType.IS_EMPTY]: 'is empty',
  [OperatorType.IS_NOT_EMPTY]: 'is not empty',
  [OperatorType.IS_ANY_OF]: 'is any of',
  [OperatorType.IS_NONE_OF]: 'is none of',
};
export const OPERATOR_TYPES: { [key in FieldType]: OperatorType[] } = {
  [FieldType.PROCESS_CODE]: [OperatorType.STRING_EQUALS, OperatorType.STRING_NOT_EQUALS, OperatorType.STRING_CONTAINS, OperatorType.STRING_DOES_NOT_CONTAIN, OperatorType.IS_EMPTY, OperatorType.IS_NOT_EMPTY],
  [FieldType.PROCESS_NAME]: [OperatorType.STRING_EQUALS, OperatorType.STRING_NOT_EQUALS, OperatorType.STRING_CONTAINS, OperatorType.STRING_DOES_NOT_CONTAIN],
  [FieldType.TYPE]: [OperatorType.STRING_EQUALS, OperatorType.STRING_NOT_EQUALS, OperatorType.IS_ANY_OF, OperatorType.IS_NONE_OF],
  [FieldType.STATUS]: [OperatorType.STRING_EQUALS, OperatorType.STRING_NOT_EQUALS, OperatorType.IS_ANY_OF, OperatorType.IS_NONE_OF],
  [FieldType.TRANSACTION_AMOUNT]: [OperatorType.EQUALS, OperatorType.NOT_EQUALS, OperatorType.GREATER_THAN, OperatorType.GREATER_THAN_OR_EQUAL, OperatorType.LESS_THAN, OperatorType.LESS_THAN_OR_EQUAL],
  [FieldType.LOCATION]: [OperatorType.STRING_EQUALS, OperatorType.STRING_NOT_EQUALS, OperatorType.IS_ANY_OF, OperatorType.IS_NONE_OF],
};

export enum EOperand {
  STRING,
  NUMBER,
  BOOLEAN,
  DATE_TIME,
  SINGLE_SELECT,
  MULTI_SELECT,
}

type TFilter = {
  logic: LogicType;
  conditions: (TGroup | TRule)[];
};
type TGroup = {
  type: ConditionType.GROUP;
  id: string;
  logic: LogicType;
  conditions: (TGroup | TRule)[];
};
type TRule = {
  type: ConditionType.RULE;
  id: string;
  field?: FieldType;
  operator?: OperatorType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operand?: any;
};

export class Filter {
  [immerable] = true;
  readonly logic: LogicType;
  readonly conditions: (Group | Rule)[];
  constructor(logic: LogicType, conditions: (Group | Rule)[]) {
    this.logic = logic;
    this.conditions = conditions;
  }
  setLogic(logic: LogicType): Filter {
    return produce(this, draft => {
      draft.logic = logic;
    });
  }
  addGroup(group: Group, parentId?: string): Filter {
    return produce(this, draft => {
      if (parentId) {
        const parent = this._findGroupById(draft, parentId);
        parent?.conditions.push(group);
      } else {
        draft.conditions.push(group);
      }
    });
  }
  addRule(rule: Rule, parentId?: string): Filter {
    return produce(this, draft => {
      if (parentId) {
        const parent = this._findGroupById(draft, parentId);
        parent?.conditions.push(rule);
      } else {
        draft.conditions.push(rule);
      }
    });
  }
  removeGroup(id: string): Filter {
    return produce(this, draft => {
      const parent = this._findParentForId(draft, id);
      if (parent) {
        parent.conditions = parent.conditions.filter(condition => condition.id !== id);
      }
    });
  }
  removeRule(id: string): Filter {
    return produce(this, draft => {
      const parent = this._findParentForId(draft, id);
      if (parent) {
        parent.conditions = parent.conditions.filter(condition => condition.id !== id);
      }
    });
  }
  setGroupLogic(id: string, logic: LogicType): Filter {
    return produce(this, draft => {
      const group = this._findGroupById(draft, id);
      group?.setLogic(logic);
    });
  }
  setRuleField(id: string, field: FieldType): Filter {
    return produce(this, draft => {
      const rule = this._findRuleById(draft, id);
      rule?.setField(field);
    });
  }
  setRuleOperator(id: string, operator: OperatorType): Filter {
    return produce(this, draft => {
      const rule = this._findRuleById(draft, id);
      rule?.setOperator(operator);
    });
  }
  setRuleOperand(id: string, operand: unknown): Filter {
    return produce(this, draft => {
      const rule = this._findRuleById(draft, id);
      rule?.setOperand(operand);
    });
  }

  private _findGroupById(draft: Draft<Filter | Group>, id: string): Draft<Group> | undefined {
    for (const condition of draft.conditions) {
      if (condition instanceof Group) {
        if (condition.id === id) return condition;
        const result = this._findGroupById(condition, id);
        if (result) return result;
      }
    }
  }
  private _findRuleById(draft: Draft<Filter | Group>, id: string): Draft<Rule> | undefined {
    for (const condition of draft.conditions) {
      if (condition instanceof Rule) {
        if (condition.id === id) return condition;
      } else if (condition instanceof Group) {
        const result = this._findRuleById(condition, id);
        if (result) return result;
      }
    }
  }
  private _findParentForId(draft: Draft<Filter | Group>, id: string): Draft<Filter | Group> | undefined {
    for (const condition of draft.conditions) {
      if (condition.id === id) return draft;
      if (condition instanceof Group) {
        const result = this._findParentForId(condition, id);
        if (result) return result;
      }
    }
  }
  print(): string {
    return `WHERE ${this.conditions.map(condition => condition.print()).join(` ${this.logic} `)}`;
  }
  toJSON(): TFilter {
    return {
      logic: this.logic,
      conditions: this.conditions.map(condition => condition.toJSON()),
    };
  }
  static fromJSON(json: TFilter): Filter {
    return new Filter(
      json.logic,
      json.conditions.map(condition => (condition.type === ConditionType.GROUP ? Group.fromJSON(condition as TGroup) : Rule.fromJSON(condition as TRule))),
    );
  }
}

export class Group {
  [immerable] = true;
  readonly id: string;
  logic: LogicType;
  readonly conditions: (Group | Rule)[];
  constructor(id: string, logic: LogicType, conditions: (Group | Rule)[]) {
    this.id = id;
    this.logic = logic;
    this.conditions = conditions;
  }
  setLogic(logic: LogicType) {
    this.logic = logic;
  }
  addGroup(group: Group) {
    this.conditions.push(group);
  }
  addRule(rule: Rule) {
    this.conditions.push(rule);
  }
  print(): string {
    return `(${this.conditions.map(condition => condition.print()).join(` ${this.logic} `)})`;
  }
  toJSON(): TGroup {
    return {
      type: ConditionType.GROUP,
      id: this.id,
      logic: this.logic,
      conditions: this.conditions.map(condition => condition.toJSON()),
    };
  }
  static fromJSON(json: TGroup): Group {
    return new Group(
      json.id,
      json.logic,
      json.conditions.map(condition => ((condition as TRule).field ? Rule.fromJSON(condition as TRule) : Group.fromJSON(condition as TGroup))),
    );
  }
}

export class Rule {
  [immerable] = true;
  readonly id: string;
  field?: FieldType;
  operator?: OperatorType;
  operand?: unknown;
  constructor(id: string, field?: FieldType, operator?: OperatorType, operand?: unknown) {
    this.id = id;
    this.field = field;
    this.operator = operator;
    this.operand = operand;
  }
  setField(field?: FieldType) {
    this.field = field;
  }
  setOperator(operator?: OperatorType) {
    this.operator = operator;
  }
  setOperand(operand?: unknown) {
    this.operand = operand;
  }
  print(): string {
    switch (this.operator) {
      case OperatorType.IS_EMPTY:
      case OperatorType.IS_NOT_EMPTY:
        if (this.field !== undefined && this.operator !== undefined) return `(${this.field} ${this.operator})`;
        break;
      default:
        if (this.field !== undefined && this.operator !== undefined && this.operand !== undefined) return `(${this.field} ${this.operator} ${JSON.stringify(this.operand)})`;
        break;
    }
    return '(INCOMPLETE_RULE)';
  }
  toJSON(): TRule {
    return {
      type: ConditionType.RULE,
      id: this.id,
      field: this.field,
      operator: this.operator,
      operand: this.operand,
    };
  }
  static fromJSON(json: TRule): Rule {
    return new Rule(json.id, json.field, json.operator, json.operand);
  }
}

type LocalStorageEffectConfig<T> = {
  key: string;
  parse?: (value: string) => T;
  stringify?: (value: T) => string;
};
export function localStorageEffect<T>({ key, parse, stringify }: LocalStorageEffectConfig<T>): AtomEffect<T> {
  return ({ onSet, resetSelf, setSelf }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue !== null) {
      setSelf(parse ? parse(savedValue) : JSON.parse(savedValue));
    } else {
      resetSelf();
    }
    onSet((newValue, _oldValue, isReset) => {
      if (isReset) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, stringify ? stringify(newValue) : JSON.stringify(newValue));
      }
    });
  };
}

const FILTER = new Filter(LogicType.AND, [new Rule(v4())]);
export const filterState = atom<Filter>({
  key: 'filterState',
  default: FILTER,
  effects_UNSTABLE: [
    localStorageEffect({
      key: 'filterState',
      parse: value => Filter.fromJSON(JSON.parse(value)),
      stringify: value => JSON.stringify(value),
    }),
  ],
});
