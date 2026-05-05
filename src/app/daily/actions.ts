"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveDailyReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const today = new Date().toISOString().slice(0, 10);
  const payload = {
    user_id: user.id, date: today,
    morning_intention: formData.get("morning_intention") as string,
    top_priority_1: formData.get("top_priority_1") as string,
    top_priority_2: formData.get("top_priority_2") as string,
    top_priority_3: formData.get("top_priority_3") as string,
    minimum_viable_day: formData.get("minimum_viable_day") as string,
    action_trading: formData.get("action_trading") as string,
    action_ecom: formData.get("action_ecom") as string,
    action_money: formData.get("action_money") as string,
    action_learning: formData.get("action_learning") as string,
    risk_of_day: formData.get("risk_of_day") as string,
    non_negotiable_rule: formData.get("non_negotiable_rule") as string,
    energy: Number(formData.get("energy") || 7),
    focus: Number(formData.get("focus") || 7),
    mood: formData.get("mood") as string,
    sleep_hours: Number(formData.get("sleep_hours") || 7),
    deep_work_hours: Number(formData.get("deep_work_hours") || 0),
    sport_done: formData.get("sport_done") === "1",
    daily_score: formData.get("daily_score") ? Number(formData.get("daily_score")) : null,
    main_win: formData.get("main_win") as string,
    tasks_done: formData.get("tasks_done") as string,
    main_mistake: formData.get("main_mistake") as string,
    lesson: formData.get("lesson") as string,
    improvement: formData.get("improvement") as string,
    tomorrow_priority: formData.get("tomorrow_priority") as string,
    trading_summary: formData.get("trading_summary") as string,
    ecom_summary: formData.get("ecom_summary") as string,
    money_summary: formData.get("money_summary") as string,
    learning_summary: formData.get("learning_summary") as string,
    notes: formData.get("notes") as string,
  };

  await supabase.from("daily_reviews").upsert(payload, { onConflict: "user_id,date" });
  // Add XP
  await supabase.from("xp_ledger").insert({ user_id: user.id, amount: 30, domain: "discipline", reason: "Daily review saved" });
  revalidatePath("/daily");
  revalidatePath("/");
}
