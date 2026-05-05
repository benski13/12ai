"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip,
} from "chart.js";
import { AIInsight } from "@/components/ui/AIInsight";
import type { Profile, MoneySnapshot } from "@/types/database";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: "#6868a0", font: { size: 9 } }, grid: { color: "#181830" } },
    y: { ticks: { color: "#6868a0", font: { size: 9 } }, grid: { color: "#181830" } },
  },
};

interface Props {
  capital: number; target: number; progress: number; daysLeft: number; weeklyRequired: number;
  monthPnL: number; monthTradesCount: number; winrate: number; profitFactor: number;
  allTradesCount: number; avgScore: number | null; monthReviewsCount: number;
  products: { status: string; name: string; product_score: number | null }[];
  snapshots: MoneySnapshot[]; allTrades: { result_r?: number | null; result_amount?: number | null }[];
  todayHabitsDone: number; totalHabits: number; xpTotal: number;
  lastReview: { top_priority_1?: string | null; top_priority_2?: string | null; top_priority_3?: string | null; daily_score?: number | null } | null;
  activeWar: { title: string; end_date?: string | null } | null;
  profile: Profile | null;
}

function fmt$(n: number, dec = 0) {
  return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export function CommandCenterClient({
  capital, target, progress, daysLeft, weeklyRequired,
  monthPnL, monthTradesCount, winrate, profitFactor, allTradesCount,
  avgScore, monthReviewsCount, products, snapshots, allTrades,
  todayHabitsDone, totalHabits, xpTotal, lastReview, activeWar, profile,
}: Props) {
  const router = useRouter();
  const [showAI, setShowAI] = useState(false);

  // Capital chart
  const capitalLabels = snapshots.map((s) => new Date(s.date).toLocaleDateString("fr-FR", { month: "short", day: "numeric" }));
  const capitalData = snapshots.map((s) => s.total_networth_usd ?? 0);
  if (!capitalData.length) { capitalLabels.push("Maintenant"); capitalData.push(capital); }

  // Equity curve
  let cum = 0;
  const equityData = allTrades.map((t) => { cum += t.result_amount ?? 0; return parseFloat(cum.toFixed(2)); });
  const equityLabels = allTrades.map((_, i) => `T${i + 1}`);
  if (!equityData.length) { equityLabels.push("—"); equityData.push(0); }

  const gap = Math.max(0, target - capital);
  const pct = progress.toFixed(1);
  const monthPnLColor = monthPnL >= 0 ? "var(--green)" : "var(--red)";
  const equityColor = (equityData[equityData.length - 1] ?? 0) >= 0 ? "#00e87a" : "#ff2d55";

  // AI context
  const aiContext = {
    capital: fmt$(capital),
    target: fmt$(target),
    gap: fmt$(gap),
    daysLeft,
    tradingStats: { trades: allTradesCount, winrate: winrate.toFixed(1) + "%", pf: profitFactor.toFixed(2), monthPnL: fmt$(monthPnL) },
    ecom: { total: products.length, winners: products.filter((p) => p.status === "winner").length, testing: products.filter((p) => p.status === "testing").length },
    recentScores: monthReviewsCount,
    avgScore,
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--txt)" }}>
            ⚡ Command Center
          </div>
          <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>
            Vue d'ensemble — Priorités — Progression vers la liberté
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-purple btn-sm" onClick={() => setShowAI(!showAI)}>
            🤖 AI Daily Brief
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/daily")}>
            + Daily Review
          </button>
        </div>
      </div>

      {/* Capital Progress Bar */}
      <div className="card card-highlight" style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)" }}>
              Capital Actuel — Objectif Mars 2028
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: "var(--green)" }}>
              {fmt$(capital)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {[
              { label: "Target", value: fmt$(target), color: "var(--amber)" },
              { label: "Gap", value: fmt$(gap), color: "var(--red)" },
              { label: "Jours", value: daysLeft.toString(), color: "var(--blue)" },
              { label: "Requis/sem", value: fmt$(weeklyRequired), color: "var(--purple)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "9px", color: "var(--txt3)" }}>{label}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="prog-wrap" style={{ height: "10px" }}>
          <div className="prog-fill prog-green" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--txt2)", marginTop: "4px", fontFamily: "JetBrains Mono, monospace" }}>
          <span>{pct}% atteint</span>
          <span>$68,000 USD · Mars 2028</span>
        </div>
      </div>

      {/* AI Brief */}
      {showAI && (
        <div className="card card-ai" style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--purple)" }}>
              🤖 AI Daily Brief
            </div>
            <button className="btn btn-xs btn-secondary" onClick={() => setShowAI(false)}>✕</button>
          </div>
          <AIInsight mode="brief" context={aiContext} buttonLabel="Générer le Brief" />
        </div>
      )}

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
        <div className="card">
          <div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>Net Worth</div>
          <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "var(--green)" }}>{fmt$(capital)}</div>
          <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "4px" }}>Capital total</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>P&L Trading (mois)</div>
          <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: monthPnLColor }}>
            {monthPnL >= 0 ? "+" : ""}{fmt$(monthPnL)}
          </div>
          <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "4px" }}>{monthTradesCount} trades ce mois</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>Winrate</div>
          <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: winrate >= 50 ? "var(--green)" : "var(--red)" }}>
            {allTradesCount ? winrate.toFixed(0) + "%" : "—%"}
          </div>
          <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "4px" }}>PF: {profitFactor ? profitFactor.toFixed(2) : "—"}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>Discipline Score</div>
          <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "var(--purple)" }}>
            {avgScore ? Math.round(avgScore) + "/100" : "—"}
          </div>
          <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "4px" }}>{monthReviewsCount} reviews ce mois</div>
        </div>
      </div>

      {/* Priorities + Habits */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
            🎯 Priorités du Jour
          </div>
          {lastReview?.top_priority_1 ? (
            <div>
              {[lastReview.top_priority_1, lastReview.top_priority_2, lastReview.top_priority_3]
                .filter(Boolean)
                .map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                    <div style={{ width: "20px", height: "20px", background: "var(--panel)", border: "1px solid var(--border2)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "var(--txt3)", flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ fontSize: "12px", lineHeight: 1.4 }}>{p}</div>
                  </div>
                ))}
              {lastReview.daily_score && (
                <div style={{ marginTop: "8px", fontSize: "10px", color: "var(--txt2)" }}>
                  Score hier: <span style={{ color: lastReview.daily_score >= 70 ? "var(--green)" : lastReview.daily_score >= 50 ? "var(--amber)" : "var(--red)", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>{lastReview.daily_score}/100</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--txt3)" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎯</div>
              <p style={{ fontSize: "11px" }}>Lance ta Daily Review pour définir tes priorités</p>
            </div>
          )}
          <button className="btn btn-primary btn-sm" style={{ marginTop: "12px" }} onClick={() => router.push("/daily")}>
            Ouvrir Daily OS →
          </button>
        </div>

        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
            🔁 Habits Today
          </div>
          {totalHabits > 0 ? (
            <div>
              <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: todayHabitsDone === totalHabits ? "var(--green)" : "var(--txt)", marginBottom: "6px" }}>
                {todayHabitsDone}/{totalHabits}
              </div>
              <div className="prog-wrap" style={{ marginBottom: "8px" }}>
                <div className="prog-fill prog-green" style={{ width: `${(todayHabitsDone / totalHabits) * 100}%` }} />
              </div>
              <div style={{ fontSize: "10px", color: "var(--txt2)" }}>
                {todayHabitsDone === totalHabits ? "🔥 Tous complétés!" : `${totalHabits - todayHabitsDone} restants`}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--txt3)" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔁</div>
              <p style={{ fontSize: "11px" }}>Configure tes habits quotidiens</p>
            </div>
          )}
          <button className="btn btn-secondary btn-sm" style={{ marginTop: "12px" }} onClick={() => router.push("/habits")}>
            Gérer Habits →
          </button>
        </div>
      </div>

      {/* Module snapshots */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>
            📈 Trading
          </div>
          {allTradesCount > 0 ? (
            <>
              {[
                { label: "Trades", value: allTradesCount.toString(), color: "var(--txt)" },
                { label: "Winrate", value: winrate.toFixed(0) + "%", color: winrate >= 50 ? "var(--green)" : "var(--red)" },
                { label: "P&L Total", value: fmt$(allTrades.reduce((s, t) => s + (t.result_amount ?? 0), 0)), color: allTrades.reduce((s, t) => s + (t.result_amount ?? 0), 0) >= 0 ? "var(--green)" : "var(--red)" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
                  <span style={{ color: "var(--txt2)" }}>{label}</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color }}>{value}</span>
                </div>
              ))}
            </>
          ) : (
            <div style={{ color: "var(--txt2)", fontSize: "11px" }}>Pas encore de trades</div>
          )}
        </div>

        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>
            🛒 E-commerce
          </div>
          {products.length > 0 ? (
            <>
              {[
                { label: "Produits", value: products.length.toString(), color: "var(--blue)" },
                { label: "Winners", value: products.filter((p) => p.status === "winner").length.toString(), color: "var(--green)" },
                { label: "En test", value: products.filter((p) => p.status === "testing").length.toString(), color: "var(--amber)" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
                  <span style={{ color: "var(--txt2)" }}>{label}</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color }}>{value}</span>
                </div>
              ))}
            </>
          ) : (
            <div style={{ color: "var(--txt2)", fontSize: "11px" }}>Pas encore de produits</div>
          )}
        </div>

        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>
            💰 Money
          </div>
          {[
            { label: "Net Worth", value: fmt$(capital), color: "var(--green)" },
            { label: "Vers 68k", value: pct + "%", color: "var(--purple)" },
            { label: "Requis/sem", value: fmt$(weeklyRequired), color: "var(--amber)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
              <span style={{ color: "var(--txt2)" }}>{label}</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
            📈 Évolution Capital
          </div>
          <Line
            data={{
              labels: capitalLabels,
              datasets: [{ data: capitalData, borderColor: "#00e87a", backgroundColor: "rgba(0,232,122,0.08)", tension: 0.4, fill: true, pointBackgroundColor: "#00e87a", pointRadius: 4 }],
            }}
            options={{ ...CHART_OPTS, scales: { ...CHART_OPTS.scales, y: { ...CHART_OPTS.scales.y, ticks: { ...CHART_OPTS.scales.y.ticks, callback: (v) => "$" + Number(v).toLocaleString() } } } }}
            height={150}
          />
        </div>
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
            🎯 Equity Curve Trading
          </div>
          <Line
            data={{
              labels: equityLabels.slice(-30),
              datasets: [{ data: equityData.slice(-30), borderColor: equityColor, backgroundColor: equityColor.replace(")", ",0.08)").replace("rgb", "rgba"), tension: 0.3, fill: true, pointRadius: 2 }],
            }}
            options={{ ...CHART_OPTS, scales: { ...CHART_OPTS.scales, y: { ...CHART_OPTS.scales.y, ticks: { ...CHART_OPTS.scales.y.ticks, callback: (v) => "$" + v } } } }}
            height={150}
          />
        </div>
      </div>
    </div>
  );
}
