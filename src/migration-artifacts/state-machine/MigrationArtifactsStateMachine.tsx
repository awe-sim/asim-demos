import { Button, Grid, Stack } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Root } from './core';
import { PartnerUserComponent } from './PartnerUserComponent';
import { PLQUserComponent } from './PLQUserComponent';
import './styles.scss';
import { SystemUserComponent } from './SystemUserComponent';

export const MigrationArtifactsStateMachineComponent: React.FC = () => {
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
    <div className='migration-artifacts-state-machine'>
      <Stack direction="row" spacing={2}>
        <Button size="small" variant="outlined" onClick={() => setRoot(new Root([]))}>
          Reset
        </Button>
        <Button size="small" variant="outlined" disabled={!root.canUndo} onClick={() => setRoot(it => it.undo())}>
          Undo (CMD+Z)
        </Button>
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <PLQUserComponent root={root} setRoot={setRoot} />
        </Grid>
        <Grid item xs={4}>
          <PartnerUserComponent root={root} setRoot={setRoot} />
        </Grid>
        <Grid item xs={4}>
          <SystemUserComponent root={root} setRoot={setRoot} />
        </Grid>
      </Grid>
    </div>
  );
};
