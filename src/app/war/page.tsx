import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function WarModePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: wars } = await supabase.from("war_modes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const activeWar = wars?.find(w => w.active) ?? null;
  return (
    <div className="page-enter">
      <div style={{ marginBottom: "16px" }}><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>⚔️ War Mode</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Exécution totale · Zéro excuse · Mode machine</div></div>
      {activeWar ? (
        <div style={{ background: "linear-gradient(135deg,rgba(255,45,85,.08),rgba(255,184,0,.05))", border: "1px solid var(--red)", borderRadius: "10px", padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--amber)", marginBottom: "8px" }}>{activeWar.title}</div>
          <div style={{ fontSize: "40px", fontWeight: 900, fontFamily: "JetBrains Mono, monospace", color: "var(--red)" }}>⚔️ ACTIF</div>
          {activeWar.end_date && <div style={{ fontSize: "12px", color: "var(--txt2)", marginTop: "12px" }}>Fin: {activeWar.end_date}</div>}
          {activeWar.goal && <div style={{ fontSize: "12px", color: "var(--txt)", marginTop: "8px" }}>Objectif: {activeWar.goal}</div>}
        </div>
      ) : (
        <div className="empty-state"><div className="icon">⚔️</div><p>Aucun War Mode actif</p><p style={{ fontSize: "10px", color: "var(--txt3)", marginTop: "6px" }}>Démarre un War Mode pour te forcer à exécuter comme une machine</p></div>
      )}
      {wars && wars.length > 0 && <div style={{ marginTop: "16px" }}><div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px" }}>📚 Historique</div>{wars.map(w => <div key={w.id} className={`card ${w.active ? "card-amber" : ""}`} style={{ marginBottom: "8px" }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontWeight: 700 }}>{w.title}</div><div style={{ fontSize: "10px", color: "var(--txt2)" }}>{w.start_date} → {w.end_date ?? "..."}</div></div><span className={`tag ${w.active ? "tag-amber" : "tag-grey"}`}>{w.active ? "Actif" : "Terminé"}</span></div></div>)}</div>}
    </div>
  );
}
