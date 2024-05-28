import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { addEdge, Background, BackgroundVariant, Controls, Edge, EdgeTypes, HandleType, MiniMap, Node, NodeMouseHandler, NodeOrigin, NodeTypes, OnConnect, OnConnectEnd, OnConnectStart, OnEdgesDelete, OnEdgeUpdateFunc, OnInit, OnNodesDelete, OnSelectionChangeFunc, Panel, ReactFlowInstance, SelectionDragHandler, SelectionMode, updateEdge, useEdgesState, useNodesState, useReactFlow, useViewport } from 'reactflow';
import { Action, Stage, Type } from './types';
import { v4 } from 'uuid';
import { CustomNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { editingNodeIdState, selectedEdgeIdsState, selectedNodeIdsState, selectedNodeIdState } from './states-v2';
import React from 'react';
import { CustomEdgeToolbarPlaceholderComponent } from './CustomEdgeToolbar';
import { areEdgesEqual, areNodesEqual, findTargetHandle, History, isMouseEvent, isReactFlowPane, makeNewEdge, makeNewNode } from './helpers';
import { Button } from '@mui/material';

const INITIAL_NODES: Node<Stage>[] = [
  //
  { id: v4(), data: { label: 'Start', type: Type.START }, position: { x: 300, y: 300 }, type: 'CustomNode' },
  { id: v4(), data: { label: 'Migration Complete', type: Type.DONE }, position: { x: 600, y: 600 }, type: 'CustomNode' },
];

const INITIAL_EDGES: Edge<Action>[] = [];

const NODE_TYPES: NodeTypes = { CustomNode };
const EDGE_TYPES: EdgeTypes = { CustomEdge };
const NODE_ORIGIN: NodeOrigin = [0.5, 0.5];
const SNAP_GRID: [number, number] = [25 / 4, 25 / 4];

const SELECTION_OFFSET = 10;

/**
 * Existing Node -> New Edge -> New Node
 * - onConnectStart (nodeId, handleId, handleType = source)
 * - onConnectEnd
 *
 * Existing Node -> New Edge -> Existing Node
 * - //  onConnectStart (nodeId, handleId, handleType = source)
 * - // onConnect (source, sourceHandle, target, targetHandle)
 * - // onConnectEnd
 *
 * Existing Node -> Existing Edge -> Existing Node
 * - onEdgeUpdateStart (edge, handleType = source/target)
 * - onConnectStart (nodeId, handleId, handleType = source/target)
 * - onEdgeUpdate (oldEdge, newConnection)
 * - onConnectEnd
 *
 * Existing Node -> Existing Edge -> New Node
 * - onEdgeUpdateStart (edge, handleType = source/target)
 * - onConnectStart (nodeId, handleId, handleType = source/target)
 * - onConnectEnd
 */

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

export const CanvasComponentV2: React.FC = () => {
  //

  const {
    addEdges,
    addNodes,
    deleteElements,
    fitBounds,
    fitView,
    flowToScreenPosition,
    getEdge,
    getEdges,
    getIntersectingNodes,
    getNode,
    getNodes,
    getViewport,
    getZoom,
    isNodeIntersecting,
    project,
    screenToFlowPosition,
    setCenter,
    // setEdges,
    // setNodes,
    setViewport,
    toObject,
    viewportInitialized,
    zoomIn,
    zoomOut,
    zoomTo,
  } = useReactFlow<Stage, Action>();

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
  const [history, setHistory] = useState<History<HistoryItem>>(new History<HistoryItem>({ nodes, edges }, 10, isHistoryEqual));

  // Save history on nodes/edges change
  useEffect(() => {
    if (nodes !== INITIAL_NODES || edges !== INITIAL_EDGES) {
      setHistory(history.push({ nodes, edges }));
    }
  }, [edges, history, nodes]);

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
  const setEditingNodeId = useSetRecoilState(editingNodeIdState);

  // Double-click handler: Creates a new node
  const onDoubleClick = useCallback<React.MouseEventHandler<Element>>(
    ev => {
      if (isReactFlowPane(ev)) {
        const newNode = makeNewNode(screenToFlowPosition({ x: ev.clientX, y: ev.clientY }));
        addNodes(newNode);
        setEditingNodeId(newNode.id);
      }
    },
    [addNodes, screenToFlowPosition, setEditingNodeId],
  );

  // Node double-click handler: Edits the node
  const onNodeDoubleClick = useCallback<NodeMouseHandler>((_ev, node) => setEditingNodeId(node.id), [setEditingNodeId]);

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
            const newEdge = makeNewEdge(source, sourceHandle, target, targetHandle);
            setEdges(edges => addEdge(newEdge, edges));
            return;
          }
        }
      }
    },
    [getEdges, getNode, setEdges],
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

      // If all required data is available
      if (nodeId && handleId && handleType && callbacks && isMouseEvent(ev) && mouseX !== undefined && mouseY !== undefined) {
        // Convert screen coordinates to flow coordinates for start and end points
        const { x: x1, y: y1 } = screenToFlowPosition({ x: mouseX, y: mouseY });
        const { x: x2, y: y2 } = screenToFlowPosition({ x: ev.clientX, y: ev.clientY });
        // If the distance between the start and end points is greater than the threshold
        if (Math.abs(x1 - x2) >= 50 || Math.abs(y1 - y2) >= 20) {
          const fromNode = getNode(nodeId);
          if (fromNode) {
            // If a new edge needs to be created
            if (callbacks === Callback.ON_CONNECT_START) {
              // Create a new node at the end point and select/edit it
              const toNode = makeNewNode({ x: x2, y: y2 });
              addNodes(toNode);
              setEditingNodeId(toNode.id);
              // If the starting node is a source, create an edge from start to end
              if (handleType === 'source') {
                const targetHandle = findTargetHandle(fromNode, toNode, false);
                const newEdge = makeNewEdge(nodeId, handleId, toNode.id, targetHandle);
                setEdges(edges => addEdge(newEdge, edges));
              }
              // If the starting node is a target, create an edge from end to start
              else {
                const sourceHandle = findTargetHandle(fromNode, toNode, true);
                const newEdge = makeNewEdge(toNode.id, sourceHandle, nodeId, handleId);
                setEdges(edges => addEdge(newEdge, edges));
              }
            }
            // If an existing edge needs to be updated
            else if (callbacks === (Callback.ON_EDGE_UPDATE_START | Callback.ON_CONNECT_START)) {
              if (edge) {
                // Create a new node at the end point and select/edit it
                const toNode = makeNewNode({ x: x2, y: y2 });
                addNodes(toNode);
                setEditingNodeId(toNode.id);
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
          }
        }
      }
    },
    [addNodes, getNode, screenToFlowPosition, setEdges, setEditingNodeId],
  );

  // ----------------------------------------------------------------------------------------------

  const onNodeContextMenu = useCallback<NodeMouseHandler>((ev, node) => {
    console.log('onNodeContextMenu', ev, node);
  }, []);

  const onClickConnectEnd = useCallback<OnConnectEnd>(ev => {
    console.log('onClickConnectEnd', ev);
  }, []);

  const onClickConnectStart = useCallback<OnConnectStart>((ev, params) => {
    console.log('onClickConnectStart', ev, params);
  }, []);

  const onEdgeClick = useCallback<(event: React.MouseEvent<Element, MouseEvent>, edge: Edge<Action>) => void>((ev, edge) => {
    console.log('onEdgeClick', ev, edge);
  }, []);

  const onEdgesDelete = useCallback<OnEdgesDelete>(edges => {
    console.log('onEdgesDelete', edges);
  }, []);

  const onNodesDelete = useCallback<OnNodesDelete>(nodes => {
    console.log('onNodesDelete', nodes);
  }, []);

  // const onEdgeContextMenu = useCallback<EdgeMouseHandler>((ev, edge) => {console.log('onEdgeContextMenu', ev, edge);}, []);
  // const onEdgeDoubleClick = useCallback<EdgeMouseHandler>((ev, edge) => {console.log('onEdgeDoubleClick', ev, edge);}, []);
  // const onEdgeMouseEnter = useCallback<EdgeMouseHandler>((ev, edge) => {console.log('onEdgeMouseEnter', ev, edge);}, []);
  // const onEdgeMouseLeave = useCallback<EdgeMouseHandler>((ev, edge) => {console.log('onEdgeMouseLeave', ev, edge);}, []);
  // const onEdgeMouseMove = useCallback<EdgeMouseHandler>((ev, edge) => {console.log('onEdgeMouseMove', ev, edge);}, []);
  // const onEdgeUpdateEnd = useCallback<(event: MouseEvent | TouchEvent, edge: Edge<Action>, handleType: HandleType) => void>((ev, edge, handleType) => {console.log('onEdgeUpdateEnd', ev, edge, handleType);}, []);
  // const onMove = useCallback<OnMove>((ev, viewport) => { console.log('onMove', ev, viewport)}, []);
  // const onMoveStart = useCallback<OnMove>((ev, viewport) => { console.log('onMoveStart', ev, viewport)}, []);
  // const onMoveEnd = useCallback<OnMove>((ev, viewport) => { console.log('onMoveEnd', ev, viewport)}, []);
  // const onNodeClick = useCallback<NodeMouseHandler>((_ev, node) => { console.log('onNodeClick', node); }, []);
  // const onNodeDrag = useCallback<NodeDragHandler>((ev, node, nodes) => { console.log('onNodeDrag', ev, node, nodes)}, []);
  // const onNodeDragStart = useCallback<NodeDragHandler>((ev, node, nodes) => { console.log('onNodeDragStart', ev, node, nodes)}, []);
  // const onNodeDragStop = useCallback<NodeDragHandler>((ev, node, nodes) => { console.log('onNodeDragStop', ev, node, nodes)}, []);
  // const onNodeMouseEnter = useCallback<NodeMouseHandler>((ev, node) => { console.log('onNodeMouseEnter', ev, node)}, []);
  // const onNodeMouseMove = useCallback<NodeMouseHandler>((ev, node) => { console.log('onNodeMouseMove', ev, node)}, []);
  // const onNodeMouseLeave = useCallback<NodeMouseHandler>((ev, node) => { console.log('onNodeMouseLeave', ev, node)}, []);
  // const onPaneClick = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>(ev => {console.log('onPaneClick', ev);}, []);
  // const onPaneContextMenu = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>((ev) => { console.log('onPaneContextMenu', ev)}, []);
  // const onPaneMouseEnter = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>((ev) => { console.log('onPaneMouseEnter', ev)}, []);
  // const onPaneMouseMove = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>((ev) => { console.log('onPaneMouseMove', ev)}, []);
  // const onPaneMouseLeave = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>((ev) => { console.log('onPaneMouseLeave', ev)}, []);
  // const onPaneScroll = useCallback<(event: React.WheelEvent<Element> | undefined) => void>(ev => {console.log('onPaneScroll', ev);}, []);
  // const onSelectionChange = useCallback<OnSelectionChangeFunc>(({ nodes, edges }) => {console.log('onSelectionChange', nodes, edges);}, [setSelectedEdgeIds, setSelectedNodeIds]);
  // const onSelectionContextMenu = useCallback<(event: React.MouseEvent<Element, MouseEvent>, nodes: Node<Stage, string | undefined>[]) => void>((ev, nodes) => {console.log('onSelectionContextMenu', ev, nodes);}, []);
  // const onSelectionDrag = useCallback<SelectionDragHandler>((ev, nodes) => {console.log('onSelectionDrag', ev, nodes);}, []);
  // const onSelectionDragStop = useCallback<SelectionDragHandler>((ev, nodes) => {console.log('onSelectionDragStop', ev, nodes);}, []);
  // const onSelectionDragStart = useCallback<SelectionDragHandler>((ev, nodes) => {console.log('onSelectionDragStart', ev, nodes);}, []);
  // const onSelectionEnd = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>(ev => {console.log('onSelectionEnd', ev);}, []);
  // const onSelectionStart = useCallback<(event: React.MouseEvent<Element, MouseEvent>) => void>(ev => {console.log('onSelectionStart', ev);}, []);

  //
  return (
    <div className="canvas-component" style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow //
        onClickConnectEnd={onClickConnectEnd}
        onClickConnectStart={onClickConnectStart}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onEdgeClick={onEdgeClick}
        // onEdgeContextMenu={onEdgeContextMenu}
        // onEdgeDoubleClick={onEdgeDoubleClick}
        // onEdgeMouseEnter={onEdgeMouseEnter}
        // onEdgeMouseLeave={onEdgeMouseLeave}
        // onEdgeMouseMove={onEdgeMouseMove}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        onEdgeUpdate={onEdgeUpdate}
        // onEdgeUpdateEnd={onEdgeUpdateEnd}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onInit={onInit}
        // onMove={onMove}
        // onMoveEnd={onMoveEnd}
        // onMoveStart={onMoveStart}
        // onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        // onNodeDrag={onNodeDrag}
        // onNodeDragStart={onNodeDragStart}
        // onNodeDragStop={onNodeDragStop}
        // onNodeMouseEnter={onNodeMouseEnter}
        // onNodeMouseLeave={onNodeMouseLeave}
        // onNodeMouseMove={onNodeMouseMove}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        // onPaneClick={onPaneClick}
        // onPaneContextMenu={onPaneContextMenu}
        // onPaneMouseEnter={onPaneMouseEnter}
        // onPaneMouseLeave={onPaneMouseLeave}
        // onPaneMouseMove={onPaneMouseMove}
        // onPaneScroll={onPaneScroll}
        // onSelectionChange={onSelectionChange}
        // onSelectionContextMenu={onSelectionContextMenu}
        // onSelectionDrag={onSelectionDrag}
        // onSelectionDragStart={onSelectionDragStart}
        // onSelectionDragStop={onSelectionDragStop}
        // onSelectionEnd={onSelectionEnd}
        // onSelectionStart={onSelectionStart}
        attributionPosition={undefined}
        autoPanOnConnect={undefined}
        autoPanOnNodeDrag={undefined}
        connectionLineComponent={undefined}
        connectionLineContainerStyle={undefined}
        connectionLineStyle={undefined}
        connectionLineType={undefined}
        connectionMode={undefined}
        connectionRadius={30}
        connectOnClick={undefined}
        defaultEdgeOptions={undefined}
        defaultEdges={undefined}
        defaultMarkerColor={undefined}
        defaultNodes={undefined}
        defaultViewport={undefined}
        deleteKeyCode={undefined}
        disableKeyboardA11y={undefined}
        edges={edges}
        edgesFocusable={undefined}
        edgesUpdatable={undefined}
        edgeTypes={EDGE_TYPES}
        edgeUpdaterRadius={undefined}
        elementsSelectable={undefined}
        elevateEdgesOnSelect={undefined}
        elevateNodesOnSelect={undefined}
        fitView={undefined}
        fitViewOptions={undefined}
        // initNodeOrigin={undefined}
        isValidConnection={undefined}
        maxZoom={20}
        minZoom={undefined}
        multiSelectionKeyCode={undefined}
        nodeDragThreshold={undefined}
        nodeExtent={undefined}
        nodeOrigin={NODE_ORIGIN}
        nodes={nodes}
        nodesConnectable={undefined}
        nodesDraggable={undefined}
        nodesFocusable={undefined}
        nodeTypes={NODE_TYPES}
        noDragClassName={undefined}
        noPanClassName={undefined}
        noWheelClassName={undefined}
        onError={undefined}
        onlyRenderVisibleElements={true}
        panActivationKeyCode={undefined}
        panOnDrag={undefined}
        panOnScroll={undefined}
        panOnScrollMode={undefined}
        panOnScrollSpeed={undefined}
        preventScrolling={undefined}
        // proOptions={undefined}
        proOptions={{ hideAttribution: true }}
        selectionKeyCode={undefined}
        selectionMode={SelectionMode.Partial}
        selectionOnDrag={true}
        selectNodesOnDrag={undefined}
        snapGrid={SNAP_GRID}
        snapToGrid={true}
        translateExtent={undefined}
        zoomActivationKeyCode={undefined}
        zoomOnDoubleClick={false}
        zoomOnPinch={undefined}
        zoomOnScroll={undefined}
        className="white-gloves-workflow-editor"
        id="white-gloves-workflow-editor"
        onClick={undefined}
        onDoubleClick={onDoubleClick}
        style={undefined}
        unselectable={undefined}
        //
      >
        <CustomEdgeToolbarPlaceholderComponent />
        {/* <SelectionBox nodes={nodes} /> */}
        <MiniMap></MiniMap>
        <Controls />
        <Background //
          color="#00000010"
          gap={25}
          variant={BackgroundVariant.Lines}></Background>
        <Panel position='bottom-left'>
          <Button size="small" variant="outlined" disabled={!history.canUndo} onClick={undo}>
            Undo
          </Button>
          <Button size="small" variant="outlined" disabled={!history.canRedo} onClick={redo}>
            Redo
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Describes the structure of the history item
type HistoryItem = {
  nodes: Node<Stage>[];
  edges: Edge<Action>[];
};

// Compares two history items
function isHistoryEqual(history1: HistoryItem, history2: HistoryItem): boolean {
  if (history1.nodes.length !== history2.nodes.length) return false;
  if (history1.edges.length !== history2.edges.length) return false;
  for (let i = 0; i < history1.nodes.length; i++) {
    if (!areNodesEqual(history1.nodes[i], history2.nodes[i])) return false;
  }
  for (let i = 0; i < history1.edges.length; i++) {
    if (!areEdgesEqual(history1.edges[i], history2.edges[i])) return false;
  }
  return true;
}
