import { Abc, Numbers, Room, Sell, ToggleOn } from '@mui/icons-material';
import { immerable, produce } from 'immer';
import { atom } from 'recoil';
import { v4 } from 'uuid';

export enum Location {
  UK = 'UK',
  US = 'US',
  EU = 'EU',
  PK = 'PK',
}

export enum Tag {
  TAG_1 = 'TAG_1',
  TAG_2 = 'TAG_2',
  TAG_3 = 'TAG_3',
}

export type Data = {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly location: Location;
  readonly tags: Tag[];
  readonly isActive: boolean;
};

export type Field = keyof Omit<Data, 'id'>;
export type Value = string | number | boolean | Location | Tag;

export enum FieldType {
  STRING,
  NUMERIC,
  SINGLE_SELECT,
  MULTI_SELECT,
  BOOLEAN,
}

export enum Operator {
  EQUALS,
  NOT_EQUALS,
  GREATER_THAN,
  LESS_THAN,
  GREATER_THAN_OR_EQUALS,
  LESS_THAN_OR_EQUALS,
  CONTAINS,
  NOT_CONTAINS,
  STARTS_WITH,
  ENDS_WITH,
  IS_ANY_OF,
  IS_NONE_OF,
  IS_TRUE,
  IS_FALSE,
  IS_EMPTY,
  IS_NOT_EMPTY,
}

export const OPERATORS_LOOKUP: Record<Operator, string> = {
  [Operator.EQUALS]: 'equals',
  [Operator.NOT_EQUALS]: 'not equals',
  [Operator.GREATER_THAN]: 'greater than',
  [Operator.LESS_THAN]: 'less than',
  [Operator.GREATER_THAN_OR_EQUALS]: 'greater than or equals',
  [Operator.LESS_THAN_OR_EQUALS]: 'less than or equals',
  [Operator.CONTAINS]: 'contains',
  [Operator.NOT_CONTAINS]: 'not contains',
  [Operator.STARTS_WITH]: 'starts with',
  [Operator.ENDS_WITH]: 'ends with',
  [Operator.IS_ANY_OF]: 'is any of',
  [Operator.IS_NONE_OF]: 'is none of',
  [Operator.IS_TRUE]: 'is true',
  [Operator.IS_FALSE]: 'is false',
  [Operator.IS_EMPTY]: 'is empty',
  [Operator.IS_NOT_EMPTY]: 'is not empty',
};

export const OPERATORS_LOOKUP_2: Record<Operator, string> = {
  [Operator.EQUALS]: '=',
  [Operator.NOT_EQUALS]: '!=',
  [Operator.GREATER_THAN]: '>',
  [Operator.LESS_THAN]: '<',
  [Operator.GREATER_THAN_OR_EQUALS]: '≥',
  [Operator.LESS_THAN_OR_EQUALS]: '≤',
  [Operator.CONTAINS]: 'contains',
  [Operator.NOT_CONTAINS]: 'does not contain',
  [Operator.STARTS_WITH]: 'starts with',
  [Operator.ENDS_WITH]: 'ends with',
  [Operator.IS_ANY_OF]: 'is any of',
  [Operator.IS_NONE_OF]: 'is none of',
  [Operator.IS_TRUE]: 'is true',
  [Operator.IS_FALSE]: 'is false',
  [Operator.IS_EMPTY]: 'is empty',
  [Operator.IS_NOT_EMPTY]: 'is not empty',
};

export const TAGS_LOOKUP: Record<Tag, string> = {
  [Tag.TAG_1]: 'Tag 1',
  [Tag.TAG_2]: 'Tag 2',
  [Tag.TAG_3]: 'Tag 3',
};

export const UNARY_OPERATORS: Operator[] = [Operator.IS_TRUE, Operator.IS_FALSE, Operator.IS_EMPTY, Operator.IS_NOT_EMPTY];

export const BINARY_OPERATORS: Operator[] = [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUALS, Operator.LESS_THAN_OR_EQUALS, Operator.CONTAINS, Operator.NOT_CONTAINS, Operator.STARTS_WITH, Operator.ENDS_WITH, Operator.IS_ANY_OF, Operator.IS_NONE_OF];

export type FieldDescriptor = {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly type: FieldType;
  readonly operators: Operator[];
  readonly initialOperator: Operator;
  readonly allowOperatorChange: boolean;
  readonly allowOperatorSearch: boolean;
  readonly options?: Value[];
  readonly optionsLookup: Map<Value, string>;
  readonly initialOption?: Value;
  readonly allowOptionsSearch: boolean;
};

