import { Button, IconButton, Stack, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Handle, NodeProps, NodeToolbar, Position, useEdges } from 'reactflow';
import { useReactFlowHooks } from './hooks';
import { Action, State, Type } from './types';
import { prevent } from '../common/helpers';
import { showToast2 } from '../common/MySnackbar';
import { AlarmOutlined } from '@mui/icons-material';
import { deadEndNodeIdsState, selectedProcessConnectionState, visitedIdsState } from './states';
import { useRecoilValue } from 'recoil';

export const CustomNode: React.FC<NodeProps<State>> = ({ id, selected, dragging, data: { label, type, isEditing } }) => {
  //
  const { updateNode } = useReactFlowHooks();
  const edges = useEdges<Action>();
  const [newLabel, setNewLabel] = useState(label);
  const ref = useRef<HTMLInputElement>(null);

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

  const onInputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(ev => {
    setNewLabel(ev.target.value);
  }, []);

  const onInputKeyDown = useCallback<React.KeyboardEventHandler<HTMLInputElement>>(
    ev => {
      if (ev.key === 'Enter') {
        updateNode(id, draft => {
          draft.data.label = newLabel;
          draft.data.isEditing = false;
        });
      }
    },
    [id, newLabel, updateNode],
  );

  const onInputBlur = useCallback<React.FocusEventHandler>(() => {
    updateNode(id, draft => {
      draft.data.label = newLabel;
      draft.data.isEditing = false;
    });
  }, [id, newLabel, updateNode]);

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
    if (selected && !dragging && isEditing) {
      setTimeout(() => {
        ref.current?.focus();
        ref.current?.select();
      }, 0);
    }
  }, [dragging, isEditing, selected]);

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
      <Tooltip
        placement="top"
        arrow
        disableInteractive
        title={
          deadEndNodeIds.has(id) ? (
            <>
              {label}
              <p>Dead end stage! Process reaching this state will not be able to progress any further!</p>
            </>
          ) : (
            label
          )
        }>
        <div className={classNames('custom-node', selected && 'selected', dragging && 'dragging', type, deadEndNodeIds.has(id) && 'dead-end')} tabIndex={-1} style={{ opacity: !shouldMakeTransparent ? 1 : 0.25 }}>
          <div onDoubleClick={onContentDoubleClick} className="content">
            <span className="label">{isEditing ? <input ref={ref} autoFocus value={newLabel} onChange={onInputChange} onKeyDown={onInputKeyDown} onBlur={onInputBlur} /> : label}</span>
            {hasReminders && (
              <Tooltip placement="top" arrow disableInteractive title="Reminders are set for this state.">
                <IconButton size="small" color={reminderColor} style={{ paddingTop: 0, paddingBottom: 0 }}>
                  <AlarmOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>
          {handles}
        </div>
      </Tooltip>
      <NodeToolbar onDoubleClick={prevent} position={Position.Top} offset={20} className={classNames('node-toolbar', selected && 'selected', dragging && 'dragging')}>
        <Stack direction="row" spacing={1}>
          <Tooltip placement="top" arrow disableInteractive title="Change this state to START. It is the first state in a workflow and can only have actions leading away from it.">
            <Button className={classNames(Type.START, type === Type.START && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.START)}>
              Start
            </Button>
          </Tooltip>
          <Tooltip placement="top" arrow disableInteractive title="Change this state to REGULAR. This indicates to WG user that migration is progressing as expected.">
            <Button className={classNames(Type.NORMAL, type === Type.NORMAL && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.NORMAL)}>
              Normal
            </Button>
          </Tooltip>
          <Tooltip placement="top" arrow disableInteractive title="Change this state to AWAITING REPLY. This indicates to WG user a reply is being awaited from the partner.">
            <Button className={classNames(Type.AWAITING_REPLY, type === Type.AWAITING_REPLY && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.AWAITING_REPLY)}>
              Awaiting reply
            </Button>
          </Tooltip>
          <Tooltip placement="top" arrow disableInteractive title="Change this state to ERROR. This indicates to WG user that an intervention is required to bring the migration back on track.">
            <Button className={classNames(Type.ERROR, type === Type.ERROR && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.ERROR)}>
              Error
            </Button>
          </Tooltip>
          <Tooltip placement="top" arrow disableInteractive title="Change this state to DONE. This indicates to WG user that the migration is complete. It is the last state in a workflow and can only have actions leading to it. In order to support a particular connection type, there must be a valid path from START to DONE for that connection type.">
            <Button className={classNames(Type.DONE, type === Type.DONE && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.DONE)}>
              Done
            </Button>
          </Tooltip>
        </Stack>
      </NodeToolbar>
    </>
  );
};
