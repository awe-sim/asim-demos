import { Button, IconButton, Stack } from '@mui/material';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Handle, NodeProps, NodeToolbar, Position, useEdges } from 'reactflow';
import { useReactFlowHooks } from './hooks';
import { Action, State, Type } from './types';
import { prevent } from '../common/helpers';
import { showToast2 } from '../common/MySnackbar';
import { AlarmOutlined } from '@mui/icons-material';

export const CustomNode: React.FC<NodeProps<State>> = ({ id, selected, dragging, data: { label, type, isEditing } }) => {
  //
  const { updateNode } = useReactFlowHooks();
  const edges = useEdges<Action>();
  const [newLabel, setNewLabel] = useState(label);
  const ref = useRef<HTMLInputElement>(null);

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
        handles.push(<Handle className="handle" id={`up_${i}_target`} type="target" position={Position.Top} style={{ transform: `translate(${i * 40}px, 0)` }} />);
        handles.push(<Handle className="handle" id={`dn_${i}_target`} type="target" position={Position.Bottom} style={{ transform: `translate(${i * 40}px, 0)` }} />);
      }
      if (type !== Type.DONE) {
        handles.push(<Handle className="handle" id={`up_${i}_source`} type="source" position={Position.Top} style={{ transform: `translate(${i * 40}px, 0)` }} />);
        handles.push(<Handle className="handle" id={`dn_${i}_source`} type="source" position={Position.Bottom} style={{ transform: `translate(${i * 40}px, 0)` }} />);
      }
    }
    for (let i = -1; i <= 1; ++i) {
      if (type !== Type.START) {
        handles.push(<Handle className="handle" id={`lt_${i}_target`} type="target" position={Position.Left} style={{ transform: `translate(0, ${-2 + i * 12}px)` }} />);
        handles.push(<Handle className="handle" id={`rt_${i}_target`} type="target" position={Position.Right} style={{ transform: `translate(0, ${-2 + i * 12}px)` }} />);
      }
      if (type !== Type.DONE) {
        handles.push(<Handle className="handle" id={`lt_${i}_source`} type="source" position={Position.Left} style={{ transform: `translate(0, ${-2 + i * 12}px)` }} />);
        handles.push(<Handle className="handle" id={`rt_${i}_source`} type="source" position={Position.Right} style={{ transform: `translate(0, ${-2 + i * 12}px)` }} />);
      }
    }
    return handles;
  }, [type]);

  return (
    <>
      <div className={classNames('custom-node', selected && 'selected', dragging && 'dragging', type)} tabIndex={-1}>
        <div onDoubleClick={onContentDoubleClick} className="content">
          <span className="label">{isEditing ? <input ref={ref} autoFocus value={newLabel} onChange={onInputChange} onKeyDown={onInputKeyDown} onBlur={onInputBlur} /> : label}</span>
          {hasReminders && (
            <IconButton size="small" color={reminderColor} style={{ paddingTop: 0, paddingBottom: 0 }}>
              <AlarmOutlined fontSize="small" />
            </IconButton>
          )}
        </div>
        {handles}
        {/* {type !== Type.START && <Handle className="handle" id="top1Tgt" type="target" position={Position.Top} style={{ translate: -30 }} />}
        {type !== Type.START && <Handle className="handle" id="top2Tgt" type="target" position={Position.Top} />}
        {type !== Type.START && <Handle className="handle" id="top3Tgt" type="target" position={Position.Top} style={{ translate: +30 }} />}
        {type !== Type.START && <Handle className="handle" id="top4Tgt" type="target" position={Position.Top} style={{ translate: -60 }} />}
        {type !== Type.START && <Handle className="handle" id="top5Tgt" type="target" position={Position.Top} style={{ translate: +60 }} />}

        {type !== Type.START && <Handle className="handle" id="leftTgt" type="target" position={Position.Left} />}
        {type !== Type.START && <Handle className="handle" id="rightTgt" type="target" position={Position.Right} />}

        {type !== Type.START && <Handle className="handle" id="bottom1Tgt" type="target" position={Position.Bottom} style={{ translate: -30 }} />}
        {type !== Type.START && <Handle className="handle" id="bottom2Tgt" type="target" position={Position.Bottom} />}
        {type !== Type.START && <Handle className="handle" id="bottom3Tgt" type="target" position={Position.Bottom} style={{ translate: +30 }} />}
        {type !== Type.START && <Handle className="handle" id="bottom4Tgt" type="target" position={Position.Bottom} style={{ translate: -60 }} />}
        {type !== Type.START && <Handle className="handle" id="bottom5Tgt" type="target" position={Position.Bottom} style={{ translate: +60 }} />}

        {type !== Type.DONE && <Handle className="handle" id="top1Src" type="source" position={Position.Top} style={{ translate: -30 }} />}
        {type !== Type.DONE && <Handle className="handle" id="top2Src" type="source" position={Position.Top} />}
        {type !== Type.DONE && <Handle className="handle" id="top3Src" type="source" position={Position.Top} style={{ translate: +30 }} />}

        {type !== Type.DONE && <Handle className="handle" id="leftSrc" type="source" position={Position.Left} />}
        {type !== Type.DONE && <Handle className="handle" id="rightSrc" type="source" position={Position.Right} />}

        {type !== Type.DONE && <Handle className="handle" id="bottom1Src" type="source" position={Position.Bottom} style={{ translate: -30 }} />}
        {type !== Type.DONE && <Handle className="handle" id="bottom2Src" type="source" position={Position.Bottom} />}
        {type !== Type.DONE && <Handle className="handle" id="bottom3Src" type="source" position={Position.Bottom} style={{ translate: +30 }} />} */}
      </div>
      <NodeToolbar onDoubleClick={prevent} position={Position.Top} offset={20} className={classNames('node-toolbar', selected && 'selected', dragging && 'dragging')}>
        <Stack direction="row" spacing={1}>
          <Button className={classNames(Type.START, type === Type.START && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.START)}>
            Start
          </Button>
          <Button className={classNames(Type.NORMAL, type === Type.NORMAL && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.NORMAL)}>
            Normal
          </Button>
          <Button className={classNames(Type.AWAITING_REPLY, type === Type.AWAITING_REPLY && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.AWAITING_REPLY)}>
            Awaiting reply
          </Button>
          <Button className={classNames(Type.ERROR, type === Type.ERROR && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.ERROR)}>
            Error
          </Button>
          <Button className={classNames(Type.DONE, type === Type.DONE && 'selected')} variant="outlined" size="small" onClick={() => setType(Type.DONE)}>
            Done
          </Button>
        </Stack>
      </NodeToolbar>
    </>
  );
};
