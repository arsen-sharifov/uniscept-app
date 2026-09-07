'use client';

import { type RefObject, useCallback, useEffect, useState } from 'react';

import type { IHeroEdge, IHeroEdgePath, IRect } from '@interfaces';

import { HERO_REMEASURE_DELAY_MS } from '../consts';
import { buildEdgePath, measureLayoutRect } from '../utils';

export const useEdgePaths = (stageRef: RefObject<HTMLElement | null>, edges: IHeroEdge[]): IHeroEdgePath[] => {
  const [paths, setPaths] = useState<IHeroEdgePath[]>([]);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const rectOf = (id: string): IRect | null => {
      const element = stage.querySelector<HTMLElement>(`[data-hero-node="${id}"]`);

      return element ? measureLayoutRect(element, stage) : null;
    };

    setPaths(
      edges
        .map((edge) => {
          const source = rectOf(edge.source);
          const target = rectOf(edge.target);

          return source && target ? buildEdgePath(edge, source, target) : null;
        })
        .filter((path): path is IHeroEdgePath => path !== null),
    );
  }, [edges, stageRef]);

  useEffect(() => {
    measure();
    const settle = setTimeout(measure, HERO_REMEASURE_DELAY_MS);
    document.fonts.ready.then(measure);

    const stage = stageRef.current;
    if (!stage) return () => clearTimeout(settle);

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    stage.querySelectorAll('[data-hero-node]').forEach((element) => observer.observe(element));

    return () => {
      clearTimeout(settle);
      observer.disconnect();
    };
  }, [measure, stageRef]);

  return paths;
};
