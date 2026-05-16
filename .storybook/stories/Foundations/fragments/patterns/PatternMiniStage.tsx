import { Background, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import type { TPatternVariant } from '@story-interfaces';
import {
  BACKGROUND_COLOR_FALLBACK,
  BACKGROUND_DOT_GAP,
  BACKGROUND_SIZE_BY_PATTERN,
  BACKGROUND_VARIANT_BY_PATTERN,
} from '@/components/Canvas/consts';

interface IPatternMiniStageProps {
  pattern: TPatternVariant;
}

export const PatternMiniStage = ({ pattern }: IPatternMiniStageProps) => (
  <div className="relative h-32 w-full overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--app-bg)]">
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
    </ReactFlowProvider>
  </div>
);
