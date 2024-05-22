import { Card, CardHeader, CardContent, Stack, Button, List } from '@mui/material';
import { Root, EUser } from './core';
import { MigrationComponent } from './MigrationRowComponent';

type Props = {
  root: Root;
  setRoot: React.Dispatch<React.SetStateAction<Root>>;
};

export const PLQUserComponent: React.FC<Props> = ({ root, setRoot }) => {
  return (
    <Card elevation={3}>
      <CardHeader title="PLQ User" />
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" size="small" onClick={() => setRoot(it => it.runMigration(EUser.PLQ))}>
            New Migration
          </Button>
          <Button variant="contained" size="small" onClick={() => setRoot(it => it.scheduleMigration())}>
            New Scheduled Migration
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
