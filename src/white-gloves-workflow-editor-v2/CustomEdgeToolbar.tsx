import { AlarmOnOutlined, AlarmOutlined, Clear, ExpandLess, ExpandMore, Lock, LockOpen, Mail, MailOutline, Upload } from '@mui/icons-material';
import { Autocomplete, AutocompleteValue, Button, Chip, IconButton, InputAdornment, List, ListItem, ListItemButton, Popover, TextField, Tooltip } from '@mui/material';
import React, { ChangeEvent, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Edge, useEdges, XYPosition } from 'reactflow';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ACTION_AUTOCOMPLETE_OPTIONS, ACTIONS_LOOKUP, TOUR_FSM } from './constants';
import { useReactFlowHooks } from './hooks';
import { edgeLabelCoordsState, editingIdState, tourStateState } from './states';
import { Action, ActionAutoCompleteOptions, Constraint, TourAction, Variant } from './types';
import { executeFSM } from './state-machine';

export const CustomEdgeToolbarPlaceholderComponent: React.FC = () => {
  //
  const edges = useEdges<Action>();

  // Editing ID
  const editingId = useRecoilValue(editingIdState);

  const edgeLabelCoords = useRecoilValue(edgeLabelCoordsState);

  const edge = useMemo(() => (editingId ? edges.find(e => e.id === editingId.id) : null), [edges, editingId]);

  if (!edge || !edgeLabelCoords) return null;

  return <CustomEdgeToolbarComponent edge={edge} edgeLabelCoords={edgeLabelCoords} />;
};