export const DATA: Data[] = [
  { id: '1', name: 'Item 1', quantity: 10, location: Location.UK, tags: [Tag.TAG_1], isActive: true },
  { id: '2', name: 'Item 2', quantity: 20, location: Location.US, tags: [Tag.TAG_2], isActive: false },
  { id: '3', name: 'Item 3', quantity: 30, location: Location.EU, tags: [Tag.TAG_3], isActive: true },
  { id: '4', name: 'Item 4', quantity: 40, location: Location.PK, tags: [Tag.TAG_1, Tag.TAG_2], isActive: false },
  { id: '5', name: 'Item 5', quantity: 50, location: Location.UK, tags: [Tag.TAG_2, Tag.TAG_3], isActive: true },
  { id: '6', name: 'Item 6', quantity: 60, location: Location.US, tags: [Tag.TAG_1, Tag.TAG_3], isActive: false },
  { id: '7', name: 'Item 7', quantity: 70, location: Location.EU, tags: [Tag.TAG_1, Tag.TAG_2, Tag.TAG_3], isActive: true },
  { id: '8', name: 'Item 8', quantity: 80, location: Location.PK, tags: [], isActive: false },
];

export const FIELD_DESCRIPTORS: Record<Field, FieldDescriptor> = {
  name: {
    label: 'Name',
    icon: <Abc />,
    type: FieldType.STRING,
    operators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.CONTAINS, Operator.NOT_CONTAINS, Operator.STARTS_WITH, Operator.ENDS_WITH, Operator.IS_EMPTY, Operator.IS_NOT_EMPTY],
    initialOperator: Operator.EQUALS,
    allowOperatorChange: true,
    allowOperatorSearch: true,
    optionsLookup: new Map(),
    allowOptionsSearch: false,
  },
  quantity: {
    label: 'Quantity',
    icon: <Numbers />,
    type: FieldType.NUMERIC,
    operators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUALS, Operator.LESS_THAN_OR_EQUALS],
    initialOperator: Operator.EQUALS,
    allowOperatorChange: true,
    allowOperatorSearch: true,
    optionsLookup: new Map(),
    allowOptionsSearch: false,
  },
  location: {
    label: 'Location',
    icon: <Room />,
    type: FieldType.SINGLE_SELECT,
    operators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IS_ANY_OF, Operator.IS_NONE_OF],
    initialOperator: Operator.EQUALS,
    allowOperatorChange: true,
    allowOperatorSearch: false,
    options: Object.values(Location),
    optionsLookup: new Map([
      [Location.UK, 'UK'],
      [Location.US, 'US'],
      [Location.EU, 'EU'],
      [Location.PK, 'PK'],
    ]),
    allowOptionsSearch: true,
  },
  tags: {
    label: 'Tags',
    icon: <Sell />,
    type: FieldType.MULTI_SELECT,
    operators: [Operator.IS_ANY_OF, Operator.IS_NONE_OF, Operator.IS_EMPTY, Operator.IS_NOT_EMPTY],
    initialOperator: Operator.IS_ANY_OF,
    allowOperatorChange: true,
    allowOperatorSearch: false,
    options: Object.values(Tag),
    optionsLookup: new Map([
      [Tag.TAG_1, 'Tag 1'],
      [Tag.TAG_2, 'Tag 2'],
      [Tag.TAG_3, 'Tag 3'],
    ]),
    allowOptionsSearch: true,
  },
  isActive: {
    label: 'Is Active',
    icon: <ToggleOn />,
    type: FieldType.BOOLEAN,
    operators: [Operator.IS_TRUE],
    initialOperator: Operator.IS_TRUE,
    allowOperatorChange: false,
    allowOperatorSearch: false,
    optionsLookup: new Map([
      [true, 'Yes'],
      [false, 'No'],
    ]),
    initialOption: true,
    allowOptionsSearch: false,
  },
};

