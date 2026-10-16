import { useCallback, useMemo } from 'react';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from '@xyflow/react';
import { CheckCircle2, Code2, Flag, Network, Play, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AssessmentData, EventCategory, GraphNodeSpec } from '../types/assessment';
import { Panel } from './Panel';

const NODE_W = 156;
const NODE_H = 44;

interface FlowNodeData extends Record<string, unknown> {
  label: string;
  meta: string;
  kind: EventCategory | 'start';
  eventId?: string;
}

type ProofNode = Node<FlowNodeData, 'proof'>;

/*
 * Accent colors reference CSS custom properties so node rails and legend swatches
 * follow the active theme. `rgb(var(--c-x))` resolves in both light and dark mode.
 */
const kindStyles: Record<
  EventCategory | 'start',
  { accent: string; icon: LucideIcon; iconClass: string }
> = {
  start: { accent: 'rgb(var(--c-muted))', icon: Play, iconClass: 'text-muted' },
  navigation: { accent: 'rgb(var(--c-muted))', icon: Play, iconClass: 'text-muted' },
  'ai-prompt': { accent: 'rgb(var(--c-violet))', icon: Sparkles, iconClass: 'text-violet' },
  'ai-response': { accent: 'rgb(var(--c-violet) / 0.7)', icon: Sparkles, iconClass: 'text-violet' },
  question: { accent: 'rgb(var(--c-violet) / 0.7)', icon: Sparkles, iconClass: 'text-violet' },
  code: { accent: 'rgb(var(--c-accent))', icon: Code2, iconClass: 'text-accent' },
  'test-fail': { accent: 'rgb(var(--c-danger))', icon: XCircle, iconClass: 'text-danger' },
  'test-pass': { accent: 'rgb(var(--c-success))', icon: CheckCircle2, iconClass: 'text-success' },
  refactor: { accent: 'rgb(var(--c-amber))', icon: RefreshCw, iconClass: 'text-amber' },
  submission: { accent: 'rgb(var(--c-ink))', icon: Flag, iconClass: 'text-ink' },
};

function ProofNodeComponent({ data, selected }: NodeProps<ProofNode>) {
  const style = kindStyles[data.kind];
  const Icon = style.icon;
  return (
    <div
      style={{ width: NODE_W, minHeight: NODE_H, borderLeftColor: style.accent }}
      className={`rounded-[7px] border border-l-[3px] bg-surface px-2 py-1.5 shadow-card ${
        selected ? 'ring-2 ring-accent/40' : ''
      }`}
    >
      {/*
        Non-overlapping connection points: targets on the left/top, sources on
        the right/bottom. Each edge picks a pair so React Flow never has to
        disambiguate two handles stacked on the same side.
      */}
      <Handle type="target" id="t-top" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-line-strong" />
      <Handle type="target" id="t-left" position={Position.Left} className="!h-1.5 !w-1.5 !border-0 !bg-line-strong" />
      <div className="flex items-center gap-1.5">
        <Icon size={11} strokeWidth={2.4} className={`shrink-0 ${style.iconClass}`} aria-hidden="true" />
        <span className="truncate text-[10.5px] font-semibold leading-tight text-ink">{data.label}</span>
      </div>
      <p className="mt-0.5 truncate pl-[17px] font-mono text-[9px] leading-tight text-muted">{data.meta}</p>
      <Handle type="source" id="s-right" position={Position.Right} className="!h-1.5 !w-1.5 !border-0 !bg-line-strong" />
      <Handle type="source" id="s-bottom" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-line-strong" />
    </div>
  );
}

const nodeTypes = { proof: ProofNodeComponent };

const legendItems: { label: string; color: string }[] = [
  { label: 'Start / Submission', color: 'rgb(var(--c-muted))' },
  { label: 'AI event', color: 'rgb(var(--c-violet))' },
  { label: 'Code revision', color: 'rgb(var(--c-accent))' },
  { label: 'Test failed', color: 'rgb(var(--c-danger))' },
  { label: 'Test passed', color: 'rgb(var(--c-success))' },
  { label: 'Refactor', color: 'rgb(var(--c-amber))' },
];

