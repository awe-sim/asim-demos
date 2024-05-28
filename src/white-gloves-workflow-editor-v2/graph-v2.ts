import { Edge, Node } from "reactflow";
import { Action, Constraint, Stage, StageType } from "./types";

type GraphNode = {
  id: string;
  label: string;
  type: StageType;
}

type GraphEdge = {
  id: string;
  parentId?: string;
  fromNodeId: string;
  toNodeId: string;
  label: string;
  isEmailAction: boolean;
  emailTemplate?: string;
  hasConstraints: boolean;
  constraints: Constraint[];
}

export class Graph {
  readonly nodes: GraphNode[];
  readonly edges: GraphEdge[];
  readonly startNodes: GraphNode[];
  readonly endNodes: GraphNode[];
  constructor(nodes: GraphNode[], edges: GraphEdge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.startNodes = nodes.filter(node => node.type === StageType.START);
    this.endNodes = nodes.filter(node => node.type === StageType.DONE);
  }
  static create(rfNodes: Node<Stage>[], rfEdges: Edge<Action>[]): Graph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    rfNodes.forEach(node => {
      nodes.push({
        id: node.id,
        label: node.data.label,
        type: node.data.type,
      });
    });
    rfEdges.forEach(edge => {
      if (edge.data?.variants.length === 1) {
        edges.push({
          id: edge.id,
          fromNodeId: edge.source,
          toNodeId: edge.target,
          label: edge.label?.toString() ?? '',
          isEmailAction: edge.data.isEmailAction,
          emailTemplate: edge.data.variants?.[0]?.emailTemplate,
          hasConstraints: edge.data.variants?.[0]?.hasConstraints ?? false,
          constraints: edge.data.variants?.[0]?.constraints ?? [],
        });
        if (edge.data.variants?.[0]?.hasReminder) {
          // edges.push({
          //   id: `${edge.id}-reminder`,
          //   fromNodeId: edge.target,
          // })
        }
      }
    })
    // const nodes = rfNodes.map(node => ({
    //   id: node.id,
    //   label: node.data.label,
    //   type: node.data.type,
    // }));
    // const edges = rfEdges.map(edge => (edge.data?.variants ?? []).map(variant => ({
    //   id: edge.id,
    //   fromNodeId: edge.source,
    // })))
  }
}
