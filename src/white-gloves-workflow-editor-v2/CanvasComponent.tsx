import { Button, Stack, Tooltip } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, BackgroundVariant, Controls, Edge, EdgeMouseHandler, EdgeTypes, HandleType, MiniMap, Node, NodeMouseHandler, NodeOrigin, NodeTypes, OnConnect, OnConnectEnd, OnConnectStart, OnEdgeUpdateFunc, OnInit, OnSelectionChangeFunc, Panel, ReactFlowInstance, SelectionMode, updateEdge, useEdgesState, useNodesState, useReactFlow } from 'reactflow';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';
import { CustomEdge } from './CustomEdge';
import { CustomEdgeToolbarPlaceholderComponent } from './CustomEdgeToolbar';
import { CustomNode } from './CustomNode';
import { findTargetHandle, isHistoryEqual, isMouseEvent, isReactFlowPane, makeNewEdge, makeNewNode } from './helpers';
import { History } from './history';
import { activeConstraintState, deadEndNodeIdsState, editingIdState, selectedIdsState, tourStateState, visitedIdsState } from './states';
import { Action, Constraint, HistoryItem, Stage, StageType, TourAction, TourState } from './types';
import { CONSTRAINTS, CONSTRAINTS_LOOKUP, TOUR_FSM } from './constants';
import { Graph } from './graph';
import { CheckCircle, Warning } from '@mui/icons-material';
import { canExecuteFSM, executeFSM } from './state-machine';

const INITIAL_NODES: Node<Stage>[] = [
  //
  { id: v4(), selected: false, data: { label: 'Start', type: StageType.START }, position: { x: 300, y: 300 }, type: 'CustomNode' },
  { id: v4(), selected: false, data: { label: 'Migration Complete', type: StageType.DONE }, position: { x: 600, y: 600 }, type: 'CustomNode' },
];

const INITIAL_EDGES: Edge<Action>[] = [];

const NODE_TYPES: NodeTypes = { CustomNode };
const EDGE_TYPES: EdgeTypes = { CustomEdge };
const NODE_ORIGIN: NodeOrigin = [0.5, 0.5];
const SNAP_GRID: [number, number] = [25 / 4, 25 / 4];

enum Callback {
  NONE = 0x00,
  ON_CONNECT_START = 0x02,
  ON_CONNECT_END = 0x04,
  ON_EDGE_UPDATE_START = 0x10,
}

type CallbackStack = {
  mouseX: number;
  mouseY: number;
  nodeId?: string;
  handleId?: string;
  handleType?: 'source' | 'target';
  edge?: Edge;
  callbacks: Callback;
};

