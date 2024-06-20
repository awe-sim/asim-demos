import { Button, ButtonProps, Checkbox, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover, TextField } from '@mui/material';
import { BINARY_OPERATORS, FIELD_DESCRIPTORS, FieldType, FilterCondition, filterStateV10, Operator, OPERATORS_LOOKUP, OPERATORS_LOOKUP_2, Tag, TAGS_LOOKUP, Value } from './types';
import { Check, Close, KeyboardArrowDown, KeyboardArrowRight, Search } from '@mui/icons-material';
import { prevent } from '../common/helpers';
import { useSetRecoilState } from 'recoil';
import { useCallback, useMemo, useState } from 'react';

type Props = Omit<ButtonProps, 'onClick' | 'endIcon' | 'variant'> & {
  condition: FilterCondition;
};

export const ConditionComponent: React.FC<Props> = ({ condition, ...props }) => {
  //
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState<string>('');
  const [anchorElOperator, setAnchorElOperator] = useState<null | HTMLElement>(null);
  const [searchOperator, setSearchOperator] = useState<string>('');
  const setFilter = useSetRecoilState(filterStateV10);

  const descriptor = useMemo(() => FIELD_DESCRIPTORS[condition.field], [condition.field]);
  const filteredOperators = useMemo(() => descriptor.operators.filter(operator => !searchOperator || OPERATORS_LOOKUP[operator].toLowerCase().includes(searchOperator.toLowerCase())), [descriptor.operators, searchOperator]);
  const filteredOptions = useMemo(() => descriptor.options?.filter(option => !search || option.toString().toLowerCase().includes(search.toLowerCase())) || [], [descriptor.options, search]);

  const onClickRemove = useCallback(
    (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setFilter(prev => prev.removeCondition(condition.id));
      prevent(ev);
    },
    [condition.id, setFilter],
  );

  const onClickOperator = useCallback(
    (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setAnchorElOperator(ev.currentTarget);
    },
    [setAnchorElOperator],
  );

  const onSelectOperator = useCallback(
    (operator: Operator) => {
      setFilter(prev => prev.setConditionOperator(condition.id, operator));
      setAnchorElOperator(null);
    },
    [condition.id, setFilter],
  );

  const onSelectValue = useCallback(
    (value: Value) => {
      setFilter(prev => prev.setConditionValue(condition.id, value));
      setAnchorEl(null);
    },
    [condition.id, setFilter],
  );

  const onCheckTag = useCallback(
    (tag: Tag) => {
      setFilter(prev => {
        if (Array.isArray(condition.value)) {
          if (condition.value.includes(tag)) {
            return prev.setConditionValue(condition.id, condition.value.filter(value => value !== tag) as unknown as Value);
          } else {
            return prev.setConditionValue(condition.id, [...condition.value, tag] as unknown as Value);
          }
        } else {
          return prev.setConditionValue(condition.id, [tag] as unknown as Value);
        }
      });
    },
    [condition.id, condition.value, setFilter],
  );

  const onReset = useCallback(() => {
    setFilter(prev => prev.resetCondition(condition.id));
    setAnchorEl(null);
  }, [condition.id, setFilter]);

  return (
    <>
      <Button {...props} onClick={ev => setAnchorEl(ev.currentTarget)} endIcon={<KeyboardArrowDown />} variant={condition.isComplete ? 'contained' : 'outlined'}>
        {!condition.isComplete && FIELD_DESCRIPTORS[condition.field].label}
        {condition.isComplete && BINARY_OPERATORS.includes(condition.operator) && `${FIELD_DESCRIPTORS[condition.field].label} ${OPERATORS_LOOKUP_2[condition.operator]} ${condition.value}`}
        {condition.isComplete && !BINARY_OPERATORS.includes(condition.operator) && `${FIELD_DESCRIPTORS[condition.field].label} ${OPERATORS_LOOKUP_2[condition.operator]}`}
        {condition.canDelete && (
          <IconButton size="small" color="default" onClick={onClickRemove}>
            <Close fontSize="small" />
          </IconButton>
        )}
      </Button>

      <Popover open={!!anchorEl} anchorEl={anchorEl} anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }} onClose={() => setAnchorEl(null)}>
        <List dense>
          {descriptor.allowOperatorChange && (
            <ListItemButton onClick={onClickOperator}>
              <ListItemText primary={OPERATORS_LOOKUP[condition.operator]} />
              <KeyboardArrowRight />
            </ListItemButton>
          )}
          {!descriptor.allowOperatorChange && (
            <ListItem>
              <ListItemText primary={OPERATORS_LOOKUP[condition.operator]} />
            </ListItem>
          )}
          <Divider />
          {descriptor.type === FieldType.STRING && BINARY_OPERATORS.includes(condition.operator) && (
            <ListItem>
              <TextField variant="standard" size="small" placeholder="Enter value" value={condition.value || ''} onChange={ev => setFilter(prev => prev.setConditionValue(condition.id, ev.target.value))} fullWidth />
            </ListItem>
          )}
          {descriptor.type === FieldType.NUMERIC && BINARY_OPERATORS.includes(condition.operator) && (
            <ListItem>
              <TextField type="number" variant="standard" size="small" placeholder="Enter value" value={condition.value || ''} onChange={ev => setFilter(prev => prev.setConditionValue(condition.id, ev.target.value))} fullWidth />
            </ListItem>
          )}
          {descriptor.type === FieldType.SINGLE_SELECT && BINARY_OPERATORS.includes(condition.operator) && (
            <>
              {descriptor.allowOptionsSearch && (
                <ListItem>
                  <TextField variant="standard" size="small" placeholder="Search" InputProps={{ endAdornment: <Search /> }} value={search} onChange={ev => setSearch(ev.target.value)} fullWidth />
                </ListItem>
              )}
              {filteredOptions.map((option, index) => (
                <ListItemButton key={index} selected={condition.value === option} onClick={() => onSelectValue(option)}>
                  <ListItemText primary={option} />
                  {condition.value === option && <Check />}
                </ListItemButton>
              ))}
            </>
          )}
          {descriptor.type === FieldType.MULTI_SELECT && BINARY_OPERATORS.includes(condition.operator) && (
            <>
              {descriptor.allowOptionsSearch && (
                <ListItem>
                  <TextField variant="standard" size="small" placeholder="Search" InputProps={{ endAdornment: <Search /> }} value={search} onChange={ev => setSearch(ev.target.value)} fullWidth />
                </ListItem>
              )}
              {filteredOptions.map((option, index) => (
                <ListItemButton key={index} selected={condition.value === option} onClick={() => onSelectValue(option)}>
                  <ListItemIcon>
                    <Checkbox edge="start" checked={((condition.value as unknown as Tag[]) ?? []).includes(option as unknown as Tag)} onChange={() => onCheckTag(option as Tag)} tabIndex={-1} disableRipple />
                  </ListItemIcon>
                  <ListItemText primary={TAGS_LOOKUP[option as unknown as Tag]} />
                </ListItemButton>
              ))}
            </>
          )}
          {condition.isComplete && (
            <>
              <Divider />
              <ListItemButton onClick={onReset}>
                <ListItemText primary="Reset" />
              </ListItemButton>
            </>
          )}
        </List>
      </Popover>

      <Popover open={!!anchorElOperator} anchorEl={anchorElOperator} anchorOrigin={{ horizontal: 'right', vertical: 'top' }} onClose={() => setAnchorElOperator(null)}>
        <List dense>
          {descriptor.allowOperatorSearch && (
            <ListItem>
              <TextField variant="standard" size="small" placeholder="Search" InputProps={{ endAdornment: <Search /> }} value={searchOperator} onChange={ev => setSearchOperator(ev.target.value)} fullWidth />
            </ListItem>
          )}
          {filteredOperators.map(operator => (
            <ListItemButton key={operator} onClick={() => onSelectOperator(operator)}>
              <ListItemText primary={OPERATORS_LOOKUP[operator]} />
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
};
