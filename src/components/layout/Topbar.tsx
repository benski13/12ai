"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Command Center",
  "/daily": "Daily OS",
  "/habits": "Habits Tracker",
  "/profile": "Profile & RPG",
  "/trading": "Trading Journal",
  "/backtest": "Backtest Lab",
  "/prop": "Prop Firm OS",
  "/ecom": "E-commerce OS",
  "/money": "Money OS",
  "/learning": "Learning OS",
  "/decisions": "Decision Log",
  "/weekly": "Weekly Review",
  "/roadmap": "Roadmap 2028",
  "/war": "War Mode",
  "/ai": "AI Coach",
  "/settings": "Settings",
};

const LEVELS = [
  { min: 0, name: "Recruit", icon: "🎖️" },
  { min: 100, name: "Operator", icon: "⚡" },
  { min: 300, name: "Builder", icon: "🔨" },
  { min: 600, name: "Executor", icon: "🎯" },
  { min: 1000, name: "Strategist", icon: "🧠" },
  { min: 1800, name: "Alpha Trader", icon: "📈" },
  { min: 3000, name: "Elite", icon: "💎" },
  { min: 5000, name: "Freedom Builder", icon: "🚀" },
];

function getLevel(xp: number) {
  let level = LEVELS[0]; let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) { if (xp >= LEVELS[i].min) { level = LEVELS[i]; idx = i; } }
  return { ...level, index: idx + 1 };
}

interface TopbarProps { xpTotal: number; onMenuClick: () => void; }

export function Topbar({ xpTotal, onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const level = getLevel(xpTotal);
  const title = PAGE_TITLES[pathname] || "Life OS V15";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="topbar">
      <button onClick={onMenuClick} style={{ display: "none", background: "none", border: "none", color: "var(--txt)", fontSize: "18px", cursor: "pointer", padding: "4px" }} className="menu-btn">
        ☰
      </button>
      <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--txt2)" }}>
        {title}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ fontSize: "9px", fontFamily: "JetBrains Mono, monospace", color: "var(--purple)", background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.3)", borderRadius: "4px", padding: "3px 8px" }}>
          ⚡ {xpTotal} XP
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "linear-gradient(135deg, rgba(168,85,247,.2), rgba(59,158,255,.1))", border: "1px solid rgba(168,85,247,.4)", borderRadius: "5px", fontSize: "10px", fontWeight: 700, color: "var(--purple)" }}>
          {level.icon} {level.name}
        </div>
        <button onClick={handleLogout} style={{ fontSize: "9px", background: "none", border: "1px solid var(--border2)", color: "var(--txt2)", padding: "3px 8px", borderRadius: "4px", cursor: "pointer", fontFamily: "Chakra Petch, monospace" }}>
          Logout
        </button>
      </div>
    </div>
  );
}
