import { useMemo, useCallback } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Edge,
  type Node,
  type NodeProps,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { relationTargetModel } from "@/lib/studio";
import type { StudioModel } from "@/lib/types";
import { useStudio } from "@/providers/studio-provider";
import { Typography } from "@/components/ui/typography";

type ModelNodeData = Node<{
  model: StudioModel;
}, "modelNode">;

function ModelNode({ data }: NodeProps<ModelNodeData>) {
  const { model } = data;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !bg-primary"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !bg-primary"
      />

      <div className="min-w-44 space-y-1 rounded-md border bg-card p-2 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md">
        <Typography  className="text-[10px]  text-black font-semibold uppercase tracking-wide">
          {model.name}
        </Typography>
        
        <div className="max-h-32 space-y-0.5 overflow-auto pr-1">
          {model.columns.map((column) => (
            <Typography key={`${model.tableName}-${column.name}`} variant="small" as="div" className="text-[11px] font-normal">
              {column.name}
            </Typography>
          ))}
        </div>
      </div>
    </>
  );
}

const nodeTypes = {
  modelNode: ModelNode,
};

function createNodes(models: StudioModel[]): ModelNodeData[] {
  return models.map((model, index) => ({
    id: model.tableName,
    position: {
      x: 120 + (index % 3) * 320,
      y: 80 + Math.floor(index / 3) * 220,
    },
    data: { model },
    type: "modelNode",
  }));
}

function createEdges(models: StudioModel[]): Edge[] {
  const edges: Edge[] = [];

  for (const model of models) {
    for (const relation of model.relations) {
      const target = relationTargetModel(relation.references);
      if (!target) continue;

      edges.push({
        id: `${model.tableName}-${relation.field}-${target}`,
        source: model.tableName,
        target,
        label: relation.field,
        animated: true,
        type: "smoothstep",
        markerEnd: { type: "arrowclosed" },
      });
    }
  }

  return edges;
}

function ModelVisualizeInner() {
  const { models, isLoading, error } = useStudio();

  const initialNodes = useMemo(() => createNodes(models), [models]);
  const initialEdges = useMemo(() => createEdges(models), [models]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Typography variant="muted">Loading visualization...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Typography variant="muted" className="text-destructive">{error}</Typography>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export function ModelVisualizeView() {
  return (
    <ReactFlowProvider>
      <ModelVisualizeInner />
    </ReactFlowProvider>
  );
}
