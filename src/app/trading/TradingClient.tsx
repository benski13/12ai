"use client";

import { useState, useTransition, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip } from "chart.js";
import { AIInsight } from "@/components/ui/AIInsight";
import { addTrade, deleteTrade, saveTradingPlan } from "./actions";
import type { Trade } from "@/types/database";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip);

const CHART_OPTS = {
  responsive: true, plugins: { legend: { display: false } },
  scales: { x: { ticks: { color: "#6868a0", font: { size: 9 } }, grid: { color: "#181830" } }, y: { ticks: { color: "#6868a0", font: { size: 9 } }, grid: { color: "#181830" } } },
};

type Tab = "log" | "analytics" | "errors" | "plan" | "ai";

function computeStats(trades: Trade[]) {
  const wins = trades.filter(t => (t.result_r ?? 0) > 0);
  const losses = trades.filter(t => (t.result_r ?? 0) < 0);
  const winrate = trades.length ? (wins.length / trades.length) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((s, t) => s + (t.result_r ?? 0), 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.result_r ?? 0), 0) / losses.length) : 0;
  const pf = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;
  const exp = (winrate / 100 * avgWin) - ((1 - winrate / 100) * avgLoss);
  const totalPnL = trades.reduce((s, t) => s + (t.result_amount ?? 0), 0);
  const planOk = trades.filter(t => t.plan_respected).length;
  const mistakes: Record<string, number> = {};
  trades.forEach(t => { if (t.mistake_type && t.mistake_type !== "none") mistakes[t.mistake_type] = (mistakes[t.mistake_type] ?? 0) + 1; });
  const topMistake = Object.entries(mistakes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return { wins: wins.length, losses: losses.length, winrate, pf, exp, totalPnL, avgWin, avgLoss, planOk, mistakes, topMistake };
}

