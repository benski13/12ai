import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PropClient } from "./PropClient";
export default async function PropPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const [{ data: challenges }, { data: payouts }] = await Promise.all([
    supabase.from("prop_challenges").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("prop_payouts").select("*").eq("user_id", user.id).order("date", { ascending: false }),
  ]);
  return <PropClient userId={user.id} challenges={challenges ?? []} payouts={payouts ?? []} />;
}
