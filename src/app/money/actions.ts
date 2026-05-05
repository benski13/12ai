"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
export async function addSnapshot(fd: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const cashAUD = Number(fd.get("cash_aud") || 0), cashUSD = Number(fd.get("cash_usd") || 0);
  const cashEUR = Number(fd.get("cash_eur") || 0), trading = Number(fd.get("trading_capital") || 0);
  const emergency = Number(fd.get("emergency_fund") || 0), ecom = Number(fd.get("ecom_budget") || 0);
  const invest = Number(fd.get("investments") || 0), debts = Number(fd.get("debts") || 0);
  const total = cashAUD * 0.65 + cashUSD + cashEUR * 1.08 + trading + emergency + ecom + invest - debts;
  await supabase.from("money_snapshots").insert({ user_id: user.id, date: fd.get("date") as string, cash_aud: cashAUD, cash_usd: cashUSD, cash_eur: cashEUR, trading_capital: trading, emergency_fund: emergency, ecom_budget: ecom, investments: invest, debts, total_networth_usd: parseFloat(total.toFixed(2)), notes: fd.get("notes") as string });
  await supabase.from("xp_ledger").insert({ user_id: user.id, amount: 20, domain: "money", reason: "Money snapshot saved" });
  revalidatePath("/money"); revalidatePath("/");
}
export async function addIncome(fd: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("income_entries").insert({ user_id: user.id, date: fd.get("date") as string, source: fd.get("source") as string, category: fd.get("category") as string, amount: Number(fd.get("amount")), currency: fd.get("currency") as string, notes: fd.get("notes") as string });
  revalidatePath("/money");
}
export async function addExpense(fd: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("expense_entries").insert({ user_id: user.id, date: fd.get("date") as string, category: fd.get("category") as string, amount: Number(fd.get("amount")), currency: fd.get("currency") as string, notes: fd.get("notes") as string });
  revalidatePath("/money");
}
export async function saveAllocation(fd: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("allocation").upsert({ user_id: user.id, cash_aud: Number(fd.get("cash_aud")||0), cash_usd: Number(fd.get("cash_usd")||0), trading: Number(fd.get("trading")||0), ecom: Number(fd.get("ecom")||0), investments: Number(fd.get("investments")||0), emergency: Number(fd.get("emergency")||0), education: Number(fd.get("education")||0), debts: Number(fd.get("debts")||0), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  revalidatePath("/money");
}
