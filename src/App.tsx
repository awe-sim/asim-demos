import { createTheme, CssBaseline, List, ListItemButton, ListItemText, ListSubheader, ThemeProvider, Typography, useMediaQuery } from '@mui/material';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './App.scss';
import { MigrationArtifactsStateMachineComponent } from './migration-artifacts/state-machine/MigrationArtifactsStateMachine';
import { CustomerSelection } from './security-center-customer-selection/components';
import { FilterComponent } from './security-center-filters/filterComponents';
import { ReleaseComponent } from './white-gloves-process-flow/ReleaseComponent';
import { WhiteGlovesWorkflowEditor } from './white-gloves-workflow-editor-v2/WhiteGlovesWorkflowEditor';
import { FiltersMain } from './filters-v2/FiltersMain';

const LIGHT_THEME = createTheme({
  palette: {
    mode: 'light',
  },
});
const DARK_THEME = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = prefersDarkMode ? DARK_THEME : LIGHT_THEME;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
              <Route path="filters-v2">
                <Route index element={<FiltersMain />} />
              </Route>
              <Route path="migration-artifacts">
                <Route path="state-machine" element={<MigrationArtifactsStateMachineComponent />} />
              </Route>
            </Route>
          </Routes>
        </>
      </HashRouter>
    </ThemeProvider>
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
        <ListSubheader>Filters v2</ListSubheader>
        <ListItemButton href="#filters-v2">
          <ListItemText primary="Filters v2" />
        </ListItemButton>
        <ListSubheader>Migration Artifacts</ListSubheader>
        <ListItemButton href="#migration-artifacts/state-machine">
          <ListItemText primary="State Machine" />
        </ListItemButton>
      </List>
    </div>
  );
};
