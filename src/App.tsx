import { Button, Stack, Typography } from '@mui/material';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { MigrationArtifactsStateMachine } from './migration-artifacts/components';
import { CustomerSelection } from './security-center-customer-selection/components';
import { FilterComponent } from './security-center-filters/filterComponents';
import { WhiteGlovesCustomWorkflow } from './white-gloves-custom-workflow/WhiteGlovesCustomWorkflow';
import { ReleaseComponent } from './white-gloves-process-flow/ReleaseComponent';

export const App: React.FC = () => {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/asim-demos">
            <Route index element={<Directory />} />
            <Route path="white-gloves-process-flow" element={<ReleaseComponent />} />
            <Route
              path="white-gloves-custom-workflow"
              element={
                <ReactFlowProvider>
                  <WhiteGlovesCustomWorkflow />
                </ReactFlowProvider>
              }
            />
            <Route path="security-center-customer-selected" element={<CustomerSelection />} />
            <Route path="security-center-filters" element={<FilterComponent />} />
            <Route path="migration-artifacts-state-machine" element={<MigrationArtifactsStateMachine />} />
          </Route>
        </Routes>
      </>
    </Router>
  );
};

const Directory: React.FC = () => {
  return (
    <Stack direction="column" spacing={2} width={500}>
      <Typography variant="h4">Demos</Typography>
      <Button href="/asim-demos/white-gloves-process-flow" variant="outlined" color="primary">
        White Gloves - Process Flow
      </Button>
      <Button href="/asim-demos/white-gloves-custom-workflow" variant="outlined" color="primary">
        White Gloves - Custom Workflow
      </Button>
      <Button href="/asim-demos/security-center-customer-selected" variant="outlined" color="primary">
        Security Center - Customer Selection
      </Button>
      <Button href="/asim-demos/security-center-filters" variant="outlined" color="primary">
        Security Center - Filters
      </Button>
      <Button href="/asim-demos/migration-artifacts-state-machine" variant="outlined" color="primary">
        Migration Artifacts - State Machine
      </Button>
    </Stack>
  );
};
