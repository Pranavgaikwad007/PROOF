import { useCallback, useMemo, useState } from 'react';
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
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Flag,
  Network,
  Play,
  RefreshCw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AssessmentData, EventCategory, GraphNodeSpec } from '../types/assessment';
import { Panel, QuietButton } from './Panel';

const NODE_W = 196;
const NODE_H = 56;

interface FlowNodeData extends Record<string, unknown> {
  label: string;
  meta: string;
  kind: EventCategory | 'start';
  eventId?: string;
}

type ProofNode = Node<FlowNodeData, 'proof'>;

const kindStyles: Record<
  EventCategory | 'start',
  { accent: string; icon: LucideIcon; iconClass: string }
> = {
  start: { accent: 'rgb(var(--c-muted))', icon: Play, iconClass: 'text-muted' },
  navigation: { accent: 'rgb(var(--c-muted))', icon: Play, iconClass: 'text-muted' },
  'ai-prompt': { accent: 'rgb(var(--c-violet))', icon: Sparkles, iconClass: 'text-violet' },
  'ai-response': { accent: 'rgb(var(--c-violet))', icon: Sparkles, iconClass: 'text-violet' },
  question: { accent: 'rgb(var(--c-violet))', icon: Sparkles, iconClass: 'text-violet' },
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
      className={`rounded-[8px] border border-l-[4px] bg-surface p-2.5 shadow-card transition-all ${
        selected ? 'ring-2 ring-accent shadow-md' : 'hover:border-line-strong'
      }`}
    >
      <Handle type="target" id="t-top" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-line-strong" />
      <Handle type="target" id="t-left" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-line-strong" />
      <div className="flex items-start gap-2">
        <Icon size={15} strokeWidth={2.4} className={`mt-0.5 shrink-0 ${style.iconClass}`} aria-hidden="true" />
        <span className="text-[13px] font-semibold leading-snug text-ink line-clamp-2">{data.label}</span>
      </div>
      <p className="mt-1 pl-[23px] font-mono text-[12px] leading-tight text-muted">{data.meta}</p>
      <Handle type="source" id="s-right" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-line-strong" />
      <Handle type="source" id="s-bottom" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-line-strong" />
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

export function DecisionGraph({ graph, theme, onSelectEventId }: DecisionGraphProps) {
  // Default expanded on 1600px+ screens, collapsed on smaller per specification
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth < 1600;
  });

  const initialNodes = useMemo<ProofNode[]>(() => {
    return graph.nodes.map((node: GraphNodeSpec) => ({
      id: node.id,
      type: 'proof',
      position: { x: node.x, y: node.y },
      data: {
        label: node.label,
        meta: node.meta,
        kind: node.kind,
        eventId: node.eventId,
      },
    }));
  }, [graph.nodes]);

  const initialEdges = useMemo<Edge[]>(() => {
    return graph.edges.map((edge) => {
      const isRetry = edge.variant === 'retry';
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.route === 'down' ? 's-bottom' : 's-right',
        targetHandle: edge.route === 'down' ? 't-top' : 't-left',
        type: 'smoothstep',
        animated: isRetry,
        label: edge.label,
        style: {
          stroke: isRetry ? '#B45309' : 'rgb(var(--c-line-strong))',
          strokeWidth: 2,
          strokeDasharray: isRetry ? '4,4' : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isRetry ? '#B45309' : 'rgb(var(--c-muted))',
          width: 14,
          height: 14,
        },
      };
    });
  }, [graph.edges]);

  const [nodes, , onNodesChange] = useNodesState<ProofNode>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback((instance: ReactFlowInstance<ProofNode, Edge>) => {
    instance.fitView({ padding: 0.12, maxZoom: 1.1 });
  }, []);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: ProofNode) => {
      if (node.data.eventId) {
        onSelectEventId(node.data.eventId);
      }
    },
    [onSelectEventId],
  );

  return (
    <Panel
      title="Decision Graph"
      icon={Network}
      subtitle="Assessment sequence"
      className="shrink-0"
      actions={
        <QuietButton
          onClick={() => setIsCollapsed(!isCollapsed)}
          ariaExpanded={!isCollapsed}
          title={isCollapsed ? 'Expand graph view (290px)' : 'Collapse graph view'}
          className="min-h-[32px] px-3 text-[13px]"
        >
          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          <span>{isCollapsed ? 'Expand Graph' : 'Collapse Graph'}</span>
        </QuietButton>
      }
    >
      {isCollapsed ? (
        /* Collapsed quick flow strip */
        <div className="flex items-center gap-2 overflow-x-auto bg-surface px-4 py-2.5">
          <span className="shrink-0 text-[12px] font-semibold text-muted">Flow:</span>
          {graph.nodes.map((n, idx) => (
            <div key={n.id} className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => n.eventId && onSelectEventId(n.eventId)}
                className="min-h-[28px] rounded-[5px] border border-line bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {n.label}
              </button>
              {idx < graph.nodes.length - 1 ? (
                <span className="text-[12px] text-faint">→</span>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        /* Lazy mount when expanded: real 290px space per design spec */
        <>
          <div className="h-[290px] w-full">
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
              fitViewOptions={{ padding: 0.12, maxZoom: 1.1 }}
              minZoom={0.3}
              maxZoom={1.75}
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable
              panOnScroll
              preventScrolling
              proOptions={{ hideAttribution: true }}
              aria-label="Decision graph for the assessment session"
            >
              <Background gap={18} size={1.2} />
              <Controls showInteractive={false} position="bottom-right" />
            </ReactFlow>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2/60 px-4 py-2">
            <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1" aria-label="Graph legend">
              {legendItems.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="text-[12px] sm:text-[13px] font-medium text-muted">{item.label}</span>
                </li>
              ))}
            </ul>
            <p className="hidden text-[12px] text-muted xl:block">
              Click node to inspect event in BuildTrail
            </p>
          </div>
        </>
      )}
    </Panel>
  );
}
