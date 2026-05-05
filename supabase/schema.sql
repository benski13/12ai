-- ============================================================
-- LIFE OS V15 — Supabase Schema
-- Run this in Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS PROFILE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users_profile (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name            TEXT DEFAULT 'Benjamin',
  country         TEXT DEFAULT 'Australie',
  timezone        TEXT DEFAULT 'AEDT',
  primary_currency TEXT DEFAULT 'USD',
  target_capital_usd NUMERIC DEFAULT 68000,
  target_date     DATE DEFAULT '2028-03-01',
  current_phase   INTEGER DEFAULT 1,
  identity        TEXT DEFAULT 'Trader / Builder / Operator',
  goal            TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── DAILY REVIEWS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_reviews (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Morning
  morning_intention TEXT,
  top_priority_1  TEXT,
  top_priority_2  TEXT,
  top_priority_3  TEXT,
  minimum_viable_day TEXT,
  action_trading  TEXT,
  action_ecom     TEXT,
  action_money    TEXT,
  action_learning TEXT,
  risk_of_day     TEXT,
  non_negotiable_rule TEXT,
  -- Evening
  energy          INTEGER CHECK (energy BETWEEN 1 AND 10),
  focus           INTEGER CHECK (focus BETWEEN 1 AND 10),
  mood            TEXT,
  sleep_hours     NUMERIC,
  deep_work_hours NUMERIC,
  sport_done      BOOLEAN DEFAULT FALSE,
  daily_score     INTEGER CHECK (daily_score BETWEEN 0 AND 100),
  main_win        TEXT,
  tasks_done      TEXT,
  main_mistake    TEXT,
  lesson          TEXT,
  improvement     TEXT,
  tomorrow_priority TEXT,
  trading_summary TEXT,
  ecom_summary    TEXT,
  money_summary   TEXT,
  learning_summary TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ── HABITS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  category        TEXT DEFAULT 'other' CHECK (category IN ('health','money','trading','ecom','learning','discipline','other')),
  active          BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── HABIT LOGS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_logs (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id        UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, habit_id, date)
);

-- ── TRADES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trades (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  symbol          TEXT,
  market          TEXT,
  session         TEXT,
  direction       TEXT CHECK (direction IN ('long', 'short')),
  setup           TEXT,
  timeframe       TEXT,
  entry           NUMERIC,
  stop_loss       NUMERIC,
  take_profit     NUMERIC,
  risk_percent    NUMERIC,
  risk_amount     NUMERIC,
  result_r        NUMERIC,
  result_amount   NUMERIC,
  fees            NUMERIC DEFAULT 0,
  plan_respected  BOOLEAN,
  setup_quality   INTEGER CHECK (setup_quality BETWEEN 1 AND 10),
  execution_quality INTEGER CHECK (execution_quality BETWEEN 1 AND 10),
  emotion_before  TEXT,
  emotion_during  TEXT,
  emotion_after   TEXT,
  mistake_type    TEXT,
  market_context  TEXT,
  news_event      TEXT,
  screenshot_before_url TEXT,
  screenshot_after_url  TEXT,
  notes           TEXT,
  tags            TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── TRADING PLAN ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trading_plan (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  strategy        TEXT,
  markets         TEXT,
  sessions        TEXT,
  risk_per_trade  NUMERIC DEFAULT 1,
  max_daily_loss  NUMERIC,
  max_weekly_loss NUMERIC,
  setup_a         TEXT,
  setup_b         TEXT,
  setup_c         TEXT,
  no_trade_conditions TEXT,
  pre_market_checklist TEXT,
  post_trade_checklist TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── BACKTESTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS backtests (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date            DATE DEFAULT CURRENT_DATE,
  strategy_name   TEXT NOT NULL,
  setup           TEXT,
  market          TEXT,
  timeframe       TEXT,
  period_start    DATE,
  period_end      DATE,
  sample_size     INTEGER,
  wins            INTEGER,
  losses          INTEGER,
  breakeven       INTEGER DEFAULT 0,
  winrate         NUMERIC,
  avg_r           NUMERIC,
  profit_factor   NUMERIC,
  max_drawdown    NUMERIC,
  conclusion      TEXT,
  decision        TEXT CHECK (decision IN ('testing','forward_test','validated','improve','abandon')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROP CHALLENGES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prop_challenges (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prop_firm       TEXT NOT NULL,
  account_size    NUMERIC NOT NULL,
  phase           TEXT DEFAULT '1',
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','passed','failed','funded')),
  profit_target   NUMERIC,
  max_daily_loss  NUMERIC,
  max_total_loss  NUMERIC,
  current_equity  NUMERIC,
  start_date      DATE,
  deadline        DATE,
  rules           TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROP UPDATES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prop_updates (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id    UUID REFERENCES prop_challenges(id) ON DELETE CASCADE NOT NULL,
  date            DATE DEFAULT CURRENT_DATE,
  equity          NUMERIC NOT NULL,
  pnl             NUMERIC,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROP PAYOUTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prop_payouts (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id    UUID REFERENCES prop_challenges(id) ON DELETE SET NULL,
  date            DATE DEFAULT CURRENT_DATE,
  amount          NUMERIC NOT NULL,
  status          TEXT DEFAULT 'received' CHECK (status IN ('received','pending')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRODUCTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  niche           TEXT,
  problem_solved  TEXT,
  customer_avatar TEXT,
  pain_level      INTEGER CHECK (pain_level BETWEEN 1 AND 10),
  wow_factor      INTEGER CHECK (wow_factor BETWEEN 1 AND 10),
  viral_potential INTEGER CHECK (viral_potential BETWEEN 1 AND 10),
  competition_level INTEGER CHECK (competition_level BETWEEN 1 AND 10),
  differentiation_score INTEGER CHECK (differentiation_score BETWEEN 1 AND 10),
  marketing_angle TEXT,
  selling_price   NUMERIC,
  cogs            NUMERIC,
  shipping_cost   NUMERIC,
  gross_margin    NUMERIC,
  breakeven_cpa   NUMERIC,
  target_cpa      NUMERIC,
  product_score   INTEGER CHECK (product_score BETWEEN 0 AND 100),
  status          TEXT DEFAULT 'research' CHECK (status IN ('research','testing','winner','killed','paused')),
  decision        TEXT,
  supplier_notes  TEXT,
  notes           TEXT,
  links           TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUPPLIERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  country         TEXT,
  contact         TEXT,
  platform        TEXT,
  moq             INTEGER,
  unit_price      NUMERIC,
  shipping_time   TEXT,
  sample_ordered  BOOLEAN DEFAULT FALSE,
  reliability_score INTEGER CHECK (reliability_score BETWEEN 1 AND 10),
  quality_score   INTEGER CHECK (quality_score BETWEEN 1 AND 10),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── CREATIVES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creatives (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  hook            TEXT,
  angle           TEXT,
  script          TEXT,
  format          TEXT,
  platform        TEXT,
  status          TEXT DEFAULT 'testing' CHECK (status IN ('testing','winner','killed','paused')),
  ctr             NUMERIC,
  cpa             NUMERIC,
  roas            NUMERIC,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── CAMPAIGNS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  platform        TEXT,
  country         TEXT,
  budget          NUMERIC,
  spend           NUMERIC DEFAULT 0,
  impressions     INTEGER DEFAULT 0,
  clicks          INTEGER DEFAULT 0,
  ctr             NUMERIC,
  cpc             NUMERIC,
  cpm             NUMERIC,
  purchases       INTEGER DEFAULT 0,
  cpa             NUMERIC,
  revenue         NUMERIC DEFAULT 0,
  roas            NUMERIC,
  profit          NUMERIC,
  decision        TEXT CHECK (decision IN ('testing','scale','kill','iterate','paused')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── MONEY SNAPSHOTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS money_snapshots (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  cash_aud        NUMERIC DEFAULT 0,
  cash_usd        NUMERIC DEFAULT 0,
  cash_eur        NUMERIC DEFAULT 0,
  trading_capital NUMERIC DEFAULT 0,
  emergency_fund  NUMERIC DEFAULT 0,
  ecom_budget     NUMERIC DEFAULT 0,
  investments     NUMERIC DEFAULT 0,
  debts           NUMERIC DEFAULT 0,
  total_networth_usd NUMERIC DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── INCOME ENTRIES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS income_entries (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  source          TEXT NOT NULL,
  category        TEXT DEFAULT 'other',
  amount          NUMERIC NOT NULL,
  currency        TEXT DEFAULT 'USD',
  recurring       BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── EXPENSE ENTRIES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_entries (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  category        TEXT NOT NULL,
  amount          NUMERIC NOT NULL,
  currency        TEXT DEFAULT 'USD',
  recurring       BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── ALLOCATION ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS allocation (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  cash_aud        NUMERIC DEFAULT 0,
  cash_usd        NUMERIC DEFAULT 0,
  trading         NUMERIC DEFAULT 0,
  ecom            NUMERIC DEFAULT 0,
  investments     NUMERIC DEFAULT 0,
  emergency       NUMERIC DEFAULT 0,
  education       NUMERIC DEFAULT 0,
  debts           NUMERIC DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── LEARNING RESOURCES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_resources (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  category        TEXT DEFAULT 'other' CHECK (category IN ('trading','ecom','finance','mindset','productivity','ai','marketing','sales','legal','health','other')),
  type            TEXT DEFAULT 'book' CHECK (type IN ('book','course','video','pdf','mentor','article','podcast','other')),
  status          TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
  priority        INTEGER CHECK (priority BETWEEN 1 AND 5),
  progress        INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  start_date      DATE,
  end_date        DATE,
  key_concepts    TEXT,
  actions_to_apply TEXT,
  impact_score    INTEGER CHECK (impact_score BETWEEN 1 AND 10),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── DECISIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decisions (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  domain          TEXT,
  decision        TEXT NOT NULL,
  context         TEXT,
  options_considered TEXT,
  reason          TEXT,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 10),
  risk_level      TEXT CHECK (risk_level IN ('low','medium','high','critical')),
  expected_upside TEXT,
  expected_downside TEXT,
  cost            NUMERIC,
  review_date     DATE,
  outcome         TEXT,
  final_score     INTEGER CHECK (final_score BETWEEN 1 AND 10),
  lesson          TEXT,
  bias_detected   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── WEEKLY REVIEWS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start      DATE NOT NULL,
  week_end        DATE NOT NULL,
  global_score    INTEGER CHECK (global_score BETWEEN 0 AND 10),
  trading_score   INTEGER CHECK (trading_score BETWEEN 0 AND 10),
  ecom_score      INTEGER CHECK (ecom_score BETWEEN 0 AND 10),
  money_score     INTEGER CHECK (money_score BETWEEN 0 AND 10),
  learning_score  INTEGER CHECK (learning_score BETWEEN 0 AND 10),
  health_score    INTEGER CHECK (health_score BETWEEN 0 AND 10),
  -- Trading
  trades_count    INTEGER DEFAULT 0,
  trading_pnl     NUMERIC DEFAULT 0,
  plan_respected  INTEGER CHECK (plan_respected BETWEEN 0 AND 10),
  trading_notes   TEXT,
  -- Ecom
  ecom_revenue    NUMERIC DEFAULT 0,
  products_tested INTEGER DEFAULT 0,
  ecom_notes      TEXT,
  -- Review content
  wins            TEXT,
  losses          TEXT,
  what_worked     TEXT,
  what_failed     TEXT,
  what_to_delete  TEXT,
  what_to_double  TEXT,
  next_week_obj_1 TEXT,
  next_week_obj_2 TEXT,
  next_week_obj_3 TEXT,
  big_move        TEXT,
  main_risk       TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- ── ROADMAP MILESTONES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  phase           INTEGER DEFAULT 1,
  target_date     DATE,
  target_amount   NUMERIC,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','failed')),
  progress        INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── WAR MODES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS war_modes (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  goal            TEXT,
  domain          TEXT,
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date        DATE,
  active          BOOLEAN DEFAULT TRUE,
  rules           TEXT,
  forbidden_actions TEXT,
  required_daily_actions TEXT,
  reward          TEXT,
  penalty         TEXT,
  final_report    TEXT,
  completion_pct  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── WAR LOGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS war_logs (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  war_mode_id     UUID REFERENCES war_modes(id) ON DELETE CASCADE NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  completed       BOOLEAN DEFAULT FALSE,
  score           INTEGER CHECK (score BETWEEN 0 AND 100),
  notes           TEXT,
  UNIQUE(user_id, war_mode_id, date)
);

-- ── AI LOGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_logs (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module          TEXT,
  mode            TEXT,
  prompt_preview  TEXT,
  response_preview TEXT,
  tokens_used     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── XP LEDGER ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS xp_ledger (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount          INTEGER NOT NULL,
  domain          TEXT DEFAULT 'discipline',
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_daily_reviews_user_date ON daily_reviews(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_date ON trades(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_setup ON trades(user_id, setup);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_money_snapshots_user_date ON money_snapshots(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expense_user_date ON expense_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_products_user_status ON products(user_id, status);
CREATE INDEX IF NOT EXISTS idx_decisions_user_date ON decisions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_user_week ON weekly_reviews(user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_ledger(user_id, created_at DESC);

-- ── UPDATED_AT TRIGGER ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profile_updated BEFORE UPDATE ON users_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_learning_updated BEFORE UPDATE ON learning_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── AUTO-CREATE PROFILE ON SIGNUP ─────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profile (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Benjamin'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
