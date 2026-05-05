"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
export async function addHabit(fd: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("habits").insert({ user_id: user.id, name: fd.get("name") as string, category: fd.get("category") as string, active: true });
  revalidatePath("/habits"); revalidatePath("/");
}
export async function toggleHabitLog(habitId: string, date: string, isDone: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  if (isDone) {
    await supabase.from("habit_logs").delete().eq("user_id", user.id).eq("habit_id", habitId).eq("date", date);
  } else {
    await supabase.from("habit_logs").insert({ user_id: user.id, habit_id: habitId, date });
    await supabase.from("xp_ledger").insert({ user_id: user.id, amount: 5, domain: "discipline", reason: "Habit completed" });
  }
  revalidatePath("/habits"); revalidatePath("/");
}
export async function toggleHabitActive(id: string, active: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("habits").update({ active: !active }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/habits");
}
export async function deleteHabit(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("habits").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/habits"); revalidatePath("/");
}
