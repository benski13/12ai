"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
const PHASES = [
  { n: 1, title: "Cash Stability Australia", obj: "Stabiliser revenus & épargne de base", color: "var(--green)" },
  { n: 2, title: "23k Saved", obj: "Atteindre $23,000 USD d'épargne", color: "var(--blue)" },
  { n: 3, title: "Trading Backtest Discipline", obj: "Backtests validés + journal discipliné", color: "var(--purple)" },
  { n: 4, title: "First E-com Tests", obj: "Premier produit testé avec budget ads", color: "var(--amber)" },
  { n: 5, title: "Prop Firm 100k", obj: "Passer le challenge 100k", color: "var(--amber)" },
  { n: 6, title: "$68k USD Target", obj: "Atteindre l'objectif capital Mars 2028", color: "var(--green)" },
  { n: 7, title: "Asia / Company / Scale", obj: "Relocate + Scale trading + E-com", color: "var(--cyan)" },
];
export function RoadmapClient({ userId, milestones, profile }: { userId: string; milestones: { id: string; title: string; target_date?: string | null; target_amount?: number | null; status: string; progress: number }[]; profile?: { target_capital_usd?: number; target_date?: string; current_phase?: number } | null }) {
  const router = useRouter();
  const now = new Date();
  const target = new Date(profile?.target_date ?? "2028-03-01");
  const daysLeft = Math.max(0, Math.round((target.getTime() - now.getTime()) / 86400000));
  const currentPhase = profile?.current_phase ?? 1;
  const capital = profile?.target_capital_usd ?? 68000;
  return (
    <div className="page-enter">
      <div style={{ marginBottom: "16px" }}><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>🗺️ Roadmap 2028</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Phases · Milestones · Timeline vers la liberté</div></div>
      <div className="card card-highlight" style={{ marginBottom: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", textAlign: "center" }}>
          {[["Jours Restants", daysLeft.toString(), "var(--green)"],["Semaines", Math.ceil(daysLeft/7).toString(), "var(--blue)"],["Mois", Math.ceil(daysLeft/30).toString(), "var(--amber)"],["Phase", currentPhase + "/7", "var(--purple)"]].map(([l,v,c]) => <div key={l as string}><div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: c as string }}>{v as string}</div><div style={{ fontSize: "8px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginTop: "4px" }}>{l as string}</div></div>)}
        </div>
      </div>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "12px" }}>📍 Phases Stratégiques</div>
        {PHASES.map(p => {
          const status = p.n < currentPhase ? "done" : p.n === currentPhase ? "active" : "future";
          return (
            <div key={p.n} className={`phase-card ${status}`} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "11px", color: "var(--txt3)", fontFamily: "JetBrains Mono, monospace" }}>Phase {p.n}</span><span style={{ fontSize: "12px", fontWeight: 700 }}>{p.title}</span></div>
                  <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>{p.obj}</div>
                </div>
                <span className={`tag ${status === "done" ? "tag-green" : status === "active" ? "tag-amber" : "tag-grey"}`}>{status === "done" ? "✓ Done" : status === "active" ? "🔥 Active" : "Pending"}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700 }}>🏆 Milestones Personnels</div>
          <button className="btn btn-primary btn-sm" onClick={async () => {
            const title = prompt("Titre du milestone?"); if (!title) return;
            const date = prompt("Date cible (YYYY-MM-DD)?") ?? "";
            const amount = prompt("Montant cible ($)?") ?? "0";
            const s = createClient(); await s.from("roadmap_milestones").insert({ user_id: userId, title, target_date: date || null, target_amount: Number(amount) || null, status: "pending", progress: 0 });
            router.refresh();
          }}>+ Milestone</button>
        </div>
        {milestones.length === 0 ? <div className="empty-state"><div className="icon">🏆</div><p>Ajoute tes milestones personnels</p></div> :
          milestones.map(m => <div key={m.id} className="card" style={{ marginBottom: "8px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontWeight: 700 }}>{m.title}</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>{m.target_date ?? "—"} · {m.target_amount ? "$" + Number(m.target_amount).toLocaleString() : "—"}</div></div><span className={`tag ${m.status === "completed" ? "tag-green" : m.status === "in_progress" ? "tag-amber" : "tag-grey"}`}>{m.status}</span></div><div className="prog-wrap" style={{ marginTop: "8px" }}><div className="prog-fill prog-purple" style={{ width: m.progress + "%" }} /></div></div>)}
      </div>
    </div>
  );
}
