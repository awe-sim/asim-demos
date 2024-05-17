import { Chip, TableCell, TableRow } from '@mui/material';
import { Process } from './process';

type Props = {
  process: Process;
};

export const ProcessComponent: React.FC<Props> = ({ process }) => {
  return (
    <TableRow>
      <TableCell />
      <TableCell>{process.name}</TableCell>
      <TableCell>{process.id}</TableCell>
      <TableCell>{process.connection}</TableCell>
      <TableCell>{process.origin}</TableCell>
      <TableCell>{process.direction}</TableCell>
      <TableCell>
        <Chip
          size="small"
          variant="outlined"
          color={process.state.color}
          label={process.state.label}
        />
      </TableCell>
    </TableRow>
  );
};
