import { AlarmOutlined } from '@mui/icons-material';
import { Autocomplete, AutocompleteValue, Button, IconButton, ListItem, Stack, TextField, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { SyntheticEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { Handle, NodeProps, NodeToolbar, Position, useEdges } from 'reactflow';
import { useRecoilState, useRecoilValue } from 'recoil';
import { showToast2 } from '../common/MySnackbar';
import { STAGE_AUTOCOMPLETE_OPTIONS, STAGE_TYPES_LOOKUP } from './constants';
import { useReactFlowHooks } from './hooks';
import { activeConstraintState, deadEndNodeIdsState, editingIdState, visitedIdsState } from './states';
import { Action, Stage, StageAutoCompleteOptions, StageType } from './types';

export const CustomNode: React.FC<NodeProps<Stage>> = ({ id, selected, dragging, data: { label, type } }) => {
  //
  // Ref for the input element
  const ref = useRef<HTMLInputElement>(null);

  // Editing ID
  const [editingId, setEditingId] = useRecoilState(editingIdState);

  // Check if this node is being edited
  const isEditing = editingId?.id === id;

  // Focus the input element when editing
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        ref.current?.focus?.();
        ref.current?.select?.();
      }, 0);
    }
  }, [isEditing]);

  // Hook to update the node
  const { updateNode } = useReactFlowHooks();

  // Get all edges
  const edges = useEdges<Action>();

  // Get IDs to check if this visited or a dead end
  const visitedIds = useRecoilValue(visitedIdsState);
  const deadEndNodeIds = useRecoilValue(deadEndNodeIdsState);
  const activeConstraint = useRecoilValue(activeConstraintState);
  const shouldMakeTransparent = !!activeConstraint && !visitedIds.has(id);

  // Check if this node has reminders
  const hasReminders = edges.some(e => e.target === id && e.data?.isEmailAction && e.data.variants.some(v => v.hasReminder));
  const reminderColor = useMemo(() => {
    switch (type) {
      case StageType.START:
        return 'default';
      case StageType.NORMAL:
        return 'primary';
      case StageType.AWAITING_REPLY:
        return 'warning';
      case StageType.ERROR:
        return 'error';
      case StageType.DONE:
        return 'success';
    }
  }, [type]);

  // Handle the autocomplete change
  const onAutoCompleteChange = useCallback(
    (_ev: SyntheticEvent, value: AutocompleteValue<string, false, true, true>) => {
      updateNode(id, draft => {
        draft.data.label = value;
        draft.data.type = STAGE_TYPES_LOOKUP[value as StageAutoCompleteOptions] ?? draft.data.type;
      });
      setEditingId(undefined);
    },
    [id, setEditingId, updateNode],
  );

  // Handle the input blur
  const onInputBlur = useCallback<React.FocusEventHandler>(() => {
    setEditingId(undefined);
  }, [setEditingId]);

  // Set the type of the stage
  const setType = useCallback(
    (type: StageType) => {
      if (type === StageType.START && edges.some(e => e.target === id)) {
        showToast2('Cannot change type to Start since there are incoming connections!');
        return;
      }
      if (type === StageType.DONE && edges.some(e => e.source === id)) {
        showToast2('Cannot change type to Done since there are outgoing connections!');
        return;
      }
      updateNode(id, draft => {
        draft.data.type = type;
      });
    },
    [edges, id, updateNode],
  );

  // Handles
  const handles = useMemo(() => {
    const handles = [];
    for (let i = -1; i <= 1; ++i) {
      if (type !== StageType.START) {
        handles.push(
          <Handle className={classNames('handle', 'top', `index_${i}`)} key={`up_${i}_target`} id={`up_${i}_target`} type="target" position={Position.Top}>
            <div className="handle-inner"></div>
          </Handle>,
        );
        handles.push(
          <Handle className={classNames('handle', 'bottom', `index_${i}`)} key={`dn_${i}_target`} id={`dn_${i}_target`} type="target" position={Position.Bottom}>
            <div className="handle-inner"></div>
          </Handle>,
        );
      }
      if (type !== StageType.DONE) {
        handles.push(
          <Handle className={classNames('handle', 'top', `index_${i}`)} key={`up_${i}_source`} id={`up_${i}_source`} type="source" position={Position.Top}>
            <div className="handle-inner"></div>
          </Handle>,
        );
        handles.push(
          <Handle className={classNames('handle', 'bottom', `index_${i}`)} key={`dn_${i}_source`} id={`dn_${i}_source`} type="source" position={Position.Bottom}>
            <div className="handle-inner"></div>
          </Handle>,
        );
      }
    }
    for (let i = -1; i <= 1; ++i) {
      if (type !== StageType.START) {
        handles.push(
          <Handle className={classNames('handle', 'left', `index_${i}`)} key={`lt_${i}_target`} id={`lt_${i}_target`} type="target" position={Position.Left}>
            <div className="handle-inner"></div>
          </Handle>,
        );
        handles.push(
          <Handle className={classNames('handle', 'right', `index_${i}`)} key={`rt_${i}_target`} id={`rt_${i}_target`} type="target" position={Position.Right}>
            <div className="handle-inner"></div>
          </Handle>,
        );
      }
      if (type !== StageType.DONE) {
        handles.push(
          <Handle className={classNames('handle', 'left', `index_${i}`)} key={`lt_${i}_source`} id={`lt_${i}_source`} type="source" position={Position.Left}>
            <div className="handle-inner"></div>
          </Handle>,
        );
        handles.push(
          <Handle className={classNames('handle', 'right', `index_${i}`)} key={`rt_${i}_source`} id={`rt_${i}_source`} type="source" position={Position.Right}>
            <div className="handle-inner"></div>
          </Handle>,
        );
      }
    }
    return handles;
  }, [type]);

  // console.log('Rendering CustomNode', "label", label, "type", type, "isEditing", isEditing, "selected", selected, "dragging", dragging, "shouldMakeTransparent", shouldMakeTransparent);

  return (
    <>
      <Tooltip
        PopperProps={{ className: 'workflow' }}
        placement="top"
        arrow
        disableInteractive
        title={
          isEditing || selected ? null : (
            <>
              Stage: <b>{label}</b>
              {hasReminders || deadEndNodeIds.has(id) ? (
                <ul>
                  {hasReminders && <li>Has reminders</li>}
                  {deadEndNodeIds.has(id) && <li>Dead end! Process arriving at this communication stage will not be able to progress any further!</li>}
                </ul>
              ) : null}
            </>
          )
        }>
        <div className={classNames('custom-node', selected && 'selected', dragging && 'dragging', type, deadEndNodeIds.has(id) && 'dead-end')} tabIndex={-1} style={{ opacity: !shouldMakeTransparent ? 1 : 0.25 }}>
          <div className="content">
            {isEditing && (
              <Autocomplete //
                id="tags-standard"
                freeSolo
                disableClearable
                autoFocus
                autoSelect
                value={label}
                options={STAGE_AUTOCOMPLETE_OPTIONS}
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
      <NodeToolbar position={Position.Top} offset={20} className={classNames('node-toolbar', selected && 'selected', dragging && 'dragging')}>
        <Stack direction="row" spacing={1}>
          <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title="Change this state to START. It is the first state in a workflow and can only have actions leading away from it.">
            <Button className={classNames(StageType.START, type === StageType.START && 'selected')} variant="outlined" size="small" onClick={() => setType(StageType.START)}>
              Start
            </Button>
          </Tooltip>
          <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title="Change this state to REGULAR. This indicates to WG user that migration is progressing as expected.">
            <Button className={classNames(StageType.NORMAL, type === StageType.NORMAL && 'selected')} variant="outlined" size="small" onClick={() => setType(StageType.NORMAL)}>
              Normal
            </Button>
          </Tooltip>
          <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title="Change this state to AWAITING REPLY. This indicates to WG user a reply is being awaited from the partner.">
            <Button className={classNames(StageType.AWAITING_REPLY, type === StageType.AWAITING_REPLY && 'selected')} variant="outlined" size="small" onClick={() => setType(StageType.AWAITING_REPLY)}>
              Awaiting reply
            </Button>
          </Tooltip>
          <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title="Change this state to ERROR. This indicates to WG user that an intervention is required to bring the migration back on track.">
            <Button className={classNames(StageType.ERROR, type === StageType.ERROR && 'selected')} variant="outlined" size="small" onClick={() => setType(StageType.ERROR)}>
              Error
            </Button>
          </Tooltip>
          <Tooltip PopperProps={{ className: 'workflow' }} placement="top" arrow disableInteractive title="Change this state to DONE. This indicates to WG user that the migration is complete. It is the last state in a workflow and can only have actions leading to it. In order to support a particular connection type, there must be a valid path from START to DONE for that connection type.">
            <Button className={classNames(StageType.DONE, type === StageType.DONE && 'selected')} variant="outlined" size="small" onClick={() => setType(StageType.DONE)}>
              Done
            </Button>
          </Tooltip>
        </Stack>
      </NodeToolbar>
    </>
  );
};
