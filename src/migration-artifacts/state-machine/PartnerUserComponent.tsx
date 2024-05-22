import { Card, CardHeader, CardContent, Stack, Button, List } from "@mui/material";
import { Root, EUser } from "./core";
import { MigrationComponent } from "./MigrationRowComponent";

type Props = {
  root: Root;
  setRoot: React.Dispatch<React.SetStateAction<Root>>;
};

export const PartnerUserComponent: React.FC<Props> = ({ root, setRoot }) => {
  return (
    <Card elevation={3}>
      <CardHeader title="Partner User" />
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" size="small" onClick={() => setRoot(it => it.requestMigration())}>
            New Migration Request
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
