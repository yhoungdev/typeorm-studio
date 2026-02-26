import { useMemo } from "react"
import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react"
import type { Edge, Node } from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { models, relationTargetModel } from "@/lib/studio"

function createNodes(): Node[] {
  return models.map((model, index) => ({
    id: model.tableName,
    position: {
      x: 120 + (index % 3) * 320,
      y: 80 + Math.floor(index / 3) * 220,
    },
    data: {
      label: (
        <div className="min-w-44 space-y-1 rounded-md border bg-background p-2 text-left">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {model.name}
          </div>
          <div className="text-sm font-semibold">{model.tableName}</div>
          <div className="space-y-0.5 text-xs text-muted-foreground">
            {model.columns.map((column) => (
              <div key={`${model.tableName}-${column.name}`}>{column.name}</div>
            ))}
          </div>
        </div>
      ),
    },
    type: "default",
  }))
}

function createEdges(): Edge[] {
  const edges: Edge[] = []

  for (const model of models) {
    for (const relation of model.relations) {
      const target = relationTargetModel(relation.references)

      if (!target) {
        continue
      }

      edges.push({
        id: `${model.tableName}-${relation.field}-${target}`,
        source: model.tableName,
        target,
        label: relation.field,
        animated: true,
      })
    }
  }

  return edges
}

export function ModelVisualizeView() {
  const nodes = useMemo(() => createNodes(), [])
  const edges = useMemo(() => createEdges(), [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Visualize</h1>
        <p className="text-sm text-muted-foreground">Relationship map of your TypeORM models.</p>
      </div>

      <div className="h-[72vh] overflow-hidden rounded-lg border">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  )
}
