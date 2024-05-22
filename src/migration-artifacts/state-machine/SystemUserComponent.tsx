import { Card, CardHeader, CardContent, Stack, Button, List } from '@mui/material';
import { Root, EUser } from './core';
import { MigrationComponent } from './MigrationRowComponent';

type Props = {
  root: Root;
  setRoot: React.Dispatch<React.SetStateAction<Root>>;
};

export const SystemUserComponent: React.FC<Props> = ({ root, setRoot }) => {
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
