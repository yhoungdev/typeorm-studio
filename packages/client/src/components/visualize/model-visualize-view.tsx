import { useMemo, useCallback, useState } from "react";
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
  Panel,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type Connection,
} from "@xyflow/react";
import { Table2, Hash, Database, X, ZoomIn, Info } from "lucide-react";
import "@xyflow/react/dist/style.css";

import { relationTargetModel } from "@/lib/studio";
import type { StudioModel } from "@/lib/types";
import { useStudio } from "@/providers/studio-provider";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

type ModelNodeData = Node<{
  model: StudioModel;
}, "modelNode">;

interface ModelNodeProps extends NodeProps<ModelNodeData> {
  selected?: boolean;
}

function ModelNode({ data, selected }: ModelNodeProps) {
  const { model } = data;

  return (
    <div className={`group relative ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2.5 !border-2 !border-background !bg-primary transition-transform group-hover:scale-125"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !border-2 !border-background !bg-primary transition-transform group-hover:scale-125"
      />

      <div className={`min-w-56 overflow-hidden rounded-xl border-2 bg-card shadow-xl transition-all ${selected ? 'border-primary shadow-primary/20' : 'group-hover:border-primary/50 group-hover:shadow-primary/10'}`}>
        <div className="flex items-center gap-1 bg-primary px-3 py-2.5 border-b">
          <div className="flex size-6 items-center justify-center rounded bg-primary/10 text-primary">
            <Table2 className="size-3.5" color="white"/>
          </div>
          <div>
            <Typography className="text-[11px] font-semibold uppercase tracking-widest text-white">
            {model.name}
          </Typography>
          </div>
        </div>
        
        <div className="max-h-48 space-y-0.5 overflow-auto p-1.5">
          {model.columns.map((column) => (
            <div 
              key={`${model.tableName}-${column.name}`}
              className="flex items-center justify-between rounded-md px-2 py-1 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                {column.isPrimary ? (
                  <Hash className="size-3 text-primary" />
                ) : (
                  <div className="size-1 rounded-full bg-muted-foreground/30" />
                )}
                <Typography variant="small" className="text-[11px] font-bold text-foreground/80">
                  {column.name}
                </Typography>
              </div>
              <Typography variant="muted" className="text-[9px] font-black uppercase tracking-tighter opacity-40">
                {column.type}
              </Typography>
            </div>
          ))}
        </div>
        
        <div className="bg-muted/30 px-3 py-1.5 border-t">
          <Typography variant="muted" className="text-[9px] font-medium text-center">
            {model.columns.length} Fields · {model.relations.length} Relations
          </Typography>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  modelNode: ModelNode,
};

function createNodes(models: StudioModel[]): ModelNodeData[] {
  return models.map((model, index) => ({
    id: model.tableName,
    position: {
      x: 150 + (index % 3) * 380,
      y: 100 + Math.floor(index / 3) * 300,
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
        style: { stroke: "var(--primary)", strokeWidth: 2, opacity: 0.4 },
        labelStyle: { fill: "var(--primary)", fontWeight: 800, fontSize: 10, textTransform: "uppercase" },
        markerEnd: { type: "arrowclosed", color: "var(--primary)" },
      });
    }
  }

  return edges;
}

// Node Details Panel Component
function NodeDetailsPanel({ 
  node, 
  onClose 
}: { 
  node: ModelNodeData | null; 
  onClose: () => void;
}) {
  if (!node) return null;
  
  const { model } = node.data;
  
  return (
    <div className="absolute top-4 right-4 z-10 w-72 rounded-xl border-2 bg-card/95 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Table2 className="size-4 text-primary" />
          <Typography className="font-semibold">{model.name}</Typography>
        </div>
        <Button variant="ghost" size="icon" className="size-6" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>
      
      <div className="max-h-64 overflow-auto p-4 space-y-4">
        <div>
          <Typography variant="muted" className="text-xs font-bold uppercase tracking-wider mb-2">
            Columns ({model.columns.length})
          </Typography>
          <div className="space-y-1">
            {model.columns.map((col) => (
              <div key={col.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {col.isPrimary && <Hash className="size-3 text-primary" />}
                  <span className={col.isPrimary ? "font-semibold" : ""}>{col.name}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{col.type}</span>
              </div>
            ))}
          </div>
        </div>
        
        {model.relations.length > 0 && (
          <div>
            <Typography variant="muted" className="text-xs font-bold uppercase tracking-wider mb-2">
              Relations ({model.relations.length})
            </Typography>
            <div className="space-y-1">
              {model.relations.map((rel, idx) => (
                <div key={idx} className="text-sm text-muted-foreground">
                  {rel.field} → {rel.references}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModelVisualizeInner() {
  const { models, isLoading, error } = useStudio();
  const [selectedNode, setSelectedNode] = useState<ModelNodeData | null>(null);
  const { fitView } = useReactFlow();

  const initialNodes = useMemo(() => createNodes(models), [models]);
  const initialEdges = useMemo(() => createEdges(models), [models]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as ModelNodeData);
  }, []);

  const handleZoomToFit = useCallback(() => {
    fitView({ padding: 0.2, duration: 800 });
  }, [fitView]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-bounce">
            <Database className="size-6" />
          </div>
          <Typography variant="muted" className="font-bold uppercase tracking-widest text-[10px]">Mapping Architecture...</Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-background/50 backdrop-blur-sm">
        <div className="max-w-md space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Database className="size-6" />
          </div>
          <Typography variant="h4" className="text-destructive font-black">Visualization Failed</Typography>
          <Typography variant="muted">{error}</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-muted/30">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
        }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="rgba(0,0,0,0.05)" 
        />
        <Controls className="!bg-card !border-2 !shadow-xl !rounded-xl">
          <Button
            variant="ghost"
            size="icon"
            className="border-b rounded-none h-8 w-8"
            onClick={handleZoomToFit}
            title="Zoom to fit"
          >
            <ZoomIn className="size-4" />
          </Button>
        </Controls>
        <MiniMap 
          className="!bg-card !border-2 !shadow-xl !rounded-xl" 
          nodeColor="#eee"
          maskColor="rgba(255, 255, 255, 0.7)"
        />
        
        {/* Custom Toolbar Panel */}
        <Panel position="top-left" className="m-4">
          <div className="flex items-center gap-2 rounded-xl border-2 bg-card/95 backdrop-blur-sm px-3 py-2 shadow-lg">
            <Database className="size-4 text-primary" />
            <Typography className="text-sm font-semibold">
              {models.length} Tables
            </Typography>
            {selectedNode && (
              <>
                <div className="w-px h-4 bg-border mx-1" />
                <Info className="size-4 text-primary" />
                <Typography className="text-xs text-muted-foreground">
                  Click table for details
                </Typography>
              </>
            )}
          </div>
        </Panel>
      </ReactFlow>

      {/* Node Details Panel */}
      <NodeDetailsPanel 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />
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
