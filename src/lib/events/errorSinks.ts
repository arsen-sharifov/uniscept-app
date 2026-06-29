import type { IAppError, TErrorSink } from '@interfaces';

const consoleSink: TErrorSink = (error) => {
  const label = error.context ? `[${error.category}] ${error.context}` : `[${error.category}]`;
  console.error(label, error.message, error.cause ?? '');
};

const sinks: TErrorSink[] = [consoleSink];

export const reportError = (error: IAppError): void => sinks.forEach((sink) => sink(error));
