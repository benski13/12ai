import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/app/settings/SettingsClient";
export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("users_profile").select("*").eq("user_id", user.id).maybeSingle();
  return <SettingsClient userId={user.id} profile={profile} email={user.email ?? ""} />;
}
