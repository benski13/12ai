import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CommandCenterClient } from "./CommandCenterClient";

export default async function CommandCenterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const uid = user.id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  // Parallel data fetching
  const [
    { data: profile },
    { data: snaps },
    { data: monthTrades },
    { data: allTrades },
    { data: products },
    { data: reviews },
    { data: habits },
    { data: habitLogs },
    { data: xpRows },
    { data: activeWar },
  ] = await Promise.all([
    supabase.from("users_profile").select("*").eq("user_id", uid).single(),
    supabase.from("money_snapshots").select("*").eq("user_id", uid).order("date", { ascending: false }).limit(12),
    supabase.from("trades").select("result_r, result_amount, date").eq("user_id", uid).gte("date", monthStart),
    supabase.from("trades").select("result_r, result_amount, mistake_type, plan_respected").eq("user_id", uid),
    supabase.from("products").select("status, name, product_score").eq("user_id", uid),
    supabase.from("daily_reviews").select("*").eq("user_id", uid).order("date", { ascending: false }).limit(7),
    supabase.from("habits").select("*").eq("user_id", uid).eq("active", true),
    supabase.from("habit_logs").select("habit_id, date").eq("user_id", uid).eq("date", today),
    supabase.from("xp_ledger").select("amount").eq("user_id", uid),
    supabase.from("war_modes").select("title, end_date").eq("user_id", uid).eq("active", true).maybeSingle(),
  ]);

  // Compute stats server-side
  const capital = snaps?.[0]?.total_networth_usd ?? profile?.target_capital_usd ?? 0;
  const target = profile?.target_capital_usd ?? 68000;
  const targetDate = new Date(profile?.target_date ?? "2028-03-01");
  const daysLeft = Math.max(0, Math.round((targetDate.getTime() - now.getTime()) / 86400000));
  const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
  const progress = Math.min(100, (capital / target) * 100);
  const weeklyRequired = Math.max(0, (target - capital) / weeksLeft);

  const wins = (allTrades ?? []).filter((t) => (t.result_r ?? 0) > 0);
  const losses = (allTrades ?? []).filter((t) => (t.result_r ?? 0) < 0);
  const winrate = allTrades?.length ? (wins.length / allTrades.length) * 100 : 0;
  const profitFactor =
    wins.length && losses.length
      ? wins.reduce((s, t) => s + (t.result_r ?? 0), 0) /
        Math.abs(losses.reduce((s, t) => s + (t.result_r ?? 0), 0))
      : 0;
  const monthPnL = (monthTrades ?? []).reduce((s, t) => s + (t.result_amount ?? 0), 0);

  const monthReviews = (reviews ?? []).filter((r) => r.date >= monthStart);
  const avgScore = monthReviews.length
    ? monthReviews.reduce((s, r) => s + (r.daily_score ?? 0), 0) / monthReviews.length
    : null;

  const todayHabitsDone = (habitLogs ?? []).length;
  const totalHabits = (habits ?? []).length;

  const xpTotal = (xpRows ?? []).reduce((s, r) => s + r.amount, 0);

  const lastReview = reviews?.[0];

  return (
    <CommandCenterClient
      capital={capital}
      target={target}
      progress={progress}
      daysLeft={daysLeft}
      weeklyRequired={weeklyRequired}
      monthPnL={monthPnL}
      monthTradesCount={monthTrades?.length ?? 0}
      winrate={winrate}
      profitFactor={profitFactor}
      allTradesCount={allTrades?.length ?? 0}
      avgScore={avgScore}
      monthReviewsCount={monthReviews.length}
      products={products ?? []}
      snapshots={(snaps ?? []).reverse()}
      allTrades={allTrades ?? []}
      todayHabitsDone={todayHabitsDone}
      totalHabits={totalHabits}
      xpTotal={xpTotal}
      lastReview={lastReview ?? null}
      activeWar={activeWar}
      profile={profile}
    />
  );
}
