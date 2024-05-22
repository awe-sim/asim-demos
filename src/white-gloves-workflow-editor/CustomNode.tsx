import { AlarmOutlined } from '@mui/icons-material';
import { Autocomplete, AutocompleteValue, Button, IconButton, ListItem, Stack, TextField, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { SyntheticEvent, useCallback, useEffect, useMemo } from 'react';
import { Handle, NodeProps, NodeToolbar, Position, useEdges } from 'reactflow';
import { useRecoilValue } from 'recoil';
import { prevent } from '../common/helpers';
import { showToast2 } from '../common/MySnackbar';
import { useReactFlowHooks } from './hooks';
import { deadEndNodeIdsState, selectedProcessConnectionState, visitedIdsState } from './states';
import { Action, State, Type } from './types';

enum AutoCompleteOptions {
  START = 'Start',
  MIGRATION_LETTER_SENT = 'Migration letter sent',
  CONNECTION_INFO_RECEIVED = 'Connection info received',
  CONNECTION_OK = 'Connection OK',
  CONNECTION_FAILED = 'Connection failed',
  CONNECTION_TEST_DATE_PROPOSED = 'Connection test date proposed',
  CONNECTION_TEST_DATE_CONFIRMED = 'Connection test date confirmed',
  GOLIVE_T_14_LETTER_SENT = 'GoLive T-14 letter sent',
  GOLIVE_T_14_LETTER_ACKNOWLEDGED = 'GoLive T-14 letter acknowledged',
  GOLIVE_T_5_LETTER_SENT = 'GoLive T-5 letter sent',
  GOLIVE_T_5_LETTER_ACKNOWLEDGED = 'GoLive T-5 letter acknowledged',
  GOLIVE_T_1_LETTER_SENT = 'GoLive T-1 letter sent',
  GOLIVE_T_1_LETTER_ACKNOWLEDGED = 'GoLive T-1 letter acknowledged',
  GOLIVE = 'GoLive',
  LIVE_LOAD_REQUESTED = 'Live load requested',
  MIGRATION_COMPLETE = 'Migration complete',
}

const AUTOCOMPLETE_OPTIONS = [
  //
  AutoCompleteOptions.START,
  AutoCompleteOptions.MIGRATION_LETTER_SENT,
  AutoCompleteOptions.CONNECTION_INFO_RECEIVED,
  AutoCompleteOptions.CONNECTION_OK,
  AutoCompleteOptions.CONNECTION_FAILED,
  AutoCompleteOptions.CONNECTION_TEST_DATE_PROPOSED,
  AutoCompleteOptions.CONNECTION_TEST_DATE_CONFIRMED,
  AutoCompleteOptions.GOLIVE_T_14_LETTER_SENT,
  AutoCompleteOptions.GOLIVE_T_14_LETTER_ACKNOWLEDGED,
  AutoCompleteOptions.GOLIVE_T_5_LETTER_SENT,
  AutoCompleteOptions.GOLIVE_T_5_LETTER_ACKNOWLEDGED,
  AutoCompleteOptions.GOLIVE_T_1_LETTER_SENT,
  AutoCompleteOptions.GOLIVE_T_1_LETTER_ACKNOWLEDGED,
  AutoCompleteOptions.GOLIVE,
  AutoCompleteOptions.LIVE_LOAD_REQUESTED,
  AutoCompleteOptions.MIGRATION_COMPLETE,
];

const TYPE_MAP: Record<AutoCompleteOptions, Type> = {
  [AutoCompleteOptions.START]: Type.START,
  [AutoCompleteOptions.MIGRATION_LETTER_SENT]: Type.NORMAL,
  [AutoCompleteOptions.CONNECTION_INFO_RECEIVED]: Type.AWAITING_REPLY,
  [AutoCompleteOptions.CONNECTION_OK]: Type.NORMAL,
  [AutoCompleteOptions.CONNECTION_FAILED]: Type.ERROR,
  [AutoCompleteOptions.CONNECTION_TEST_DATE_PROPOSED]: Type.AWAITING_REPLY,
  [AutoCompleteOptions.CONNECTION_TEST_DATE_CONFIRMED]: Type.NORMAL,
  [AutoCompleteOptions.GOLIVE_T_14_LETTER_SENT]: Type.AWAITING_REPLY,
  [AutoCompleteOptions.GOLIVE_T_14_LETTER_ACKNOWLEDGED]: Type.NORMAL,
  [AutoCompleteOptions.GOLIVE_T_5_LETTER_SENT]: Type.AWAITING_REPLY,
  [AutoCompleteOptions.GOLIVE_T_5_LETTER_ACKNOWLEDGED]: Type.NORMAL,
  [AutoCompleteOptions.GOLIVE_T_1_LETTER_SENT]: Type.AWAITING_REPLY,
  [AutoCompleteOptions.GOLIVE_T_1_LETTER_ACKNOWLEDGED]: Type.NORMAL,
  [AutoCompleteOptions.GOLIVE]: Type.NORMAL,
  [AutoCompleteOptions.LIVE_LOAD_REQUESTED]: Type.AWAITING_REPLY,
  [AutoCompleteOptions.MIGRATION_COMPLETE]: Type.DONE,
};

export const CustomNode: React.FC<NodeProps<State>> = ({ id, selected, dragging, data: { label, type, isEditing } }) => {
  //
  const { updateNode } = useReactFlowHooks();
  const edges = useEdges<Action>();

  const visitedIds = useRecoilValue(visitedIdsState);
  const deadEndNodeIds = useRecoilValue(deadEndNodeIdsState);
  const selectedConnection = useRecoilValue(selectedProcessConnectionState);
  const shouldMakeTransparent = !!selectedConnection && !visitedIds.has(id);

  const hasReminders = edges.some(e => e.target === id && e.data?.isEmailAction && e.data.variants.some(v => v.hasReminder));
  const reminderColor = useMemo(() => {
    switch (type) {
      case Type.START:
        return 'default';
      case Type.NORMAL:
        return 'primary';
      case Type.AWAITING_REPLY:
        return 'warning';
      case Type.ERROR:
        return 'error';
      case Type.DONE:
        return 'success';
    }
  }, [type]);

  const onContentDoubleClick = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      updateNode(id, draft => {
        draft.data.isEditing = true;
      });
    },
    [id, updateNode],
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onAutoCompleteChange = useCallback(
    (_ev: SyntheticEvent, value: AutocompleteValue<string, false, true, true>) => {
      updateNode(id, draft => {
        draft.data.label = value;
        draft.data.type = TYPE_MAP[value as AutoCompleteOptions] ?? draft.data.type;
        draft.data.isEditing = false;
      });
    },
    [id, updateNode],
  );

  const onInputBlur = useCallback<React.FocusEventHandler>(() => {
    updateNode(id, draft => {
      draft.data.isEditing = false;
          });
  }, [id, updateNode]);

  const setType = useCallback(
    (type: Type) => {
      if (type === Type.START && edges.some(e => e.target === id)) {
        showToast2('Cannot change type to Start if there are incoming connections!');
        return;
      }
      if (type === Type.DONE && edges.some(e => e.source === id)) {
        showToast2('Cannot change type to Done if there are outgoing connections!');
        return;
      }
      updateNode(id, draft => {
        draft.data.type = type;
      });
    },
    [edges, id, updateNode],
  );

  useEffect(() => {
    if (!selected) {
      updateNode(id, draft => {
        draft.data.isEditing = false;
      });
    }
  }, [dragging, id, isEditing, selected, updateNode]);

  const handles = useMemo(() => {
    const handles = [];
    for (let i = -1; i <= 1; ++i) {
      if (type !== Type.START) {
        handles.push(<Handle className="handle" key={`up_${i}_target`} id={`up_${i}_target`} type="target" position={Position.Top} style={{ transform: `translate(${i * 40}px, 0)` }} />);
        handles.push(<Handle className="handle" key={`dn_${i}_target`} id={`dn_${i}_target`} type="target" position={Position.Bottom} style={{ transform: `translate(${i * 40}px, 0)` }} />);
      }
      if (type !== Type.DONE) {
        handles.push(<Handle className="handle" key={`up_${i}_source`} id={`up_${i}_source`} type="source" position={Position.Top} style={{ transform: `translate(${i * 40}px, 0)` }} />);
        handles.push(<Handle className="handle" key={`dn_${i}_source`} id={`dn_${i}_source`} type="source" position={Position.Bottom} style={{ transform: `translate(${i * 40}px, 0)` }} />);
      }
    }
    for (let i = -1; i <= 1; ++i) {
      if (type !== Type.START) {
        handles.push(<Handle className="handle" key={`lt_${i}_target`} id={`lt_${i}_target`} type="target" position={Position.Left} style={{ transform: `translate(0, ${-2 + i * 12}px)` }} />);
        handles.push(<Handle className="handle" key={`rt_${i}_target`} id={`rt_${i}_target`} type="target" position={Position.Right} style={{ transform: `translate(0, ${-2 + i * 12}px)` }} />);
      }
      if (type !== Type.DONE) {
        handles.push(<Handle className="handle" key={`lt_${i}_source`} id={`lt_${i}_source`} type="source" position={Position.Left} style={{ transform: `translate(0, ${-2 + i * 12}px)` }} />);
        handles.push(<Handle className="handle" key={`rt_${i}_source`} id={`rt_${i}_source`} type="source" position={Position.Right} style={{ transform: `translate(0, ${-2 + i * 12}px)` }} />);
      }
    }
    return handles;
  }, [type]);

  return (
    <>
      <Tooltip PopperProps={{ className: 'workflow'}}
        placement="top"
        arrow
        disableInteractive
        title={
          <>
            Stage: <b>{label}</b>
            {hasReminders || deadEndNodeIds.has(id) ? (
              <ul>
                {hasReminders && <li>Has reminders</li>}
                {deadEndNodeIds.has(id) && <li>Dead end! Process arriving at this communication stage will not be able to progress any further!</li>}
              </ul>
            ) : null}
          </>
        }>
        <div className={classNames('custom-node', selected && 'selected', dragging && 'dragging', type, deadEndNodeIds.has(id) && 'dead-end')} tabIndex={-1} style={{ opacity: !shouldMakeTransparent ? 1 : 0.25 }}>
          <div onDoubleClick={onContentDoubleClick} className="content">
            {isEditing && (
              <Autocomplete //
                id="tags-standard"
                freeSolo
                disableClearable
                autoFocus
                autoSelect
                value={label}
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
                    placeholder="Stage name"
                    onBlur={onInputBlur}
                  />
                )}
              />
            )}
            {!isEditing && <span className="label">{label}</span>}
            {hasReminders && (
              <IconButton size="small" color={reminderColor} style={{ paddingTop: 0, paddingBottom: 0 }}>
                <AlarmOutlined fontSize="small" />
              </IconButton>
            )}
          </div>
          {handles}
        </div>
      </Tooltip>
      <NodeToolbar onDoubleClick={prevent} position={Position.Top} offset={20} className={classNames('node-toolbar', selected && 'selected', dragging && 'dragging')}>
        <Stack direction="row" spacing={1}>
          <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title="Change this state to START. It is the first state in a workflow and can only have actions leading away from it.">
            <Button className={classNames(Type.START, type === Type.START && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.START)}>
              Start
            </Button>
          </Tooltip>
          <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title="Change this state to REGULAR. This indicates to WG user that migration is progressing as expected.">
            <Button className={classNames(Type.NORMAL, type === Type.NORMAL && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.NORMAL)}>
              Normal
            </Button>
          </Tooltip>
          <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title="Change this state to AWAITING REPLY. This indicates to WG user a reply is being awaited from the partner.">
            <Button className={classNames(Type.AWAITING_REPLY, type === Type.AWAITING_REPLY && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.AWAITING_REPLY)}>
              Awaiting reply
            </Button>
          </Tooltip>
          <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title="Change this state to ERROR. This indicates to WG user that an intervention is required to bring the migration back on track.">
            <Button className={classNames(Type.ERROR, type === Type.ERROR && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.ERROR)}>
              Error
            </Button>
          </Tooltip>
          <Tooltip PopperProps={{ className: 'workflow'}} placement="top" arrow disableInteractive title="Change this state to DONE. This indicates to WG user that the migration is complete. It is the last state in a workflow and can only have actions leading to it. In order to support a particular connection type, there must be a valid path from START to DONE for that connection type.">
            <Button className={classNames(Type.DONE, type === Type.DONE && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.DONE)}>
              Done
            </Button>
          </Tooltip>
        </Stack>
      </NodeToolbar>
    </>
  );
};
