import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AICoachClient } from "./AICoachClient";
export default async function AICoachPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const uid = user.id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const [{ data: trades }, { data: reviews }, { data: products }, { data: snaps }, { data: profile }] = await Promise.all([
    supabase.from("trades").select("result_r,result_amount,mistake_type,plan_respected,date").eq("user_id", uid),
    supabase.from("daily_reviews").select("date,daily_score,energy,focus,main_win,main_mistake").eq("user_id", uid).order("date",{ascending:false}).limit(14),
    supabase.from("products").select("name,status,product_score").eq("user_id", uid),
    supabase.from("money_snapshots").select("total_networth_usd,date").eq("user_id", uid).order("date",{ascending:false}).limit(1),
    supabase.from("users_profile").select("target_capital_usd,target_date,name").eq("user_id", uid).maybeSingle(),
  ]);
  const capital = snaps?.[0]?.total_networth_usd ?? 0;
  const target = profile?.target_capital_usd ?? 68000;
  const daysLeft = Math.max(0, Math.round((new Date(profile?.target_date ?? "2028-03-01").getTime() - now.getTime()) / 86400000));
  const wins = (trades ?? []).filter(t => (t.result_r ?? 0) > 0);
  const winrate = trades?.length ? (wins.length / trades.length * 100).toFixed(1) : "0";
  const pnl = (trades ?? []).reduce((s, t) => s + (t.result_amount ?? 0), 0);
  const context = { capital, target, gap: target - capital, daysLeft, trading: { trades: trades?.length ?? 0, winrate, pnl }, ecom: { total: products?.length ?? 0, winners: products?.filter(p => p.status === "winner").length ?? 0 }, recentReviews: reviews?.slice(0, 7).map(r => ({ date: r.date, score: r.daily_score, energy: r.energy, win: r.main_win, mistake: r.main_mistake })) };
  return <AICoachClient context={context} />;
}
