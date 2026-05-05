"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTrade(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("trades").insert({
    user_id: user.id,
    date: formData.get("date") as string,
    symbol: formData.get("symbol") as string,
    market: formData.get("market") as string,
    session: formData.get("session") as string,
    direction: formData.get("direction") as "long" | "short",
    setup: formData.get("setup") as string,
    timeframe: formData.get("timeframe") as string,
    entry: formData.get("entry") ? Number(formData.get("entry")) : null,
    stop_loss: formData.get("stop_loss") ? Number(formData.get("stop_loss")) : null,
    take_profit: formData.get("take_profit") ? Number(formData.get("take_profit")) : null,
    risk_percent: formData.get("risk_percent") ? Number(formData.get("risk_percent")) : null,
    risk_amount: formData.get("risk_amount") ? Number(formData.get("risk_amount")) : null,
    result_r: formData.get("result_r") ? Number(formData.get("result_r")) : null,
    result_amount: formData.get("result_amount") ? Number(formData.get("result_amount")) : null,
    fees: formData.get("fees") ? Number(formData.get("fees")) : 0,
    plan_respected: formData.get("plan_respected") === "true",
    setup_quality: formData.get("setup_quality") ? Number(formData.get("setup_quality")) : null,
    execution_quality: formData.get("execution_quality") ? Number(formData.get("execution_quality")) : null,
    emotion_before: formData.get("emotion_before") as string,
    mistake_type: formData.get("mistake_type") as string,
    market_context: formData.get("market_context") as string,
    notes: formData.get("notes") as string,
  });
  await supabase.from("xp_ledger").insert({ user_id: user.id, amount: 20, domain: "trading", reason: "Trade logged" });
  revalidatePath("/trading"); revalidatePath("/");
}

export async function deleteTrade(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("trades").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/trading"); revalidatePath("/");
}

export async function saveTradingPlan(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("trading_plan").upsert({
    user_id: user.id,
    strategy: formData.get("strategy") as string,
    markets: formData.get("markets") as string,
    sessions: formData.get("sessions") as string,
    risk_per_trade: formData.get("risk_per_trade") ? Number(formData.get("risk_per_trade")) : 1,
    max_daily_loss: formData.get("max_daily_loss") ? Number(formData.get("max_daily_loss")) : null,
    max_weekly_loss: formData.get("max_weekly_loss") ? Number(formData.get("max_weekly_loss")) : null,
    setup_a: formData.get("setup_a") as string,
    setup_b: formData.get("setup_b") as string,
    no_trade_conditions: formData.get("no_trade_conditions") as string,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  revalidatePath("/trading");
}
