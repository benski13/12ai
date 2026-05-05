import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DailyClient } from "./DailyClient";

export default async function DailyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const today = new Date().toISOString().slice(0, 10);
  const { data: todayReview } = await supabase.from("daily_reviews").select("*").eq("user_id", user.id).eq("date", today).maybeSingle();
  const { data: history } = await supabase.from("daily_reviews").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(30);

  return <DailyClient userId={user.id} today={today} todayReview={todayReview} history={history ?? []} />;
}
