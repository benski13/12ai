interface EmptyStateProps { icon: string; title: string; hint?: string; }
export function EmptyState({ icon, title, hint }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <p>{title}</p>
      {hint && <p style={{ fontSize: "10px", color: "var(--txt3)", marginTop: "6px", fontFamily: "JetBrains Mono, monospace" }}>{hint}</p>}
    </div>
  );
}
