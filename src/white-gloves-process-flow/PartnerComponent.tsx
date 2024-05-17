import { KeyboardArrowDown } from '@mui/icons-material';
import { Button, Checkbox, Menu, MenuItem, TableCell, TableRow } from '@mui/material';
import { useMemo, useState } from 'react';
import { showMessageBox } from '../common/MessageBox';
import { showToast2 } from '../common/MySnackbar';
import { Action } from './action';
import { Partner } from './partner';
import { ProcessComponent } from './ProcessComponent';
import { Release } from './release';
import { Workflow } from './workflow';

type Props = {
  workflow: Workflow;
  release: Release;
  partner: Partner;
  setRelease: (release: Release) => void;
};

export const PartnerComponent: React.FC<Props> = ({ workflow, release, partner, setRelease }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!actions.length) return;
    setAnchorEl(event.currentTarget);
  };
  const handleClose = async (action?: Action) => {
    setAnchorEl(null);
    if (!action) return;
    if (action.isReleaseAction) {
      const result = await showMessageBox({
        title: action.label,
        message: 'This is a RELEASE action and is applicable to all processes!',
        buttons: [
          { text: 'OK', value: true, props: { variant: 'outlined' } },
          { text: 'Cancel', value: false, props: { variant: 'contained' } },
        ],
      });
      if (!result) return;
      const { release: newRelease, emailLogs } = workflow.executeAction(action, release, release.getProcesses());
      if (emailLogs.length)
        showToast2(
          <ul>
            {emailLogs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>,
        );
      setRelease(newRelease);
    } else {
      const { release: newRelease, emailLogs } = workflow.executeAction(action, release, partner.processes);
      if (emailLogs.length)
        showToast2(
          <ul>
            {emailLogs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>,
        );
      setRelease(newRelease);
    }
  };
  const actions = useMemo(() => workflow.getActions(partner.processes), [workflow, partner]);
  return (
    <>
      <TableRow>
        <TableCell>
          <Checkbox checked={partner.checked} onChange={(_ev, checked) => setRelease(release.setPartnerChecked(partner, checked))} />
        </TableCell>
        <TableCell>
          <b>{partner.name}</b>
        </TableCell>
        <TableCell>
          <b>{partner.id}</b>
        </TableCell>
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell>
          <Button variant="contained" size="small" color={partner.getStates()?.[0]?.color} endIcon={actions.length ? <KeyboardArrowDown /> : null} onClick={handleClick}>
            {partner
              .getStates()
              .map(state => state.label)
              .join(', ')}
          </Button>
        </TableCell>
      </TableRow>
      {Object.entries(partner.processes).map(([processId, process]) => (
        <ProcessComponent key={processId} process={process} />
      ))}
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => handleClose()}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}>
        {actions.map(action => (
          <MenuItem key={action.label} onClick={() => handleClose(action)}>
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
