import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WeeklyClient } from "./WeeklyClient";
export default async function WeeklyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: reviews } = await supabase.from("weekly_reviews").select("*").eq("user_id", user.id).order("week_start", { ascending: false }).limit(20);
  return <WeeklyClient userId={user.id} reviews={reviews ?? []} />;
}
