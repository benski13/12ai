"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setTimeout(() => router.push("/auth/login"), 3000); }
  };

  if (success) return (
    <div style={{ minHeight: "100vh", background: "var(--void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "var(--green)" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
        <div style={{ fontSize: "14px", fontWeight: 700 }}>Compte créé!</div>
        <div style={{ fontSize: "11px", color: "var(--txt2)", marginTop: "8px" }}>Redirection vers la connexion...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--void)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "3px", color: "var(--green)", textTransform: "uppercase" }}>Life OS V15</div>
          <div style={{ fontSize: "20px", marginTop: "16px", fontWeight: 700 }}>Créer ton compte</div>
        </div>
        <div className="card" style={{ padding: "24px" }}>
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" }}>Nom</label>
              <input className="inp" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Benjamin" required />
            </div>
            <div>
              <label style={{ fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" }}>Email</label>
              <input className="inp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" required />
            </div>
            <div>
              <label style={{ fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--txt3)", display: "block", marginBottom: "4px" }}>Mot de passe</label>
              <input className="inp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 caractères" minLength={8} required />
            </div>
            {error && <div style={{ color: "var(--red)", fontSize: "11px", padding: "8px 12px", background: "rgba(255,45,85,.1)", borderRadius: "5px" }}>❌ {error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? "Création..." : "⚡ Créer mon Life OS"}
            </button>
          </form>
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "var(--txt2)" }}>
            Déjà un compte ?{" "}
            <Link href="/auth/login" style={{ color: "var(--green)", textDecoration: "none" }}>Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