function fmt$(n: number) { return (n >= 0 ? "+" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function fmtDate(d: string) { return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" }); }
const today = () => new Date().toISOString().slice(0, 10);

export function TradingClient({ userId, trades, plan }: { userId: string; trades: Trade[]; plan: Record<string, unknown> | null }) {
  const [tab, setTab] = useState<Tab>("log");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [planPending, startPlanTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const stats = computeStats(trades);

  const handleAddTrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => { await addTrade(fd); setShowForm(false); formRef.current?.reset(); });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ce trade?")) return;
    startTransition(async () => { await deleteTrade(id); });
  };

  const handleSavePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startPlanTransition(async () => { await saveTradingPlan(fd); });
  };

  // Equity curve
  let cum = 0;
  const equityData = [...trades].reverse().map(t => { cum += t.result_amount ?? 0; return parseFloat(cum.toFixed(2)); });
  const equityLabels = equityData.map((_, i) => `T${i + 1}`);

  // Setup performance
  const setupMap: Record<string, { wins: number; total: number }> = {};
  trades.forEach(t => {
    if (!t.setup) return;
    if (!setupMap[t.setup]) setupMap[t.setup] = { wins: 0, total: 0 };
    setupMap[t.setup].total++;
    if ((t.result_r ?? 0) > 0) setupMap[t.setup].wins++;
  });
  const setupLabels = Object.keys(setupMap).slice(0, 8);
  const setupRates = setupLabels.map(s => parseFloat((setupMap[s].wins / setupMap[s].total * 100).toFixed(0)));

  const aiContext = {
    total: trades.length, winrate: stats.winrate.toFixed(1) + "%", pf: stats.pf.toFixed(2),
    totalPnL: fmt$(stats.totalPnL), topMistake: stats.topMistake, mistakes: stats.mistakes,
    planRespectedRate: trades.length ? (stats.planOk / trades.length * 100).toFixed(0) + "%" : "—",
    recentTrades: trades.slice(0, 20).map(t => ({ date: t.date, sym: t.symbol, dir: t.direction, r: t.result_r, plan: t.plan_respected, mistake: t.mistake_type })),
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>📈 Trading Journal</div>
          <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Documente chaque trade · Analyse ton edge · +20 XP par trade</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { setTab("ai"); }}>🤖 AI Analyst</button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Fermer" : "+ Nouveau Trade"}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "12px" }}>
        {[
          { label: "Total Trades", value: trades.length.toString(), color: "var(--blue)" },
          { label: "Winrate", value: trades.length ? stats.winrate.toFixed(0) + "%" : "—%", color: stats.winrate >= 50 ? "var(--green)" : "var(--red)" },
          { label: "Profit Factor", value: stats.pf ? stats.pf.toFixed(2) : "—", color: stats.pf >= 1.5 ? "var(--green)" : stats.pf >= 1 ? "var(--amber)" : "var(--red)" },
          { label: "Expectancy", value: stats.exp ? stats.exp.toFixed(3) + "R" : "—R", color: stats.exp > 0 ? "var(--green)" : "var(--red)" },
          { label: "P&L Total", value: fmt$(stats.totalPnL), color: stats.totalPnL >= 0 ? "var(--green)" : "var(--red)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>{label}</div>
            <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Add Trade Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: "12px", borderColor: "var(--green)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px", color: "var(--green)" }}>
            ➕ Nouveau Trade (+20 XP)
          </div>
          <form ref={formRef} onSubmit={handleAddTrade}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "10px" }}>
              {[
                { label: "Date", name: "date", type: "date", defaultValue: today() },
                { label: "Symbol", name: "symbol", placeholder: "EUR/USD, SPX..." },
                { label: "Market", name: "market", placeholder: "Forex, Indices..." },
                { label: "Session", name: "session", placeholder: "London, NY..." },
              ].map(f => <TF key={f.name} {...f} />)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "10px" }}>
              <div>
                <label style={LS}>Direction</label>
                <select className="inp" name="direction"><option value="long">Long ↑</option><option value="short">Short ↓</option></select>
              </div>
              {[
                { label: "Setup", name: "setup", placeholder: "BOS, ICT, Pullback..." },
                { label: "Timeframe", name: "timeframe", placeholder: "H1, H4..." },
              ].map(f => <TF key={f.name} {...f} />)}
              <div>
                <label style={LS}>Plan Respecté?</label>
                <select className="inp" name="plan_respected"><option value="true">Oui ✓</option><option value="false">Non ✗</option></select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "10px" }}>
              {[
                { label: "Result (R)", name: "result_r", type: "number", placeholder: "+2.0", step: "0.01" },
                { label: "Result ($)", name: "result_amount", type: "number", placeholder: "200", step: "0.01" },
                { label: "Risk ($)", name: "risk_amount", type: "number", placeholder: "100" },
                { label: "Fees ($)", name: "fees", type: "number", placeholder: "0", defaultValue: "0" },
              ].map(f => <TF key={f.name} {...f} />)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "10px" }}>
              <div>
                <label style={LS}>Erreur</label>
                <select className="inp" name="mistake_type">
                  {["none", "Revenge trade", "FOMO", "Early entry", "Late entry", "Moved SL", "Overleveraged", "Ignored news", "Traded tired", "No plan", "Overtrading"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={LS}>Émotion avant</label>
                <select className="inp" name="emotion_before">
                  {["calme", "confiant", "anxieux", "euphorique", "frustré", "neutre"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <TF label="Contexte marché" name="market_context" placeholder="Bullish, Range, News..." />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={LS}>Notes</label>
              <textarea className="inp" name="notes" placeholder="Contexte, leçon, observations..." style={{ minHeight: "60px" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? "⏳ Sauvegarde..." : "💾 Sauvegarder Trade (+20 XP)"}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: "16px" }}>
        {(["log", "analytics", "errors", "plan", "ai"] as Tab[]).map(t => (
          <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "log" ? "📋 Trade Log" : t === "analytics" ? "📊 Analytics" : t === "errors" ? "❌ Error Lab" : t === "plan" ? "📝 Trading Plan" : "🤖 AI Analyst"}
          </div>
        ))}
      </div>

      {/* Trade Log */}
      {tab === "log" && (
        trades.length === 0 ? <div className="empty-state"><div className="icon">📈</div><p>Pas encore de trades journalisés</p><p style={{ fontSize: "10px", color: "var(--txt3)", marginTop: "6px" }}>Chaque trade = données réelles + 20 XP</p></div> :
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>{["Date", "Symbol", "Dir", "Setup", "R", "P&L $", "Plan", "Erreur", ""].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {trades.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: "JetBrains Mono, monospace" }}>{fmtDate(t.date)}</td>
                  <td style={{ fontWeight: 600 }}>{t.symbol ?? "—"}</td>
                  <td><span className={`tag ${t.direction === "long" ? "tag-green" : "tag-red"}`}>{t.direction ?? "—"}</span></td>
                  <td style={{ color: "var(--blue)" }}>{t.setup ?? "—"}</td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", color: (t.result_r ?? 0) >= 0 ? "var(--green)" : "var(--red)" }}>
                    {(t.result_r ?? 0) >= 0 ? "+" : ""}{(t.result_r ?? 0).toFixed(2)}R
                  </td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", color: (t.result_amount ?? 0) >= 0 ? "var(--green)" : "var(--red)" }}>
                    {fmt$(t.result_amount ?? 0)}
                  </td>
                  <td><span className={`tag ${t.plan_respected ? "tag-green" : "tag-red"}`}>{t.plan_respected ? "✓" : "✗"}</span></td>
                  <td style={{ color: "var(--amber)", fontSize: "10px" }}>{t.mistake_type ?? "—"}</td>
                  <td><button className="btn btn-xs btn-red" onClick={() => handleDelete(t.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Analytics */}
      {tab === "analytics" && (
        trades.length < 3 ? <div className="empty-state"><div className="icon">📊</div><p>Minimum 3 trades pour les analytics</p></div> :
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div className="card">
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>📈 Equity Curve</div>
              <Line data={{ labels: equityLabels, datasets: [{ data: equityData, borderColor: stats.totalPnL >= 0 ? "#00e87a" : "#ff2d55", backgroundColor: stats.totalPnL >= 0 ? "rgba(0,232,122,.08)" : "rgba(255,45,85,.08)", tension: 0.3, fill: true, pointRadius: 2 }] }} options={{ ...CHART_OPTS, scales: { ...CHART_OPTS.scales, y: { ...CHART_OPTS.scales.y, ticks: { ...CHART_OPTS.scales.y.ticks, callback: (v) => "$" + v } } } }} height={180} />
            </div>
            <div className="card">
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>🎯 Winrate par Setup</div>
              {setupLabels.length ? <Bar data={{ labels: setupLabels, datasets: [{ data: setupRates, backgroundColor: setupRates.map(r => r >= 60 ? "#00e87a" : r >= 40 ? "#ffb800" : "#ff2d55"), borderRadius: 4 }] }} options={{ ...CHART_OPTS, scales: { ...CHART_OPTS.scales, y: { ...CHART_OPTS.scales.y, max: 100, ticks: { ...CHART_OPTS.scales.y.ticks, callback: (v) => v + "%" } } } }} height={180} /> : <div className="empty-state"><p>Pas assez de données par setup</p></div>}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>📊 Stats Détaillées</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {[
                ["Avg Win (R)", stats.avgWin.toFixed(2) + "R", "var(--green)"],
                ["Avg Loss (R)", stats.avgLoss.toFixed(2) + "R", "var(--red)"],
                ["Plan Respecté", trades.length ? (stats.planOk / trades.length * 100).toFixed(0) + "%" : "—", "var(--blue)"],
                ["Max Consec. Wins", computeMaxConsec(trades, true).toString(), "var(--green)"],
                ["Max Consec. Losses", computeMaxConsec(trades, false).toString(), "var(--red)"],
                ["Avg R/trade", stats.exp.toFixed(3) + "R", stats.exp > 0 ? "var(--green)" : "var(--red)"],
                ["Wins", stats.wins.toString(), "var(--green)"],
                ["Losses", stats.losses.toString(), "var(--red)"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ padding: "10px", background: "var(--panel)", borderRadius: "6px" }}>
                  <div style={{ fontSize: "9px", color: "var(--txt3)", marginBottom: "4px" }}>{l}</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: c as string }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Lab */}
      {tab === "errors" && (
        trades.length < 5 ? <div className="empty-state"><div className="icon">❌</div><p>Minimum 5 trades pour l&apos;Error Lab</p></div> :
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="card">
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px" }}>🔴 Erreurs Fréquentes</div>
            {Object.keys(stats.mistakes).length ? Object.entries(stats.mistakes).sort((a, b) => b[1] - a[1]).map(([err, cnt]) => {
              const maxCnt = Math.max(...Object.values(stats.mistakes));
              return (
                <div key={err} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ flex: 1, fontSize: "11px" }}>{err}</div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--red)", fontWeight: 700 }}>{cnt}x</div>
                  <div style={{ width: "60px", height: "6px", background: "var(--panel)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${(cnt / maxCnt) * 100}%`, height: "100%", background: "var(--red)", borderRadius: "3px" }} />
                  </div>
                </div>
              );
            }) : <div style={{ color: "var(--txt2)", fontSize: "11px" }}>Aucune erreur trackée</div>}
          </div>
          <div className="card">
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px" }}>📊 Métriques Discipline</div>
            {[
              { label: "Trades HORS plan", value: `${trades.filter(t => !t.plan_respected).length}/${trades.length}`, sub: `P&L: ${fmt$(trades.filter(t => !t.plan_respected).reduce((s, t) => s + (t.result_amount ?? 0), 0))}`, color: "var(--red)" },
              { label: "Plan respecté", value: `${(stats.planOk / trades.length * 100).toFixed(0)}%`, sub: `${stats.planOk} trades`, color: "var(--green)" },
              { label: "Erreur principale", value: stats.topMistake ?? "—", sub: "la plus fréquente", color: "var(--amber)" },
            ].map(({ label, value, sub, color }) => (
              <div key={label} style={{ padding: "12px", background: "var(--panel)", borderRadius: "6px", marginBottom: "8px" }}>
                <div style={{ fontSize: "9px", color: "var(--txt3)", marginBottom: "4px" }}>{label}</div>
                <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color }}>{value}</div>
                <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trading Plan */}
      {tab === "plan" && (
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px" }}>📝 Mon Trading Plan</div>
          <form onSubmit={handleSavePlan}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              {[
                { label: "Markets Tradés", name: "markets", defaultValue: plan?.markets as string ?? "", placeholder: "Forex, Indices, Crypto..." },
                { label: "Sessions", name: "sessions", defaultValue: plan?.sessions as string ?? "", placeholder: "London, New York..." },
                { label: "Risk Max/Trade (%)", name: "risk_per_trade", type: "number", defaultValue: plan?.risk_per_trade?.toString() ?? "1", placeholder: "1" },
                { label: "Max Daily Loss ($)", name: "max_daily_loss", type: "number", defaultValue: plan?.max_daily_loss?.toString() ?? "", placeholder: "200" },
                { label: "Max Weekly Loss ($)", name: "max_weekly_loss", type: "number", defaultValue: plan?.max_weekly_loss?.toString() ?? "", placeholder: "500" },
              ].map(f => <TF key={f.name} {...f} />)}
            </div>
            {[
              { label: "Résumé Stratégie", name: "strategy", defaultValue: plan?.strategy as string ?? "", placeholder: "Ma stratégie principale...", textarea: true },
              { label: "Setup A — Description", name: "setup_a", defaultValue: plan?.setup_a as string ?? "", placeholder: "Mon setup principal...", textarea: true },
              { label: "Setup B", name: "setup_b", defaultValue: plan?.setup_b as string ?? "", textarea: true },
              { label: "Conditions pour NE PAS trader", name: "no_trade_conditions", defaultValue: plan?.no_trade_conditions as string ?? "", placeholder: "News importantes, drawdown max, fatigue...", textarea: true },
            ].map(f => (
              <div key={f.name} style={{ marginBottom: "10px" }}>
                <label style={LS}>{f.label}</label>
                {f.textarea ? <textarea className="inp" name={f.name} defaultValue={f.defaultValue} placeholder={f.placeholder} style={{ minHeight: "70px" }} /> : <input className="inp" name={f.name} defaultValue={f.defaultValue} placeholder={f.placeholder} />}
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={planPending}>{planPending ? "⏳ Sauvegarde..." : "💾 Sauvegarder Plan"}</button>
          </form>
        </div>
      )}

      {/* AI Analyst */}
      {tab === "ai" && (
        <div className="card card-ai">
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--purple)" }}>🤖 AI Trading Analyst</div>
            <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Forces · Faiblesses · Plan d&apos;amélioration basé sur tes données réelles</div>
          </div>
          <AIInsight mode="trading" context={aiContext} buttonLabel="Analyser mes trades" />
        </div>
      )}
    </div>
  );
}

// helpers
const LS: React.CSSProperties = { fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" };

function TF({ label, name, type = "text", defaultValue = "", placeholder = "", step }: { label: string; name: string; type?: string; defaultValue?: string; placeholder?: string; step?: string }) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <input className="inp" type={type} name={name} defaultValue={defaultValue} placeholder={placeholder} step={step} />
    </div>
  );
}

function computeMaxConsec(trades: Trade[], isWin: boolean) {
  let max = 0, cur = 0;
  [...trades].reverse().forEach(t => {
    const w = (t.result_r ?? 0) > 0;
    if (isWin ? w : !w) { cur++; max = Math.max(max, cur); } else cur = 0;
  });
  return max;
}
