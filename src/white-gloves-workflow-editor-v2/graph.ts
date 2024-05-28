import { uniq } from 'lodash';
import { Edge, Node } from 'reactflow';
import { Action, Constraint, Stage, StageType } from './types';

type GraphEdge = {
  id: string;
  type: Constraint;
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
  static create(rfNodes: Node<Stage>[], rfEdges: Edge<Action>[]): Graph {
    const nodes = rfNodes.map(node => node.id);
    const edges = rfEdges
      .map(edge =>
        (edge.data?.variants ?? []).map(variant =>
          (variant.constraints.length !== 0 ? variant.constraints : [Constraint.AS2, Constraint.HTTP, Constraint.SFTP_EXTERNAL, Constraint.SFTP_INTERNAL, Constraint.VAN, Constraint.WEBHOOK]).map(connection => ({
            id: edge.id,
            type: connection,
            from: edge.source,
            to: edge.target,
          })),
        ),
      )
      .flat()
      .flat();
    const startNodeIds = rfNodes.filter(node => node.data.type === StageType.START).map(node => node.id);
    const endNodeIds = rfNodes.filter(node => node.data.type === StageType.DONE).map(node => node.id);
    return new Graph(nodes, edges, startNodeIds, endNodeIds);
  }
  get connectionsUsed(): Constraint[] {
    return uniq(this.edges.map(edge => edge.type));
  }
  getEdgesFromNode(nodeId: string, connection: Constraint): GraphEdge[] {
    return this.edges.filter(edge => edge.from === nodeId && edge.type === connection);
  }
  private _recursivelyVisitOnceAndReturnAllValues<T>(nodeId: string, connection: Constraint, visited: Set<string>, fn: (nodeId: string) => T | undefined): (T | undefined)[] {
    if (visited.has(nodeId)) {
      return [];
    }
    visited.add(nodeId);
    const value = fn(nodeId);
    const nextEdges = this.getEdgesFromNode(nodeId, connection);
    return [value].concat(nextEdges.map(edge => this._recursivelyVisitOnceAndReturnAllValues(edge.to, connection, visited, fn)).flat());
  }
  recursivelyVisitOnceAndReturnValues<T>(connection: Constraint, fn: (nodeId: string) => T | undefined): (T | undefined)[] {
    const visited = new Set<string>();
    return this.startNodeIds.map(nodeId => this._recursivelyVisitOnceAndReturnAllValues(nodeId, connection, visited, fn)).flat();
  }
  hasPathsFromStartToEnd(connection: Constraint): boolean {
    const list = this.recursivelyVisitOnceAndReturnValues(connection, nodeId => this.endNodeIds.includes(nodeId));
    return list.some(value => !!value);
  }
  hasDeadEnds(connection: Constraint): boolean {
    const list = this.recursivelyVisitOnceAndReturnValues(connection, nodeId => !this.endNodeIds.includes(nodeId) && this.getEdgesFromNode(nodeId, connection).length === 0);
    return list.some(value => !!value);
  }
  isOk(connection: Constraint): boolean {
    return !this.hasDeadEnds(connection) && this.hasPathsFromStartToEnd(connection);
  }
  getVisitableNodeIds(connection: Constraint): string[] {
    const visited = new Set<string>();
    this.startNodeIds.forEach(nodeId => this._recursivelyVisitOnceAndReturnAllValues(nodeId, connection, visited, () => undefined));
    return Array.from(visited);
  }
  getVisitableEdgeIds(connection: Constraint): string[] {
    return this.edges.filter(edge => edge.type === connection && this.getVisitableNodeIds(connection).includes(edge.from)).map(edge => edge.id);
  }
  getVisitableIds(connection: Constraint): string[] {
    return this.getVisitableNodeIds(connection).concat(this.getVisitableEdgeIds(connection));
  }
  getDeadEndNodeIds(connection: Constraint): string[] {
    return this.getVisitableNodeIds(connection).filter(nodeId => !this.endNodeIds.includes(nodeId) && this.getEdgesFromNode(nodeId, connection).length === 0);
  }
}
