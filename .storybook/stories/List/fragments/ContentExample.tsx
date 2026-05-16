interface IContentExampleProps {
  text: string;
}

export const ContentExample = ({ text }: IContentExampleProps) => (
  <div className="ml-6 border-l border-[color:var(--border)] py-1 pl-3 text-[12.5px] text-[color:var(--text-muted)]">
    {text}
  </div>
);
