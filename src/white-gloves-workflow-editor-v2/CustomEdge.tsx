import { ContentCopyOutlined, Lock, MailOutline } from '@mui/icons-material';
import { ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useMemo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, MarkerType, useReactFlow, useViewport } from 'reactflow';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { activeConstraintState, edgeLabelCoordsState, editingIdState, visitedIdsState } from './states';
import { Action, Stage } from './types';

export const CustomEdge: React.FC<EdgeProps<Action>> = ({ id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, selected, label, data, ...props }) => {
  //
  // Editing ID
  const [editingId, setEditingId] = useRecoilState(editingIdState);

  // Check if this node is being edited
  const isEditing = editingId?.id === id && editingId.type === 'edge';

  // Set the edge label coordinates
  const setEdgeLabelCoords = useSetRecoilState(edgeLabelCoordsState);
  const { flowToScreenPosition } = useReactFlow<Stage, Action>();
  const viewport = useViewport();

  // Clear the editing ID if the edge is not selected
  useEffect(() => {
    // setEditingId(value => (!selected && value === id ? undefined : value));
    setEditingId(value => (!selected && value?.id === id && value.type === 'edge' ? undefined : value));
  }, [id, selected, setEditingId]);

  // Whether the edge is an email action
  const isEmailAction = data?.isEmailAction ?? false;

  // Get IDs to check if the edge is visited
  const visitedIds = useRecoilValue(visitedIdsState);
  const activeConstraint = useRecoilValue(activeConstraintState);
  const shouldMakeTransparent = activeConstraint && !visitedIds.has(id);
  const shouldEnhance = !!activeConstraint && visitedIds.has(id);

  // Get the path and label position
  const [path, labelX, labelY] = useMemo(() => getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition }), [sourcePosition, sourceX, sourceY, targetPosition, targetX, targetY]);

  useEffect(() => {
    if (isEditing) {
      const { x, y } = flowToScreenPosition({ x: labelX, y: labelY });
      setEdgeLabelCoords({ x, y });
    }
  }, [flowToScreenPosition, isEditing, labelX, labelY, setEdgeLabelCoords, viewport]);

  // Edge CSS
  const edgeCss = useMemo<React.CSSProperties>(() => {
    if (selected) {
      return {
        animation: 'edge-animation 60s linear infinite',
        stroke: '#d00000',
        strokeDasharray: '7px 10px',
        strokeLinecap: 'round',
        strokeWidth: 4,
        opacity: 1,
      };
    }
    if (shouldEnhance) {
      return {
        animation: 'edge-animation 60s linear infinite',
        stroke: '#404040',
        strokeDasharray: '5',
        strokeWidth: 2,
        opacity: 1,
      };
    }
    if (shouldMakeTransparent) {
      return {
        animation: 'edge-animation 60s linear infinite',
        stroke: '#808080',
        strokeDasharray: '5',
        strokeWidth: 1,
        opacity: 0.25,
      };
    }
    return {
      animation: 'edge-animation 60s linear infinite',
      stroke: '#808080',
      strokeDasharray: '5',
      strokeWidth: 1,
      opacity: 1,
    };
  }, [selected, shouldEnhance, shouldMakeTransparent]);
  // const edgeCss = useMemo<React.CSSProperties>(
  //   () => ({
  //     animation: 'dashdraw 0.5s linear infinite',
  //     stroke: selected || shouldEnhance ? '#404040' : '#808080',
  //     strokeDasharray: '5',
  //     strokeWidth: selected || shouldEnhance ? 3 : 2,
  //     opacity: !shouldMakeTransparent ? 1 : 0.25,
  //   }),
  //   [selected, shouldEnhance, shouldMakeTransparent],
  // );

  // Check if the action has constraints
  const hasConstraints = useMemo(() => {
    return data?.variants.some(action => {
      if (action.constraints.length > 0) return true;
      return false;
    });
  }, [data?.variants]);

  return (
    <>
      <BaseEdge {...props} id={id} path={path} markerEnd={MarkerType.Arrow} style={edgeCss} />
      <EdgeLabelRenderer>
        <div className={classNames('edge-label', selected && 'selected')} style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}>
          <ListItem dense disablePadding className={classNames('custom-edge-label', selected && 'selected', isEditing && 'is-editing', shouldEnhance && 'should-enhance', shouldMakeTransparent && 'should-make-transparent')}>
            {isEmailAction && (
              <ListItemIcon>
                <MailOutline color="error" />
              </ListItemIcon>
            )}
            {hasConstraints && (
              <ListItemIcon>
                <Lock />
              </ListItemIcon>
            )}
            {data && data.variants.length > 1 && (
              <ListItemIcon>
                <ContentCopyOutlined />
              </ListItemIcon>
            )}
            <Tooltip
              PopperProps={{ className: 'workflow' }}
              placement="top"
              arrow
              disableInteractive
              title={
                isEditing && selected ? null : (
                  <>
                    Action: <b>{label}</b>
                    {isEmailAction || hasConstraints || (data && data.variants.length > 1) ? (
                      <ul>
                        {isEmailAction && <li>Email action</li>}
                        {hasConstraints && <li>Has constraints</li>}
                        {data && data.variants.length > 1 && <li>{data.variants.length} variants</li>}
                      </ul>
                    ) : null}
                  </>
                )
              }>
              <ListItemText>{label}</ListItemText>
            </Tooltip>
          </ListItem>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