export class FilterCondition {
  [immerable] = true;
  readonly id: string;
  readonly field: Field;
  readonly operator: Operator;
  readonly value?: Value;
  readonly canDelete: boolean;
  constructor(id: string, field: Field, operator: Operator, canDelete: boolean, value?: Value) {
    this.id = id;
    this.field = field;
    this.operator = operator;
    this.value = value;
    this.canDelete = canDelete;
  }
  setField(field: Field): FilterCondition {
    return produce(this, draft => {
      const oldFieldDescriptor = FIELD_DESCRIPTORS[draft.field];
      const newFieldDescriptor = FIELD_DESCRIPTORS[field];
      if (oldFieldDescriptor.type !== newFieldDescriptor.type && !newFieldDescriptor.operators.includes(draft.operator)) {
        draft.operator = newFieldDescriptor.initialOperator;
      }
      draft.field = field;
      draft.value = newFieldDescriptor.initialOption;
    });
  }
  setOperator(operator: Operator): FilterCondition {
    return produce(this, draft => {
      if (UNARY_OPERATORS.includes(operator)) {
        draft.value = undefined;
      } else if (BINARY_OPERATORS.includes(operator) && !BINARY_OPERATORS.includes(draft.operator)) {
        draft.value = FIELD_DESCRIPTORS[draft.field].initialOption;
      }
      draft.operator = operator;
    });
  }
  setValue(value: Value): FilterCondition {
    return produce(this, draft => {
      if (BINARY_OPERATORS.includes(draft.operator)) {
        switch (FIELD_DESCRIPTORS[draft.field].type) {
          case FieldType.STRING:
            draft.value = value || undefined;
            break;
          case FieldType.NUMERIC:
            if (typeof value === 'number') {
              draft.value = value;
            } else if (typeof value === 'string') {
              if (value === '') {
                draft.value = undefined;
              } else if (!isNaN(Number(value))) {
                draft.value = Number(value);
              } else {
                draft.value = undefined;
              }
            }
            break;
          case FieldType.SINGLE_SELECT:
            draft.value = FIELD_DESCRIPTORS[draft.field].options?.includes(value) ? value : undefined;
            break;
          case FieldType.MULTI_SELECT:
            draft.value = Array.isArray(value) && value.every(v => FIELD_DESCRIPTORS[draft.field].options?.includes(v)) ? value : undefined;
            break;
          case FieldType.BOOLEAN:
            draft.value = typeof value === 'boolean' ? value : undefined;
            break;
        }
      }
    });
  }
  clearValue(): FilterCondition {
    return produce(this, draft => {
      draft.value = FIELD_DESCRIPTORS[draft.field].initialOption;
    });
  }
  reset(): FilterCondition {
    return produce(this, draft => {
      draft.operator = FIELD_DESCRIPTORS[draft.field].initialOperator;
      draft.value = FIELD_DESCRIPTORS[draft.field].initialOption;
    });
  }
  get isComplete(): boolean {
    return this.value !== undefined || UNARY_OPERATORS.includes(this.operator);
  }
  evaluate(data: Data): boolean {
    const value = data[this.field];
    switch (this.operator) {
      case Operator.EQUALS:
        if (FIELD_DESCRIPTORS[this.field].type === FieldType.STRING && typeof value === 'string' && typeof this.value === 'string') {
          return value.toLowerCase() === this.value.toLowerCase();
        }
        return value === this.value;
      case Operator.NOT_EQUALS:
        if (FIELD_DESCRIPTORS[this.field].type === FieldType.STRING && typeof value === 'string' && typeof this.value === 'string') {
          return value.toLowerCase() !== this.value.toLowerCase();
        }
        return value !== this.value;
      case Operator.GREATER_THAN:
        if (this.value === undefined) return true;
        if (typeof value !== 'number') return false;
        if (typeof this.value !== 'number') return false;
        return value > this.value;
      case Operator.LESS_THAN:
        if (this.value === undefined) return true;
        if (typeof value !== 'number') return false;
        if (typeof this.value !== 'number') return false;
        return value < this.value;
      case Operator.GREATER_THAN_OR_EQUALS:
        if (this.value === undefined) return true;
        if (typeof value !== 'number') return false;
        if (typeof this.value !== 'number') return false;
        return value >= this.value;
      case Operator.LESS_THAN_OR_EQUALS:
        if (this.value === undefined) return true;
        if (typeof value !== 'number') return false;
        if (typeof this.value !== 'number') return false;
        return value <= this.value;
      case Operator.CONTAINS:
        if (this.value === undefined) return true;
        if (typeof value !== 'string') return false;
        if (typeof this.value !== 'string') return false;
        return value.toLowerCase().includes(this.value.toLowerCase());
      case Operator.NOT_CONTAINS:
        if (this.value === undefined) return true;
        if (typeof value !== 'string') return false;
        if (typeof this.value !== 'string') return false;
        return !value.toLowerCase().includes(this.value.toLowerCase());
      case Operator.STARTS_WITH:
        if (this.value === undefined) return true;
        if (typeof value !== 'string') return false;
        if (typeof this.value !== 'string') return false;
        return value.toLowerCase().startsWith(this.value.toLowerCase());
      case Operator.ENDS_WITH:
        if (this.value === undefined) return true;
        if (typeof value !== 'string') return false;
        if (typeof this.value !== 'string') return false;
        return value.toLowerCase().endsWith(this.value.toLowerCase());
      case Operator.IS_ANY_OF:
        if (this.value === undefined) return true;
        if (!Array.isArray(this.value)) return false;
        switch (FIELD_DESCRIPTORS[this.field].type) {
          case FieldType.SINGLE_SELECT:
            return this.value.includes(value);
          case FieldType.MULTI_SELECT:
            if (!Array.isArray(value)) return false;
            return this.value.every(v => value.includes(v));
        }
        return false;
      case Operator.IS_NONE_OF:
        if (this.value === undefined) return true;
        if (!Array.isArray(this.value)) return false;
        switch (FIELD_DESCRIPTORS[this.field].type) {
          case FieldType.SINGLE_SELECT:
            return !this.value.includes(value);
          case FieldType.MULTI_SELECT:
            if (!Array.isArray(value)) return false;
            return this.value.every(v => !value.includes(v));
        }
        return false;
      case Operator.IS_TRUE:
        return value === true;
      case Operator.IS_FALSE:
        return value === false;
      case Operator.IS_EMPTY:
        if (value === undefined) return true;
        if (typeof value === 'string') return value === '';
        if (Array.isArray(value)) return value.length === 0;
        return false;
      case Operator.IS_NOT_EMPTY:
        if (value === undefined) return false;
        if (typeof value === 'string') return value !== '';
        if (Array.isArray(value)) return value.length !== 0;
        return true;
    }
  }
  evaluateForList(data: Data[]): Data[] {
    return data.filter(d => this.evaluate(d));
  }
}

