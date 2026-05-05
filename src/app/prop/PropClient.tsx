"use client";
import { useState, useTransition } from "react";
import type { PropChallenge } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const LS: React.CSSProperties = { fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" };
const fmt$ = (n: number) => "$" + Number(n || 0).toLocaleString("en-US");

export function PropClient({ userId, challenges, payouts }: { userId: string; challenges: PropChallenge[]; payouts: { id: string; amount: number; date: string; status: string }[] }) {
  const [tab, setTab] = useState<"challenges" | "risk" | "payouts">("challenges");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const active = challenges.filter(c => c.status === "active" || c.status === "funded");

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const supabase = createClient();
    const size = Number(fd.get("account_size"));
    await supabase.from("prop_challenges").insert({ user_id: userId, prop_firm: fd.get("prop_firm") as string, account_size: size, phase: fd.get("phase") as string, status: "active", profit_target: Number(fd.get("profit_target")), max_daily_loss: Number(fd.get("max_daily_loss")), max_total_loss: Number(fd.get("max_total_loss")), current_equity: size, start_date: new Date().toISOString().slice(0,10) });
    setShowForm(false); router.refresh();
  };

  const updateEquity = async (id: string, equity: number) => {
    const supabase = createClient();
    await supabase.from("prop_challenges").update({ current_equity: equity }).eq("id", id).eq("user_id", userId);
    router.refresh();
  };

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>🏦 Prop Firm OS</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Challenges · Risk Monitor · Payouts</div></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "✕" : "+ Nouveau Challenge"}</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: "12px", borderColor: "var(--amber)" }}>
          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "10px" }}>
              {[["prop_firm","Prop Firm","text","FTMO, MFF..."],["account_size","Taille Compte ($)","number","100000"],["profit_target","Profit Target ($)","number","110000"],["max_daily_loss","Max Daily Loss ($)","number","500"],["max_total_loss","Max Drawdown ($)","number","1000"]].map(([n,l,t,p]) => <div key={n as string}><label style={LS}>{l as string}</label><input className="inp" type={t as string} name={n as string} placeholder={p as string} required={n === "prop_firm" || n === "account_size"} /></div>)}
              <div><label style={LS}>Phase</label><select className="inp" name="phase"><option value="1">Phase 1</option><option value="2">Phase 2</option><option value="funded">Funded</option></select></div>
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Ajouter Challenge</button>
          </form>
        </div>
      )}
      <div className="tabs" style={{ marginBottom: "16px" }}>
        {(["challenges","risk","payouts"] as const).map(t => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t === "challenges" ? "🏦 Challenges" : t === "risk" ? "⚠️ Risk Monitor" : "💸 Payouts"}</div>)}
      </div>
      {tab === "challenges" && (
        challenges.length === 0 ? <div className="empty-state"><div className="icon">🏦</div><p>Ajoute ton premier challenge prop firm</p></div> :
        challenges.map(c => {
          const equity = Number(c.current_equity ?? c.account_size);
          const target = Number(c.profit_target ?? c.account_size * 1.1);
          const progress = Math.max(0, Math.min(100, ((equity - Number(c.account_size)) / (target - Number(c.account_size)) * 100)));
          return (
            <div key={c.id} className={`card ${c.status === "active" ? "card-amber" : c.status === "passed" ? "card-highlight" : ""}`} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div><div style={{ fontSize: "13px", fontWeight: 700 }}>{c.prop_firm} — {fmt$(Number(c.account_size))}</div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}><span className={`tag ${c.status === "active" ? "tag-amber" : c.status === "passed" ? "tag-green" : "tag-red"}`}>{c.status}</span><span className="tag tag-blue">Phase {c.phase}</span></div>
                </div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: "var(--green)" }}>{fmt$(equity)}</div><div style={{ fontSize: "10px", color: "var(--txt2)" }}>Equity actuel</div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "10px" }}>
                {[["Objectif", fmt$(target), "var(--green)"],["Max Loss/Jour", fmt$(Number(c.max_daily_loss)||0), "var(--red)"],["Max Drawdown", fmt$(Number(c.max_total_loss)||0), "var(--red)"]].map(([l,v,col]) => <div key={l as string}><div style={{ fontSize: "9px", color: "var(--txt3)" }}>{l as string}</div><div style={{ fontFamily: "JetBrains Mono, monospace", color: col as string, fontWeight: 700 }}>{v as string}</div></div>)}
              </div>
              <div className="prog-wrap"><div className="prog-fill prog-amber" style={{ width: progress + "%" }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--txt2)", marginTop: "4px", fontFamily: "JetBrains Mono, monospace" }}><span>Progression: {progress.toFixed(0)}%</span><span>Reste: {fmt$(Math.max(0, target - equity))}</span></div>
              <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
                <input type="number" className="inp" style={{ width: "140px" }} defaultValue={equity} id={`eq-${c.id}`} placeholder="Nouvelle equity" />
                <button className="btn btn-sm btn-blue" onClick={() => { const val = Number((document.getElementById(`eq-${c.id}`) as HTMLInputElement)?.value); if (val) updateEquity(c.id, val); }}>📊 Update</button>
                <button className="btn btn-xs btn-red" onClick={async () => { if (!confirm("Supprimer?")) return; const s = createClient(); await s.from("prop_challenges").delete().eq("id", c.id).eq("user_id", userId); router.refresh(); }}>🗑️</button>
              </div>
            </div>
          );
        })
      )}
      {tab === "risk" && (
        active.length === 0 ? <div className="empty-state"><div className="icon">⚠️</div><p>Aucun challenge actif</p></div> :
        active.map(c => {
          const equity = Number(c.current_equity ?? c.account_size);
          const maxLoss = equity - (Number(c.account_size) - Number(c.max_total_loss ?? 0));
          const riskPerTrade = Math.max(0.25, maxLoss * 0.05);
          const danger = Number(c.max_total_loss) ? Math.min(100, (1 - maxLoss / Number(c.max_total_loss)) * 100) : 0;
          const col = danger < 30 ? "var(--green)" : danger < 70 ? "var(--amber)" : "var(--red)";
          return (
            <div key={c.id} className={`card ${danger > 70 ? "card-danger" : danger > 30 ? "card-amber" : "card-highlight"}`} style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "14px" }}>{c.prop_firm} — Risk Monitor</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "12px" }}>
                {[["Dist. Objectif", fmt$(Math.max(0, Number(c.profit_target) - equity)), "var(--green)"],["Marge avant DD", fmt$(Math.max(0, maxLoss)), col],["Risk/Trade Rec.", fmt$(riskPerTrade), "var(--blue)"],["Max Daily Loss", fmt$(Number(c.max_daily_loss)||0), "var(--red)"]].map(([l,v,co]) => <div key={l as string} style={{ padding: "10px", background: "var(--panel)", borderRadius: "6px" }}><div style={{ fontSize: "9px", color: "var(--txt3)" }}>{l as string}</div><div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: co as string }}>{v as string}</div></div>)}
              </div>
              <div style={{ fontSize: "9px", color: "var(--txt3)", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}><span>Niveau de Danger</span><span style={{ color: col }}>{danger.toFixed(0)}%</span></div>
              <div style={{ height: "12px", borderRadius: "6px", background: "linear-gradient(90deg,#00e87a,#ffb800,#ff2d55)", position: "relative", border: "1px solid var(--border2)" }}>
                <div style={{ position: "absolute", top: "-3px", bottom: "-3px", width: "4px", background: "#fff", borderRadius: "2px", left: danger + "%", transition: "left .5s" }} />
              </div>
            </div>
          );
        })
      )}
      {tab === "payouts" && (
        <div>
          <div style={{ marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
            <button className="btn btn-primary btn-sm" onClick={async () => {
              const amount = prompt("Montant du payout ($)?"); if (!amount) return;
              const s = createClient(); await s.from("prop_payouts").insert({ user_id: userId, amount: Number(amount), date: new Date().toISOString().slice(0,10), status: "received" }); router.refresh();
            }}>+ Payout</button>
            {payouts.length > 0 && <div style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--green)", fontWeight: 700 }}>Total: {fmt$(payouts.reduce((s,p)=>s+Number(p.amount),0))}</div>}
          </div>
          {payouts.length === 0 ? <div className="empty-state"><div className="icon">💸</div><p>Pas encore de payouts</p></div> :
            <table><thead><tr><th>Date</th><th>Montant</th><th>Status</th></tr></thead>
              <tbody>{payouts.map(p => <tr key={p.id}><td style={{ fontFamily: "JetBrains Mono, monospace" }}>{p.date}</td><td style={{ color: "var(--green)", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>{fmt$(Number(p.amount))}</td><td><span className={`tag ${p.status === "received" ? "tag-green" : "tag-amber"}`}>{p.status}</span></td></tr>)}</tbody>
            </table>}
        </div>
      )}
    </div>
  );
}
