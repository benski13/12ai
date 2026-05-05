"use client";
import { useTransition, useState } from "react";
import { addHabit, toggleHabitLog, toggleHabitActive, deleteHabit } from "./actions";
import type { Habit, HabitLog } from "@/types/database";

type Tab = "today" | "manage" | "stats";

const CAT_ICONS: Record<string, string> = { health: "🏃", money: "💰", trading: "📈", ecom: "🛒", learning: "📚", discipline: "⚡", other: "🔁" };

function getStreak(habitId: string, logs: HabitLog[], today: string): number {
  let streak = 0;
  const d = new Date(today + "T12:00:00");
  while (true) {
    const ds = d.toISOString().slice(0, 10);
    if (logs.some(l => l.habit_id === habitId && l.date === ds)) { streak++; d.setDate(d.getDate() - 1); }
    else break;
    if (streak > 365) break;
  }
  return streak;
}

export function HabitsClient({ habits, logs, today }: { userId: string; habits: Habit[]; logs: HabitLog[]; today: string }) {
  const [tab, setTab] = useState<Tab>("today");
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const active = habits.filter(h => h.active);
  const todayLogs = logs.filter(l => l.date === today);
  const done = active.filter(h => todayLogs.some(l => l.habit_id === h.id));
  const rate7 = (() => {
    const days: string[] = [];
    for (let i = 0; i < 7; i++) { const d = new Date(today + "T12:00:00"); d.setDate(d.getDate() - i); days.push(d.toISOString().slice(0, 10)); }
    const possible = active.length * 7;
    const actual = days.reduce((s, date) => s + active.filter(h => logs.some(l => l.habit_id === h.id && l.date === date)).length, 0);
    return possible ? Math.round(actual / possible * 100) : 0;
  })();
  const maxStreak = active.length ? Math.max(...active.map(h => getStreak(h.id, logs, today)), 0) : 0;

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>🔁 Habits Tracker</div>
          <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Discipline mesurable · Streaks · +5 XP par habit</div></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "✕ Fermer" : "+ Nouvel Habit"}</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "12px", borderColor: "var(--green)" }}>
          <form action={async (fd) => { await addHabit(fd); setShowForm(false); }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "10px", alignItems: "end" }}>
              <div><label style={LS}>Nom de l&apos;Habit</label><input className="inp" name="name" placeholder="Ex: 30min sport, Lire 20min..." required /></div>
              <div><label style={LS}>Catégorie</label>
                <select className="inp" name="category">
                  {Object.entries(CAT_ICONS).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Ajouter</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
        {[
          { label: "Habits Actifs", value: active.length.toString(), color: "var(--blue)" },
          { label: "Complétés Aujourd'hui", value: `${done.length}/${active.length}`, color: "var(--green)" },
          { label: "Streak Max", value: maxStreak + " jours", color: "var(--amber)" },
          { label: "Rate 7 jours", value: rate7 + "%", color: "var(--purple)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>{label}</div>
            <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom: "16px" }}>
        {(["today", "manage", "stats"] as Tab[]).map(t => (
          <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "today" ? "📅 Aujourd'hui" : t === "manage" ? "⚙️ Gérer" : "📊 Stats"}
          </div>
        ))}
      </div>

      {tab === "today" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Check du Jour</div>
            <div style={{ fontSize: "11px", color: "var(--txt2)" }}>{new Date(today + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
          </div>
          {active.length === 0 ? <div className="empty-state"><div className="icon">🔁</div><p>Ajoute tes premiers habits via le bouton +</p></div> :
            active.map(h => {
              const isDone = todayLogs.some(l => l.habit_id === h.id);
              const streak = getStreak(h.id, logs, today);
              return (
                <div key={h.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "var(--panel)", border: `1px solid ${isDone ? "rgba(0,232,122,.3)" : "var(--border)"}`, borderRadius: "6px", marginBottom: "6px", transition: "all 0.16s", opacity: isDone ? 0.7 : 1 }}>
                  <div onClick={() => startTransition(() => toggleHabitLog(h.id, today, isDone))}
                    style={{ width: "22px", height: "22px", border: `2px solid ${isDone ? "var(--green)" : "var(--border2)"}`, borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", background: isDone ? "var(--green)" : "transparent", color: "#000", flexShrink: 0, transition: "all 0.16s" }}>
                    {isDone ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: "14px" }}>{CAT_ICONS[h.category] ?? "🔁"}</span>
                  <div style={{ flex: 1, fontSize: "12px", fontWeight: 500, textDecoration: isDone ? "line-through" : "none" }}>{h.name}</div>
                  {streak > 0 && <div style={{ fontSize: "10px", fontFamily: "JetBrains Mono, monospace", color: "var(--amber)" }}>🔥 {streak}d</div>}
                </div>
              );
            })
          }
        </div>
      )}

      {tab === "manage" && (
        <div>
          {habits.length === 0 ? <div className="empty-state"><div className="icon">⚙️</div><p>Pas encore d&apos;habits</p></div> :
            habits.map(h => (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", marginBottom: "6px" }}>
                <span style={{ fontSize: "14px" }}>{CAT_ICONS[h.category] ?? "🔁"}</span>
                <div style={{ flex: 1, fontSize: "12px", fontWeight: 500 }}>{h.name}</div>
                <span className={`tag ${h.active ? "tag-green" : "tag-grey"}`}>{h.active ? "Actif" : "Inactif"}</span>
                <button className="btn btn-xs btn-secondary" onClick={() => startTransition(() => toggleHabitActive(h.id, h.active))}>{h.active ? "Désactiver" : "Activer"}</button>
                <button className="btn btn-xs btn-red" onClick={() => { if (confirm("Supprimer?")) startTransition(() => deleteHabit(h.id)); }}>🗑️</button>
              </div>
            ))
          }
        </div>
      )}

      {tab === "stats" && (
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px" }}>🏆 Streaks par Habit</div>
          {active.length === 0 ? <div className="empty-state"><div className="icon">📊</div><p>Pas encore de données</p></div> :
            active.map(h => {
              const streak = getStreak(h.id, logs, today);
              const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(today + "T12:00:00"); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10); });
              return (
                <div key={h.id} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <span>{CAT_ICONS[h.category]} {h.name}</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--amber)" }}>🔥 {streak}d</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {last7.map(date => {
                      const done = logs.some(l => l.habit_id === h.id && l.date === date);
                      return <div key={date} style={{ flex: 1, height: "12px", background: done ? "var(--green)" : "var(--panel)", borderRadius: "2px", border: "1px solid var(--border)" }} title={date} />;
                    })}
                  </div>
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
const LS: React.CSSProperties = { fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" };
