import { Edge, useEdges, XYPosition } from 'reactflow';
import { Action, ProcessConnection, Variant } from './types';
import { useRecoilValue } from 'recoil';
import { selectedEdgeIdsState, selectedEdgeLabelCoordsState } from './states';
import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useReactFlowHooks } from './hooks';
import { MailOutline, ExpandMore, ExpandLess, Clear, Mail, Upload, Lock, LockOpen, AlarmOnOutlined, AlarmOutlined } from '@mui/icons-material';
import { Stack, TextField, Button, IconButton, InputAdornment, Chip, List, Popover, ListItemButton, Tooltip } from '@mui/material';
import { prevent } from '../common/helpers';

export const CustomEdgeToolbarPlaceholderComponent: React.FC = () => {
  const edges = useEdges<Action>();
  const id = useRecoilValue(selectedEdgeIdsState)?.[0];
  const edgeLabelCoords = useRecoilValue(selectedEdgeLabelCoordsState);
  const edge = useMemo(() => edges.find(e => e.id === id), [edges, id]);

  if (!edge || !edgeLabelCoords) return null;
  return <CustomEdgeToolbarComponent edge={edge} edgeLabelCoords={edgeLabelCoords} />;
};

// ------------------------------------------------------------------------------------------------

type CustomEdgeToolbarProps = {
  edge: Edge<Action>;
  edgeLabelCoords: XYPosition;
};
const CustomEdgeToolbarComponent: React.FC<CustomEdgeToolbarProps> = ({ edge, edgeLabelCoords }) => {
  const { updateEdge } = useReactFlowHooks();

  const setName = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    ev => {
      updateEdge(edge.id, draft => {
        draft.label = ev.target.value;
      });
    },
    [edge.id, updateEdge],
  );

  const toggleEmailAction = useCallback(() => {
    updateEdge(edge.id, draft => {
      draft.data = draft.data ?? {
        isEmailAction: false,
        variants: [],
      };
      if (draft.data.isEmailAction) {
        draft.data.isEmailAction = false;
        draft.data.variants = draft.data.variants.slice(0, 1);
      } else {
        draft.data.isEmailAction = true;
      }
    });
  }, [edge.id, updateEdge]);

  const addVariant = useCallback(() => {
    updateEdge(edge.id, draft => {
      draft.data = draft.data ?? {
        isEmailAction: false,
        variants: [],
      };
      draft.data.variants.push({
        label: ``,
        emailTemplate: '',
        hasReminder: false,
        reminderEmailTemplate: '',
        constraintsConnectionsIn: [],
        constraintsConnectionsNotIn: [],
        constraintsOriginsIn: [],
        constraintsOriginsNotIn: [],
        constraintsDirectionsIn: [],
        constraintsDirectionsNotIn: [],
        constraintsStatesIn: [],
        constraintsStatesNotIn: [],
      });
    });
  }, [updateEdge, edge.id]);

  const removeVariant = useCallback(
    (index: number) => {
      updateEdge(edge.id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants.splice(index, 1);
      });
    },
    [edge.id, updateEdge],
  );

  const [expanded, setExpanded] = useState(false);

  return (
    <div onDoubleClick={prevent} className="edge-toolbar-v2" style={{ left: edgeLabelCoords?.x, top: edgeLabelCoords?.y }}>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" spacing={1}>
          <ToggleButtonComponent iconOn={<MailOutline color="error" />} iconOff={<MailOutline />} value={edge.data?.isEmailAction ?? false} onToggle={toggleEmailAction} tooltip={edge.data?.isEmailAction ?? false ? 'Click to revert to a simple action' : 'Click to convert to an email action'} />
          <TextField label="Action Name" size="small" variant="standard" value={edge.label} onChange={setName} style={{ width: '200px' }} inputProps={{ style: { height: '26px' } }} />
          {edge.data && edge.data.variants.length === 1 && (
            <VariantComponent //
              edgeId={edge.id}
              index={0}
              variant={edge.data.variants[0]}
              showName={false}
              showTemplates={edge.data.isEmailAction}
              showRemove={false}
              remove={() => removeVariant(0)}
            />
          )}
          {edge.data && edge.data.variants.length > 1 && <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>{edge.data.variants.length} Variants</div>}
          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <Tooltip placement="top" arrow disableInteractive title="Add a new variant">
              <Button size="small" variant="outlined" onClick={addVariant}>
                Add Variant
              </Button>
            </Tooltip>
          </div>
          {edge.data && edge.data.variants.length > 1 && (
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? (
                <Tooltip placement="top" arrow disableInteractive title="Hide variants">
                  <ExpandMore />
                </Tooltip>
              ) : (
                <Tooltip placement="top" arrow disableInteractive title="Show variants">
                  <ExpandLess />
                </Tooltip>
              )}
            </IconButton>
          )}
        </Stack>
        {expanded &&
          edge.data &&
          edge.data.variants.length > 1 &&
          edge.data?.variants.map((variant, index) => (
            <Stack key={index} direction="row" spacing={1}>
              <VariantComponent //
                edgeId={edge.id}
                index={index}
                variant={variant}
                showName={true}
                showTemplates={edge.data?.isEmailAction ?? false}
                showRemove={true}
                remove={() => removeVariant(index)}
              />
            </Stack>
          ))}
      </Stack>
    </div>
  );
};

