import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MoneyClient } from "./MoneyClient";
export default async function MoneyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const [{ data: snaps }, { data: incomes }, { data: expenses }, { data: alloc }, { data: profile }] = await Promise.all([
    supabase.from("money_snapshots").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(24),
    supabase.from("income_entries").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(50),
    supabase.from("expense_entries").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(50),
    supabase.from("allocation").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("users_profile").select("target_capital_usd,target_date").eq("user_id", user.id).maybeSingle(),
  ]);
  return <MoneyClient userId={user.id} snapshots={snaps ?? []} incomes={incomes ?? []} expenses={expenses ?? []} allocation={alloc} target={profile?.target_capital_usd ?? 68000} targetDate={profile?.target_date ?? "2028-03-01"} />;
}
