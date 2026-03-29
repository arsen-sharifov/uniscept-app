'use client';

import { FileText, Folder } from 'lucide-react';
import type { IFlattenedItem } from '@interfaces';

interface IDragOverlayContentProps {
  item: IFlattenedItem;
  bulkCount?: number;
}

export const DragOverlayContent = ({
  item,
  bulkCount,
}: IDragOverlayContentProps) => (
  <div className="relative">
    {bulkCount && bulkCount > 1 && (
      <>
        <div className="absolute top-1 left-1 h-full w-56 rounded-xl border border-emerald-500/10 bg-emerald-50/50" />
        <div className="absolute top-0.5 left-0.5 h-full w-56 rounded-xl border border-emerald-500/15 bg-emerald-50/80" />
      </>
    )}
    <div className="relative w-56 rounded-xl border border-emerald-500/20 bg-white shadow-lg">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1 text-sm leading-5 text-black/60 transition-all duration-150 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-cyan-500/10 hover:text-emerald-700">
        <div className="h-3.5 w-3.5 shrink-0" />
        {item.type === 'folder' ? (
          <Folder className="h-4 w-4 shrink-0 text-black/30" />
        ) : (
          <FileText className="h-4 w-4 shrink-0 text-black/30" />
        )}
        <span className="truncate">{item.name}</span>
        {item.type === 'folder' && item.childCount > 0 && (
          <span className="ml-auto rounded-full bg-emerald-100 px-1.5 text-[10px] font-medium text-emerald-600">
            {item.childCount}
          </span>
        )}
      </div>
      {bulkCount && bulkCount > 1 && (
        <span className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
          {bulkCount}
        </span>
      )}
    </div>
  </div>
);
