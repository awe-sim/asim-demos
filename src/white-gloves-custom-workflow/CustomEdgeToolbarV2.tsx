import { Upload, Clear, AlarmOutlined, AlarmOnOutlined, Lock, LockOpen, Mail } from '@mui/icons-material';
import { Chip, IconButton, InputAdornment, InputLabel, List, ListItem, MenuItem, Popover, Select, SelectChangeEvent, TextField } from '@mui/material';
import { ChangeEvent, useCallback, useRef, useState } from 'react';
import { ProcessConnection, ProcessOrigin, ProcessDirection, Variant } from './types';
import { prevent } from '../common/helpers';

type ToggleButtonProps = {
  iconOn: React.ReactElement;
  iconOff: React.ReactElement;
  value: boolean;
  onToggle: (value: boolean) => void;
};
export const ToggleButtonComponent: React.FC<ToggleButtonProps> = ({ iconOn, iconOff, value, onToggle }) => {
  return (
    <IconButton size="small" onClick={() => onToggle(!value)}>
      {value ? iconOn : iconOff}
    </IconButton>
  );
};

// ------------------------------------------------------------------------------------------------

type FileUploadProps = {
  value: string;
  onSet: (filename: string) => void;
  onReset: () => void;
};
export const FileUploadComponent: React.FC<FileUploadProps> = ({ value, onSet, onReset }) => {
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
              <IconButton size="small" color={value ? 'default' : 'warning'}>
                <Mail fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {value && (
                <IconButton size="small" onClick={handleClear}>
                  <Clear />
                </IconButton>
              )}
              <IconButton size="small" onClick={handleUploadClick}>
                <Upload />
              </IconButton>
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

type ConstraintsProps = {
  connections: ProcessConnection[];
  origins: ProcessOrigin[];
  directions: ProcessDirection[];
  setConnections: (connections: ProcessConnection[]) => void;
  setOrigins: (origins: ProcessOrigin[]) => void;
  setDirections: (directions: ProcessDirection[]) => void;
};
export const ConstraintsComponent: React.FC<ConstraintsProps> = ({ connections, origins, directions, setConnections, setDirections, setOrigins }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const changeConnectionConstraints = useCallback(
    (ev: SelectChangeEvent<ProcessConnection[]>) => {
      const value = ev.target.value;
      const values = typeof value === 'string' ? value.split(',').map(it => it as ProcessConnection) : value;
      setConnections(values);
    },
    [setConnections],
  );
  const changeDirectionConstraints = useCallback(
    (ev: SelectChangeEvent<ProcessDirection[]>) => {
      const value = ev.target.value;
      const values = typeof value === 'string' ? value.split(',').map(it => it as ProcessDirection) : value;
      setDirections(values);
    },
    [setDirections],
  );
  const changeOriginConstraints = useCallback(
    (ev: SelectChangeEvent<ProcessOrigin[]>) => {
      const value = ev.target.value;
      const values = typeof value === 'string' ? value.split(',').map(it => it as ProcessOrigin) : value;
      setOrigins(values);
    },
    [setOrigins],
  );

  const LABELS: Record<ProcessConnection | ProcessDirection | ProcessOrigin, string> = {
    [ProcessConnection.AS2]: 'AS2',
    [ProcessConnection.SFTP]: 'SFTP',
    [ProcessConnection.HTTP]: 'HTTP',
    [ProcessConnection.VAN]: 'VAN',
    [ProcessConnection.WEBHOOK]: 'Web Hook',
    [ProcessDirection.INBOUND]: 'Inbound',
    [ProcessDirection.OUTBOUND]: 'Outbound',
    [ProcessOrigin.INTERNAL]: 'Internal',
    [ProcessOrigin.EXTERNAL]: 'External',
  };

  return (
    <>
      <IconButton size="small">{connections.length > 0 || origins.length > 0 || directions.length > 0 ? <Lock color="error" /> : <LockOpen />}</IconButton>
      <div onClick={ev => setAnchorEl(ev.currentTarget)} style={{ width: '300px', marginTop: 'auto', marginBottom: 'auto' }}>
        {connections.map(connection => (
          <Chip key={connection} onDelete={() => setConnections(connections.filter(it => it !== connection))} label={LABELS[connection]} size="small" variant="outlined" color="default" />
        ))}
        {origins.map(origin => (
          <Chip key={origin} onDelete={() => setOrigins(origins.filter(it => it !== origin))} label={LABELS[origin]} size="small" variant="outlined" color="default" />
        ))}
        {directions.map(direction => (
          <Chip key={direction} label={LABELS[direction]} onDelete={() => setDirections(directions.filter(it => it !== direction))} size="small" variant="outlined" color="default" />
        ))}
        {connections.length === 0 && origins.length === 0 && directions.length === 0 && <Chip label="Add constraints" size="small" variant="outlined" color="default" />}
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
          <ListItem dense>
            <InputLabel id="connections">Connections</InputLabel>
            <Select labelId="connections" value={connections ?? []} size="small" variant="standard" fullWidth multiple onChange={changeConnectionConstraints}>
              <MenuItem value={ProcessConnection.AS2}>AS2</MenuItem>
              <MenuItem value={ProcessConnection.SFTP}>SFTP</MenuItem>
              <MenuItem value={ProcessConnection.HTTP}>HTTP</MenuItem>
              <MenuItem value={ProcessConnection.VAN}>VAN</MenuItem>
              <MenuItem value={ProcessConnection.WEBHOOK}>Web Hook</MenuItem>
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
          </ListItem>
        </List>
      </Popover>
    </>
  );
};

// ------------------------------------------------------------------------------------------------

type VariantProps = {
  variant: Variant;
  showName: boolean;
  showTemplates: boolean;
  showRemove: boolean;
  setName: (name: string) => void;
  setEmailTemplate: (filename: string) => void;
  toggleReminder: (value: boolean) => void;
  setReminderEmailTemplate: (filename: string) => void;
  setConnections: (connections: ProcessConnection[]) => void;
  setOrigins: (origins: ProcessOrigin[]) => void;
  setDirections: (directions: ProcessDirection[]) => void;
  remove: () => void;
};
export const VariantComponent: React.FC<VariantProps> = ({ variant, showName, showTemplates, showRemove, setName, setEmailTemplate, toggleReminder, setReminderEmailTemplate, setConnections, setDirections, setOrigins, remove }) => {
  return (
    <>
      {showName && <TextField label="Variant name" size="small" variant="standard" value={variant.label} onChange={ev => setName(ev.target.value)} style={{ width: '200px' }} inputProps={{ style: { height: '26px' } }} />}
      {showTemplates && <FileUploadComponent value={variant.emailTemplate} onSet={setEmailTemplate} onReset={() => setEmailTemplate('')} />}
      {showTemplates && <ToggleButtonComponent iconOff={<AlarmOutlined />} iconOn={<AlarmOnOutlined />} value={variant.hasReminder} onToggle={toggleReminder} />}
      {variant.hasReminder && showTemplates && <FileUploadComponent value={variant.reminderEmailTemplate} onSet={setReminderEmailTemplate} onReset={() => setReminderEmailTemplate('')} />}
      <ConstraintsComponent connections={variant.constraintsConnectionsIn} origins={variant.constraintsOriginsIn} directions={variant.constraintsDirectionsIn} setConnections={setConnections} setOrigins={setOrigins} setDirections={setDirections} />
      {showRemove && (
        <IconButton onClick={remove}>
          <Clear />
        </IconButton>
      )}
    </>
  );
};
