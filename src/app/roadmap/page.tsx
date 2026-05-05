import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoadmapClient } from "./RoadmapClient";
export default async function RoadmapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const [{ data: milestones }, { data: profile }] = await Promise.all([
    supabase.from("roadmap_milestones").select("*").eq("user_id", user.id).order("target_date"),
    supabase.from("users_profile").select("target_capital_usd,target_date,current_phase").eq("user_id", user.id).maybeSingle(),
  ]);
  return <RoadmapClient userId={user.id} milestones={milestones ?? []} profile={profile} />;
}
