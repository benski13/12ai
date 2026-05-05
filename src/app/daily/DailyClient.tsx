"use client";

import { useState, useTransition } from "react";
import { saveDailyReview } from "./actions";
import type { DailyReview } from "@/types/database";

interface Props {
  userId: string;
  today: string;
  todayReview: DailyReview | null;
  history: DailyReview[];
}

type Tab = "morning" | "evening" | "history";

const MOOD_OPTIONS = ["🔥 En feu", "✅ Bon", "😐 Neutre", "😤 Fatigué", "😞 Mauvais"];

export function DailyClient({ todayReview, history, today }: Props) {
  const [tab, setTab] = useState<Tab>("morning");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const r = todayReview;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveDailyReview(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  const dateLabel = new Date(today + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>🎯 Daily OS</div>
          <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px", textTransform: "capitalize" }}>{dateLabel}</div>
        </div>
        {tab !== "history" && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {saved && <span style={{ fontSize: "11px", color: "var(--green)", fontFamily: "JetBrains Mono, monospace" }}>✅ Sauvegardé +30 XP</span>}
            <button type="submit" form="daily-form" className="btn btn-primary" disabled={isPending}>
              {isPending ? "⏳ Sauvegarde..." : "💾 Sauvegarder (+30 XP)"}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: "16px" }}>
        {(["morning", "evening", "history"] as Tab[]).map((t) => (
          <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "morning" ? "🌅 Morning Setup" : t === "evening" ? "🌙 Evening Review" : "📚 Historique"}
          </div>
        ))}
      </div>

      {tab !== "history" ? (
        <form id="daily-form" onSubmit={handleSubmit}>
          {/* Morning Tab */}
          {tab === "morning" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div className="card">
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>🌅 Intention du Jour</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <Field label="Intention principale" name="morning_intention" defaultValue={r?.morning_intention ?? ""} placeholder="Ce que cette journée doit accomplir..." />
                    <Field label="Priorité #1 — Action critique" name="top_priority_1" defaultValue={r?.top_priority_1 ?? ""} placeholder="L'action #1 qui te rapproche le + de l'objectif..." />
                    <Field label="Priorité #2" name="top_priority_2" defaultValue={r?.top_priority_2 ?? ""} placeholder="Action importante..." />
                    <Field label="Priorité #3" name="top_priority_3" defaultValue={r?.top_priority_3 ?? ""} placeholder="Action utile..." />
                    <Field label="Minimum Viable Day" name="minimum_viable_day" defaultValue={r?.minimum_viable_day ?? ""} placeholder="Le strict minimum pour que la journée soit un succès..." />
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>⚡ Actions par Domaine</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <Field label="🎯 Action Trading" name="action_trading" defaultValue={r?.action_trading ?? ""} placeholder="Ex: Analyser setup EUR/USD H4..." />
                    <Field label="🛒 Action E-com" name="action_ecom" defaultValue={r?.action_ecom ?? ""} placeholder="Ex: Analyser 3 produits..." />
                    <Field label="💰 Action Money" name="action_money" defaultValue={r?.action_money ?? ""} placeholder="Ex: Vérifier allocation..." />
                    <Field label="📚 Action Learning" name="action_learning" defaultValue={r?.action_learning ?? ""} placeholder="Ex: 30min lecture..." />
                    <Field label="⚠️ Risque du jour" name="risk_of_day" defaultValue={r?.risk_of_day ?? ""} placeholder="Ce qui pourrait dérailler..." />
                    <Field label="🔒 Règle non négociable" name="non_negotiable_rule" defaultValue={r?.non_negotiable_rule ?? ""} placeholder="La règle du jour..." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Evening Tab */}
          {tab === "evening" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div className="card">
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>🔋 État du Jour</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <Field label="Énergie /10" name="energy" type="number" min="1" max="10" defaultValue={r?.energy?.toString() ?? "7"} />
                    <Field label="Focus /10" name="focus" type="number" min="1" max="10" defaultValue={r?.focus?.toString() ?? "7"} />
                    <div>
                      <label style={{ fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" }}>Humeur</label>
                      <select className="inp" name="mood" defaultValue={r?.mood ?? "✅ Bon"}>
                        {MOOD_OPTIONS.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <Field label="Sommeil (h)" name="sleep_hours" type="number" min="0" max="12" step="0.5" defaultValue={r?.sleep_hours?.toString() ?? "7"} />
                    <Field label="Deep Work (h)" name="deep_work_hours" type="number" min="0" max="12" step="0.5" defaultValue={r?.deep_work_hours?.toString() ?? "0"} />
                    <div>
                      <label style={{ fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" }}>Sport</label>
                      <select className="inp" name="sport_done" defaultValue={r?.sport_done ? "1" : "0"}>
                        <option value="0">Non</option>
                        <option value="1">Oui ✓</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>✅ Wins & Score</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <Field label="Score Global /100" name="daily_score" type="number" min="0" max="100" defaultValue={r?.daily_score?.toString() ?? ""} placeholder="75" />
                    <Field label="Victoire principale" name="main_win" defaultValue={r?.main_win ?? ""} placeholder="La meilleure chose accomplie..." />
                    <Field label="Tâches terminées (résumé)" name="tasks_done" defaultValue={r?.tasks_done ?? ""} placeholder="P1 ✓ P2 ✓ P3 ✗" />
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div className="card">
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>🔍 Erreurs & Leçons</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <Field label="Erreur principale" name="main_mistake" defaultValue={r?.main_mistake ?? ""} placeholder="Ce qui n'a pas fonctionné..." />
                    <Field label="Leçon retenue" name="lesson" defaultValue={r?.lesson ?? ""} placeholder="Ce que tu en retiens..." />
                    <Field label="Amélioration pour demain" name="improvement" defaultValue={r?.improvement ?? ""} placeholder="Ce que tu vas faire différemment..." />
                    <Field label="Priorité #1 demain" name="tomorrow_priority" defaultValue={r?.tomorrow_priority ?? ""} placeholder="La chose la + importante demain..." />
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>📊 Résumé Domaines</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <Field label="Trading du jour" name="trading_summary" defaultValue={r?.trading_summary ?? ""} placeholder="Ex: 1 trade +0.5R, plan respecté..." />
                    <Field label="E-com du jour" name="ecom_summary" defaultValue={r?.ecom_summary ?? ""} placeholder="Ex: Produit analysé..." />
                    <Field label="Money du jour" name="money_summary" defaultValue={r?.money_summary ?? ""} placeholder="Ex: Épargne virée..." />
                    <Field label="Learning du jour" name="learning_summary" defaultValue={r?.learning_summary ?? ""} placeholder="Ex: 30min lecture..." />
                  </div>
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>📝 Notes Libres</div>
                <textarea className="inp" name="notes" defaultValue={r?.notes ?? ""} placeholder="Réflexions, idées, observations du jour..." style={{ minHeight: "80px" }} />
              </div>
            </div>
          )}
        </form>
      ) : (
        /* History Tab */
        <div>
          {history.length === 0 ? (
            <div className="empty-state"><div className="icon">📚</div><p>Pas encore de reviews</p></div>
          ) : (
            history.map((rev) => (
              <div key={rev.id} className="card" style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "12px" }}>{new Date(rev.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
                    <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>{rev.morning_intention || "—"}</div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {rev.daily_score != null && (
                      <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: rev.daily_score >= 70 ? "var(--green)" : rev.daily_score >= 50 ? "var(--amber)" : "var(--red)" }}>
                        {rev.daily_score}
                      </span>
                    )}
                    {rev.energy && <span className="tag tag-blue">E:{rev.energy}</span>}
                    {rev.focus && <span className="tag tag-purple">F:{rev.focus}</span>}
                  </div>
                </div>
                {rev.top_priority_1 && <div style={{ fontSize: "11px", marginBottom: "4px" }}>🎯 {rev.top_priority_1}</div>}
                {rev.main_win && <div style={{ fontSize: "11px", color: "var(--green)" }}>✅ {rev.main_win}</div>}
                {rev.main_mistake && <div style={{ fontSize: "11px", color: "var(--red)" }}>❌ {rev.main_mistake}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, name, type = "text", defaultValue = "", placeholder = "", min, max, step }: {
  label: string; name: string; type?: string; defaultValue?: string; placeholder?: string;
  min?: string; max?: string; step?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" }}>{label}</label>
      <input className="inp" type={type} name={name} defaultValue={defaultValue} placeholder={placeholder} min={min} max={max} step={step} />
    </div>
  );
}
