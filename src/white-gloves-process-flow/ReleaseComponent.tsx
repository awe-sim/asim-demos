import { KeyboardArrowDown } from '@mui/icons-material';
import { Button, Checkbox, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { showMessageBox } from '../common/MessageBox';
import { showToast2 } from '../common/MySnackbar';
import { Action } from './action';
import { PartnerComponent } from './PartnerComponent';
import { RELEASE, Release } from './release';
import { WORKFLOW } from './workflow';

export const ReleaseComponent: React.FC = () => {
  const [release, setRelease] = useState(RELEASE);
  const [releaseStack, setReleaseStack] = useState<Release[]>([]);
  const updateRelease = useCallback(
    (newRelease: Release) => {
      setRelease(newRelease);
      setReleaseStack(releaseStack.concat(release));
    },
    [release, releaseStack],
  );
  const checked = release.getCheckedPartners().length === release.partners.length;
  const indeterminate = release.getCheckedPartners().length !== 0 && release.getCheckedPartners().length !== release.partners.length;
  const onChecked = (value: boolean) => {
    updateRelease(release.setAllPartnersChecked(value));
  };
  const undo = useCallback(() => {
    const oldReleaseStack = [...releaseStack];
    const oldRelease = oldReleaseStack.pop();
    if (!oldRelease) return;
    setRelease(oldRelease);
    setReleaseStack(oldReleaseStack);
  }, [releaseStack]);

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
      const { release: newRelease, emailLogs } = WORKFLOW.executeAction(action, release, release.getProcesses());
      if (emailLogs.length)
        showToast2(
          <ul>
            {emailLogs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>,
        );
      updateRelease(newRelease);
    } else {
      const { release: newRelease, emailLogs } = WORKFLOW.executeAction(action, release, release.getCheckedProcesses());
      if (emailLogs.length)
        showToast2(
          <ul>
            {emailLogs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>,
        );
      updateRelease(newRelease);
      updateRelease(newRelease);
    }
  };
  const actions = useMemo(() => WORKFLOW.getActions(release.getCheckedProcesses()), [release]);
  return (
    <>
      {/* <Button onClick={() => setShow(!show)}>SHOW/HIDE</Button> */}
      {/* <Loader show={show} enterDelay={2000} minimumDuration={3000} /> */}
      <Button
        variant="contained"
        size="small"
        endIcon={actions.length ? <KeyboardArrowDown /> : null}
        onClick={handleClick}>
        Bulk Actions
      </Button>
      &nbsp;
      <Button
        variant="outlined"
        size="small"
        disabled={releaseStack.length === 0}
        onClick={undo}>
        Undo
      </Button>
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="simple table">
          <TableHead>
            <TableCell width={10}>
              <Checkbox
                checked={checked}
                indeterminate={indeterminate}
                onChange={(_ev, checked) => onChecked(checked)}
              />
            </TableCell>
            <TableCell width={150}>Name</TableCell>
            <TableCell width={200}>Code</TableCell>
            <TableCell width={40}>Connection</TableCell>
            <TableCell width={200}>Origin</TableCell>
            <TableCell width={100}>Direction</TableCell>
            <TableCell>Actions</TableCell>
          </TableHead>
          <TableBody>
            {release.partners.map(partner => (
              <PartnerComponent
                key={partner.id}
                workflow={WORKFLOW}
                release={release}
                partner={partner}
                setRelease={updateRelease}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => handleClose()}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}>
        {actions.map(action => (
          <MenuItem
            key={action.label}
            onClick={() => handleClose(action)}>
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
