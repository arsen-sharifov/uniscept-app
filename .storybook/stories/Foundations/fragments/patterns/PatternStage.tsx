import { Background, ReactFlow, ReactFlowProvider } from '@xyflow/react';

import type { TPatternVariant } from '@story-interfaces';
import {
  BACKGROUND_COLOR_FALLBACK,
  BACKGROUND_DOT_GAP,
  BACKGROUND_SIZE_BY_PATTERN,
  BACKGROUND_VARIANT_BY_PATTERN,
} from '@/components/Canvas/consts';

interface IPatternStageProps {
  pattern: TPatternVariant;
  height?: number;
}

export const PatternStage = ({ pattern, height = 360 }: IPatternStageProps) => (
  <div
    className="relative w-full overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--app-bg)]"
    style={{ height }}
  >
    <ReactFlowProvider>
      <ReactFlow
        nodes={[]}
        edges={[]}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        fitView={false}
      >
        {pattern !== 'none' && (
          <Background
            variant={BACKGROUND_VARIANT_BY_PATTERN[pattern]}
            gap={BACKGROUND_DOT_GAP}
            size={BACKGROUND_SIZE_BY_PATTERN[pattern]}
            color={`var(--app-bg-grid, ${BACKGROUND_COLOR_FALLBACK})`}
          />
        )}
      </ReactFlow>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(80% 60% at 80% 6%, var(--accent-glow), transparent 60%), radial-gradient(60% 50% at 14% 100%, color-mix(in oklab, var(--accent-2) 22%, transparent), transparent 70%)',
          opacity: 0.4,
        }}
      />
    </ReactFlowProvider>
  </div>
);
