import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function DecisionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: decisions } = await supabase.from("decisions").select("*").eq("user_id", user.id).order("date", { ascending: false });
  const good = decisions?.filter(d => (d.final_score ?? 0) >= 7) ?? [];
  const bad = decisions?.filter(d => d.final_score != null && d.final_score < 5) ?? [];
  const avg = decisions?.length && decisions.some(d => d.final_score != null) ? (decisions.filter(d => d.final_score != null).reduce((s, d) => s + (d.final_score ?? 0), 0) / decisions.filter(d => d.final_score != null).length).toFixed(1) : null;
  return (
    <div className="page-enter">
      <div style={{ marginBottom: "16px" }}><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>🧠 Decision Log</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Décisions importantes · Résultats · Biais · Leçons</div></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
        {[{ label: "Total", value: (decisions?.length ?? 0).toString(), color: "var(--blue)" },{ label: "Bonnes (≥7)", value: good.length.toString(), color: "var(--green)" },{ label: "Mauvaises (<5)", value: bad.length.toString(), color: "var(--red)" },{ label: "Score Moyen", value: avg ? avg + "/10" : "—", color: "var(--purple)" }].map(({ label, value, color }) => <div key={label} className="card"><div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>{label}</div><div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color }}>{value}</div></div>)}
      </div>
      {!decisions?.length ? <div className="empty-state"><div className="icon">🧠</div><p>Documente tes décisions importantes</p></div> :
        decisions.map(d => <div key={d.id} className="card" style={{ marginBottom: "8px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><div><div style={{ fontWeight: 700 }}>{d.decision}</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>{d.date} · {d.domain ?? "—"}</div></div><div style={{ display: "flex", gap: "6px", alignItems: "center" }}>{d.confidence_score && <span className="tag tag-blue">Conf: {d.confidence_score}/10</span>}{d.final_score && <span style={{ fontSize: "16px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: d.final_score >= 7 ? "var(--green)" : d.final_score >= 5 ? "var(--amber)" : "var(--red)" }}>{d.final_score}/10</span>}</div></div>{d.lesson && <div style={{ fontSize: "10px", color: "var(--cyan)", marginTop: "6px" }}>💡 {d.lesson}</div>}</div>)}
    </div>
  );
}
