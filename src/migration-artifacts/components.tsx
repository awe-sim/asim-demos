import { Button, Card, CardContent, CardHeader, Chip, Grid, List, ListItem, ListItemText, Stack } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ACTION_LABELS, EState, EUser, Migration, Root } from './core';

type StateProps = {
  state: EState;
};
export const StateComponent: React.FC<StateProps> = ({ state }) => {
  switch (state) {
    case EState.CANCELLED:
      return <Chip label="Cancelled" color="default" size="small" variant="filled" />;
    case EState.FAILED:
      return <Chip label="Failed" color="error" size="small" variant="filled" />;
    case EState.IN_PROGRESS:
      return <Chip label="In Progress" color="warning" size="small" variant="filled" />;
    case EState.REJECTED:
      return <Chip label="Rejected" color="error" size="small" variant="filled" />;
    case EState.REQUESTED:
      return <Chip label="Requested" color="secondary" size="small" variant="filled" />;
    case EState.REVERTED:
      return <Chip label="Reverted" color="success" size="small" variant="filled" />;
    case EState.REVERTING:
      return <Chip label="Reverting" color="warning" size="small" variant="filled" />;
    case EState.SCHEDULED:
      return <Chip label="Scheduled" color="primary" size="small" variant="filled" />;
    case EState.SUCCESS:
      return <Chip label="Success" color="success" size="small" variant="filled" />;
  }
};

type MigrationProps = {
  migration: Migration;
  user: EUser;
  setRoot: React.Dispatch<React.SetStateAction<Root>>;
};
export const MigrationComponent: React.FC<MigrationProps> = ({ migration, user, setRoot }) => {
  const actions = useMemo(() => migration.getActions(user), [migration, user]);

  return (
    <ListItem dense disableGutters disablePadding>
      <ListItemText
        primary={
          <Stack direction="row" spacing={2}>
            {migration.name}
            {actions.map(action => (
              <Button key={action} variant="text" size="small" onClick={() => setRoot(it => it.execute(migration.id, user, action))}>
                {ACTION_LABELS[action]}
              </Button>
            ))}
          </Stack>
        }></ListItemText>
      <StateComponent state={migration.state} />
    </ListItem>
  );
};

type SystemProps = {
  root: Root;
  setRoot: React.Dispatch<React.SetStateAction<Root>>;
};
export const SystemComponent: React.FC<SystemProps> = ({ root, setRoot }) => {
  return (
    <Card elevation={3}>
      <CardHeader title="System" />
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" size="small" disabled>
            No Options
          </Button>
        </Stack>
        <hr />
        <List dense>
          {root.migrations.map(migration => (
            <MigrationComponent key={migration.id} migration={migration} user={EUser.SYSTEM} setRoot={setRoot} />
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

type PLQProps = {
  root: Root;
  setRoot: React.Dispatch<React.SetStateAction<Root>>;
};
export const PLQComponent: React.FC<PLQProps> = ({ root, setRoot }) => {
  return (
    <Card elevation={3}>
      <CardHeader title="PLQ User" />
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" size="small" onClick={() => setRoot(it => it.runMigration(EUser.PLQ))}>
            Run New
          </Button>
          <Button variant="contained" size="small" onClick={() => setRoot(it => it.scheduleMigration())}>
            Schedule New
          </Button>
        </Stack>
        <hr />
        <List dense>
          {root.migrations.map(migration => (
            <MigrationComponent key={migration.id} migration={migration} user={EUser.PLQ} setRoot={setRoot} />
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

type PartnerProps = {
  root: Root;
  setRoot: React.Dispatch<React.SetStateAction<Root>>;
};
export const PartnerComponent: React.FC<PartnerProps> = ({ root, setRoot }) => {
  return (
    <Card elevation={3}>
      <CardHeader title="Partner User" />
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" size="small" onClick={() => setRoot(it => it.requestMigration())}>
            Request New
          </Button>
        </Stack>
        <hr />
        <List dense>
          {root.migrations
            .filter(it => it.user === EUser.PARTNER)
            .map(migration => (
              <MigrationComponent key={migration.id} migration={migration} user={EUser.PARTNER} setRoot={setRoot} />
            ))}
        </List>
      </CardContent>
    </Card>
  );
};

export const MigrationArtifactsStateMachine: React.FC = () => {
  const [root, setRoot] = useState(new Root([]));
  const undo = useCallback((ev: KeyboardEvent) => {
    if (ev.ctrlKey && ev.key === 'z') {
      setRoot(it => (it.canUndo ? it.undo() : it));
    }
    if (ev.metaKey && ev.key === 'z') {
      setRoot(it => (it.canUndo ? it.undo() : it));
    }
  }, []);
  useEffect(() => {
    document.addEventListener('keydown', undo);
    return () => document.removeEventListener('keydown', undo);
  }, [undo]);
  return (
    <>
      <Stack direction="row" spacing={2}>
        <Button variant="text" disabled={!root.canUndo} onClick={() => setRoot(it => it.undo())}>
          Undo
        </Button>
        <Button variant="text" onClick={() => setRoot(new Root([]))}>
          Clear
        </Button>
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <PLQComponent root={root} setRoot={setRoot} />
        </Grid>
        <Grid item xs={4}>
          <PartnerComponent root={root} setRoot={setRoot} />
        </Grid>
        <Grid item xs={4}>
          <SystemComponent root={root} setRoot={setRoot} />
        </Grid>
      </Grid>
    </>
  );
};
