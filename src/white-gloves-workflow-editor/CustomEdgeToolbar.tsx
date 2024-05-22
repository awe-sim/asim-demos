import { AlarmOnOutlined, AlarmOutlined, Clear, ExpandLess, ExpandMore, Lock, LockOpen, Mail, MailOutline, Upload } from '@mui/icons-material';
import { Autocomplete, AutocompleteValue, Button, Chip, IconButton, InputAdornment, List, ListItem, ListItemButton, Popover, TextField, Tooltip } from '@mui/material';
import React, { ChangeEvent, SyntheticEvent, useCallback, useMemo, useRef, useState } from 'react';
import { Edge, useEdges, XYPosition } from 'reactflow';
import { useRecoilValue } from 'recoil';
import { prevent } from '../common/helpers';
import { useReactFlowHooks } from './hooks';
import { selectedEdgeIdsState, selectedEdgeLabelCoordsState } from './states';
import { Action, ProcessConnection, Variant } from './types';

enum AutoCompleteOptions {
  SEND_MIGRATION_LETTER = 'Send migration letter',
  RECEIVE_CONNECTION_INFO = 'Receive connection info',
  RECEIVE_ACKNOWLEDGEMENT = 'Receive acknowledgement',
  SEND_ACKNOWLEDGEMENT = 'Send acknowledgement',
  MARK_CONNECTION_OK = 'Mark connection OK',
  MARK_CONNECTION_FAILED = 'Mark connection failed',
  PROPOSE_CONNECTION_TEST_DATE = 'Propose connection test date',
  SCHEDULE_CONNECTION_TEST = 'Schedule connection test',
  REQUEST_ADDITIONAL_CONNECTION_INFO = 'Request additional connection info',
  SEND_GOLIVE_T14_LETTER = 'Send GoLive T-14 letter',
  SEND_GOLIVE_T5_LETTER = 'Send GoLive T-5 letter',
  SEND_GOLIVE_T1_LETTER = 'Send GoLive T-1 letter',
  MARK_GOLIVE = 'Mark GoLive',
  REQUEST_LIVE_LOAD = 'Request live load',
  COMPLETE_MIGRATION = 'Complete migration',
}

const AUTOCOMPLETE_OPTIONS: React.ReactNode[] = [
  //
  AutoCompleteOptions.SEND_MIGRATION_LETTER,
  AutoCompleteOptions.RECEIVE_CONNECTION_INFO,
  AutoCompleteOptions.RECEIVE_ACKNOWLEDGEMENT,
  AutoCompleteOptions.SEND_ACKNOWLEDGEMENT,
  AutoCompleteOptions.MARK_CONNECTION_OK,
  AutoCompleteOptions.MARK_CONNECTION_FAILED,
  AutoCompleteOptions.PROPOSE_CONNECTION_TEST_DATE,
  AutoCompleteOptions.SCHEDULE_CONNECTION_TEST,
  AutoCompleteOptions.REQUEST_ADDITIONAL_CONNECTION_INFO,
  AutoCompleteOptions.SEND_GOLIVE_T14_LETTER,
  AutoCompleteOptions.SEND_GOLIVE_T5_LETTER,
  AutoCompleteOptions.SEND_GOLIVE_T1_LETTER,
  AutoCompleteOptions.MARK_GOLIVE,
  AutoCompleteOptions.REQUEST_LIVE_LOAD,
  AutoCompleteOptions.COMPLETE_MIGRATION,
];

