import { Clear, ExpandLess, ExpandMore, MailOutline, Upload } from '@mui/icons-material';
import { Button, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import { ChangeEvent, MouseEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import { Edge, useEdges, XYPosition } from 'reactflow';
import { useRecoilValue } from 'recoil';
import { useReactFlowHooks } from './hooks';
import { selectedEdgeIdsState, selectedEdgeLabelCoordsState } from './states';
import { Action, ProcessConnection, ProcessDirection, ProcessOrigin } from './types';
import { prevent } from '../common/helpers';
import { VariantComponent } from './CustomEdgeToolbarV2';

// ------------------------------------------------------------------------------------------------

type CustomEdgeToolbarProps = {
  edge: Edge<Action>;
  edgeLabelCoords: XYPosition;
};
const CustomEdgeToolbar: React.FC<CustomEdgeToolbarProps> = ({ edge, edgeLabelCoords }) => {
  const { updateEdge } = useReactFlowHooks();

  const inputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    ev => {
      updateEdge(edge.id, draft => {
        draft.label = ev.target.value;
      });
    },
    [edge.id, updateEdge],
  );

  const toggleEmailAction = useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
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

  const addVariation = useCallback(() => {
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

  const setVariantName = useCallback(
    (index: number, value: string) => {
      updateEdge(edge.id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].label = value;
      });
    },
    [edge.id, updateEdge],
  );

  const setVariantEmailTemplate = useCallback(
    (index: number, value: string) => {
      updateEdge(edge.id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].emailTemplate = value;
      });
    },
    [edge.id, updateEdge],
  );

  const setVariantHasReminder = useCallback(
    (index: number, value: boolean) => {
      updateEdge(edge.id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].hasReminder = value;
      });
    },
    [edge.id, updateEdge],
  );

  const setVariantReminderEmailTemplate = useCallback(
    (index: number, value: string) => {
      updateEdge(edge.id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].reminderEmailTemplate = value;
      });
    },
    [edge.id, updateEdge],
  );

  const setVariantConnections = useCallback(
    (index: number, connections: ProcessConnection[]) => {
      updateEdge(edge.id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].constraintsConnectionsIn = connections;
      });
    },
    [edge.id, updateEdge],
  );

  const setVariantDirections = useCallback(
    (index: number, directions: ProcessDirection[]) => {
      updateEdge(edge.id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].constraintsDirectionsIn = directions;
      });
    },
    [edge.id, updateEdge],
  );

  const setVariantOrigins = useCallback(
    (index: number, origins: ProcessOrigin[]) => {
      updateEdge(edge.id, draft => {
        draft.data = draft.data ?? {
          isEmailAction: false,
          variants: [],
        };
        draft.data.variants[index].constraintsOriginsIn = origins;
      });
    },
    [edge.id, updateEdge],
  );

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

  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div onDoubleClick={prevent} className="edge-toolbar-v2" style={{ left: edgeLabelCoords?.x, top: edgeLabelCoords?.y }}>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" spacing={1}>
          <ToggleButton iconOn={<MailOutline color="error" />} iconOff={<MailOutline />} value={edge.data?.isEmailAction ?? false} onToggle={toggleEmailAction} />
          <TextField label="Action Name" size="small" variant="standard" value={edge.label} onChange={inputChange} style={{ width: '200px' }} inputProps={{ style: { height: '26px' } }} />
          {edge.data && edge.data.variants.length === 1 && (
            <VariantComponent //
              variant={edge.data.variants[0]}
              showName={false}
              showTemplates={edge.data.isEmailAction}
              showRemove={false}
              setName={value => setVariantName(0, value)}
              setEmailTemplate={value => setVariantEmailTemplate(0, value)}
              toggleReminder={value => setVariantHasReminder(0, value)}
              setReminderEmailTemplate={value => setVariantReminderEmailTemplate(0, value)}
              setConnections={value => setVariantConnections(0, value)}
              setDirections={value => setVariantDirections(0, value)}
              setOrigins={value => setVariantOrigins(0, value)}
              remove={() => removeVariant(0)}
            />
          )}
          {edge.data && edge.data.variants.length > 1 && <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>{edge.data.variants.length} Variants</div>}
          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <Button size="small" variant="outlined" onClick={addVariation}>
              Add Variant
            </Button>
          </div>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandMore /> : <ExpandLess />}
          </IconButton>
        </Stack>
        {expanded &&
          edge.data &&
          edge.data.variants.length > 1 &&
          edge.data?.variants.map((variant, index) => (
            <Stack key={index} direction="row" spacing={1}>
              <VariantComponent //
                variant={variant}
                showName={true}
                showTemplates={edge.data?.isEmailAction ?? false}
                showRemove={true}
                setName={value => setVariantName(index, value)}
                setEmailTemplate={value => setVariantEmailTemplate(index, value)}
                toggleReminder={value => setVariantHasReminder(index, value)}
                setReminderEmailTemplate={value => setVariantReminderEmailTemplate(index, value)}
                setConnections={value => setVariantConnections(index, value)}
                setDirections={value => setVariantDirections(index, value)}
                setOrigins={value => setVariantOrigins(index, value)}
                remove={() => removeVariant(index)}
              />
            </Stack>
          ))}
      </Stack>
    </div>
  );
};

// ------------------------------------------------------------------------------------------------

export const CustomEdgeToolbarPlaceholder: React.FC = () => {
  const edges = useEdges<Action>();

  const [id = ''] = useRecoilValue(selectedEdgeIdsState);
  const edgeLabelCoords = useRecoilValue(selectedEdgeLabelCoordsState);
  const edge = useMemo(() => edges.find(it => it.id === id), [id, edges]);

  if (!edge || !edgeLabelCoords) return null;
  return <CustomEdgeToolbar edge={edge} edgeLabelCoords={edgeLabelCoords} />;
};

// ------------------------------------------------------------------------------------------------

type ToggleButtonProps = {
  iconOn: React.ReactElement;
  iconOff: React.ReactElement;
  value: boolean;
  onToggle: MouseEventHandler<HTMLButtonElement>;
};
export const ToggleButton: React.FC<ToggleButtonProps> = ({ iconOn, iconOff, value, onToggle }) => {
  return (
    <IconButton size="small" onClick={onToggle}>
      {value ? iconOn : iconOff}
    </IconButton>
  );
};

type FileUploadProps = {
  onSet: (file: File) => void;
  onReset: () => void;
};
export const FileUpload: React.FC<FileUploadProps> = ({ onSet, onReset }) => {
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
      onSet(event.target.files[0]);
    }
  };

  const handleClear = () => {
    setFileName('');
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
        value={fileName}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleUploadClick}>
                <Upload />
              </IconButton>
              {fileName && (
                <IconButton onClick={handleClear}>
                  <Clear />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
        variant="standard"
        fullWidth
      />
    </div>
  );
};
