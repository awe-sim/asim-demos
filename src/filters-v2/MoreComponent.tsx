import { Add, Search } from '@mui/icons-material';
import { Button, ButtonProps, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover, TextField } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Field, FIELD_DESCRIPTORS, filterStateV10 } from './types';

type Props = Omit<ButtonProps, 'onClick' | 'endIcon' | 'variant'>;

export const MoreComponent: React.FC<Props> = props => {
  //
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useRecoilState(filterStateV10);
  const fields = useMemo(() => filter.moreFields.map(field => [field, FIELD_DESCRIPTORS[field]] as const), [filter.moreFields]);
  const filteredFields = useMemo(() => fields.filter(([, descriptor]) => descriptor.label.toLowerCase().includes(search.toLowerCase())), [fields, search]);

  const onClick = useCallback(
    (field: Field) => {
      setFilter(prev => prev.addCondition(field));
      setAnchorEl(null);
    },
    [setFilter],
  );

  return (
    <>
      <Button {...props} onClick={ev => setAnchorEl(ev.currentTarget)} endIcon={<Add />} variant="outlined">
        More
      </Button>
      <Popover open={!!anchorEl} anchorEl={anchorEl} anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }} onClose={() => setAnchorEl(null)}>
        <List dense>
          <ListItem>
            <TextField variant="standard" size="small" placeholder="Search" InputProps={{ endAdornment: <Search /> }} value={search} onChange={ev => setSearch(ev.target.value)} fullWidth />
          </ListItem>
          {filteredFields.map(([field, descriptor]) => (
            <ListItemButton key={field} onClick={() => onClick(field)}>
              <ListItemIcon>{descriptor.icon}</ListItemIcon>
              <ListItemText primary={descriptor.label} />
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
};
