"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push("/"); router.refresh(); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--void)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "3px", color: "var(--green)", textTransform: "uppercase" }}>Life OS V15</div>
          <div style={{ fontSize: "10px", color: "var(--txt3)", letterSpacing: "2px", marginTop: "4px" }}>Elite Execution System</div>
          <div style={{ fontSize: "20px", marginTop: "16px", fontWeight: 700, color: "var(--txt)" }}>Connexion</div>
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" }}>Email</label>
              <input className="inp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" required />
            </div>
            <div>
              <label style={{ fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" }}>Mot de passe</label>
              <input className="inp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <div style={{ color: "var(--red)", fontSize: "11px", padding: "8px 12px", background: "rgba(255,45,85,.1)", borderRadius: "5px", border: "1px solid rgba(255,45,85,.3)" }}>❌ {error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? "Connexion..." : "🚀 Se connecter"}
            </button>
          </form>
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "var(--txt2)" }}>
            Pas encore de compte ?{" "}
            <Link href="/auth/signup" style={{ color: "var(--green)", textDecoration: "none" }}>Créer un compte</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
