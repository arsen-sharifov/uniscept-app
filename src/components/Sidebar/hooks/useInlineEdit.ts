'use client';

import { useCallback, useState, type KeyboardEvent } from 'react';

interface IUseInlineEditOptions {
  items: Array<{ id: string; name: string }>;
  autoEditId?: string | null;
  onAutoEditHandled?: () => void;
  onRename?: (id: string, name: string) => void;
  findItem?: (id: string) => { id: string; name: string } | null | undefined;
}

export const useInlineEdit = ({
  items,
  autoEditId,
  onAutoEditHandled,
  onRename,
  findItem,
}: IUseInlineEditOptions) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [prevAutoEditId, setPrevAutoEditId] = useState<string | null>(null);

  if (autoEditId !== prevAutoEditId) {
    setPrevAutoEditId(autoEditId ?? null);
    if (autoEditId) {
      const match = findItem
        ? findItem(autoEditId)
        : items.find((item) => item.id === autoEditId);
      if (match) {
        setEditingId(match.id);
        setEditValue(match.name);
      }
    }
  }

  const inputRef = useCallback((element: HTMLInputElement | null) => {
    if (element) {
      element.focus();
      element.select();
    }
  }, []);

  const startEditing = useCallback((id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  }, []);

  const commitRename = useCallback(() => {
    if (editingId && editValue.trim()) {
      onRename?.(editingId, editValue.trim());
    }
    setEditingId(null);
    onAutoEditHandled?.();
  }, [editingId, editValue, onRename, onAutoEditHandled]);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    onAutoEditHandled?.();
  }, [onAutoEditHandled]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter') commitRename();
      if (event.key === 'Escape') cancelEditing();
    },
    [commitRename, cancelEditing]
  );

  return {
    editingId,
    editValue,
    setEditValue,
    inputRef,
    startEditing,
    commitRename,
    cancelEditing,
    handleKeyDown,
  };
};
