import { List, ListItemButton, ListItemText, ListSubheader, Typography } from '@mui/material';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './App.scss';
import { MigrationArtifactsStateMachineComponent } from './migration-artifacts/state-machine/MigrationArtifactsStateMachine';
import { CustomerSelection } from './security-center-customer-selection/components';
import { FilterComponent } from './security-center-filters/filterComponents';
import { ReleaseComponent } from './white-gloves-process-flow/ReleaseComponent';
import { WhiteGlovesWorkflowEditor } from './white-gloves-workflow-editor-v2/WhiteGlovesWorkflowEditor';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <>
        <Routes>
          <Route path="/">
            <Route index element={<Directory />} />
            <Route path="white-gloves">
              <Route path="communication-stages" element={<ReleaseComponent />} />
              <Route path="workflow-editor" element={<WhiteGlovesWorkflowEditor />} />
            </Route>
            <Route path="security-center">
              <Route path="customer-selection" element={<CustomerSelection />} />
              <Route path="filters" element={<FilterComponent />} />
            </Route>
            <Route path="migration-artifacts">
              <Route path="state-machine" element={<MigrationArtifactsStateMachineComponent />} />
            </Route>
          </Route>
        </Routes>
      </>
    </HashRouter>
  );
};

const Directory: React.FC = () => {
  return (
    <div className="app">
      <Typography variant="h4">Demos</Typography>
      <List dense>
        <ListSubheader>White Gloves</ListSubheader>
        <ListItemButton href="#white-gloves/communication-stages">
          <ListItemText primary="Communication stages" />
        </ListItemButton>
        <ListItemButton href="#white-gloves/workflow-editor">
          <ListItemText primary="Workflow Editor" />
        </ListItemButton>
        <ListSubheader>Security Center</ListSubheader>
        <ListItemButton href="#security-center/customer-selection">
          <ListItemText primary="Customer Selection" />
        </ListItemButton>
        <ListItemButton href="#security-center/filters">
          <ListItemText primary="Filters" />
        </ListItemButton>
        <ListSubheader>Migration Artifacts</ListSubheader>
        <ListItemButton href="#migration-artifacts/state-machine">
          <ListItemText primary="State Machine" />
        </ListItemButton>
      </List>
    </div>
  );
};
