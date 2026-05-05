import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TradingClient } from "./TradingClient";

export default async function TradingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: trades } = await supabase.from("trades").select("*").eq("user_id", user.id).order("date", { ascending: false });
  const { data: plan } = await supabase.from("trading_plan").select("*").eq("user_id", user.id).maybeSingle();
  return <TradingClient userId={user.id} trades={trades ?? []} plan={plan} />;
}
