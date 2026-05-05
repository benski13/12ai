"use client";
import { useState } from "react";

interface AIInsightProps {
  mode: string;
  context?: Record<string, unknown>;
  buttonLabel?: string;
}

export function AIInsight({ mode, context, buttonLabel = "Analyser" }: AIInsightProps) {
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOutput(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur AI");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <button onClick={run} disabled={loading} className="btn btn-purple btn-sm" style={{ marginBottom: "12px" }}>
        {loading ? "⏳ Analyse..." : `🤖 ${buttonLabel}`}
      </button>
      {loading && (
        <div className="ai-loading">
          <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
          <span>Analyse en cours...</span>
        </div>
      )}
      {error && <div style={{ color: "var(--red)", fontSize: "11px" }}>❌ {error}</div>}
      {output && (
        <div className="ai-response" dangerouslySetInnerHTML={{
          __html: output
            .replace(/\*\*(.*?)\*\*/g, "<strong style='color:var(--green)'>$1</strong>")
            .replace(/\n/g, "<br>")
        }} />
      )}
    </div>
  );
}
