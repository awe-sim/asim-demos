import { ListItem, ListItemText, Stack, Button, Tooltip } from '@mui/material';
import { useMemo } from 'react';
import { Migration, EUser, Root, ACTION_LABELS } from './core';
import { StateComponent } from './StateComponent';

type Props = {
  migration: Migration;
  user: EUser;
  setRoot: React.Dispatch<React.SetStateAction<Root>>;
};

export const MigrationComponent: React.FC<Props> = ({ migration, user, setRoot }) => {
  const actions = useMemo(() => migration.getActions(user), [migration, user]);

  return (
    <ListItem dense disableGutters disablePadding>
      <ListItemText
        primary={
          <Stack direction="row" spacing={2}>
            <Tooltip
              arrow
              disableInteractive
              placement="top"
              title={
                <ol>
                  {migration.history.map((it, index) => (
                    <li key={index}>{it}</li>
                  ))}
                </ol>
              }>
              <div className='migration-name' style={{ marginTop: 'auto', marginBottom: 'auto' }}>{migration.name}</div>
            </Tooltip>
            {actions.map(action => (
              <Button key={action} variant="outlined" size="small" onClick={() => setRoot(it => it.execute(migration.id, user, action))}>
                {ACTION_LABELS[action]}
              </Button>
            ))}
          </Stack>
        }></ListItemText>
      <StateComponent state={migration.state} />
    </ListItem>
  );
};
