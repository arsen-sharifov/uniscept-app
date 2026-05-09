import { BaseEdge, type EdgeProps, getBezierPath, Position } from '@xyflow/react';
import type { TCanvasEdge } from '@interfaces';
import { ARROW_LENGTH } from './consts';

const retractAlongPosition = (x: number, y: number, position: Position): { x: number; y: number } => {
  switch (position) {
    case Position.Top:
      return { x, y: y - ARROW_LENGTH };
    case Position.Right:
      return { x: x + ARROW_LENGTH, y };
    case Position.Bottom:
      return { x, y: y + ARROW_LENGTH };
    case Position.Left:
    default:
      return { x: x - ARROW_LENGTH, y };
  }
};

export const CanvasEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
}: EdgeProps<TCanvasEdge>) => {
  const tone = data?.tone ?? 'default';
  const bidirectional = data?.bidirectional === true;

  const target = retractAlongPosition(targetX, targetY, targetPosition ?? Position.Top);
  const source = bidirectional
    ? retractAlongPosition(sourceX, sourceY, sourcePosition ?? Position.Bottom)
    : { x: sourceX, y: sourceY };

  const [path] = getBezierPath({
    sourceX: source.x,
    sourceY: source.y,
    targetX: target.x,
    targetY: target.y,
    sourcePosition: sourcePosition ?? Position.Bottom,
    targetPosition: targetPosition ?? Position.Top,
  });

  const markerRef = `url(#canvas-arrow-${tone})`;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerStart={bidirectional ? markerRef : undefined}
        markerEnd={markerRef}
        style={style}
      />
      {bidirectional && (
        <path
          d={path}
          className="react-flow__edge-path canvas-edge-bidi-reverse"
          style={{ ...style, fill: 'none', pointerEvents: 'none' }}
        />
      )}
    </>
  );
};
