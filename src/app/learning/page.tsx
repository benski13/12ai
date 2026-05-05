import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function LearningPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: resources } = await supabase.from("learning_resources").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const active = resources?.filter(r => r.status === "in_progress") ?? [];
  const done = resources?.filter(r => r.status === "done") ?? [];
  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <div><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>📚 Learning OS</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Chaque ressource = compétence + XP</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
        {[{ label: "Total", value: (resources?.length ?? 0).toString(), color: "var(--blue)" },{ label: "En Cours", value: active.length.toString(), color: "var(--amber)" },{ label: "Terminées", value: done.length.toString(), color: "var(--green)" },{ label: "À Faire", value: (resources?.filter(r => r.status === "todo")?.length ?? 0).toString(), color: "var(--txt2)" }].map(({ label, value, color }) => <div key={label} className="card"><div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>{label}</div><div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color }}>{value}</div></div>)}
      </div>
      {!resources?.length ? <div className="empty-state"><div className="icon">📚</div><p>Commence à capturer tes apprentissages</p><p style={{ fontSize: "10px", color: "var(--txt3)", marginTop: "6px" }}>Livres, cours, vidéos, mentors...</p></div> :
        resources.map(r => <div key={r.id} className="card" style={{ marginBottom: "8px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><div><div style={{ fontWeight: 700 }}>{r.title}</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>{r.category} · {r.type}</div></div><div style={{ display: "flex", gap: "6px" }}><span className={`tag ${r.status === "done" ? "tag-green" : r.status === "in_progress" ? "tag-amber" : "tag-grey"}`}>{r.status}</span>{r.progress ? <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "var(--purple)" }}>{r.progress}%</span> : null}</div></div>{r.actions_to_apply && <div style={{ fontSize: "10px", color: "var(--cyan)", marginTop: "6px" }}>→ {r.actions_to_apply}</div>}</div>)}
    </div>
  );
}
