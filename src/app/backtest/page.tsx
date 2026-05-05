import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BacktestClient } from "./BacktestClient";
export default async function BacktestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: backtests } = await supabase.from("backtests").select("*").eq("user_id", user.id).order("date", { ascending: false });
  return <BacktestClient userId={user.id} backtests={backtests ?? []} />;
}
