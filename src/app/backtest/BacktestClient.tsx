"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Backtest } from "@/types/database";
const LS: React.CSSProperties = { fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" };
const STATUS_COLORS: Record<string, string> = { testing: "tag-amber", forward_test: "tag-blue", validated: "tag-green", improve: "tag-purple", abandon: "tag-red" };

export function BacktestClient({ userId, backtests }: { userId: string; backtests: Backtest[] }) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const validated = backtests.filter(b => b.decision === "validated");
  const avgWR = backtests.length ? (backtests.reduce((s, b) => s + (b.winrate ?? 0), 0) / backtests.length).toFixed(0) : null;
  const avgPF = backtests.length ? (backtests.reduce((s, b) => s + (b.profit_factor ?? 0), 0) / backtests.length).toFixed(2) : null;

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const wins = Number(fd.get("wins") || 0), losses = Number(fd.get("losses") || 0), be = Number(fd.get("breakeven") || 0);
    const total = wins + losses + be;
    const wr = total ? parseFloat((wins / total * 100).toFixed(2)) : null;
    const supabase = createClient();
    await supabase.from("backtests").insert({ user_id: userId, strategy_name: fd.get("strategy_name") as string, setup: fd.get("setup") as string, market: fd.get("market") as string, timeframe: fd.get("timeframe") as string, period_start: fd.get("period_start") as string || null, period_end: fd.get("period_end") as string || null, sample_size: total || null, wins, losses, breakeven: be, winrate: wr, avg_r: Number(fd.get("avg_r")) || null, profit_factor: Number(fd.get("profit_factor")) || null, max_drawdown: Number(fd.get("max_drawdown")) || null, conclusion: fd.get("conclusion") as string, decision: fd.get("decision") as Backtest["decision"], notes: fd.get("notes") as string, date: new Date().toISOString().slice(0,10) });
    await supabase.from("xp_ledger").insert({ user_id: userId, amount: 10, domain: "trading", reason: "Backtest logged" });
    setShowForm(false); router.refresh();
  };

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>🔬 Backtest Lab</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Valide ton edge avant de risquer du capital — +10 XP</div></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "✕ Fermer" : "+ Nouveau Backtest (+10 XP)"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
        {[{ label: "Total Backtests", value: backtests.length.toString(), color: "var(--blue)" },{ label: "Validés", value: validated.length.toString(), color: "var(--green)" },{ label: "WR Moyen", value: avgWR ? avgWR + "%" : "—", color: "var(--amber)" },{ label: "PF Moyen", value: avgPF ?? "—", color: "var(--purple)" }].map(({ label, value, color }) => (
          <div key={label} className="card"><div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>{label}</div><div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color }}>{value}</div></div>
        ))}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "12px", borderColor: "var(--blue)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "14px", color: "var(--blue)" }}>🔬 Nouveau Backtest (+10 XP)</div>
          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "10px" }}>
              {[["strategy_name","Stratégie","text"],["setup","Setup","text"],["market","Marché","text"],["timeframe","Timeframe","text"],["period_start","Début Période","date"],["period_end","Fin Période","date"]].map(([n,l,t]) => <div key={n as string}><label style={LS}>{l as string}</label><input className="inp" type={t as string} name={n as string} required={n === "strategy_name"} /></div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "10px" }}>
              {[["wins","Wins","number"],["losses","Losses","number"],["breakeven","Breakeven","number"],["avg_r","Avg R","number"],["profit_factor","Profit Factor","number"],["max_drawdown","Max Drawdown (%)","number"]].map(([n,l,t]) => <div key={n as string}><label style={LS}>{l as string}</label><input className="inp" type={t as string} name={n as string} step="0.01" /></div>)}
              <div><label style={LS}>Décision</label>
                <select className="inp" name="decision">
                  {[["testing","🔄 En test"],["forward_test","🔭 Forward test"],["validated","✅ Validé"],["improve","🔧 À améliorer"],["abandon","❌ Abandonné"]].map(([v,l]) => <option key={v as string} value={v as string}>{l as string}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div><label style={LS}>Conclusion</label><textarea className="inp" name="conclusion" style={{ minHeight: "70px" }} placeholder="Ce que ce backtest démontre..." /></div>
              <div><label style={LS}>Notes</label><textarea className="inp" name="notes" style={{ minHeight: "70px" }} /></div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}><button type="submit" className="btn btn-primary">💾 Sauvegarder (+10 XP)</button><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Annuler</button></div>
          </form>
        </div>
      )}

      {backtests.length === 0 ? (
        <div className="empty-state"><div className="icon">🔬</div><p>Pas encore de backtests</p><p style={{ fontSize: "10px", color: "var(--txt3)", marginTop: "6px" }}>Un backtest solide avant de risquer du capital = règle #1</p></div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Stratégie</th><th>Setup</th><th>Marché</th><th>TF</th><th>Sample</th><th>WR%</th><th>Avg R</th><th>PF</th><th>Max DD</th><th>Décision</th></tr></thead>
            <tbody>
              {backtests.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600, color: "var(--blue)" }}>{b.strategy_name}</td>
                  <td>{b.setup ?? "—"}</td><td>{b.market ?? "—"}</td><td>{b.timeframe ?? "—"}</td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace" }}>{b.sample_size ?? "—"}</td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", color: (b.winrate ?? 0) >= 55 ? "var(--green)" : "var(--amber)" }}>{b.winrate ? b.winrate.toFixed(0) + "%" : "—"}</td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", color: (b.avg_r ?? 0) > 0 ? "var(--green)" : "var(--red)" }}>{b.avg_r ? b.avg_r.toFixed(2) + "R" : "—"}</td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", color: (b.profit_factor ?? 0) >= 1.5 ? "var(--green)" : (b.profit_factor ?? 0) >= 1 ? "var(--amber)" : "var(--red)" }}>{b.profit_factor?.toFixed(2) ?? "—"}</td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--red)" }}>{b.max_drawdown ? b.max_drawdown + "%" : "—"}</td>
                  <td><span className={`tag ${STATUS_COLORS[b.decision ?? "testing"] ?? "tag-grey"}`}>{b.decision ?? "testing"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {validated.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px", color: "var(--green)" }}>✅ Setups Validés — Prêts à trader en live</div>
          {validated.map(b => (
            <div key={b.id} className="card card-highlight" style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontWeight: 700, color: "var(--green)" }}>{b.strategy_name}</div>
                  <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>{b.market ?? "—"} · {b.timeframe ?? "—"} · {b.sample_size ?? 0} trades</div>
                </div>
                <div style={{ display: "flex", gap: "12px", fontFamily: "JetBrains Mono, monospace", fontSize: "14px", fontWeight: 700 }}>
                  <span style={{ color: "var(--green)" }}>{b.winrate?.toFixed(0) ?? "—"}%</span>
                  <span style={{ color: "var(--blue)" }}>{b.avg_r?.toFixed(2) ?? "—"}R</span>
                  <span style={{ color: "var(--purple)" }}>PF {b.profit_factor?.toFixed(2) ?? "—"}</span>
                </div>
              </div>
              {b.conclusion && <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "8px" }}>📋 {b.conclusion}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