export class Filter {
  [immerable] = true;
  readonly searchText: string;
  readonly searchConditions: FilterCondition[];
  readonly conditions: FilterCondition[];
  readonly moreFields: Field[];
  constructor(searchText: string, searchConditions: FilterCondition[], conditions: FilterCondition[], moreFields: Field[]) {
    this.searchText = searchText;
    this.searchConditions = searchConditions;
    this.conditions = conditions;
    this.moreFields = moreFields;
  }
  setSearchText(searchText: string): Filter {
    return produce(this, draft => {
      draft.searchText = searchText;
      draft.searchConditions = draft.searchConditions.map(condition => condition.setValue(searchText));
    });
  }
  clearSearchText(): Filter {
    return produce(this, draft => {
      draft.searchText = '';
      draft.searchConditions = draft.searchConditions.map(condition => condition.clearValue());
    });
  }
  addCondition(field: Field): Filter {
    return produce(this, draft => {
      draft.conditions.push(new FilterCondition(v4(), field, FIELD_DESCRIPTORS[field].initialOperator, true, FIELD_DESCRIPTORS[field].initialOption));
    });
  }
  removeCondition(id: string): Filter {
    return produce(this, draft => {
      draft.conditions = draft.conditions.filter(condition => condition.id !== id || !condition.canDelete);
    });
  }
  setConditionField(id: string, field: Field): Filter {
    return produce(this, draft => {
      draft.conditions = draft.conditions.map(condition => (condition.id === id ? condition.setField(field) : condition));
    });
  }
  setConditionOperator(id: string, operator: Operator): Filter {
    return produce(this, draft => {
      draft.conditions = draft.conditions.map(condition => (condition.id === id ? condition.setOperator(operator) : condition));
    });
  }
  setConditionValue(id: string, value: Value): Filter {
    return produce(this, draft => {
      draft.conditions = draft.conditions.map(condition => (condition.id === id ? condition.setValue(value) : condition));
    });
  }
  resetCondition(id: string): Filter {
    return produce(this, draft => {
      draft.conditions = draft.conditions.map(condition => (condition.id === id ? condition.reset() : condition));
    });
  }
  evaluate(data: Data): boolean {
    const searchConditions = this.searchConditions.filter(c => c.isComplete);
    const conditions = this.conditions.filter(c => c.isComplete);
    if (searchConditions.length > 0 && !searchConditions.some(c => c.evaluate(data))) return false;
    if (conditions.length > 0 && !conditions.every(c => c.evaluate(data))) return false;
    return true;
  }
  evaluateForList(data: Data[]): Data[] {
    return data.filter(d => this.evaluate(d));
  }
  reset(): Filter {
    return produce(this, draft => {
      draft.searchText = '';
      draft.searchConditions.forEach(condition => condition.clearValue());
      draft.conditions.forEach(condition => condition.reset());
    });
  }
}

export const DEFAULT_FILTER = new Filter(
  //
  '',
  [new FilterCondition(v4(), 'name', Operator.CONTAINS, false), new FilterCondition(v4(), 'quantity', Operator.EQUALS, false)],
  [new FilterCondition(v4(), 'name', Operator.CONTAINS, false), new FilterCondition(v4(), 'quantity', Operator.EQUALS, false)],
  ['name', 'quantity', 'location', 'tags', 'isActive'],
);

export const filterStateV10 = atom<Filter>({
  key: 'filterStateV10',
  default: DEFAULT_FILTER,
});
