"use client";
import { useState, useTransition } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend } from "chart.js";
import { AIInsight } from "@/components/ui/AIInsight";
import { addSnapshot, addIncome, addExpense, saveAllocation } from "./actions";
import type { MoneySnapshot, IncomeEntry, ExpenseEntry } from "@/types/database";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend);
const fmt$ = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
const LS: React.CSSProperties = { fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" };
type Tab = "snapshots" | "income" | "allocation" | "forecast" | "ai";

export function MoneyClient({ userId, snapshots, incomes, expenses, allocation, target, targetDate }: { userId: string; snapshots: MoneySnapshot[]; incomes: IncomeEntry[]; expenses: ExpenseEntry[]; allocation: Record<string, number> | null; target: number; targetDate: string }) {
  const [tab, setTab] = useState<Tab>("snapshots");
  const [showSnapForm, setShowSnapForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const capital = snapshots[0]?.total_networth_usd ?? 0;
  const pct = Math.min(100, (capital / target * 100)).toFixed(1);
  const daysLeft = Math.max(0, Math.round((new Date(targetDate).getTime() - Date.now()) / 86400000));
  const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
  const weeklyReq = Math.max(0, (target - capital) / weeksLeft);
  const totalInc = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalExp = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const snapLabels = [...snapshots].reverse().map(s => fmtDate(s.date));
  const snapData = [...snapshots].reverse().map(s => s.total_networth_usd ?? 0);
  const allocData = allocation ? [allocation.cash_usd ?? 0, allocation.trading ?? 0, allocation.ecom ?? 0, allocation.investments ?? 0, allocation.emergency ?? 0, allocation.education ?? 0] : [];
  const aiContext = { capital, target, gap: target - capital, daysLeft, weeklyRequired: weeklyReq, totalIncome: totalInc, totalExpenses: totalExp, savingsRate: totalInc > 0 ? ((totalInc - totalExp) / totalInc * 100).toFixed(1) + "%" : "—" };
  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>💰 Money OS</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Capital · Épargne · Forecast $68k</div></div>
        <div style={{ display: "flex", gap: "8px" }}><button className="btn btn-secondary btn-sm" onClick={() => { setTab("ai"); }}>🤖 AI Coach</button><button className="btn btn-primary" onClick={() => setShowSnapForm(!showSnapForm)}>{showSnapForm ? "✕" : "+ Snapshot (+20 XP)"}</button></div>
      </div>
      {showSnapForm && (
        <div className="card" style={{ marginBottom: "12px", borderColor: "var(--green)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px", color: "var(--green)" }}>📸 Nouveau Snapshot Mensuel (+20 XP)</div>
          <form action={async fd => { await addSnapshot(fd); setShowSnapForm(false); }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "10px" }}>
              {[["date","Date","date",today()],["cash_aud","Cash AUD ($)","number","0"],["cash_usd","Cash USD ($)","number","0"],["cash_eur","Cash EUR (€)","number","0"],["trading_capital","Trading Capital ($)","number","0"],["emergency_fund","Emergency Fund ($)","number","0"],["ecom_budget","Ecom Budget ($)","number","0"],["investments","Investissements ($)","number","0"],["debts","Dettes ($)","number","0"]].map(([n,l,t,dv]) => <div key={n as string}><label style={LS}>{l as string}</label><input className="inp" type={t as string} name={n as string} defaultValue={dv as string} /></div>)}
            </div>
            <div style={{ marginBottom: "10px" }}><label style={LS}>Notes</label><input className="inp" name="notes" placeholder="Contexte de ce snapshot..." /></div>
            <button type="submit" className="btn btn-primary btn-sm">💾 Sauvegarder (+20 XP)</button>
          </form>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
        {[{ label: "Net Worth (USD)", value: fmt$(capital), color: "var(--green)", sub: snapshots[0] ? `maj. ${fmtDate(snapshots[0].date)}` : "Pas de snapshot" },
          { label: "Progression 68k", value: pct + "%", color: "var(--purple)", sub: `Gap: ${fmt$(Math.max(0, target - capital))}` },
          { label: "Requis/semaine", value: fmt$(weeklyReq), color: "var(--amber)", sub: `${daysLeft} jours restants` },
          { label: "Savings Rate", value: totalInc > 0 ? ((totalInc - totalExp) / totalInc * 100).toFixed(0) + "%" : "—", color: "var(--blue)", sub: `Inc: ${fmt$(totalInc)} / Exp: ${fmt$(totalExp)}` },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="card"><div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>{label}</div><div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color }}>{value}</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "4px" }}>{sub}</div></div>
        ))}
      </div>
      <div className="tabs" style={{ marginBottom: "16px" }}>
        {(["snapshots","income","allocation","forecast","ai"] as Tab[]).map(t => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t === "snapshots" ? "📸 Snapshots" : t === "income" ? "💸 Income/Dépenses" : t === "allocation" ? "📊 Allocation" : t === "forecast" ? "🔮 Forecast 2028" : "🤖 AI Coach"}</div>)}
      </div>
      {tab === "snapshots" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="card"><div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px" }}>📈 Évolution Net Worth</div>
            {snapData.length > 0 ? <Line data={{ labels: snapLabels, datasets: [{ data: snapData, borderColor: "#00e87a", backgroundColor: "rgba(0,232,122,.08)", tension: 0.4, fill: true, pointRadius: 4 }] }} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: "#6868a0", font: { size: 9 } }, grid: { color: "#181830" } }, y: { ticks: { color: "#6868a0", font: { size: 9 }, callback: (v) => "$" + Number(v).toLocaleString() }, grid: { color: "#181830" } } } }} height={200} /> : <div className="empty-state"><p>Pas encore de snapshots</p></div>}
          </div>
          <div className="card"><div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px" }}>📋 Historique Snapshots</div>
            {snapshots.length === 0 ? <div className="empty-state"><p>Capture ton premier snapshot</p></div> :
              snapshots.map(s => <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "11px" }}><span style={{ color: "var(--txt2)" }}>{fmtDate(s.date)}</span><span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--green)", fontWeight: 700 }}>{fmt$(s.total_networth_usd ?? 0)}</span></div>)}
          </div>
        </div>
      )}
      {tab === "income" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div className="card"><div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px" }}>➕ Ajouter Income</div>
              <form action={addIncome}><div style={{ display: "grid", gap: "10px" }}>{[["date","Date","date",today()],["source","Source","text",""],["amount","Montant ($)","number",""],["notes","Notes","text",""]].map(([n,l,t,dv]) => <div key={n as string}><label style={LS}>{l as string}</label><input className="inp" type={t as string} name={n as string} defaultValue={dv as string} placeholder={n === "source" ? "Trading, Job, E-com..." : ""} /></div>)}<input type="hidden" name="category" value="other" /><input type="hidden" name="currency" value="USD" /><button type="submit" className="btn btn-primary btn-sm">+ Income</button></div></form>
            </div>
            <div className="card"><div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px" }}>➖ Ajouter Dépense</div>
              <form action={addExpense}><div style={{ display: "grid", gap: "10px" }}>{[["date","Date","date",today()],["category","Catégorie","text",""],["amount","Montant ($)","number",""],["notes","Notes","text",""]].map(([n,l,t,dv]) => <div key={n as string}><label style={LS}>{l as string}</label><input className="inp" type={t as string} name={n as string} defaultValue={dv as string} placeholder={n === "category" ? "Logement, Nourriture, Ads..." : ""} /></div>)}<input type="hidden" name="currency" value="USD" /><button type="submit" className="btn btn-red btn-sm">+ Dépense</button></div></form>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table><thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Montant</th></tr></thead>
              <tbody>
                {[...incomes.map(i => ({ ...i, type: "income" })), ...expenses.map(e => ({ ...e, source: e.category, type: "expense" }))].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).map(e => <tr key={e.id}><td style={{ fontFamily: "JetBrains Mono, monospace" }}>{fmtDate(e.date)}</td><td>{"source" in e ? e.source : e.category}</td><td><span className={`tag ${e.type === "income" ? "tag-green" : "tag-red"}`}>{e.type}</span></td><td style={{ fontFamily: "JetBrains Mono, monospace", color: e.type === "income" ? "var(--green)" : "var(--red)", fontWeight: 700 }}>{e.type === "income" ? "+" : "-"}{fmt$(Number(e.amount))}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === "allocation" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="card"><div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "14px" }}>📊 Allocation Capital</div>
            <form action={saveAllocation}><div style={{ display: "grid", gap: "10px", marginBottom: "12px" }}>{[["cash_usd","Cash USD ($)"],["trading","Trading Capital ($)"],["ecom","E-commerce ($)"],["investments","Investissements ($)"],["emergency","Emergency Fund ($)"],["education","Education ($)"],["debts","Dettes ($)"]].map(([n,l]) => <div key={n as string}><label style={LS}>{l as string}</label><input className="inp" type="number" name={n as string} defaultValue={((allocation as Record<string, number> | null)?.[n as string] ?? 0).toString()} /></div>)}</div><button type="submit" className="btn btn-primary">💾 Sauvegarder</button></form>
          </div>
          <div className="card"><div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px" }}>🎯 Répartition Actuelle</div>
            {allocData.some(v => v > 0) ? <Doughnut data={{ labels: ["Cash USD","Trading","E-com","Invest","Emergency","Education"], datasets: [{ data: allocData, backgroundColor: ["#3b9eff","#00e87a","#ffb800","#a855f7","#06b6d4","#f43f5e"], borderWidth: 0 }] }} options={{ responsive: true, plugins: { legend: { labels: { color: "#6868a0", font: { size: 10 } } } } }} /> : <div className="empty-state"><p>Remplis les champs d&apos;allocation</p></div>}
          </div>
        </div>
      )}
      {tab === "forecast" && (
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "14px" }}>🔮 Forecast vers $68,000 — Mars 2028</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            {[["Conservateur", capital + weeklyReq * weeksLeft * 0.6, "var(--txt2)"],["Réaliste", capital + weeklyReq * weeksLeft, "var(--green)"],["Agressif", capital + weeklyReq * weeksLeft * 1.3, "var(--amber)"]].map(([l, v, c]) => <div key={l as string} style={{ padding: "14px", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px" }}><div style={{ fontSize: "9px", color: "var(--txt3)", marginBottom: "6px" }}>{l as string}</div><div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: c as string }}>{fmt$(Number(v))}</div></div>)}
          </div>
          <div style={{ fontSize: "11px", color: "var(--txt2)", padding: "10px", background: "var(--panel)", borderRadius: "6px" }}>
            <strong style={{ color: "var(--txt)" }}>Calcul basé sur :</strong> Capital actuel {fmt$(capital)} + {fmt$(weeklyReq)}/semaine × {weeksLeft} semaines = <strong style={{ color: "var(--green)" }}>{fmt$(capital + weeklyReq * weeksLeft)}</strong>
          </div>
        </div>
      )}
      {tab === "ai" && <div className="card card-ai"><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "var(--purple)", marginBottom: "4px" }}>🤖 AI Money Coach</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginBottom: "14px" }}>Analyse ta trajectoire · Détecte les fuites · Plan $68k</div><AIInsight mode="money" context={aiContext} buttonLabel="Analyser mes finances" /></div>}
    </div>
  );
}
