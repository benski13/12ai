"use client";
import { useState } from "react";
import { AIInsight } from "@/components/ui/AIInsight";

const MODES = [
  { id: "brief", icon: "⚡", label: "Daily Brief", color: "var(--green)", desc: "Priorité du jour" },
  { id: "audit", icon: "🔍", label: "Brutal Audit", color: "var(--red)", desc: "Vérité sans filtre" },
  { id: "trading", icon: "📈", label: "Trading Analysis", color: "var(--blue)", desc: "Edge & erreurs" },
  { id: "ecom", icon: "🛒", label: "Ecom Analysis", color: "var(--amber)", desc: "Kill / Scale" },
  { id: "money", icon: "💰", label: "Money Coach", color: "var(--green)", desc: "Trajectoire 68k" },
  { id: "weekly", icon: "📅", label: "Weekly Review", color: "var(--purple)", desc: "Bilan semaine" },
  { id: "roadmap", icon: "🗺️", label: "Roadmap Review", color: "var(--amber)", desc: "Avance ou retard?" },
];

export function AICoachClient({ context }: { context: Record<string, unknown> }) {
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [customMode, setCustomMode] = useState(false);

  return (
    <div className="page-enter">
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>🤖 AI Coach Central</div>
        <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Analyse tes données · Identifie tes angles morts · Plan d&apos;action</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
        {MODES.map(m => (
          <div key={m.id} className={`card ${activeMode === m.id ? "card-ai" : ""}`}
            style={{ cursor: "pointer", borderColor: activeMode === m.id ? m.color : undefined, transition: "all 0.16s" }}
            onClick={() => { setActiveMode(m.id); setCustomMode(false); }}>
            <div style={{ fontSize: "20px", marginBottom: "8px" }}>{m.icon}</div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: m.color }}>{m.label}</div>
            <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "4px" }}>{m.desc}</div>
          </div>
        ))}
        <div className="card" style={{ cursor: "pointer", borderColor: customMode ? "var(--cyan)" : undefined }} onClick={() => { setCustomMode(true); setActiveMode(null); }}>
          <div style={{ fontSize: "20px", marginBottom: "8px" }}>💬</div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cyan)" }}>Question Libre</div>
          <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "4px" }}>Pose n&apos;importe quelle question</div>
        </div>
      </div>
      <div className="card card-ai">
        {customMode ? (
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "var(--cyan)", marginBottom: "12px" }}>💬 Question Libre</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input className="inp" value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="Ex: Quel est mon plus gros problème en trading en ce moment ?" style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && e.currentTarget.form?.submit()} />
            </div>
            {customPrompt.trim() && <AIInsight mode="audit" context={{ ...context, customQuestion: customPrompt }} buttonLabel="Envoyer" />}
          </div>
        ) : activeMode ? (
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "var(--purple)", marginBottom: "4px" }}>
              {MODES.find(m => m.id === activeMode)?.icon} {MODES.find(m => m.id === activeMode)?.label}
            </div>
            <div style={{ fontSize: "10px", color: "var(--txt2)", marginBottom: "14px" }}>Analyse basée sur tes données réelles</div>
            <AIInsight mode={activeMode} context={context} buttonLabel="Lancer l'analyse" />
          </div>
        ) : (
          <div className="empty-state"><div className="icon">🤖</div><p>Sélectionne un mode ci-dessus ou pose une question libre</p><p style={{ fontSize: "10px", color: "var(--txt3)", marginTop: "6px" }}>L&apos;IA analyse tes données réelles pour des réponses pertinentes</p></div>
        )}
      </div>
    </div>
  );
}