type CustomEdgeToolbarProps = {
  edge: Edge<Action>;
  edgeLabelCoords: XYPosition;
};
const CustomEdgeToolbarComponent: React.FC<CustomEdgeToolbarProps> = ({ edge, edgeLabelCoords }) => {
  const [expanded, setExpanded] = useState(false);
  const setTourState = useSetRecoilState(tourStateState);

  const onAddVariant = useCallback(() => {
    setExpanded(true);
    setTourState(value => executeFSM(TOUR_FSM, value, TourAction.ACTION_CONFIGURED));
  }, [setTourState]);

  return (
    <div className="edge-toolbar" style={{ left: edgeLabelCoords?.x, top: edgeLabelCoords?.y }}>
      <table>
        <tbody>
          <tr className="action-header">
            <td className="start-icon-button">{true && <ActionToggleEmailComponent id={edge.id} edge={edge} />}</td>
            <td className="label">{true && <ActionLabelComponent id={edge.id} edge={edge} setExpanded={setExpanded} />}</td>
            <td className="variant-email">{edge.data?.isEmailAction && edge.data.variants.length === 1 && <VariantEmailComponent id={edge.id} index={0} variant={edge.data.variants[0]} />}</td>
            <td className="variant-has-reminder">{edge.data?.isEmailAction && edge.data.variants.length === 1 && <VariantToggleReminderComponent id={edge.id} index={0} variant={edge.data.variants[0]} />}</td>
            <td className="variant-reminder-email">{edge.data?.isEmailAction && edge.data.variants.length === 1 && edge.data.variants[0].hasReminder && <VariantReminderEmailComponent id={edge.id} index={0} variant={edge.data.variants[0]} />}</td>
            <td className="variant-has-constraints">{edge.data?.variants.length === 1 && <VariantToggleConstraintsComponent id={edge.id} index={0} variant={edge.data.variants[0]} />}</td>
            <td className="variant-constraints">{edge.data?.variants.length === 1 && edge.data.variants[0].hasConstraints && <VariantConstraintsComponent id={edge.id} index={0} variant={edge.data.variants[0]} />}</td>
            <td className="action-add-variant">{true && <ActionAddVariantComponent id={edge.id} edge={edge} onClick={onAddVariant} />}</td>
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
      <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title={tooltip}>
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
              <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title={value ? `${label1} template configured` : `${label1} template not configured. Click the upload icon to configure an ${label2} template.`}>
                <IconButton size="small" color={value ? 'default' : 'warning'}>
                  <Mail fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {value && (
                <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title={`Remove ${label2} template`}>
                  <IconButton size="small" onClick={handleClear}>
                    <Clear />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title={`Upload ${label2} template`}>
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

const LABELS: Record<Constraint, string> = {
  [Constraint.AS2]: 'AS2',
  [Constraint.SFTP_INTERNAL]: 'SFTP Internal',
  [Constraint.SFTP_EXTERNAL]: 'SFTP External',
  [Constraint.HTTP]: 'HTTP',
  [Constraint.VAN]: 'VAN',
  [Constraint.WEBHOOK]: 'Web Hook',
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
      <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title="Variant name is for display purposes only">
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
    (connections: Constraint[]) => {
      updateEdge(id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].constraints = connections;
      });
    },
    [id, index, updateEdge],
  );
  const toggleConnectionConstraint = useCallback(
    (value: Constraint) => {
      if (variant.constraints.includes(value)) {
        setConnections(variant.constraints.filter(it => it !== value));
      } else {
        setConnections([...variant.constraints, value]);
      }
    },
    [variant.constraints, setConnections],
  );
  return (
    <div className={className}>
      <div className="chips" onClick={ev => setAnchorEl(ev.currentTarget)}>
        {variant.constraints.map(connection => (
          <Chip key={connection} onDelete={() => setConnections(variant.constraints.filter(it => it !== connection))} label={LABELS[connection]} size="small" variant="outlined" color="default" />
        ))}
        {variant.constraints.length === 0 && <Chip label="Add constraints" size="small" variant="outlined" color="default" />}
      </div>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}>
        <List dense style={{ width: '400px' }}>
          <ListItemButton dense selected={variant.constraints.includes(Constraint.AS2)} onClick={() => toggleConnectionConstraint(Constraint.AS2)}>
            AS2
          </ListItemButton>
          <ListItemButton dense selected={variant.constraints.includes(Constraint.SFTP_INTERNAL)} onClick={() => toggleConnectionConstraint(Constraint.SFTP_INTERNAL)}>
            SFTP Internal
          </ListItemButton>
          <ListItemButton dense selected={variant.constraints.includes(Constraint.SFTP_EXTERNAL)} onClick={() => toggleConnectionConstraint(Constraint.SFTP_EXTERNAL)}>
            SFTP External
          </ListItemButton>
          <ListItemButton dense selected={variant.constraints.includes(Constraint.HTTP)} onClick={() => toggleConnectionConstraint(Constraint.HTTP)}>
            HTTP
          </ListItemButton>
          <ListItemButton dense selected={variant.constraints.includes(Constraint.VAN)} onClick={() => toggleConnectionConstraint(Constraint.VAN)}>
            VAN
          </ListItemButton>
          <ListItemButton dense selected={variant.constraints.includes(Constraint.WEBHOOK)} onClick={() => toggleConnectionConstraint(Constraint.WEBHOOK)}>
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
    <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title="Remove this variant">
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

const ActionLabelComponent: React.FC<ActionItemProps & { setExpanded: React.Dispatch<React.SetStateAction<boolean>> }> = ({ className, id, edge, setExpanded }) => {
  //
  // Ref for the input element
  const ref = useRef<HTMLInputElement>(null);

  const { updateEdge } = useReactFlowHooks();
  const onAutoCompleteChange = useCallback(
    async (_ev: SyntheticEvent, value: AutocompleteValue<React.ReactNode, false, true, true>) => {
      const newValue = ACTIONS_LOOKUP[value as ActionAutoCompleteOptions];
      if (newValue) {
        setExpanded(newValue.variants.length > 1);
      }
      updateEdge(id, draft => {
        draft.label = value;
        draft.data = newValue ?? draft.data;
      });
    },
    [id, setExpanded, updateEdge],
  );

  // Focus the input element when editing
  useEffect(() => {
    setTimeout(() => {
      ref.current?.focus?.();
      ref.current?.select?.();
    }, 0);
  }, []);

  return (
    <div className={className}>
      <Autocomplete //
        id="tags-standard"
        freeSolo
        disableClearable
        autoFocus
        autoSelect
        value={edge.label ?? ''}
        options={ACTION_AUTOCOMPLETE_OPTIONS}
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
            inputRef={ref}
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
        constraints: [],
      });
    });
    onClick();
  }, [id, onClick, updateEdge]);
  return (
    <div className={className}>
      <div>
        <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title="Add a new variant">
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
        <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title="Hide variants">
          <ExpandMore />
        </Tooltip>
      ) : (
        <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title="Show variants">
          <ExpandLess />
        </Tooltip>
      )}
    </IconButton>
  );
};
