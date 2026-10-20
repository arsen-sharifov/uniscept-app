'use client';

import { Component, type ReactNode } from 'react';

import type { IErrorBoundaryState, IHandleErrorOptions } from '@interfaces';

import { event } from '@/lib/events';

interface IErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  report?: IHandleErrorOptions;
  onError?: () => void;
}

export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
  state: IErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): IErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    const { report = { toast: false, context: 'boundary.render' }, onError } = this.props;
    event.error(error, report);
    onError?.();
  }

  render() {
    if (this.state.hasError) return this.props.fallback;

    return this.props.children;
  }
}
