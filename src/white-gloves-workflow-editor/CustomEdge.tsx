import { ContentCopyOutlined, Lock, MailOutline } from '@mui/icons-material';
import { ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useMemo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, MarkerType, Position, getBezierPath, useReactFlow, useViewport } from 'reactflow';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { selectedProcessConnectionState, selectedEdgeLabelCoordsState, visitedIdsState } from './states';
import { Action, Stage } from './types';
import { prevent } from '../common/helpers';

export const CustomEdge: React.FC<EdgeProps<Action>> = ({ id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, selected, label, data, ...props }) => {
  //
  const isEmailAction = data?.isEmailAction ?? false;
  const visitedIds = useRecoilValue(visitedIdsState);
  const selectedConnection = useRecoilValue(selectedProcessConnectionState);
  const shouldMakeTransparent = selectedConnection && !visitedIds.has(id);
  const shouldEnhance = !!selectedConnection && visitedIds.has(id);

  const { flowToScreenPosition } = useReactFlow<Stage, Action>();
  const viewport = useViewport();

  const setEdgeLabelCoords = useSetRecoilState(selectedEdgeLabelCoordsState);
  const [path, labelX, labelY] = useMemo(() => getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition }), [sourcePosition, sourceX, sourceY, targetPosition, targetX, targetY]);
  // const [path, labelX, labelY] = useMemo(() => getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition }), [sourcePosition, sourceX, sourceY, targetPosition, targetX, targetY]);

  const markerEnd = useMemo(() => {
    if (selected) {
      switch (targetPosition) {
        case Position.Top:
          return 'url(#arrow-dark-grey-top)';
        case Position.Bottom:
          return 'url(#arrow-dark-grey-bottom)';
        case Position.Left:
          return 'url(#arrow-dark-grey-left)';
        case Position.Right:
          return 'url(#arrow-dark-grey-right)';
      }
    } else {
      switch (targetPosition) {
        case Position.Top:
          return 'url(#arrow-light-grey-top)';
        case Position.Bottom:
          return 'url(#arrow-light-grey-bottom)';
        case Position.Left:
          return 'url(#arrow-light-grey-left)';
        case Position.Right:
          return 'url(#arrow-light-grey-right)';
      }
    }
  }, [selected, targetPosition]);

  const edgeCss = useMemo<React.CSSProperties>(
    () => ({
      animation: 'dashdraw 0.5s linear infinite',
      markerEnd,
      stroke: selected || shouldEnhance ? '#404040' : '#808080',
      strokeDasharray: '5',
      strokeWidth: selected || shouldEnhance ? 3 : 2,
      opacity: !shouldMakeTransparent ? 1 : 0.25,
    }),
    [markerEnd, selected, shouldEnhance, shouldMakeTransparent],
  );

  useEffect(() => {
    if (selected) {
      const { x, y } = flowToScreenPosition({ x: labelX, y: labelY });
      setEdgeLabelCoords({ x, y });
    }
  }, [flowToScreenPosition, labelX, labelY, selected, setEdgeLabelCoords, viewport]);

  const hasConstraints = useMemo(() => {
    return data?.variants.some(action => {
      if (action.constraintsConnectionsIn.length > 0) return true;
      if (action.constraintsConnectionsNotIn.length > 0) return true;
      if (action.constraintsDirectionsIn.length > 0) return true;
      if (action.constraintsDirectionsNotIn.length > 0) return true;
      if (action.constraintsOriginsIn.length > 0) return true;
      if (action.constraintsOriginsNotIn.length > 0) return true;
      if (action.constraintsStatesIn.length > 0) return true;
      if (action.constraintsStatesNotIn.length > 0) return true;
      return false;
    });
  }, [data?.variants]);

  return (
    <>
      <BaseEdge {...props} id={id} path={path} markerEnd={MarkerType.Arrow} style={edgeCss} />
      <EdgeLabelRenderer>
        <div onDoubleClick={prevent} className={classNames('edge-label', selected && 'selected')} style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}>
          <ListItem dense disablePadding style={{ opacity: !shouldMakeTransparent ? 1 : 0.25 }}>
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
            <Tooltip PopperProps={{ className: 'workflow'}}
              placement="top"
              arrow
              disableInteractive
              title={
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
              }>
              <ListItemText>{label}</ListItemText>
            </Tooltip>
          </ListItem>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
