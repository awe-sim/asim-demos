import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { CanvasComponent } from './CanvasComponent';
import './styles.scss';

export const WhiteGlovesWorkflowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <CanvasComponent />
    </ReactFlowProvider>
  );
};