interface DecisionGraphProps {
  graph: AssessmentData['graph'];
  theme: 'light' | 'dark';
  onSelectEventId: (eventId: string) => void;
}

function toFlowNode(spec: GraphNodeSpec): ProofNode {
  const kind = spec.kind;
  return {
    id: spec.id,
    type: 'proof',
    position: { x: spec.x, y: spec.y },
    data: { label: spec.label, meta: spec.meta, kind, eventId: spec.eventId },
    draggable: true,
    selectable: true,
  };
}

/*
 * Routing: `forward` edges run left-to-right along a row; `down` edges step
 * into the gap below and continue on the next row, so no line ever crosses a
 * neighbouring node.
 */
const routeHandles: Record<
  NonNullable<AssessmentData['graph']['edges'][number]['route']>,
  { sourceHandle: string; targetHandle: string }
> = {
  forward: { sourceHandle: 's-right', targetHandle: 't-left' },
  down: { sourceHandle: 's-bottom', targetHandle: 't-top' },
};

function toFlowEdge(spec: AssessmentData['graph']['edges'][number]): Edge {
  const retry = spec.variant === 'retry';
  const stroke = retry ? 'rgb(var(--c-amber))' : 'rgb(var(--c-line-strong))';
  const handles = routeHandles[spec.route ?? 'forward'];
  return {
    id: spec.id,
    source: spec.source,
    target: spec.target,
    sourceHandle: handles.sourceHandle,
    targetHandle: handles.targetHandle,
    type: 'smoothstep',
    label: spec.label,
    labelBgPadding: [4, 2],
    labelBgBorderRadius: 3,
    style: retry
      ? { stroke, strokeWidth: 1.4, strokeDasharray: '4 3' }
      : { stroke, strokeWidth: 1.4 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 11,
      height: 11,
      color: stroke,
    },
  };
}

export function DecisionGraph({ graph, theme, onSelectEventId }: DecisionGraphProps) {
  const seedNodes = useMemo<ProofNode[]>(() => graph.nodes.map(toFlowNode), [graph.nodes]);
  const seedEdges = useMemo<Edge[]>(() => graph.edges.map(toFlowEdge), [graph.edges]);
  const [nodes, , onNodesChange] = useNodesState<ProofNode>(seedNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge>(seedEdges);

  const onInit = useCallback((instance: ReactFlowInstance<ProofNode, Edge>) => {
    instance.fitView({ padding: 0.06, maxZoom: 1.25, duration: 0 });
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: ProofNode) => {
      const eventId = node.data.eventId;
      if (typeof eventId === 'string') onSelectEventId(eventId);
    },
    [onSelectEventId],
  );

  return (
    <Panel
      title="Decision Graph"
      icon={Network}
      subtitle="Assessment sequence"
      className="shrink-0"
      bodyClassName="flex flex-col"
    >
      <div className="min-h-0 flex-1">
        <div className="h-full min-h-[236px] w-full">
          <ReactFlow<ProofNode, Edge>
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onInit={onInit}
            onNodeClick={onNodeClick}
            colorMode={theme}
            fitView
            fitViewOptions={{ padding: 0.06, maxZoom: 1.25 }}
            minZoom={0.3}
            maxZoom={1.75}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
            panOnScroll
            preventScrolling
            aria-label="Decision graph for the assessment session"
          >
            <Background gap={16} size={1} />
            <Controls showInteractive={false} position="bottom-right" />
          </ReactFlow>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-line bg-surface-2 px-3 py-1.5">
        <ul className="flex flex-wrap items-center gap-x-2.5 gap-y-1" aria-label="Graph legend">
          {legendItems.map((item) => (
            <li key={item.label} className="flex items-center gap-1">
              <span
                className="h-[7px] w-[7px] shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="text-[9.5px] font-medium text-muted">{item.label}</span>
            </li>
          ))}
        </ul>
        <p className="ml-auto hidden text-[9.5px] text-faint lg:block">
          Select a node to highlight its BuildTrail event. Dashed edge marks the debug loop.
        </p>
      </div>
    </Panel>
  );
}