// ------------------------------------------------------------------------------------------------

type ToggleButtonProps = {
  iconOn: React.ReactElement;
  iconOff: React.ReactElement;
  value: boolean;
  onToggle: (value: boolean) => void;
  tooltip?: string;
};
export const ToggleButtonComponent: React.FC<ToggleButtonProps> = ({ iconOn, iconOff, value, onToggle, tooltip }) => {
  return (
    <Tooltip placement="top" arrow disableInteractive title={tooltip}>
      <IconButton size="small" onClick={() => onToggle(!value)}>
        {value ? iconOn : iconOff}
      </IconButton>
    </Tooltip>
  );
};

// ------------------------------------------------------------------------------------------------

type FileUploadProps = {
  value: string;
  onSet: (filename: string) => void;
  onReset: () => void;
  label1?: string;
  label2?: string;
};
export const FileUploadComponent: React.FC<FileUploadProps> = ({ value, onSet, onReset, label1, label2 }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onSet(event.target.files[0].name);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      onReset();
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
      <TextField
        label="Upload File"
        value={value}
        onChange={ev => onSet(ev.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Tooltip placement="top" arrow disableInteractive title={value ? `${label1} template configured` : `${label1} template not configured. Click the upload icon to configure an ${label2} template.`}>
                <IconButton size="small" color={value ? 'default' : 'warning'}>
                  <Mail fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {value && (
                <Tooltip placement="top" arrow disableInteractive title={`Remove ${label2} template`}>
                  <IconButton size="small" onClick={handleClear}>
                    <Clear />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip placement="top" arrow disableInteractive title={`Upload ${label2} template`}>
                <IconButton size="small" onClick={handleUploadClick}>
                  <Upload />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        variant="standard"
        fullWidth
        style={{ width: '250px' }}
      />
    </div>
  );
};

// ------------------------------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export const LABELS: Record<ProcessConnection, string> = {
  [ProcessConnection.AS2]: 'AS2',
  [ProcessConnection.SFTP_INTERNAL]: 'SFTP Internal',
  [ProcessConnection.SFTP_EXTERNAL]: 'SFTP External',
  [ProcessConnection.HTTP]: 'HTTP',
  [ProcessConnection.VAN]: 'VAN',
  [ProcessConnection.WEBHOOK]: 'Web Hook',
};

type ConstraintsProps = {
  connections: ProcessConnection[];
  setConnections: (connections: ProcessConnection[]) => void;
};
export const ConstraintsComponent: React.FC<ConstraintsProps> = ({ connections, setConnections }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const toggleConnectionConstraint = useCallback(
    (value: ProcessConnection) => {
      if (connections.includes(value)) {
        setConnections(connections.filter(it => it !== value));
      } else {
        setConnections([...connections, value]);
      }
    },
    [connections, setConnections],
  );
  // const changeConnectionConstraints = useCallback(
  //   (ev: SelectChangeEvent<ProcessConnection[]>) => {
  //     const value = ev.target.value;
  //     const values = typeof value === 'string' ? value.split(',').map(it => it as ProcessConnection) : value;
  //     setConnections(values);
  //   },
  //   [setConnections],
  // );
  // const changeDirectionConstraints = useCallback(
  //   (ev: SelectChangeEvent<ProcessDirection[]>) => {
  //     const value = ev.target.value;
  //     const values = typeof value === 'string' ? value.split(',').map(it => it as ProcessDirection) : value;
  //     setDirections(values);
  //   },
  //   [setDirections],
  // );
  // const changeOriginConstraints = useCallback(
  //   (ev: SelectChangeEvent<ProcessOrigin[]>) => {
  //     const value = ev.target.value;
  //     const values = typeof value === 'string' ? value.split(',').map(it => it as ProcessOrigin) : value;
  //     setOrigins(values);
  //   },
  //   [setOrigins],
  // );

  return (
    <>
      <Tooltip placement="top" arrow disableInteractive title={connections.length > 0 ? 'Connection constraints applied' : 'No connection constraints'}>
        <IconButton size="small">{connections.length > 0 ? <Lock color="error" /> : <LockOpen />}</IconButton>
      </Tooltip>
      <div onClick={ev => setAnchorEl(ev.currentTarget)} style={{ width: '300px', marginTop: 'auto', marginBottom: 'auto' }}>
        {connections.map(connection => (
          <Chip key={connection} onDelete={() => setConnections(connections.filter(it => it !== connection))} label={LABELS[connection]} size="small" variant="outlined" color="default" />
        ))}
        {connections.length === 0 && <Chip label="Add constraints" size="small" variant="outlined" color="default" />}
      </div>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        onDoubleClick={prevent}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}>
        <List dense style={{ width: '400px' }}>
          <ListItemButton dense selected={connections.includes(ProcessConnection.AS2)} onClick={() => toggleConnectionConstraint(ProcessConnection.AS2)}>
            AS2
          </ListItemButton>
          <ListItemButton dense selected={connections.includes(ProcessConnection.SFTP_INTERNAL)} onClick={() => toggleConnectionConstraint(ProcessConnection.SFTP_INTERNAL)}>
            SFTP Internal
          </ListItemButton>
          <ListItemButton dense selected={connections.includes(ProcessConnection.SFTP_EXTERNAL)} onClick={() => toggleConnectionConstraint(ProcessConnection.SFTP_EXTERNAL)}>
            SFTP External
          </ListItemButton>
          <ListItemButton dense selected={connections.includes(ProcessConnection.HTTP)} onClick={() => toggleConnectionConstraint(ProcessConnection.HTTP)}>
            HTTP
          </ListItemButton>
          <ListItemButton dense selected={connections.includes(ProcessConnection.VAN)} onClick={() => toggleConnectionConstraint(ProcessConnection.VAN)}>
            VAN
          </ListItemButton>
          <ListItemButton dense selected={connections.includes(ProcessConnection.WEBHOOK)} onClick={() => toggleConnectionConstraint(ProcessConnection.WEBHOOK)}>
            Web Hook
          </ListItemButton>
          {/* <ListItem dense>
            <Select labelId="connections" value={connections ?? []} size="small" variant="standard" fullWidth multiple onChange={changeConnectionConstraints}>
              <MenuItem value={ProcessConnection.AS2}>AS2</MenuItem>
              <MenuItem value={ProcessConnection.SFTP}>SFTP</MenuItem>
              <MenuItem value={ProcessConnection.SFTP_INTERNAL}>SFTP Internal</MenuItem>
              <MenuItem value={ProcessConnection.SFTP_EXTERNAL}>SFTP External</MenuItem>
              <MenuItem value={ProcessConnection.HTTP}>HTTP</MenuItem>
              <MenuItem value={ProcessConnection.VAN}>VAN</MenuItem>
              <MenuItem value={ProcessConnection.WEBHOOK}>Web Hook</MenuItem>
              <InputLabel id="connections">Connections</InputLabel>
            </Select>
          </ListItem>
          <ListItem dense>
            <InputLabel id="origins">Directions</InputLabel>
            <Select labelId="origins" value={directions ?? []} size="small" variant="standard" fullWidth multiple onChange={changeDirectionConstraints}>
              <MenuItem value={ProcessDirection.INBOUND}>Inbound</MenuItem>
              <MenuItem value={ProcessDirection.OUTBOUND}>Outbound</MenuItem>
            </Select>
          </ListItem>
          <ListItem dense>
            <InputLabel id="connections">Origins</InputLabel>
            <Select labelId="connections" value={origins ?? []} size="small" variant="standard" fullWidth multiple onChange={changeOriginConstraints}>
              <MenuItem value={ProcessOrigin.INTERNAL}>Internal</MenuItem>
              <MenuItem value={ProcessOrigin.EXTERNAL}>External</MenuItem>
            </Select>
          </ListItem> */}
        </List>
      </Popover>
    </>
  );
};

// ------------------------------------------------------------------------------------------------

type VariantProps = {
  edgeId: string;
  index: number;
  variant: Variant;
  showName: boolean;
  showTemplates: boolean;
  showRemove: boolean;
  remove: () => void;
};

const VariantComponent: React.FC<VariantProps> = ({ edgeId, index, variant, showName, showTemplates, showRemove, remove }) => {
  const { updateEdge } = useReactFlowHooks();
  const setName = useCallback(
    (value: string) => {
      updateEdge(edgeId, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].label = value;
      });
    },
    [edgeId, index, updateEdge],
  );

  const setEmailTemplate = useCallback(
    (value: string) => {
      updateEdge(edgeId, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].emailTemplate = value;
      });
    },
    [edgeId, index, updateEdge],
  );

  const setHasReminder = useCallback(
    (value: boolean) => {
      updateEdge(edgeId, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].hasReminder = value;
      });
    },
    [edgeId, index, updateEdge],
  );

  const setReminderEmailTemplate = useCallback(
    (value: string) => {
      updateEdge(edgeId, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].reminderEmailTemplate = value;
      });
    },
    [edgeId, index, updateEdge],
  );

  const setConnections = useCallback(
    (connections: ProcessConnection[]) => {
      updateEdge(edgeId, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].constraintsConnectionsIn = connections;
      });
    },
    [edgeId, index, updateEdge],
  );

  return (
    <>
      {showName && (
        <Tooltip placement="top" arrow disableInteractive title="Variant name is for display purposes only">
          <TextField //
            label="Variant name"
            size="small"
            variant="standard"
            value={variant.label}
            onChange={ev => setName(ev.target.value)}
            style={{ width: '200px' }}
            inputProps={{ style: { height: '26px' } }}
          />
        </Tooltip>
      )}
      {showTemplates && (
        <FileUploadComponent //
          value={variant.emailTemplate}
          onSet={setEmailTemplate}
          onReset={() => setEmailTemplate('')}
          label1="Email"
          label2="email"
        />
      )}
      {showTemplates && (
        <ToggleButtonComponent //
          iconOff={<AlarmOutlined />}
          iconOn={<AlarmOnOutlined />}
          value={variant.hasReminder}
          onToggle={setHasReminder}
          tooltip={variant.hasReminder ? 'Click to disable reminder for this variant' : 'Click to enable reminder for this variant'}
        />
      )}
      {variant.hasReminder && showTemplates && (
        <FileUploadComponent //
          value={variant.reminderEmailTemplate}
          onSet={setReminderEmailTemplate}
          onReset={() => setReminderEmailTemplate('')}
          label1="Reminder email"
          label2="reminder email"
        />
      )}
      <ConstraintsComponent connections={variant.constraintsConnectionsIn} setConnections={setConnections} />
      {showRemove && (
        <Tooltip placement="top" arrow disableInteractive title="Remove this variant">
          <IconButton onClick={remove}>
            <Clear />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};