export const CanvasComponent: React.FC = () => {
  //

  const {
    addEdges,
    addNodes,
    // deleteElements,
    // fitBounds,
    // fitView,
    // flowToScreenPosition,
    // getEdge,
    getEdges,
    // getIntersectingNodes,
    getNode,
    // getNodes,
    // getViewport,
    // getZoom,
    // isNodeIntersecting,
    // project,
    screenToFlowPosition,
    // setCenter,
    // setEdges,
    // setNodes,
    setViewport,
    // toObject,
    // viewportInitialized,
    // zoomIn,
    // zoomOut,
    // zoomTo,
  } = useReactFlow<Stage, Action>();

  // ----------------------------------------------------------------------------------------------
  // Tour flags
  // ----------------------------------------------------------------------------------------------

  const [tourState, setTourState] = useRecoilState(tourStateState);

  // ----------------------------------------------------------------------------------------------
  // ReactFlow instance
  // ----------------------------------------------------------------------------------------------

  // Ref to ReactFlow instance
  const refRf = useRef<ReactFlowInstance<Stage, Action> | null>(null);

  // OnInit handler: Stores the ReactFlow instance
  const onInit = useCallback<OnInit<Stage, Action>>(ref => {
    refRf.current = ref;
  }, []);

  // ----------------------------------------------------------------------------------------------
  // Nodes and edges
  // ----------------------------------------------------------------------------------------------

  // Nodes and edges state
  const [nodes, setNodes, onNodesChange] = useNodesState<Stage>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Action>(INITIAL_EDGES);

  // ----------------------------------------------------------------------------------------------
  // History
  // ----------------------------------------------------------------------------------------------

  // Undo/redo history
  const [history, setHistory] = useState<History<HistoryItem>>(new History<HistoryItem>({ nodes, edges, tourState }, 10, isHistoryEqual));

  // Save history on nodes/edges change
  useEffect(() => {
    setHistory(history.push({ nodes, edges, tourState }));
  }, [edges, history, nodes, tourState]);

  // Undo
  const undo = useCallback(() => {
    if (!history.canUndo) return;
    const [newHistory, historyItem] = history.undo();
    if (historyItem) {
      setNodes(historyItem.nodes);
      setEdges(historyItem.edges);
      setHistory(newHistory);
    }
  }, [history, setEdges, setNodes]);

  // Redo
  const redo = useCallback(() => {
    if (!history.canRedo) return;
    const [newHistory, historyItem] = history.redo();
    if (historyItem) {
      setNodes(historyItem.nodes);
      setEdges(historyItem.edges);
      setHistory(newHistory);
    }
  }, [history, setEdges, setNodes]);

  // ----------------------------------------------------------------------------------------------
  // Node creation/selection/editing
  // ----------------------------------------------------------------------------------------------

  // Setter for editing node ID
  const setEditingId = useSetRecoilState(editingIdState);
  const editingId = useRecoilValue(editingIdState);

  useEffect(() => { 
    console.log('NODES', nodes.map(it => `${it.data.label}__${it.selected}__${it.id}`));
    console.log('EDGES', edges.map(it => `${it.label}__${it.selected}__${it.id}`));
    console.log('EDITING', editingId)
  }, [edges, editingId, nodes])

  // Double-click handler: Creates a new node
  const onDoubleClick = useCallback<React.MouseEventHandler<Element>>(
    ev => {
      if (isReactFlowPane(ev)) {
        const newNode = makeNewNode(screenToFlowPosition({ x: ev.clientX, y: ev.clientY }), true);
        addNodes(newNode);
        setEditingId({ id: newNode.id, type: 'node' });
        setTourState(value => executeFSM(TOUR_FSM, value, TourAction.STAGE_CREATED));
      }
    },
    [addNodes, screenToFlowPosition, setEditingId, setTourState],
  );

  // Node double-click handler: Edits the node
  const onNodeDoubleClick = useCallback<NodeMouseHandler>((_ev, node) => setEditingId({ id: node.id, type: 'node' }), [setEditingId]);

  // Edge click handler: Edits the edge
  // const onEdgeClick = useCallback<(event: React.MouseEvent<Element, MouseEvent>, edge: Edge<Action>) => void>((ev, edge) => setEditingId(edge.id), [setEditingId]);

  // Edge double-click handler: Edits the edge
  const onEdgeDoubleClick = useCallback<EdgeMouseHandler>(
    (_ev, edge) => {
      setEditingId({ id: edge.id, type: 'edge' });
      setTourState(value => executeFSM(TOUR_FSM, value, TourAction.ACTION_EDITING));
    },
    [setEditingId, setTourState],
  );

  // ----------------------------------------------------------------------------------------------
  // Automatic node/edge creation
  // ----------------------------------------------------------------------------------------------

  // Callbacks stack
  const callbacksStack = useRef<CallbackStack | null>(null);

  // OnConnect handler: Creates a new edge between two existing nodes
  const onConnect = useCallback<OnConnect>(
    ({ source, sourceHandle, target, targetHandle }) => {
      callbacksStack.current = null;
      if (source && sourceHandle && target && targetHandle) {
        const sourceNode = getNode(source);
        const targetNode = getNode(target);
        if (sourceNode && targetNode) {
          if (getEdges().every(edge => edge.source !== source || edge.target !== target)) {
            const newEdge = makeNewEdge(source, sourceHandle, target, targetHandle, true);
            addEdges(newEdge);
            setEditingId({ id: newEdge.id, type: 'edge' });
            setTourState(value => executeFSM(TOUR_FSM, value, TourAction.ACTION_CREATED));
          }
        }
      }
    },
    [addEdges, getEdges, getNode, setEditingId, setTourState],
  );

  // OnConnectStart handler: Stores the source node and handle for potential edge and node creation
  const onConnectStart = useCallback<OnConnectStart>((ev, { nodeId, handleId, handleType }) => {
    if (nodeId && handleId && handleType && isMouseEvent(ev)) {
      callbacksStack.current = callbacksStack.current ?? { mouseX: ev.clientX, mouseY: ev.clientY, callbacks: Callback.NONE };
      callbacksStack.current.nodeId = nodeId;
      callbacksStack.current.handleId = handleId;
      callbacksStack.current.handleType = handleType;
      callbacksStack.current.callbacks |= Callback.ON_CONNECT_START;
    }
  }, []);

  // OnEdgeUpdate handler: Updates an existing edge
  const onEdgeUpdate = useCallback<OnEdgeUpdateFunc<Action>>(
    (oldEdge, newConnection) => {
      setEdges(edges => updateEdge(oldEdge, newConnection, edges));
      callbacksStack.current = null;
    },
    [setEdges],
  );

  // OnEdgeUpdateStart handler: Stores the edge for potential node creation
  const onEdgeUpdateStart = useCallback<(event: React.MouseEvent<Element, MouseEvent>, edge: Edge<Action>, handleType: HandleType) => void>((ev, edge, handleType) => {
    if (isMouseEvent(ev)) {
      callbacksStack.current = callbacksStack.current ?? { mouseX: ev.clientX, mouseY: ev.clientY, callbacks: Callback.NONE };
      callbacksStack.current.handleType = handleType;
      callbacksStack.current.edge = edge;
      callbacksStack.current.callbacks |= Callback.ON_EDGE_UPDATE_START;
    }
  }, []);

  // OnConnectEnd handler: Checks if a new edge or node needs to be created
  const onConnectEnd = useCallback<OnConnectEnd>(
    ev => {
      const mouseX = callbacksStack.current?.mouseX;
      const mouseY = callbacksStack.current?.mouseY;
      const nodeId = callbacksStack.current?.nodeId;
      const handleId = callbacksStack.current?.handleId;
      const handleType = callbacksStack.current?.handleType;
      const edge = callbacksStack.current?.edge;
      const callbacks = callbacksStack.current?.callbacks;
      callbacksStack.current = null;

      console.log(selectedIdsState);

      // If all required data is available
      if (nodeId && handleId && handleType && callbacks && isMouseEvent(ev) && mouseX !== undefined && mouseY !== undefined) {
        // Convert screen coordinates to flow coordinates for start and end points
        const { x: x1, y: y1 } = screenToFlowPosition({ x: mouseX, y: mouseY });
        const { x: x2, y: y2 } = screenToFlowPosition({ x: ev.clientX, y: ev.clientY });
        // If the distance between the start and end points is greater than the threshold
        if (Math.abs(x1 - x2) >= 50 || Math.abs(y1 - y2) >= 20) {
          const fromNode = getNode(nodeId);
          if (fromNode) {
            updateEdge;
            // If a new edge needs to be created
            if (callbacks === Callback.ON_CONNECT_START) {
              // Create a new node at the end point and select/edit it
              const toNode = makeNewNode({ x: x2, y: y2 }, true);
              addNodes(toNode);
              setEditingId({ id: toNode.id, type: 'node' });
              // If the starting node is a source, create an edge from start to end
              if (handleType === 'source') {
                const targetHandle = findTargetHandle(fromNode, toNode, false);
                const newEdge = makeNewEdge(nodeId, handleId, toNode.id, targetHandle, false);
                addEdges(newEdge);
              }
              // If the starting node is a target, create an edge from end to start
              else {
                const sourceHandle = findTargetHandle(fromNode, toNode, true);
                const newEdge = makeNewEdge(toNode.id, sourceHandle, nodeId, handleId, false);
                addEdges(newEdge);
              }
            }
            // If an existing edge needs to be updated
            else if (callbacks === (Callback.ON_EDGE_UPDATE_START | Callback.ON_CONNECT_START)) {
              if (edge) {
                // Create a new node at the end point and select/edit it
                const toNode = makeNewNode({ x: x2, y: y2 }, true);
                addNodes(toNode);
                setEditingId({ id: toNode.id, type: 'node' });
                // If the starting node is a source, update the edge source
                if (handleType === 'source') {
                  setEdges(edges =>
                    updateEdge(
                      edge,
                      {
                        source: nodeId,
                        sourceHandle: handleId,
                        target: toNode.id,
                        targetHandle: findTargetHandle(fromNode, toNode, false),
                      },
                      edges,
                    ),
                  );
                }
                // If the starting node is a target, update the edge target
                else {
                  setEdges(edges =>
                    updateEdge(
                      edge,
                      {
                        source: toNode.id,
                        sourceHandle: findTargetHandle(fromNode, toNode, true),
                        target: nodeId,
                        targetHandle: handleId,
                      },
                      edges,
                    ),
                  );
                }
              }
            }
            setTourState(value => executeFSM(TOUR_FSM, value, TourAction.ACTION_CREATED_WITH_STAGE));
          }
        }
      }
    },
    [addEdges, addNodes, getNode, screenToFlowPosition, setEdges, setEditingId, setTourState],
  );

  // ----------------------------------------------------------------------------------------------
  // Save/Load functionality
  // ----------------------------------------------------------------------------------------------

  const saveWorkflow = useCallback(() => {
    const workflow = refRf.current?.toObject();
    localStorage.setItem('workflow', JSON.stringify(workflow));
  }, []);

  const canLoadWorkflow = useCallback(() => {
    return !!localStorage.getItem('workflow');
  }, []);

  const loadWorkflow = useCallback(() => {
    const workflow = localStorage.getItem('workflow');
    if (workflow) {
      const flow = JSON.parse(workflow);
      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      setViewport({ x, y, zoom });
    }
  }, [setEdges, setNodes, setViewport]);

  const clearWorkflow = useCallback(() => {
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
  }, [setEdges, setNodes]);

  // ----------------------------------------------------------------------------------------------
  const onSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ nodes, edges }) => {
      if (nodes.length === 0) {
        setTourState(value => executeFSM(TOUR_FSM, value, TourAction.STAGE_CONFIGURED));
      }
      if (edges.length === 0) {
        setTourState(value => executeFSM(TOUR_FSM, value, TourAction.ACTION_CLOSED));
      }
    },
    [setTourState],
  );

  // const onClickConnectEnd = useCallback<OnConnectEnd>(ev => {console.log('onClickConnectEnd', ev);}, []);
  // const onClickConnectStart = useCallback<OnConnectStart>((ev, params) => {console.log('onClickConnectStart', ev, params);}, []);
  // const onEdgesDelete = useCallback<OnEdgesDelete>(edges => {console.log('onEdgesDelete', edges);}, []);
  // const onEdgeClick = useCallback<(event: React.MouseEvent<Element, MouseEvent>, edge: Edge<Action>) => void>((ev, edge) => console.log('onEdgeClick', ev, edge), []);
  // const onEdgeContextMenu = useCallback<EdgeMouseHandler>((ev, edge) => {console.log('onEdgeContextMenu', ev, edge);}, []);
  // const onEdgeMouseEnter = useCallback<EdgeMouseHandler>((ev, edge) => {console.log('onEdgeMouseEnter', ev, edge);}, []);
  // const onEdgeMouseLeave = useCallback<EdgeMouseHandler>((ev, edge) => {console.log('onEdgeMouseLeave', ev, edge);}, []);
  // const onEdgeMouseMove = useCallback<EdgeMouseHandler>((ev, edge) => {console.log('onEdgeMouseMove', ev, edge);}, []);
  // const onEdgeUpdateEnd = useCallback<(event: MouseEvent | TouchEvent, edge: Edge<Action>, handleType: HandleType) => void>((ev, edge, handleType) => {console.log('onEdgeUpdateEnd', ev, edge, handleType);}, []);
  // const onMove = useCallback<OnMove>((ev, viewport) => { console.log('onMove', ev, viewport)}, []);
  // const onMoveStart = useCallback<OnMove>((ev, viewport) => { console.log('onMoveStart', ev, viewport)}, []);
  // const onMoveEnd = useCallback<OnMove>((ev, viewport) => { console.log('onMoveEnd', ev, viewport)}, []);
  // const onNodeClick = useCallback<NodeMouseHandler>((_ev, node) => { console.log('onNodeClick', node); }, []);
  // const onNodeContextMenu = useCallback<NodeMouseHandler>((ev, node) => {console.log('onNodeContextMenu', ev, node);}, []);
  // const onNodeDrag = useCallback<NodeDragHandler>((ev, node, nodes) => { console.log('onNodeDrag', ev, node, nodes)}, []);
  // const onNodeDragStart = useCallback<NodeDragHandler>((ev, node, nodes) => { console.log('onNodeDragStart', ev, node, nodes)}, []);
  // const onNodeDragStop = useCallback<NodeDragHandler>((ev, node, nodes) => { console.log('onNodeDragStop', ev, node, nodes)}, []);
  // const onNodeMouseEnter = useCallback<NodeMouseHandler>((ev, node) => { console.log('onNodeMouseEnter', ev, node)}, []);
  // const onNodeMouseMove = useCallback<NodeMouseHandler>((ev, node) => { console.log('onNodeMouseMove', ev, node)}, []);
  // const onNodesDelete = useCallback<OnNodesDelete>(nodes => {console.log('onNodesDelete', nodes);}, []);
  // const onNodeMouseLeave = useCallback<NodeMouseHandler>((ev, node) => { console.log('onNodeMouseLeave', ev, node)}, []);
  // const onPaneClick = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>(ev => {console.log('onPaneClick', ev);}, []);
  // const onPaneContextMenu = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>((ev) => { console.log('onPaneContextMenu', ev)}, []);
  // const onPaneMouseEnter = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>((ev) => { console.log('onPaneMouseEnter', ev)}, []);
  // const onPaneMouseMove = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>((ev) => { console.log('onPaneMouseMove', ev)}, []);
  // const onPaneMouseLeave = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>((ev) => { console.log('onPaneMouseLeave', ev)}, []);
  // const onPaneScroll = useCallback<(event: React.WheelEvent<Element> | undefined) => void>(ev => {console.log('onPaneScroll', ev);}, []);
  // const onSelectionContextMenu = useCallback<(event: React.MouseEvent<Element, MouseEvent>, nodes: Node<Stage, string | undefined>[]) => void>((ev, nodes) => {console.log('onSelectionContextMenu', ev, nodes);}, []);
  // const onSelectionDrag = useCallback<SelectionDragHandler>((ev, nodes) => {console.log('onSelectionDrag', ev, nodes);}, []);
  // const onSelectionDragStop = useCallback<SelectionDragHandler>((ev, nodes) => {console.log('onSelectionDragStop', ev, nodes);}, []);
  // const onSelectionDragStart = useCallback<SelectionDragHandler>((ev, nodes) => {console.log('onSelectionDragStart', ev, nodes);}, []);
  // const onSelectionEnd = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>(ev => {console.log('onSelectionEnd', ev);}, []);
  // const onSelectionStart = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>(ev => {console.log('onSelectionStart', ev);}, []);

  // ----------------------------------------------------------------------------------------------
  // Graph validation
  // ----------------------------------------------------------------------------------------------

  // Graph instance
  const graph = useMemo(() => Graph.create(nodes, edges), [edges, nodes]);

  // Constraints status
  const constraintsOk = useMemo(() => CONSTRAINTS.map(constraint => graph.isOk(constraint)), [graph]);

  // Active constraint state
  const [activeConstraint, setActiveConstraint] = useRecoilState(activeConstraintState);

  // Visited node/edge IDs
  const setVisitedIds = useSetRecoilState(visitedIdsState);

  // Dead-end node IDs
  const setDeadEndNodeIds = useSetRecoilState(deadEndNodeIdsState);

  // Update visited/dead-end node IDs when required
  useEffect(() => {
    if (activeConstraint) {
      setVisitedIds(new Set(graph.getVisitableIds(activeConstraint)));
      setDeadEndNodeIds(new Set(graph.getDeadEndNodeIds(activeConstraint)));
    }
  }, [activeConstraint, graph, setDeadEndNodeIds, setVisitedIds]);

  // Get constraint tooltip
  function getConstraintTooltip(constraint: Constraint, status: boolean, selected: boolean): string {
    const label = CONSTRAINTS_LOOKUP[constraint];
    const tip1 = status ? `${label} constraint has been configured properly.` : `${label} constraint has NOT been configured properly.`;
    const tip2 = (() => {
      if (status) {
        return selected ? `Click to show the complete workflow.` : `Click to show ${label} portion of the workflow.`;
      } else {
        return selected ? `Click to show complete workflow.` : `Click to show ${label} portion of the workflow for troubleshooting.`;
      }
    })();
    return `${tip1} ${tip2}`;
  }

  //
  return (
    <div className="canvas-component" style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow //
        // onClickConnectEnd={onClickConnectEnd}
        // onClickConnectStart={onClickConnectStart}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        // onEdgeClick={onEdgeClick}
        // onEdgeContextMenu={onEdgeContextMenu}
        onEdgeDoubleClick={onEdgeDoubleClick}
        // onEdgeMouseEnter={onEdgeMouseEnter}
        // onEdgeMouseLeave={onEdgeMouseLeave}
        // onEdgeMouseMove={onEdgeMouseMove}
        onEdgesChange={onEdgesChange}
        // onEdgesDelete={onEdgesDelete}
        onEdgeUpdate={onEdgeUpdate}
        // onEdgeUpdateEnd={onEdgeUpdateEnd}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onInit={onInit}
        // onMove={onMove}
        // onMoveEnd={onMoveEnd}
        // onMoveStart={onMoveStart}
        // onNodeClick={onNodeClick}
        // onNodeContextMenu={onNodeContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        // onNodeDrag={onNodeDrag}
        // onNodeDragStart={onNodeDragStart}
        // onNodeDragStop={onNodeDragStop}
        // onNodeMouseEnter={onNodeMouseEnter}
        // onNodeMouseLeave={onNodeMouseLeave}
        // onNodeMouseMove={onNodeMouseMove}
        onNodesChange={onNodesChange}
        // onNodesDelete={onNodesDelete}
        // onPaneClick={onPaneClick}
        // onPaneContextMenu={onPaneContextMenu}
        // onPaneMouseEnter={onPaneMouseEnter}
        // onPaneMouseLeave={onPaneMouseLeave}
        // onPaneMouseMove={onPaneMouseMove}
        // onPaneScroll={onPaneScroll}
        onSelectionChange={onSelectionChange}
        // onSelectionContextMenu={onSelectionContextMenu}
        // onSelectionDrag={onSelectionDrag}
        // onSelectionDragStart={onSelectionDragStart}
        // onSelectionDragStop={onSelectionDragStop}
        // onSelectionEnd={onSelectionEnd}
        // onSelectionStart={onSelectionStart}

        // attributionPosition={undefined}
        // autoPanOnConnect={undefined}
        // autoPanOnNodeDrag={undefined}
        // connectionLineComponent={undefined}
        // connectionLineContainerStyle={undefined}
        // connectionLineStyle={undefined}
        // connectionLineType={undefined}
        // connectionMode={undefined}
        connectionRadius={30}
        // connectOnClick={undefined}
        // defaultEdgeOptions={undefined}
        // defaultEdges={undefined}
        // defaultMarkerColor={undefined}
        // defaultNodes={undefined}
        // defaultViewport={undefined}
        // deleteKeyCode={undefined}
        // disableKeyboardA11y={undefined}
        edges={edges}
        // edgesFocusable={undefined}
        // edgesUpdatable={undefined}
        edgeTypes={EDGE_TYPES}
        // edgeUpdaterRadius={undefined}
        // elementsSelectable={undefined}
        // elevateEdgesOnSelect={undefined}
        // elevateNodesOnSelect={undefined}
        // fitView={undefined}
        // fitViewOptions={undefined}
        // initNodeOrigin={undefined}
        // isValidConnection={undefined}
        maxZoom={20}
        minZoom={undefined}
        // multiSelectionKeyCode={undefined}
        // nodeDragThreshold={undefined}
        // nodeExtent={undefined}
        nodeOrigin={NODE_ORIGIN}
        nodes={nodes}
        // nodesConnectable={undefined}
        // nodesDraggable={undefined}
        // nodesFocusable={undefined}
        nodeTypes={NODE_TYPES}
        // noDragClassName={undefined}
        // noPanClassName={undefined}
        // noWheelClassName={undefined}
        // onError={undefined}
        // onlyRenderVisibleElements={undefined}
        // panActivationKeyCode={undefined}
        // panOnDrag={undefined}
        // panOnScroll={undefined}
        // panOnScrollMode={undefined}
        // panOnScrollSpeed={undefined}
        // preventScrolling={undefined}
        // proOptions={undefined}
        proOptions={{ hideAttribution: true }}
        // selectionKeyCode={undefined}
        selectionMode={SelectionMode.Partial}
        selectionOnDrag={true}
        // selectNodesOnDrag={undefined}
        snapGrid={SNAP_GRID}
        snapToGrid={true}
        // translateExtent={undefined}
        // zoomActivationKeyCode={undefined}
        zoomOnDoubleClick={false}
        // zoomOnPinch={undefined}
        // zoomOnScroll={undefined}
        className="white-gloves-workflow-editor"
        id="white-gloves-workflow-editor"
        // onClick={undefined}
        onDoubleClick={onDoubleClick}
        // unselectable={undefined}
        //
      >
        <CustomEdgeToolbarPlaceholderComponent />
        <MiniMap></MiniMap>
        <Controls />
        <Background //
          color="#00000010"
          gap={25}
          variant={BackgroundVariant.Lines}></Background>
        <Panel position="bottom-left" className="control-panel">
          <Stack direction="column" spacing={1}>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" disabled={!history.canUndo} onClick={undo}>
                Undo
              </Button>
              <Button size="small" variant="outlined" disabled={!history.canRedo} onClick={redo}>
                Redo
              </Button>
              <Button size="small" variant="outlined" onClick={saveWorkflow}>
                Save
              </Button>
              <Button size="small" variant="outlined" onClick={loadWorkflow} disabled={!canLoadWorkflow()}>
                Load
              </Button>
              <Button size="small" variant="outlined" onClick={clearWorkflow}>
                Clear
              </Button>
            </Stack>
            <Stack direction="row" spacing={1}>
              {CONSTRAINTS.map((constraint, index) => (
                <Tooltip PopperProps={{ className: 'workflow' }} key={constraint} placement="top" arrow disableInteractive title={getConstraintTooltip(constraint, constraintsOk[index], activeConstraint === constraint)}>
                  <Button //
                    color={graph.isOk(constraint) ? 'success' : 'warning'}
                    endIcon={graph.isOk(constraint) ? <CheckCircle /> : <Warning />}
                    variant={activeConstraint === constraint ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setActiveConstraint(value => (value === constraint ? undefined : constraint))}>
                    {CONSTRAINTS_LOOKUP[constraint]}
                  </Button>
                </Tooltip>
              ))}
            </Stack>
          </Stack>
        </Panel>
        <Panel position="top-center" className="tour-panel">
          {tourState}
          {/* {tourState === TourState.INTRODUCTION && (
            <>
              <p>
                Welcome to the <b>White Gloves Workflow Editor</b>. Here we can create and configure workflows for White Gloves migration journey. A workflow consists of a collection of <b>communication stages</b>, connected by <b>actions</b>. The WG team can execute these actions to move partners and processes along the migration journey.
              </p>
              <p>To get started, double-click an empty area on the canvas to create a new stage.</p>
            </>
          )}
          {tourState === TourState.HOW_TO_CONFIGURE_STAGE && (
            <>
              <p>Great! We just created a new communication stage! A stage represents a checkpoint in the migration journey, and informs the WG team about the current status of a partner or process.</p>
              <p>
                We should rename stages to be more meaningful. We can also choose from a list of predefined stages by pressing the <b>Up/Down</b> arrow keys in the autocomplete name field. Any stage can be renamed by double-clicking it.
              </p>
              <p>We can also change the type of stage. This is primarily for our own convenience. There are several types of stages available. Hover over a stage type to see its purpose.</p>
              <p>Go ahead and configure this stage as you please. When done, click away from the stage to exit editing mode.</p>
            </>
          )}
          {tourState === TourState.HOW_TO_CONFIGURE_STAGE___WITH_ACTION && (
            <>
              <p>
                Great! We just created a new action and a stage! We could also have double-clicked on an empty area of the canvas to create a stage, and then drag from one stage's <b>handle</b> to another to create an action linking the two.
              </p>
              <p>
                A stage represents a checkpoint in the migration journey, and informs the WG team about the current status of a partner or process. We should rename stages to be more meaningful. We can also choose from a list of predefined stages by pressing the <b>Up/Down</b> arrow keys in the autocomplete name field. Any stage can be renamed by double-clicking it.
              </p>
              <p>We can also change the type of stage. This is primarily for our own convenience. There are several types of stages available. Hover over a stage type to see its purpose.</p>
              <p>Go ahead and configure this stage as you please. When done, click away from the stage to exit editing mode.</p>
            </>
          )}
          {tourState === TourState.HOW_TO_CREATE_ACTION && (
            <>
              <p>Actions are steps that the WG team can take to move a partner or process along the migration journey.</p>
              <p>
                Drag from one stage <b>handle</b> to another to create an action.
              </p>
            </>
          )}
          {tourState === TourState.HOW_TO_CREATE_ACTION_WITH_STAGE && (
            <>
              <p>We can also drag an action from a stage handle to an empty area of the canvas. This quickly creates both a new action and a stage.</p>
              <p>Go ahead and try it out now.</p>
            </>
          )}
          {tourState === TourState.HOW_TO_CONFIGURE_ACTION && (
            <>
              <p>Just like stages, actions can be edited by double-clicking them. We can rename an action to be more meaningful.</p>
              <p>We can also convert an action into an email action, with an associated email template, and possibly reminders as well.</p>
              <p>We can also specify <b>constraints</b> for this action. Constraints restrict actions to only run for partners or processes with specific connection types.</p>
              <p>Actions can also have variants.</p>
              <p>The workflow editor renders special icons to identify email actions, and actions with constraints.</p>
            </>
          )} */}
          {/* {tourState === TourState.HOW_TO_CONFIGURE_VARIANTS && ()} */}
          {canExecuteFSM(TOUR_FSM, tourState, TourAction.NEXT) && (
            <Button size="small" variant="outlined" onClick={() => setTourState(value => executeFSM(TOUR_FSM, value, TourAction.NEXT))}>
              Next
            </Button>
          )}
          {canExecuteFSM(TOUR_FSM, tourState, TourAction.DONE) && (
            <Button size="small" variant="outlined" onClick={() => setTourState(value => executeFSM(TOUR_FSM, value, TourAction.DONE))}>
              Done
            </Button>
          )}
          {canExecuteFSM(TOUR_FSM, tourState, TourAction.DISMISS) && (
            <Button size="small" variant="outlined" onClick={() => setTourState(value => executeFSM(TOUR_FSM, value, TourAction.DISMISS))}>
              Dismiss
            </Button>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
};