const ACTION_MAP: Record<AutoCompleteOptions, Action> = {
  [AutoCompleteOptions.SEND_MIGRATION_LETTER]: {
    isEmailAction: true,
    variants: [
      //
      { label: 'AS2', emailTemplate: 'migration-letter-as2.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-as2-reminder.html', hasConstraints: true, constraintsConnectionsIn: [ProcessConnection.AS2], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] },
      { label: 'HTTP', emailTemplate: 'migration-letter-http.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-http-reminder.html', hasConstraints: true, constraintsConnectionsIn: [ProcessConnection.HTTP], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] },
      { label: 'SFTP External', emailTemplate: 'migration-letter-sftp-ext.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-sftp-ext-reminder.html', hasConstraints: true, constraintsConnectionsIn: [ProcessConnection.SFTP_EXTERNAL], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] },
      { label: 'SFTP Internal', emailTemplate: 'migration-letter-sftp-int.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-sftp-int-reminder.html', hasConstraints: true, constraintsConnectionsIn: [ProcessConnection.SFTP_INTERNAL], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] },
      { label: 'VAN', emailTemplate: 'migration-letter-van.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-van-reminder.html', hasConstraints: true, constraintsConnectionsIn: [ProcessConnection.VAN], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] },
      { label: 'Web Hook', emailTemplate: 'migration-letter-webhook.html', hasReminder: true, reminderEmailTemplate: 'migration-letter-webhook-reminder.html', hasConstraints: true, constraintsConnectionsIn: [ProcessConnection.WEBHOOK], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] },
    ],
  },
  [AutoCompleteOptions.RECEIVE_CONNECTION_INFO]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: true, constraintsConnectionsIn: [ProcessConnection.AS2, ProcessConnection.HTTP, ProcessConnection.SFTP_EXTERNAL], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.RECEIVE_ACKNOWLEDGEMENT]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: true, constraintsConnectionsIn: [ProcessConnection.SFTP_INTERNAL, ProcessConnection.VAN, ProcessConnection.WEBHOOK], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.SEND_ACKNOWLEDGEMENT]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraintsConnectionsIn: [], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.MARK_CONNECTION_OK]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraintsConnectionsIn: [], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.MARK_CONNECTION_FAILED]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraintsConnectionsIn: [], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.PROPOSE_CONNECTION_TEST_DATE]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'connection-test-date.html', hasReminder: true, reminderEmailTemplate: 'connection-test-date-reminder.html', hasConstraints: false, constraintsConnectionsIn: [], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.SCHEDULE_CONNECTION_TEST]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraintsConnectionsIn: [], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.REQUEST_ADDITIONAL_CONNECTION_INFO]: {
    isEmailAction: true,
    variants: [
      { label: 'AS2', emailTemplate: 'additional-connection-info-as2.html', hasReminder: true, reminderEmailTemplate: 'additional-connection-info-as2-reminder.html', hasConstraints: true, constraintsConnectionsIn: [ProcessConnection.AS2], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] },
      { label: 'HTTP', emailTemplate: 'additional-connection-info-http.html', hasReminder: true, reminderEmailTemplate: 'additional-connection-info-http-reminder.html', hasConstraints: true, constraintsConnectionsIn: [ProcessConnection.HTTP], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] },
      { label: 'SFTP External', emailTemplate: 'additional-connection-info-sftp-ext.html', hasReminder: true, reminderEmailTemplate: 'additional-connection-info-sftp-ext-reminder.html', hasConstraints: true, constraintsConnectionsIn: [ProcessConnection.SFTP_EXTERNAL], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] },
    ],
  },
  [AutoCompleteOptions.SEND_GOLIVE_T14_LETTER]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'golive-t14-letter.html', hasReminder: true, reminderEmailTemplate: 'golive-t14-letter-reminder.html', hasConstraints: false, constraintsConnectionsIn: [], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.SEND_GOLIVE_T5_LETTER]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'golive-t5-letter.html', hasReminder: true, reminderEmailTemplate: 'golive-t5-letter-reminder.html', hasConstraints: false, constraintsConnectionsIn: [], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.SEND_GOLIVE_T1_LETTER]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'golive-t1-letter.html', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraintsConnectionsIn: [], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.MARK_GOLIVE]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'golive.html', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraintsConnectionsIn: [], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.REQUEST_LIVE_LOAD]: {
    isEmailAction: true,
    variants: [{ label: '', emailTemplate: 'live-load.html', hasReminder: true, reminderEmailTemplate: 'live-load-reminder.html', hasConstraints: false, constraintsConnectionsIn: [], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
  [AutoCompleteOptions.COMPLETE_MIGRATION]: {
    isEmailAction: false,
    variants: [{ label: '', emailTemplate: '', hasReminder: false, reminderEmailTemplate: '', hasConstraints: false, constraintsConnectionsIn: [], constraintsConnectionsNotIn: [], constraintsOriginsIn: [], constraintsOriginsNotIn: [], constraintsDirectionsIn: [], constraintsDirectionsNotIn: [], constraintsStatesIn: [], constraintsStatesNotIn: [] }],
  },
};

// ------------------------------------------------------------------------------------------------

export const CustomEdgeToolbarPlaceholderComponent: React.FC = () => {
  const edges = useEdges<Action>();
  const id = useRecoilValue(selectedEdgeIdsState)?.[0];
  const edgeLabelCoords = useRecoilValue(selectedEdgeLabelCoordsState);
  const edge = useMemo(() => edges.find(e => e.id === id), [edges, id]);

  if (!edge || !edgeLabelCoords) return null;
  return <CustomEdgeToolbarComponent edge={edge} edgeLabelCoords={edgeLabelCoords} />;
};

type CustomEdgeToolbarProps = {
  edge: Edge<Action>;
  edgeLabelCoords: XYPosition;
};
const CustomEdgeToolbarComponent: React.FC<CustomEdgeToolbarProps> = ({ edge, edgeLabelCoords }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div onDoubleClick={prevent} className="edge-toolbar" style={{ left: edgeLabelCoords?.x, top: edgeLabelCoords?.y }}>
      <table>
        <tbody>
          <tr className="action-header">
            <td className="start-icon-button">{true && <ActionToggleEmailComponent id={edge.id} edge={edge} />}</td>
            <td className="label">{true && <ActionLabelComponent id={edge.id} edge={edge} />}</td>
            <td className="variant-email">{edge.data?.isEmailAction && edge.data.variants.length === 1 && <VariantEmailComponent id={edge.id} index={0} variant={edge.data.variants[0]} />}</td>
            <td className="variant-has-reminder">{edge.data?.isEmailAction && edge.data.variants.length === 1 && <VariantToggleReminderComponent id={edge.id} index={0} variant={edge.data.variants[0]} />}</td>
            <td className="variant-reminder-email">{edge.data?.isEmailAction && edge.data.variants.length === 1 && edge.data.variants[0].hasReminder && <VariantReminderEmailComponent id={edge.id} index={0} variant={edge.data.variants[0]} />}</td>
            <td className="variant-has-constraints">{edge.data?.variants.length === 1 && <VariantToggleConstraintsComponent id={edge.id} index={0} variant={edge.data.variants[0]} />}</td>
            <td className="variant-constraints">{edge.data?.variants.length === 1 && edge.data.variants[0].hasConstraints && <VariantConstraintsComponent id={edge.id} index={0} variant={edge.data.variants[0]} />}</td>
            <td className="action-add-variant">{true && <ActionAddVariantComponent id={edge.id} edge={edge} onClick={() => setExpanded(true)} />}</td>
            <td className="end-icon-button">{edge.data?.variants.length !== 1 && <VariantExpandComponent expanded={expanded} setExpanded={setExpanded} />}</td>
          </tr>
          {expanded &&
            edge.data?.variants.map((variant, index) => (
              <tr key={index} className="action-variant">
                <td className="index">
                  <div>{index + 1}</div>
                </td>
                <td className="label">{true && <VariantNameComponent id={edge.id} index={index} variant={variant} />}</td>
                <td className="variant-email">{edge.data?.isEmailAction && <VariantEmailComponent id={edge.id} index={index} variant={variant} />}</td>
                <td className="variant-has-reminder">{edge.data?.isEmailAction && <VariantToggleReminderComponent id={edge.id} index={index} variant={variant} />}</td>
                <td className="variant-reminder-email">{edge.data?.isEmailAction && edge.data.variants[index].hasReminder && <VariantReminderEmailComponent id={edge.id} index={index} variant={variant} />}</td>
                <td className="variant-has-constraints">{true && <VariantToggleConstraintsComponent id={edge.id} index={index} variant={variant} />}</td>
                <td className="variant-constraints">{edge.data?.variants[index].hasConstraints && <VariantConstraintsComponent id={edge.id} index={index} variant={variant} />}</td>
                <td className="action-add-variant"></td>
                <td className="end-icon-button">
                  {true && (
                    <VariantRemoveComponent
                      id={edge.id}
                      index={index}
                      variant={edge.data!.variants[index]}
                      onClick={() => {
                        edge.data?.variants.length === 2 && setExpanded(false);
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

// ------------------------------------------------------------------------------------------------

type ToggleButtonProps = {
  className?: string;
  iconOn: React.ReactElement;
  iconOff: React.ReactElement;
  value: boolean;
  onToggle: (value: boolean) => void;
  tooltip?: string;
};
const ToggleButtonComponent: React.FC<ToggleButtonProps> = ({ className, iconOn, iconOff, value, onToggle, tooltip }) => {
  return (
    <div className={className}>
      <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title={tooltip}>
        <IconButton size="small" onClick={() => onToggle(!value)}>
          {value ? iconOn : iconOff}
        </IconButton>
      </Tooltip>
    </div>
  );
};

// ------------------------------------------------------------------------------------------------

type FileUploadProps = {
  className?: string;
  value: string;
  onSet: (filename: string) => void;
  onReset: () => void;
  label1?: string;
  label2?: string;
};
const FileUploadComponent: React.FC<FileUploadProps> = ({ className, value, onSet, onReset, label1, label2 }) => {
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
    <div className={className}>
      <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
      <TextField
        value={value}
        onChange={ev => onSet(ev.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title={value ? `${label1} template configured` : `${label1} template not configured. Click the upload icon to configure an ${label2} template.`}>
                <IconButton size="small" color={value ? 'default' : 'warning'}>
                  <Mail fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {value && (
                <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title={`Remove ${label2} template`}>
                  <IconButton size="small" onClick={handleClear}>
                    <Clear />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title={`Upload ${label2} template`}>
                <IconButton size="small" onClick={handleUploadClick}>
                  <Upload fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        variant="standard"
        fullWidth
      />
    </div>
  );
};

// ------------------------------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
const LABELS: Record<ProcessConnection, string> = {
  [ProcessConnection.AS2]: 'AS2',
  [ProcessConnection.SFTP_INTERNAL]: 'SFTP Internal',
  [ProcessConnection.SFTP_EXTERNAL]: 'SFTP External',
  [ProcessConnection.HTTP]: 'HTTP',
  [ProcessConnection.VAN]: 'VAN',
  [ProcessConnection.WEBHOOK]: 'Web Hook',
};

// ------------------------------------------------------------------------------------------------

type VariantItemProps = {
  className?: string;
  id: string;
  index: number;
  variant: Variant;
};

const VariantNameComponent: React.FC<VariantItemProps> = ({ className, id, index, variant }) => {
  const { updateEdge } = useReactFlowHooks();
  const setName = useCallback(
    (value: string) => {
      updateEdge(id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].label = value;
      });
    },
    [id, index, updateEdge],
  );
  return (
    <div className={className}>
      <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title="Variant name is for display purposes only">
        <TextField //
          className={className}
          placeholder="Variant name"
          size="small"
          variant="standard"
          value={variant.label}
          onChange={ev => setName(ev.target.value)}
          style={{ width: '200px' }}
          inputProps={{ style: { height: '26px' } }}
        />
      </Tooltip>
    </div>
  );
};

const VariantEmailComponent: React.FC<VariantItemProps> = ({ className, id, index, variant }) => {
  const { updateEdge } = useReactFlowHooks();
  const setEmailTemplate = useCallback(
    (value: string) => {
      updateEdge(id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].emailTemplate = value;
      });
    },
    [id, index, updateEdge],
  );
  return (
    <FileUploadComponent //
      className={className}
      value={variant.emailTemplate}
      onSet={setEmailTemplate}
      onReset={() => setEmailTemplate('')}
      label1="Email"
      label2="email"
    />
  );
};

const VariantToggleReminderComponent: React.FC<VariantItemProps> = ({ className, id, index, variant }) => {
  const { updateEdge } = useReactFlowHooks();
  const setHasReminder = useCallback(
    (value: boolean) => {
      updateEdge(id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].hasReminder = value;
      });
    },
    [id, index, updateEdge],
  );
  return (
    <ToggleButtonComponent //
      className={className}
      iconOff={<AlarmOutlined />}
      iconOn={<AlarmOnOutlined color="error" />}
      value={variant.hasReminder}
      onToggle={setHasReminder}
      tooltip={variant.hasReminder ? 'Click to disable reminder for this variant' : 'Click to enable reminder for this variant'}
    />
  );
};

const VariantReminderEmailComponent: React.FC<VariantItemProps> = ({ className, id, index, variant }) => {
  const { updateEdge } = useReactFlowHooks();
  const setReminderEmailTemplate = useCallback(
    (value: string) => {
      updateEdge(id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].reminderEmailTemplate = value;
      });
    },
    [id, index, updateEdge],
  );
  return (
    <FileUploadComponent //
      className={className}
      value={variant.reminderEmailTemplate}
      onSet={setReminderEmailTemplate}
      onReset={() => setReminderEmailTemplate('')}
      label1="Reminder email"
      label2="reminder email"
    />
  );
};

const VariantToggleConstraintsComponent: React.FC<VariantItemProps> = ({ className, id, index, variant }) => {
  const { updateEdge } = useReactFlowHooks();
  const setHasConstraints = useCallback(
    (value: boolean) => {
      updateEdge(id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].hasConstraints = value;
      });
    },
    [id, index, updateEdge],
  );
  return (
    <ToggleButtonComponent //
      className={className}
      iconOff={<LockOpen />}
      iconOn={<Lock color="error" />}
      value={variant.hasConstraints}
      onToggle={setHasConstraints}
      tooltip={variant.hasConstraints ? 'Click to disable constraints for this variant' : 'Click to enable constraints for this variant'}
    />
  );
};

const VariantConstraintsComponent: React.FC<VariantItemProps> = ({ className, id, index, variant }) => {
  const { updateEdge } = useReactFlowHooks();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const setConnections = useCallback(
    (connections: ProcessConnection[]) => {
      updateEdge(id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].constraintsConnectionsIn = connections;
      });
    },
    [id, index, updateEdge],
  );
  const toggleConnectionConstraint = useCallback(
    (value: ProcessConnection) => {
      if (variant.constraintsConnectionsIn.includes(value)) {
        setConnections(variant.constraintsConnectionsIn.filter(it => it !== value));
      } else {
        setConnections([...variant.constraintsConnectionsIn, value]);
      }
    },
    [variant.constraintsConnectionsIn, setConnections],
  );
  return (
    <div className={className}>
      <div className="chips" onClick={ev => setAnchorEl(ev.currentTarget)}>
        {variant.constraintsConnectionsIn.map(connection => (
          <Chip key={connection} onDelete={() => setConnections(variant.constraintsConnectionsIn.filter(it => it !== connection))} label={LABELS[connection]} size="small" variant="outlined" color="default" />
        ))}
        {variant.constraintsConnectionsIn.length === 0 && <Chip label="Add constraints" size="small" variant="outlined" color="default" />}
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
          <ListItemButton dense selected={variant.constraintsConnectionsIn.includes(ProcessConnection.AS2)} onClick={() => toggleConnectionConstraint(ProcessConnection.AS2)}>
            AS2
          </ListItemButton>
          <ListItemButton dense selected={variant.constraintsConnectionsIn.includes(ProcessConnection.SFTP_INTERNAL)} onClick={() => toggleConnectionConstraint(ProcessConnection.SFTP_INTERNAL)}>
            SFTP Internal
          </ListItemButton>
          <ListItemButton dense selected={variant.constraintsConnectionsIn.includes(ProcessConnection.SFTP_EXTERNAL)} onClick={() => toggleConnectionConstraint(ProcessConnection.SFTP_EXTERNAL)}>
            SFTP External
          </ListItemButton>
          <ListItemButton dense selected={variant.constraintsConnectionsIn.includes(ProcessConnection.HTTP)} onClick={() => toggleConnectionConstraint(ProcessConnection.HTTP)}>
            HTTP
          </ListItemButton>
          <ListItemButton dense selected={variant.constraintsConnectionsIn.includes(ProcessConnection.VAN)} onClick={() => toggleConnectionConstraint(ProcessConnection.VAN)}>
            VAN
          </ListItemButton>
          <ListItemButton dense selected={variant.constraintsConnectionsIn.includes(ProcessConnection.WEBHOOK)} onClick={() => toggleConnectionConstraint(ProcessConnection.WEBHOOK)}>
            Web Hook
          </ListItemButton>
        </List>
      </Popover>
    </div>
  );
};

const VariantRemoveComponent: React.FC<VariantItemProps & { onClick: () => void }> = ({ className, id, index, onClick }) => {
  const { updateEdge } = useReactFlowHooks();
  const remove = useCallback(() => {
    updateEdge(id, draft => {
      draft.data = draft.data ?? {
        isEmailAction: false,
        variants: [],
      };
      draft.data.variants.splice(index, 1);
    });
    onClick();
  }, [id, index, onClick, updateEdge]);
  return (
    <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title="Remove this variant">
      <IconButton className={className} onClick={remove}>
        <Clear />
      </IconButton>
    </Tooltip>
  );
};

type ActionItemProps = {
  className?: string;
  id: string;
  edge: Edge<Action>;
};

const ActionToggleEmailComponent: React.FC<ActionItemProps> = ({ className, id, edge }) => {
  const { updateEdge } = useReactFlowHooks();
  const toggleEmailAction = useCallback(() => {
    updateEdge(id, draft => {
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
  }, [id, updateEdge]);
  return <ToggleButtonComponent className={className} iconOn={<MailOutline color="error" />} iconOff={<MailOutline />} value={edge.data?.isEmailAction ?? false} onToggle={toggleEmailAction} tooltip={edge.data?.isEmailAction ?? false ? 'Click to revert to a simple action' : 'Click to convert to an email action'} />;
};

const ActionLabelComponent: React.FC<ActionItemProps> = ({ className, id, edge }) => {
  const { updateEdge } = useReactFlowHooks();
  const onAutoCompleteChange = useCallback(
    async (_ev: SyntheticEvent, value: AutocompleteValue<React.ReactNode, false, true, true>) => {
      updateEdge(id, draft => {
        draft.label = value;
        draft.data = ACTION_MAP[value as AutoCompleteOptions] ?? draft.data;
      });
    },
    [id, updateEdge],
  );
  return (
    <div className={className}>
      <Autocomplete //
        id="tags-standard"
        freeSolo
        disableClearable
        autoFocus
        autoSelect
        value={edge.label ?? ''}
        options={AUTOCOMPLETE_OPTIONS}
        onChange={onAutoCompleteChange}
        componentsProps={{ popper: { style: { width: 300 } } }}
        renderOption={(props, option, { selected }) => (
          <ListItem dense disablePadding disableGutters {...props} selected={selected}>
            {option}
          </ListItem>
        )}
        renderInput={params => (
          <TextField //
            {...params}
            autoFocus
            variant="standard"
            placeholder="Name"
            fullWidth
          />
        )}
      />
    </div>
  );
};

const ActionAddVariantComponent: React.FC<ActionItemProps & { onClick: () => void }> = ({ className, id, edge, onClick }) => {
  const { updateEdge } = useReactFlowHooks();
  const addVariant = useCallback(() => {
    updateEdge(id, draft => {
      draft.data = draft.data ?? {
        isEmailAction: false,
        variants: [],
      };
      draft.data.variants.push({
        label: ``,
        emailTemplate: '',
        hasReminder: false,
        reminderEmailTemplate: '',
        hasConstraints: false,
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
    onClick();
  }, [id, onClick, updateEdge]);
  return (
    <div className={className}>
      <div>
        <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title="Add a new variant">
          <Button size="small" variant="contained" onClick={addVariant}>
            Add Variant{edge.data?.variants.length === 1 ? '' : ` [${edge.data?.variants.length}]`}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

type VariantExpandCollapseProps = {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
};

const VariantExpandComponent: React.FC<VariantExpandCollapseProps> = ({ expanded, setExpanded }) => {
  return (
    <IconButton size="small" onClick={() => setExpanded(!expanded)}>
      {expanded ? (
        <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title="Hide variants">
          <ExpandMore />
        </Tooltip>
      ) : (
        <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title="Show variants">
          <ExpandLess />
        </Tooltip>
      )}
    </IconButton>
  );
};
