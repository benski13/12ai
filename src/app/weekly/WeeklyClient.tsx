"use client";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AIInsight } from "@/components/ui/AIInsight";
const LS: React.CSSProperties = { fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" };
type Tab = "new" | "history" | "ai";

export function WeeklyClient({ userId, reviews }: { userId: string; reviews: { id: string; week_start: string; global_score?: number | null; wins?: string | null; what_worked?: string | null; next_week_obj_1?: string | null }[] }) {
  const [tab, setTab] = useState<Tab>("new");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const getMonday = () => { const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); d.setDate(diff); return d.toISOString().slice(0,10); };
  const getSunday = () => { const d = new Date(getMonday() + "T12:00:00"); d.setDate(d.getDate() + 6); return d.toISOString().slice(0,10); };
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("weekly_reviews").upsert({ user_id: userId, week_start: getMonday(), week_end: getSunday(), global_score: Number(fd.get("global_score")) || null, trading_score: Number(fd.get("trading_score")) || null, ecom_score: Number(fd.get("ecom_score")) || null, money_score: Number(fd.get("money_score")) || null, health_score: Number(fd.get("health_score")) || null, trades_count: Number(fd.get("trades_count")) || 0, trading_pnl: Number(fd.get("trading_pnl")) || 0, trading_notes: fd.get("trading_notes") as string, ecom_revenue: Number(fd.get("ecom_revenue")) || 0, products_tested: Number(fd.get("products_tested")) || 0, wins: fd.get("wins") as string, losses: fd.get("losses") as string, what_worked: fd.get("what_worked") as string, what_failed: fd.get("what_failed") as string, what_to_delete: fd.get("what_to_delete") as string, what_to_double: fd.get("what_to_double") as string, next_week_obj_1: fd.get("next_week_obj_1") as string, next_week_obj_2: fd.get("next_week_obj_2") as string, next_week_obj_3: fd.get("next_week_obj_3") as string, big_move: fd.get("big_move") as string, main_risk: fd.get("main_risk") as string, notes: fd.get("notes") as string }, { onConflict: "user_id,week_start" });
      await supabase.from("xp_ledger").insert({ user_id: userId, amount: 200, domain: "discipline", reason: "Weekly review saved" });
      setSaved(true); setTimeout(() => setSaved(false), 3000); router.refresh();
    });
  };
  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>📅 Weekly Review</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Audit CEO hebdomadaire — +200 XP</div></div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>{saved && <span style={{ fontSize: "11px", color: "var(--green)" }}>✅ +200 XP</span>}<button className="btn btn-secondary btn-sm" onClick={() => setTab("ai")}>🤖 AI Generator</button>{tab === "new" && <button type="submit" form="weekly-form" className="btn btn-primary" disabled={isPending}>{isPending ? "⏳" : "💾 Sauvegarder (+200 XP)"}</button>}</div>
      </div>
      <div className="tabs" style={{ marginBottom: "16px" }}>
        {(["new","history","ai"] as Tab[]).map(t => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t === "new" ? "📝 Nouvelle Review" : t === "history" ? "📚 Historique" : "🤖 AI Generator"}</div>)}
      </div>
      {tab === "new" && (
        <form id="weekly-form" onSubmit={handleSave}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div className="card"><div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px" }}>📈 Trading cette semaine</div><div style={{ display: "grid", gap: "10px" }}>{[["trades_count","Nombre de trades","number"],["trading_pnl","P&L ($)","number"],["plan_respected","Plan respecté (/10)","number"]].map(([n,l,t]) => <div key={n as string}><label style={LS}>{l as string}</label><input className="inp" type={t as string} name={n as string} /></div>)}<div><label style={LS}>Résumé trading</label><textarea className="inp" name="trading_notes" style={{ minHeight: "60px" }} /></div></div></div>
            <div className="card"><div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px" }}>🛒 E-com cette semaine</div><div style={{ display: "grid", gap: "10px" }}>{[["ecom_revenue","Revenue ($)","number"],["products_tested","Produits testés","number"]].map(([n,l,t]) => <div key={n as string}><label style={LS}>{l as string}</label><input className="inp" type={t as string} name={n as string} /></div>)}<div><label style={LS}>Résumé e-com</label><textarea className="inp" name="ecom_notes" style={{ minHeight: "60px" }} /></div></div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div className="card"><div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "10px" }}>✅ Ce qui a fonctionné</div><textarea className="inp" name="what_worked" style={{ minHeight: "80px" }} /></div>
            <div className="card"><div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "10px" }}>❌ Ce qui a échoué</div><textarea className="inp" name="what_failed" style={{ minHeight: "80px" }} /></div>
          </div>
          <div className="card" style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px" }}>🎯 Objectifs & Score</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
              {[["next_week_obj_1","Objectif #1"],["next_week_obj_2","Objectif #2"],["next_week_obj_3","Objectif #3"],["big_move","Grand Move"],["main_risk","Risque principal"],["global_score","Score Global /10"],["trading_score","Score Trading /10"],["health_score","Score Santé /10"]].map(([n,l]) => <div key={n as string}><label style={LS}>{l as string}</label><input className="inp" name={n as string} type={n as string === "global_score" || (n as string).includes("score") ? "number" : "text"} min="0" max="10" /></div>)}
            </div>
          </div>
        </form>
      )}
      {tab === "history" && (reviews.length === 0 ? <div className="empty-state"><div className="icon">📅</div><p>Pas encore de reviews</p></div> :
        reviews.map(r => <div key={r.id} className="card" style={{ marginBottom: "8px" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}><div style={{ fontWeight: 700 }}>Semaine du {new Date(r.week_start + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</div>{r.global_score && <span style={{ fontSize: "20px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: r.global_score >= 7 ? "var(--green)" : r.global_score >= 5 ? "var(--amber)" : "var(--red)" }}>{r.global_score}/10</span>}</div>{r.wins && <div style={{ fontSize: "11px", color: "var(--green)" }}>✅ {r.wins}</div>}{r.next_week_obj_1 && <div style={{ fontSize: "11px", color: "var(--txt2)", marginTop: "4px" }}>→ {r.next_week_obj_1}</div>}</div>)
      )}
      {tab === "ai" && <div className="card card-ai"><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "var(--purple)", marginBottom: "4px" }}>🤖 AI Weekly Review Generator</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginBottom: "14px" }}>Analyse automatique · Audit brutal · Plan semaine suivante</div><AIInsight mode="weekly" context={{ recentReviews: reviews.slice(0, 5) }} buttonLabel="Générer AI Review" /></div>}
    </div>
  );
}
