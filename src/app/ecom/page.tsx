import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EcomClient } from "./EcomClient";
export default async function EcomPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const [{ data: products }, { data: creatives }, { data: campaigns }, { data: suppliers }] = await Promise.all([
    supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("creatives").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("campaigns").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("suppliers").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  return <EcomClient userId={user.id} products={products ?? []} creatives={creatives ?? []} campaigns={campaigns ?? []} suppliers={suppliers ?? []} />;
}
