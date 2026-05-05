-- ============================================================
-- LIFE OS V15 — Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================================

-- ── ENABLE RLS ─────────────────────────────────────────────
ALTER TABLE users_profile        ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits               ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades               ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_plan         ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtests            ENABLE ROW LEVEL SECURITY;
ALTER TABLE prop_challenges      ENABLE ROW LEVEL SECURITY;
ALTER TABLE prop_updates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE prop_payouts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives            ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns            ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_snapshots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation           ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources   ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_milestones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE war_modes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE war_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_ledger            ENABLE ROW LEVEL SECURITY;

-- ── HELPER MACRO ───────────────────────────────────────────
-- All policies follow the same pattern: user can only see/modify their own rows.
-- Format: "table_name_action" policy

-- ── USERS PROFILE ──────────────────────────────────────────
CREATE POLICY "profile_all" ON users_profile FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── DAILY REVIEWS ──────────────────────────────────────────
CREATE POLICY "daily_reviews_all" ON daily_reviews FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── HABITS ─────────────────────────────────────────────────
CREATE POLICY "habits_all" ON habits FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── HABIT LOGS ─────────────────────────────────────────────
CREATE POLICY "habit_logs_all" ON habit_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── TRADES ─────────────────────────────────────────────────
CREATE POLICY "trades_all" ON trades FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── TRADING PLAN ───────────────────────────────────────────
CREATE POLICY "trading_plan_all" ON trading_plan FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── BACKTESTS ──────────────────────────────────────────────
CREATE POLICY "backtests_all" ON backtests FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── PROP CHALLENGES ────────────────────────────────────────
CREATE POLICY "prop_challenges_all" ON prop_challenges FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prop_updates_all" ON prop_updates FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prop_payouts_all" ON prop_payouts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── E-COMMERCE ─────────────────────────────────────────────
CREATE POLICY "products_all" ON products FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "suppliers_all" ON suppliers FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "creatives_all" ON creatives FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "campaigns_all" ON campaigns FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── MONEY ──────────────────────────────────────────────────
CREATE POLICY "money_snapshots_all" ON money_snapshots FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "income_all" ON income_entries FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_all" ON expense_entries FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allocation_all" ON allocation FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── LEARNING ───────────────────────────────────────────────
CREATE POLICY "learning_all" ON learning_resources FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── DECISIONS ──────────────────────────────────────────────
CREATE POLICY "decisions_all" ON decisions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── WEEKLY REVIEWS ─────────────────────────────────────────
CREATE POLICY "weekly_reviews_all" ON weekly_reviews FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── ROADMAP ────────────────────────────────────────────────
CREATE POLICY "milestones_all" ON roadmap_milestones FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── WAR MODE ───────────────────────────────────────────────
CREATE POLICY "war_modes_all" ON war_modes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "war_logs_all" ON war_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── AI LOGS ────────────────────────────────────────────────
CREATE POLICY "ai_logs_all" ON ai_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── XP LEDGER ──────────────────────────────────────────────
CREATE POLICY "xp_ledger_all" ON xp_ledger FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── STORAGE BUCKET (run in Dashboard > Storage) ────────────
-- Create bucket "lifeos-assets" with public=false
-- Policy: authenticated users can read/write their own folder
-- INSERT INTO storage.buckets (id, name, public) VALUES ('lifeos-assets', 'lifeos-assets', false);
