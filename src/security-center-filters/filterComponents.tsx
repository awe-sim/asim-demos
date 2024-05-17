import { useRecoilState, useSetRecoilState } from 'recoil';
import { filterState, LogicType, Group, Rule, FIELD_TYPES, FIELD_LABELS, FieldType, OperatorType, OPERATOR_TYPES, OPERATOR_LABELS } from './filter';
import { Card, CardContent, CardHeader, MenuItem, Select, Stack, SelectChangeEvent, Button, Grid, TextField, IconButton } from '@mui/material';
import { useCallback } from 'react';
import React from 'react';
import { v4 } from 'uuid';
import { Add, DeleteOutline } from '@mui/icons-material';

export const FilterComponent: React.FC = () => {
  //
  const [filter, setFilter] = useRecoilState(filterState);

  const setLogic = useCallback(
    (event: SelectChangeEvent<LogicType>) => {
      setFilter(prev => prev.setLogic(event.target.value as LogicType));
    },
    [setFilter],
  );

  const addGroup = useCallback(() => {
    setFilter(prev => prev.addGroup(new Group(v4(), LogicType.AND, [new Rule(v4())])));
  }, [setFilter]);

  const addRule = useCallback(() => {
    setFilter(prev => prev.addRule(new Rule(v4())));
  }, [setFilter]);

  return (
    <Card
      elevation={3}
      style={{ width: '1000px', minWidth: '1000px' }}>
      <CardHeader title="Filter" />
      <CardContent>
        <Grid
          container
          spacing={2}>
          <Grid
            item
            xs={12}>
            <Stack
              direction="row"
              spacing={2}>
              {filter.conditions.length > 1 && (
                <Select
                  variant="outlined"
                  size="small"
                  style={{ width: '100px', minWidth: '100px' }}
                  value={filter.logic}
                  onChange={setLogic}>
                  <MenuItem value={LogicType.AND}>AND</MenuItem>
                  <MenuItem value={LogicType.OR}>OR</MenuItem>
                </Select>
              )}
              <div style={{ textAlign: 'right', width: '100%' }}>
                <Button
                  onClick={addRule}
                  variant="text"
                  size="small">
                  <Add /> Rule
                </Button>
                <Button
                  onClick={addGroup}
                  variant="text"
                  size="small">
                  <Add /> Group
                </Button>
              </div>
            </Stack>
          </Grid>
          {filter.conditions.map(condition => (
            <React.Fragment key={condition.id}>
              {condition instanceof Group && (
                <Grid
                  item
                  xs={12}>
                  <GroupComponent
                    group={condition}
                    shouldShowDelete={filter.conditions.length > 1}
                  />
                </Grid>
              )}
              {condition instanceof Rule && (
                <Grid
                  item
                  xs={12}>
                  <RuleComponent
                    rule={condition}
                    shouldShowDelete={filter.conditions.length > 1}
                  />
                </Grid>
              )}
            </React.Fragment>
          ))}
          <Grid
            item
            xs={12}>
            <pre style={{ padding: '10px', border: '1px solid #c0c0c0', borderRadius: '6px', backgroundColor: '#f0f0f0', whiteSpace: 'normal' }}>{filter.print()}</pre>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// ------------------------------------------------------------------------------------------------

type GroupProps = {
  group: Group;
  shouldShowDelete: boolean;
};
export const GroupComponent: React.FC<GroupProps> = ({ group, shouldShowDelete }) => {
  //
  const setFilter = useSetRecoilState(filterState);

  const setLogic = useCallback(
    (event: SelectChangeEvent<LogicType>) => {
      setFilter(prev => prev.setGroupLogic(group.id, event.target.value as LogicType));
    },
    [group.id, setFilter],
  );

  const addGroup = useCallback(() => {
    setFilter(prev => prev.addGroup(new Group(v4(), LogicType.AND, [new Rule(v4())]), group.id));
  }, [group.id, setFilter]);

  const addRule = useCallback(() => {
    setFilter(prev => prev.addRule(new Rule(v4()), group.id));
  }, [group.id, setFilter]);

  const deleteGroup = useCallback(() => {
    setFilter(prev => prev.removeGroup(group.id));
  }, [group.id, setFilter]);

  return (
    <Card elevation={3}>
      <CardContent>
        <Grid
          container
          spacing={2}>
          <Grid
            item
            xs={12}>
            <Stack
              direction="row"
              spacing={2}>
              {group.conditions.length > 1 && (
                <Select
                  variant="outlined"
                  size="small"
                  style={{ width: '100px', minWidth: '100px' }}
                  value={group.logic}
                  onChange={setLogic}>
                  <MenuItem value={LogicType.AND}>AND</MenuItem>
                  <MenuItem value={LogicType.OR}>OR</MenuItem>
                </Select>
              )}
              <div style={{ textAlign: 'right', width: '100%' }}>
                <Button
                  onClick={addRule}
                  variant="text"
                  size="small">
                  <Add /> Rule
                </Button>
                <Button
                  onClick={addGroup}
                  variant="text"
                  size="small">
                  <Add /> Group
                </Button>
                {shouldShowDelete && (
                  <IconButton
                    onClick={deleteGroup}
                    size="small"
                    color="error">
                    <DeleteOutline />
                  </IconButton>
                )}
              </div>
            </Stack>
          </Grid>
          {group.conditions.map(condition => (
            <React.Fragment key={condition.id}>
              {condition instanceof Group && (
                <Grid
                  item
                  xs={12}>
                  <GroupComponent
                    group={condition}
                    shouldShowDelete={group.conditions.length > 1}
                  />
                </Grid>
              )}
              {condition instanceof Rule && (
                <Grid
                  item
                  xs={12}>
                  <RuleComponent
                    rule={condition}
                    shouldShowDelete={group.conditions.length > 1}
                  />
                </Grid>
              )}
            </React.Fragment>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// ------------------------------------------------------------------------------------------------

type RuleProps = {
  rule: Rule;
  shouldShowDelete: boolean;
};
export const RuleComponent: React.FC<RuleProps> = ({ rule, shouldShowDelete }) => {
  //
  const setFilter = useSetRecoilState(filterState);

  return (
    <Stack
      direction="row"
      spacing={2}>
      <FieldComponent rule={rule} />
      <OperatorComponent rule={rule} />
      <OperandComponent rule={rule} />
      {shouldShowDelete && (
        <div style={{ textAlign: 'right', width: '100%' }}>
          <IconButton
            onClick={() => setFilter(prev => prev.removeRule(rule.id))}
            size="small"
            color="error">
            <DeleteOutline />
          </IconButton>
        </div>
      )}
    </Stack>
  );
};

// ------------------------------------------------------------------------------------------------

type FieldProps = {
  rule: Rule;
};
export const FieldComponent: React.FC<FieldProps> = ({ rule }) => {
  //
  const setFilter = useSetRecoilState(filterState);

  return (
    <Select
      variant="outlined"
      size="small"
      style={{ width: '225px', minWidth: '225px' }}
      value={rule.field ?? ''}
      onChange={ev => setFilter(prev => prev.setRuleField(rule.id, ev.target.value as FieldType))}>
      {FIELD_TYPES.map(fieldType => (
        <MenuItem
          key={fieldType}
          value={fieldType}>
          {FIELD_LABELS[fieldType]}
        </MenuItem>
      ))}
    </Select>
  );
};

// ------------------------------------------------------------------------------------------------

type OperatorProps = {
  rule: Rule;
};
export const OperatorComponent: React.FC<OperatorProps> = ({ rule }) => {
  //
  const setFilter = useSetRecoilState(filterState);
  const operatorTypes = rule.field !== undefined ? OPERATOR_TYPES[rule.field] : [];

  if (rule.field === undefined) return null;

  return (
    <Select
      variant="outlined"
      size="small"
      style={{ width: '225px', minWidth: '225px' }}
      value={rule.operator ?? ''}
      onChange={ev => setFilter(prev => prev.setRuleOperator(rule.id, ev.target.value as OperatorType))}>
      {operatorTypes.map(operatorType => (
        <MenuItem
          key={operatorType}
          value={operatorType}>
          {OPERATOR_LABELS[operatorType]}
        </MenuItem>
      ))}
    </Select>
  );
};

// ------------------------------------------------------------------------------------------------

type OperandProps = {
  rule: Rule;
};
export const OperandComponent: React.FC<OperandProps> = ({ rule }) => {
  //
  const setFilter = useSetRecoilState(filterState);

  if (rule.field === undefined || rule.operator === undefined) return null;

  switch (rule.field) {
    case FieldType.PROCESS_CODE:
      switch (rule.operator) {
        case OperatorType.STRING_EQUALS:
        case OperatorType.STRING_NOT_EQUALS:
        case OperatorType.STRING_CONTAINS:
        case OperatorType.STRING_DOES_NOT_CONTAIN:
          return (
            <TextField
              size="small"
              placeholder="Enter value"
              style={{ width: '225px', minWidth: '225px' }}
              value={typeof rule.operand === 'string' ? rule.operand : ''}
              onChange={ev => setFilter(prev => prev.setRuleOperand(rule.id, ev.target.value))}
            />
          );
        case OperatorType.IS_EMPTY:
        case OperatorType.IS_NOT_EMPTY:
          break;
      }
      break;
    case FieldType.PROCESS_NAME:
      switch (rule.operator) {
        case OperatorType.STRING_EQUALS:
        case OperatorType.STRING_NOT_EQUALS:
        case OperatorType.STRING_CONTAINS:
        case OperatorType.STRING_DOES_NOT_CONTAIN:
          return (
            <TextField
              size="small"
              placeholder="Enter value"
              style={{ width: '225px', minWidth: '225px' }}
              value={typeof rule.operand === 'string' ? rule.operand : ''}
              onChange={ev => setFilter(prev => prev.setRuleOperand(rule.id, ev.target.value))}
            />
          );
        case OperatorType.IS_EMPTY:
        case OperatorType.IS_NOT_EMPTY:
          break;
      }
      break;
    case FieldType.TYPE:
      switch (rule.operator) {
        case OperatorType.STRING_EQUALS:
        case OperatorType.STRING_NOT_EQUALS:
          return (
            <Select
              size="small"
              style={{ width: '225px', minWidth: '225px' }}
              value={typeof rule.operand === 'string' ? rule.operand : ''}
              onChange={ev => setFilter(prev => prev.setRuleOperand(rule.id, ev.target.value))}>
              <MenuItem value="AS2">AS2</MenuItem>
              <MenuItem value="SFTP">SFTP</MenuItem>
              <MenuItem value="HTTP">HTTP</MenuItem>
              <MenuItem value="VAN">VAN</MenuItem>
            </Select>
          );
        case OperatorType.IS_ANY_OF:
        case OperatorType.IS_NONE_OF:
          return (
            <Select
              size="small"
              multiple
              style={{ width: '225px', minWidth: '225px' }}
              value={rule.operand instanceof Array ? rule.operand : []}
              onChange={ev => setFilter(prev => prev.setRuleOperand(rule.id, ev.target.value))}>
              <MenuItem value="AS2">AS2</MenuItem>
              <MenuItem value="SFTP">SFTP</MenuItem>
              <MenuItem value="HTTP">HTTP</MenuItem>
              <MenuItem value="VAN">VAN</MenuItem>
            </Select>
          );
      }
      break;
    case FieldType.STATUS:
      switch (rule.operator) {
        case OperatorType.STRING_EQUALS:
        case OperatorType.STRING_NOT_EQUALS:
          return (
            <Select
              size="small"
              style={{ width: '225px', minWidth: '225px' }}
              value={typeof rule.operand === 'string' ? rule.operand : ''}
              onChange={ev => setFilter(prev => prev.setRuleOperand(rule.id, ev.target.value))}>
              <MenuItem value="SUCCESS">Success</MenuItem>
              <MenuItem value="FAILURE">Failure</MenuItem>
            </Select>
          );
        case OperatorType.IS_ANY_OF:
        case OperatorType.IS_NONE_OF:
          return (
            <Select
              size="small"
              multiple
              style={{ width: '225px', minWidth: '225px' }}
              value={rule.operand instanceof Array ? rule.operand : []}
              onChange={ev => setFilter(prev => prev.setRuleOperand(rule.id, ev.target.value))}>
              <MenuItem value="SUCCESS">Success</MenuItem>
              <MenuItem value="FAILURE">Failure</MenuItem>
            </Select>
          );
      }
      break;
    case FieldType.TRANSACTION_AMOUNT:
      switch (rule.operator) {
        case OperatorType.EQUALS:
        case OperatorType.NOT_EQUALS:
        case OperatorType.GREATER_THAN:
        case OperatorType.GREATER_THAN_OR_EQUAL:
        case OperatorType.LESS_THAN:
        case OperatorType.LESS_THAN_OR_EQUAL:
          return (
            <TextField
              size="small"
              placeholder="Enter value"
              style={{ width: '225px', minWidth: '225px' }}
              value={typeof rule.operand === 'number' ? rule.operand : 0}
              type="number"
              onChange={ev => setFilter(prev => prev.setRuleOperand(rule.id, +ev.target.value))}
            />
          );
          break;
      }
      break;
    case FieldType.LOCATION:
      switch (rule.operator) {
        case OperatorType.STRING_EQUALS:
        case OperatorType.STRING_NOT_EQUALS:
          return (
            <Select
              size="small"
              style={{ width: '225px', minWidth: '225px' }}
              value={typeof rule.operand === 'string' ? rule.operand : ''}
              onChange={ev => setFilter(prev => prev.setRuleOperand(rule.id, ev.target.value))}>
              <MenuItem value="US">United States</MenuItem>
              <MenuItem value="UK">United Kingdom</MenuItem>
              <MenuItem value="PK">Pakistan</MenuItem>
            </Select>
          );
        case OperatorType.IS_ANY_OF:
        case OperatorType.IS_NONE_OF:
          return (
            <Select
              size="small"
              multiple
              style={{ width: '225px', minWidth: '225px' }}
              value={rule.operand instanceof Array ? rule.operand : []}
              onChange={ev => setFilter(prev => prev.setRuleOperand(rule.id, ev.target.value))}>
              <MenuItem value="US">United States</MenuItem>
              <MenuItem value="UK">United Kingdom</MenuItem>
              <MenuItem value="PK">Pakistan</MenuItem>
            </Select>
          );
      }
      break;
  }
};
