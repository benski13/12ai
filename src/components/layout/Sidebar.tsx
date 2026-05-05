"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  let level = LEVELS[0];
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) { level = LEVELS[i]; idx = i; }
  }
  const next = LEVELS[idx + 1];
  const progress = next ? Math.min(100, ((xp - level.min) / (next.min - level.min)) * 100) : 100;
  return { ...level, index: idx + 1, progress };
}

const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { href: "/", icon: "⚡", label: "Command Center" },
      { href: "/daily", icon: "🎯", label: "Daily OS" },
      { href: "/habits", icon: "🔁", label: "Habits" },
      { href: "/profile", icon: "👤", label: "Profile & RPG" },
    ],
  },
  {
    label: "Trading",
    items: [
      { href: "/trading", icon: "📈", label: "Trading Journal" },
      { href: "/backtest", icon: "🔬", label: "Backtest Lab" },
      { href: "/prop", icon: "🏦", label: "Prop Firm" },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/ecom", icon: "🛒", label: "E-commerce OS" },
      { href: "/money", icon: "💰", label: "Money OS" },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/learning", icon: "📚", label: "Learning OS" },
      { href: "/decisions", icon: "🧠", label: "Decision Log" },
      { href: "/weekly", icon: "📅", label: "Weekly Review" },
    ],
  },
  {
    label: "Systems",
    items: [
      { href: "/roadmap", icon: "🗺️", label: "Roadmap 2028" },
      { href: "/war", icon: "⚔️", label: "War Mode" },
      { href: "/ai", icon: "🤖", label: "AI Coach", badge: "NEW" },
      { href: "/settings", icon: "⚙️", label: "Settings" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  xpTotal: number;
}

export function Sidebar({ isOpen, xpTotal }: SidebarProps) {
  const pathname = usePathname();
  const level = getLevel(xpTotal);

  // Days until March 2028
  const target = new Date("2028-03-01");
  const now = new Date();
  const daysLeft = Math.max(0, Math.round((target.getTime() - now.getTime()) / 86400000));

  return (
    <nav className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "3px", color: "var(--green)", textTransform: "uppercase" }}>
          Life OS V15
        </div>
        <div style={{ fontSize: "8px", color: "var(--txt3)", letterSpacing: "2px", marginTop: "2px" }}>
          Elite Execution System
        </div>
        <div style={{ fontSize: "9px", color: "var(--purple)", marginTop: "8px", fontFamily: "JetBrains Mono, monospace" }}>
          {level.icon} {xpTotal} XP — Lv.{level.index} {level.name}
        </div>
        <div style={{ marginTop: "6px" }}>
          <div style={{ height: "4px", background: "var(--panel)", borderRadius: "2px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${level.progress}%`,
                background: "linear-gradient(90deg, var(--purple), var(--blue))",
                borderRadius: "2px",
                transition: "width 0.7s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="nav-section">{group.label}</div>
          {group.items.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "active" : ""}`}>
                <span style={{ width: "16px", textAlign: "center", fontSize: "13px", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{ marginLeft: "auto", fontSize: "8px", background: "rgba(168,85,247,.3)", color: "var(--purple)", borderRadius: "4px", padding: "1px 5px", fontFamily: "JetBrains Mono, monospace" }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Bottom */}
      <div style={{ marginTop: "auto", padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: "9px", color: "var(--txt3)", fontFamily: "JetBrains Mono, monospace" }}>
          {now.toLocaleDateString("fr-FR")}
        </div>
        <div style={{ fontSize: "10px", color: "var(--amber)", fontFamily: "JetBrains Mono, monospace", marginTop: "3px" }}>
          ⏱ {daysLeft} jours restants
        </div>
      </div>
    </nav>
  );
}
