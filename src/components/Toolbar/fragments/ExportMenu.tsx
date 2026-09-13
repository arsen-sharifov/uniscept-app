'use client';

import { Download, LoaderCircle } from 'lucide-react';

import { useTranslations } from '@/i18n';

import { EXPORT_FORMATS, ICON_STROKE } from '../consts';
import { useExportMenu } from '../hooks';

interface IExportMenuProps {
  threadId: string;
  threadName: string;
}

export const ExportMenu = ({ threadId, threadName }: IExportMenuProps) => {
  const copy = useTranslations().platform.canvas.export;
  const { open, disabled, loading, hint, menuId, rootRef, buttonRef, menuRef, toggle, handleKeyDown, exportFormat } =
    useExportMenu(threadId, threadName);

  return (
    <div ref={rootRef} className="relative flex justify-center">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || loading}
        aria-label={loading ? copy.loading : copy.label}
        title={disabled ? copy.unavailable : copy.label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
      >
        {loading ? (
          <LoaderCircle
            className="h-[17px] w-[17px] animate-spin motion-reduce:animate-none"
            strokeWidth={ICON_STROKE}
          />
        ) : (
          <Download className="h-[17px] w-[17px]" strokeWidth={ICON_STROKE} />
        )}
      </button>

      {open && (
        <div className="absolute right-full bottom-0 z-50 mr-3 w-64 max-w-[calc(100vw-6rem)] rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2 text-[color:var(--text)] shadow-[var(--shadow-modal)]">
          <p className="px-2 pt-1 text-[13px] font-semibold">{copy.label}</p>
          <p className="px-2 pt-1 pb-2 text-xs leading-relaxed text-[color:var(--text-muted)]">{copy.description}</p>

          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            tabIndex={-1}
            aria-label={copy.label}
            aria-busy={loading}
            onKeyDown={handleKeyDown}
            className="outline-none"
          >
            {EXPORT_FORMATS.map((format) => (
              <button
                key={format}
                type="button"
                role="menuitem"
                disabled={loading || disabled}
                onClick={() => exportFormat(format)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left text-[13px] transition-colors hover:bg-[color:var(--surface-overlay)] focus-visible:bg-[color:var(--surface-overlay)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none disabled:cursor-wait disabled:opacity-50 motion-reduce:transition-none"
              >
                <span className="font-semibold">{format.toUpperCase()}</span>
                <span className="text-xs text-[color:var(--text-muted)]">{copy.formats[format]}</span>
              </button>
            ))}
          </div>

          {(loading || hint) && (
            <output className="block px-2 pt-2 text-xs leading-relaxed text-[color:var(--text-muted)]">
              {loading ? copy.loading : hint}
            </output>
          )}
        </div>
      )}
    </div>
  );
};
