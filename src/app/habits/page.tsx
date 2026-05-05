import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HabitsClient } from "./HabitsClient";
export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const today = new Date().toISOString().slice(0, 10);
  const last30 = new Date(); last30.setDate(last30.getDate() - 30);
  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase.from("habits").select("*").eq("user_id", user.id).order("sort_order"),
    supabase.from("habit_logs").select("habit_id,date").eq("user_id", user.id).gte("date", last30.toISOString().slice(0,10)),
  ]);
  return <HabitsClient userId={user.id} habits={habits ?? []} logs={logs ?? []} today={today} />;
}
