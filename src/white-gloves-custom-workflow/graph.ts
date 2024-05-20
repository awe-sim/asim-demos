import { Edge, Node } from 'reactflow';
import { Action, ProcessConnection, State, Type } from './types';
import { uniq } from 'lodash';

type GraphEdge = {
  id: string;
  type: ProcessConnection;
  from: string;
  to: string;
};

export class Graph {
  readonly nodeIds: string[];
  readonly edges: GraphEdge[];
  readonly startNodeIds: string[];
  readonly endNodeIds: string[];
  constructor(nodeIds: string[], edges: GraphEdge[], startNodeIds: string[], endNodeIds: string[]) {
    this.nodeIds = nodeIds;
    this.edges = edges;
    this.startNodeIds = startNodeIds;
    this.endNodeIds = endNodeIds;
  }
  static create(rfNodes: Node<State>[], rfEdges: Edge<Action>[]): Graph {
    const nodes = rfNodes.map(node => node.id);
    const edges = rfEdges
      .map(edge =>
        (edge.data?.variants ?? []).map(variant =>
          (variant.constraintsConnectionsIn.length !== 0 ? variant.constraintsConnectionsIn : [ProcessConnection.AS2, ProcessConnection.HTTP, ProcessConnection.SFTP_EXTERNAL, ProcessConnection.SFTP_INTERNAL, ProcessConnection.VAN, ProcessConnection.WEBHOOK]).map(connection => ({
            id: edge.id,
            type: connection,
            from: edge.source,
            to: edge.target,
          })),
        ),
      )
      .flat()
      .flat();
    const startNodeIds = rfNodes.filter(node => node.data.type === Type.START).map(node => node.id);
    const endNodeIds = rfNodes.filter(node => node.data.type === Type.DONE).map(node => node.id);
    return new Graph(nodes, edges, startNodeIds, endNodeIds);
  }
  get connectionsUsed(): ProcessConnection[] {
    return uniq(this.edges.map(edge => edge.type));
  }
  getEdgesFromNode(nodeId: string, connection: ProcessConnection): GraphEdge[] {
    return this.edges.filter(edge => edge.from === nodeId && edge.type === connection);
  }
  private _recursivelyVisitOnceAndReturnAllValues<T>(nodeId: string, connection: ProcessConnection, visited: Set<string>, fn: (nodeId: string) => T | undefined): (T | undefined)[] {
    if (visited.has(nodeId)) {
      return [];
    }
    visited.add(nodeId);
    const value = fn(nodeId);
    const nextEdges = this.getEdgesFromNode(nodeId, connection);
    return [value].concat(nextEdges.map(edge => this._recursivelyVisitOnceAndReturnAllValues(edge.to, connection, visited, fn)).flat());
  }
  recursivelyVisitOnceAndReturnValues<T>(connection: ProcessConnection, fn: (nodeId: string) => T | undefined): (T | undefined)[] {
    const visited = new Set<string>();
    return this.startNodeIds.map(nodeId => this._recursivelyVisitOnceAndReturnAllValues(nodeId, connection, visited, fn)).flat();
  }
  hasPathsFromStartToEnd(connection: ProcessConnection): boolean {
    const list = this.recursivelyVisitOnceAndReturnValues(connection, nodeId => this.endNodeIds.includes(nodeId));
    return list.some(value => !!value);
  }
  hasDeadEnds(connection: ProcessConnection): boolean {
    const list = this.recursivelyVisitOnceAndReturnValues(connection, nodeId => !this.endNodeIds.includes(nodeId) && this.getEdgesFromNode(nodeId, connection).length === 0);
    return list.some(value => !!value);
  }
  isOk(connection: ProcessConnection): boolean {
    return !this.hasDeadEnds(connection) && this.hasPathsFromStartToEnd(connection);
  }
  getVisitableNodes(connection: ProcessConnection): string[] {
    const visited = new Set<string>();
    this.startNodeIds.forEach(nodeId => this._recursivelyVisitOnceAndReturnAllValues(nodeId, connection, visited, () => undefined));
    return Array.from(visited);
  }
  getVisitableEdgeIds(connection: ProcessConnection): string[] {
    return this.edges.filter(edge => edge.type === connection && this.getVisitableNodes(connection).includes(edge.from)).map(edge => edge.id);
  }
  getDeadEndNodeIds(connection: ProcessConnection): string[] {
    return this.getVisitableNodes(connection).filter(nodeId => !this.endNodeIds.includes(nodeId) && this.getEdgesFromNode(nodeId, connection).length === 0);
  }
}
