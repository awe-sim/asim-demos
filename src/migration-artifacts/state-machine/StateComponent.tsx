import { Chip } from '@mui/material';
import { EState } from './core';

type Props = {
  state: EState;
};

export const StateComponent: React.FC<Props> = ({ state }) => {
  switch (state) {
    case EState.CANCELLED:
      return <Chip label="Cancelled" color="default" size="small" variant="outlined" />;
    case EState.FAILED:
      return <Chip label="Failed" color="error" size="small" variant="outlined" />;
    case EState.IN_PROGRESS:
      return <Chip label="In Progress" color="warning" size="small" variant="outlined" />;
    case EState.REJECTED:
      return <Chip label="Rejected" color="error" size="small" variant="outlined" />;
    case EState.REQUESTED:
      return <Chip label="Requested" color="secondary" size="small" variant="outlined" />;
    case EState.REVERTED:
      return <Chip label="Reverted" color="success" size="small" variant="outlined" />;
    case EState.REVERTING:
      return <Chip label="Reverting" color="warning" size="small" variant="outlined" />;
    case EState.SCHEDULED:
      return <Chip label="Scheduled" color="primary" size="small" variant="outlined" />;
    case EState.SUCCESS:
      return <Chip label="Success" color="success" size="small" variant="outlined" />;
  }
};
