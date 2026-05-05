"use client";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function SettingsClient({ userId, profile, email }: { userId: string; profile: Profile | null; email: string }) {
  const [tab, setTab] = useState<"profile" | "data" | "health">("profile");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();
    await supabase.from("users_profile").upsert({
      user_id: userId,
      name: fd.get("name") as string,
      country: fd.get("country") as string,
      timezone: fd.get("timezone") as string,
      primary_currency: fd.get("currency") as string,
      target_capital_usd: Number(fd.get("target_capital")),
      target_date: fd.get("target_date") as string,
      current_phase: Number(fd.get("current_phase")),
      goal: fd.get("goal") as string,
    }, { onConflict: "user_id" });
    setMsg("✅ Profil sauvegardé"); setTimeout(() => setMsg(""), 3000);
  };

  const handleExport = async () => {
    const supabase = createClient();
    const tables = ["daily_reviews","trades","products","money_snapshots","income_entries","expense_entries","habits","habit_logs","backtests","prop_challenges","decisions","weekly_reviews","war_modes","roadmap_milestones","learning_resources"];
    const data: Record<string, unknown> = {};
    for (const t of tables) {
      const { data: rows } = await supabase.from(t).select("*").eq("user_id", userId);
      data[t] = rows;
    }
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `lifeos_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
  };

  const handleHealthCheck = async () => {
    const supabase = createClient();
    const results: string[] = [];
    const tables = ["users_profile","daily_reviews","trades","habits","money_snapshots"];
    for (const t of tables) {
      const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true }).eq("user_id", userId);
      results.push(`${error ? "❌" : "✅"} ${t}: ${count ?? 0} enregistrements`);
    }
    setMsg(results.join("\n"));
  };

  return (
    <div className="page-enter">
      <div style={{ marginBottom: "16px" }}><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>⚙️ Settings</div></div>
      <div className="tabs" style={{ marginBottom: "16px" }}>
        {(["profile", "data", "health"] as const).map(t => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t === "profile" ? "👤 Profil" : t === "data" ? "💾 Données" : "❤️ Health Check"}</div>)}
      </div>
      {msg && <div style={{ padding: "10px 14px", background: "rgba(0,232,122,.1)", border: "1px solid rgba(0,232,122,.3)", borderRadius: "6px", marginBottom: "12px", fontSize: "11px", whiteSpace: "pre-wrap", color: "var(--green)" }}>{msg}</div>}
      {tab === "profile" && (
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "14px" }}>👤 Profil & Objectifs</div>
          <form onSubmit={handleSaveProfile}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              {[["name","Nom",profile?.name ?? ""],["country","Pays",profile?.country ?? ""],["timezone","Timezone",profile?.timezone ?? ""],["currency","Devise principale",profile?.primary_currency ?? "USD"]].map(([n, l, v]) => (
                <div key={n}><label style={LS}>{l}</label><input className="inp" name={n} defaultValue={v} /></div>
              ))}
              <div><label style={LS}>Capital Target (USD)</label><input className="inp" name="target_capital" type="number" defaultValue={profile?.target_capital_usd?.toString() ?? "68000"} /></div>
              <div><label style={LS}>Date Target</label><input className="inp" name="target_date" type="date" defaultValue={profile?.target_date ?? "2028-03-01"} /></div>
              <div><label style={LS}>Phase Actuelle</label>
                <select className="inp" name="current_phase" defaultValue={profile?.current_phase?.toString() ?? "1"}>
                  {[1,2,3,4,5,6,7].map(p => <option key={p} value={p}>Phase {p}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}><label style={LS}>Objectif Principal</label><input className="inp" name="goal" defaultValue={profile?.goal ?? ""} placeholder="Liberté financière mars 2028..." /></div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? "⏳" : "💾 Sauvegarder"}</button>
              <span style={{ fontSize: "10px", color: "var(--txt2)" }}>Email: {email}</span>
            </div>
          </form>
        </div>
      )}
      {tab === "data" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="card">
            <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "14px" }}>📦 Export / Import</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button className="btn btn-primary" onClick={handleExport}>📦 Export JSON Complet</button>
              <p style={{ fontSize: "10px", color: "var(--txt2)" }}>Exporte toutes tes données en JSON. Sauvegarde à faire régulièrement.</p>
            </div>
          </div>
          <div className="card card-danger">
            <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "14px", color: "var(--red)" }}>⚠️ Zone Danger</div>
            <p style={{ fontSize: "10px", color: "var(--txt2)", marginBottom: "12px" }}>Ces actions sont irréversibles. Exporte tes données d&apos;abord.</p>
            <button className="btn btn-red" onClick={() => { if (confirm("ATTENTION: Supprimer TOUTES les données? Cette action est irréversible.")) { /* implement */ alert("Fonctionnalité disponible dans la prochaine version"); } }}>
              💀 Clear All Data
            </button>
          </div>
        </div>
      )}
      {tab === "health" && (
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "14px" }}>❤️ Data Health Check</div>
          <button className="btn btn-primary btn-sm" onClick={() => startTransition(handleHealthCheck)} disabled={isPending} style={{ marginBottom: "14px" }}>
            {isPending ? "⏳ Vérification..." : "🔍 Lancer Health Check"}
          </button>
          {!msg && <div className="empty-state"><div className="icon">❤️</div><p>Lance un health check pour vérifier l&apos;état de tes données</p></div>}
        </div>
      )}
    </div>
  );
}
const LS: React.CSSProperties = { fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" };
