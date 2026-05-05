"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { createClient } from "@/lib/supabase/client";

interface AppShellProps {
  userId: string;
  children: React.ReactNode;
}

export function AppShell({ userId, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [xpTotal, setXpTotal] = useState(0);
  const [warModeActive, setWarModeActive] = useState(false);
  const [warModeTitle, setWarModeTitle] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    // Load XP
    supabase.from("xp_ledger").select("amount").eq("user_id", userId)
      .then(({ data }) => {
        if (data) setXpTotal(data.reduce((s, r) => s + r.amount, 0));
      });
    // Check active war mode
    supabase.from("war_modes").select("title").eq("user_id", userId).eq("active", true).maybeSingle()
      .then(({ data }) => {
        if (data) { setWarModeActive(true); setWarModeTitle(data.title); }
      });
  }, [userId]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} xpTotal={xpTotal} />
      <div className="main-area">
        <Topbar
          xpTotal={xpTotal}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        {warModeActive && (
          <div
            style={{
              background: "linear-gradient(90deg, rgba(255,45,85,.15), rgba(255,184,0,.1))",
              borderBottom: "1px solid var(--red)",
              padding: "7px 16px",
              fontSize: "10px",
              color: "var(--red)",
              fontWeight: 700,
              letterSpacing: "1px",
              textAlign: "center",
            }}
          >
            ⚔️ WAR MODE ACTIF — {warModeTitle}
          </div>
        )}
        <main className="content page-enter">{children}</main>
      </div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 150 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
