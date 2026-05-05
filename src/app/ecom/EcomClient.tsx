"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AIInsight } from "@/components/ui/AIInsight";
import type { Product } from "@/types/database";
const LS: React.CSSProperties = { fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" };
const fmt$ = (n?: number | null) => "$" + Number(n || 0).toLocaleString();
type Tab = "products" | "creatives" | "campaigns" | "suppliers" | "ai";
const STATUS_COLORS: Record<string, string> = { research: "tag-grey", testing: "tag-amber", winner: "tag-green", killed: "tag-red", paused: "tag-blue" };

export function EcomClient({ userId, products, creatives, campaigns, suppliers }: { userId: string; products: Product[]; creatives: { id: string; hook?: string | null; angle?: string | null; platform?: string | null; status?: string | null; ctr?: number | null; cpa?: number | null }[]; campaigns: { id: string; name: string; platform?: string | null; spend?: number | null; revenue?: number | null; roas?: number | null; decision?: string | null }[]; suppliers: { id: string; name: string; platform?: string | null; country?: string | null; unit_price?: number | null; quality_score?: number | null }[] }) {
  const [tab, setTab] = useState<Tab>("products");
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const aiContext = { total: products.length, winners: products.filter(p => p.status === "winner").length, testing: products.filter(p => p.status === "testing").length, killed: products.filter(p => p.status === "killed").length, products: products.slice(0, 10).map(p => ({ name: p.name, status: p.status, margin: p.gross_margin, score: p.product_score })) };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const price = Number(fd.get("selling_price")), cogs = Number(fd.get("cogs")), ship = Number(fd.get("shipping_cost"));
    const margin = price ? Math.round((price - cogs - ship) / price * 100) : 0;
    const supabase = createClient();
    await supabase.from("products").insert({ user_id: userId, name: fd.get("name") as string, niche: fd.get("niche") as string, status: fd.get("status") as string, selling_price: price, cogs, shipping_cost: ship, gross_margin: margin, breakeven_cpa: Number(fd.get("breakeven_cpa")) || null, product_score: Number(fd.get("product_score")) || null, decision: fd.get("decision") as string, notes: fd.get("notes") as string });
    await supabase.from("xp_ledger").insert({ user_id: userId, amount: 15, domain: "ecom", reason: "Product added" });
    setShowForm(false); router.refresh();
  };

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>🛒 E-commerce OS</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>Product Lab · Suppliers · Creatives · Campaigns</div></div>
        <div style={{ display: "flex", gap: "8px" }}><button className="btn btn-secondary btn-sm" onClick={() => setTab("ai")}>🤖 AI Analyst</button><button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "✕" : "+ Produit (+15 XP)"}</button></div>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: "12px", borderColor: "var(--green)" }}>
          <form onSubmit={handleAddProduct}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "10px" }}>
              {[["name","Nom Produit","text"],["niche","Niche","text"],["selling_price","Prix ($)","number"],["cogs","COGS ($)","number"],["shipping_cost","Shipping ($)","number"],["breakeven_cpa","Break CPA ($)","number"],["product_score","Score /100","number"]].map(([n,l,t]) => <div key={n as string}><label style={LS}>{l as string}</label><input className="inp" type={t as string} name={n as string} required={n === "name"} /></div>)}
              <div><label style={LS}>Status</label><select className="inp" name="status"><option value="research">Research</option><option value="testing">Testing</option><option value="winner">Winner ✓</option><option value="killed">Killed ✗</option></select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div><label style={LS}>Décision</label><input className="inp" name="decision" placeholder="Kill, Scale, Tester..." /></div>
              <div><label style={LS}>Notes</label><input className="inp" name="notes" /></div>
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Ajouter Produit (+15 XP)</button>
          </form>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
        {[{ label: "Total", value: products.length.toString(), color: "var(--blue)" }, { label: "En Test", value: products.filter(p => p.status === "testing").length.toString(), color: "var(--amber)" }, { label: "Winners", value: products.filter(p => p.status === "winner").length.toString(), color: "var(--green)" }, { label: "Killed", value: products.filter(p => p.status === "killed").length.toString(), color: "var(--red)" }].map(({ label, value, color }) => <div key={label} className="card"><div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>{label}</div><div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color }}>{value}</div></div>)}
      </div>
      <div className="tabs" style={{ marginBottom: "16px" }}>
        {(["products","creatives","campaigns","suppliers","ai"] as Tab[]).map(t => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t === "products" ? "🧪 Products" : t === "creatives" ? "🎬 Creatives" : t === "campaigns" ? "📣 Campaigns" : t === "suppliers" ? "🏭 Suppliers" : "🤖 AI"}</div>)}
      </div>
      {tab === "products" && (products.length === 0 ? <div className="empty-state"><div className="icon">🧪</div><p>Analyse ton premier produit</p></div> :
        products.map(p => (
          <div key={p.id} className="card" style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
              <div><div style={{ fontWeight: 700 }}>{p.name}</div><div style={{ fontSize: "10px", color: "var(--txt2)" }}>{p.niche ?? "—"}</div></div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span className={`tag ${STATUS_COLORS[p.status ?? "research"] ?? "tag-grey"}`}>{p.status ?? "research"}</span>
                {p.product_score && <span style={{ fontSize: "16px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: p.product_score >= 70 ? "var(--green)" : p.product_score >= 50 ? "var(--amber)" : "var(--red)" }}>{p.product_score}</span>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px", marginBottom: "8px", fontSize: "11px" }}>
              {[["Prix", fmt$(p.selling_price)],["COGS", fmt$(p.cogs)],["Marge", (p.gross_margin ?? 0) + "%"],["B.E. CPA", fmt$(p.breakeven_cpa)]].map(([l,v]) => <div key={l as string}><div style={{ fontSize: "9px", color: "var(--txt3)" }}>{l as string}</div><div style={{ fontFamily: "JetBrains Mono, monospace", color: l === "Marge" ? ((p.gross_margin ?? 0) >= 50 ? "var(--green)" : "var(--amber)") : "var(--txt)" }}>{v as string}</div></div>)}
            </div>
            {p.decision && <div style={{ fontSize: "10px", color: "var(--txt2)" }}>🎯 {p.decision}</div>}
          </div>
        ))
      )}
      {tab === "creatives" && <div style={{ overflowX: "auto" }}>{creatives.length === 0 ? <div className="empty-state"><div className="icon">🎬</div><p>Documente tes creatives</p></div> : <table><thead><tr><th>Hook</th><th>Angle</th><th>Platform</th><th>CTR</th><th>CPA</th><th>Status</th></tr></thead><tbody>{creatives.map(c => <tr key={c.id}><td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>{c.hook ?? "—"}</td><td style={{ color: "var(--blue)" }}>{c.angle ?? "—"}</td><td>{c.platform ?? "—"}</td><td style={{ fontFamily: "JetBrains Mono, monospace" }}>{c.ctr ?? "—"}</td><td style={{ fontFamily: "JetBrains Mono, monospace" }}>{c.cpa ? "$" + c.cpa : "—"}</td><td><span className={`tag ${c.status === "winner" ? "tag-green" : c.status === "killed" ? "tag-red" : "tag-amber"}`}>{c.status ?? "testing"}</span></td></tr>)}</tbody></table>}</div>}
      {tab === "campaigns" && <div style={{ overflowX: "auto" }}>{campaigns.length === 0 ? <div className="empty-state"><div className="icon">📣</div><p>Track tes campagnes</p></div> : <table><thead><tr><th>Nom</th><th>Platform</th><th>Spend</th><th>Revenue</th><th>ROAS</th><th>Décision</th></tr></thead><tbody>{campaigns.map(c => <tr key={c.id}><td style={{ fontWeight: 600 }}>{c.name}</td><td>{c.platform ?? "—"}</td><td style={{ color: "var(--red)", fontFamily: "JetBrains Mono, monospace" }}>${c.spend ?? 0}</td><td style={{ color: "var(--green)", fontFamily: "JetBrains Mono, monospace" }}>${c.revenue ?? 0}</td><td style={{ fontFamily: "JetBrains Mono, monospace", color: (c.roas ?? 0) >= 2 ? "var(--green)" : "var(--red)" }}>{c.roas ?? "—"}x</td><td><span className={`tag ${c.decision === "scale" ? "tag-green" : c.decision === "kill" ? "tag-red" : "tag-amber"}`}>{c.decision ?? "testing"}</span></td></tr>)}</tbody></table>}</div>}
      {tab === "suppliers" && <div style={{ overflowX: "auto" }}>{suppliers.length === 0 ? <div className="empty-state"><div className="icon">🏭</div><p>Ajoute tes fournisseurs</p></div> : <table><thead><tr><th>Nom</th><th>Platform</th><th>Pays</th><th>Prix Unit</th><th>Qualité</th></tr></thead><tbody>{suppliers.map(s => <tr key={s.id}><td style={{ fontWeight: 600 }}>{s.name}</td><td>{s.platform ?? "—"}</td><td>{s.country ?? "—"}</td><td style={{ fontFamily: "JetBrains Mono, monospace" }}>{s.unit_price ? "$" + s.unit_price : "—"}</td><td style={{ color: (s.quality_score ?? 0) >= 7 ? "var(--green)" : "var(--amber)", fontFamily: "JetBrains Mono, monospace" }}>{s.quality_score ?? "—"}/10</td></tr>)}</tbody></table>}</div>}
      {tab === "ai" && <div className="card card-ai"><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "var(--purple)", marginBottom: "4px" }}>🤖 AI Ecom Analyst</div><div style={{ fontSize: "10px", color: "var(--txt2)", marginBottom: "14px" }}>Kill/Scale · Angles marketing · Analyse portfolio</div><AIInsight mode="ecom" context={aiContext} buttonLabel="Analyser E-com" /></div>}
    </div>
  );
}
