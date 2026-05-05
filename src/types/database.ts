// Auto-generated types matching Supabase schema
// Update this file when schema changes

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users_profile: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          country: string | null;
          timezone: string | null;
          primary_currency: string;
          target_capital_usd: number;
          target_date: string;
          current_phase: number;
          identity: string | null;
          goal: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users_profile']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users_profile']['Insert']>;
      };
      daily_reviews: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          morning_intention: string | null;
          top_priority_1: string | null;
          top_priority_2: string | null;
          top_priority_3: string | null;
          minimum_viable_day: string | null;
          action_trading: string | null;
          action_ecom: string | null;
          action_money: string | null;
          action_learning: string | null;
          risk_of_day: string | null;
          non_negotiable_rule: string | null;
          energy: number | null;
          focus: number | null;
          mood: string | null;
          sleep_hours: number | null;
          deep_work_hours: number | null;
          sport_done: boolean;
          daily_score: number | null;
          main_win: string | null;
          tasks_done: string | null;
          main_mistake: string | null;
          lesson: string | null;
          improvement: string | null;
          tomorrow_priority: string | null;
          trading_summary: string | null;
          ecom_summary: string | null;
          money_summary: string | null;
          learning_summary: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['daily_reviews']['Insert']>;
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['habits']['Insert']>;
      };
      habit_logs: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          date: string;
        };
        Insert: Omit<Database['public']['Tables']['habit_logs']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['habit_logs']['Insert']>;
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          symbol: string | null;
          market: string | null;
          session: string | null;
          direction: 'long' | 'short' | null;
          setup: string | null;
          timeframe: string | null;
          entry: number | null;
          stop_loss: number | null;
          take_profit: number | null;
          risk_percent: number | null;
          risk_amount: number | null;
          result_r: number | null;
          result_amount: number | null;
          fees: number;
          plan_respected: boolean | null;
          setup_quality: number | null;
          execution_quality: number | null;
          emotion_before: string | null;
          emotion_during: string | null;
          emotion_after: string | null;
          mistake_type: string | null;
          market_context: string | null;
          news_event: string | null;
          screenshot_before_url: string | null;
          screenshot_after_url: string | null;
          notes: string | null;
          tags: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trades']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['trades']['Insert']>;
      };
      backtests: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          strategy_name: string;
          setup: string | null;
          market: string | null;
          timeframe: string | null;
          period_start: string | null;
          period_end: string | null;
          sample_size: number | null;
          wins: number | null;
          losses: number | null;
          breakeven: number;
          winrate: number | null;
          avg_r: number | null;
          profit_factor: number | null;
          max_drawdown: number | null;
          conclusion: string | null;
          decision: 'testing' | 'forward_test' | 'validated' | 'improve' | 'abandon' | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['backtests']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['backtests']['Insert']>;
      };
      prop_challenges: {
        Row: {
          id: string;
          user_id: string;
          prop_firm: string;
          account_size: number;
          phase: string;
          status: 'active' | 'passed' | 'failed' | 'funded';
          profit_target: number | null;
          max_daily_loss: number | null;
          max_total_loss: number | null;
          current_equity: number | null;
          start_date: string | null;
          deadline: string | null;
          rules: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prop_challenges']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['prop_challenges']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          niche: string | null;
          problem_solved: string | null;
          customer_avatar: string | null;
          pain_level: number | null;
          wow_factor: number | null;
          viral_potential: number | null;
          competition_level: number | null;
          differentiation_score: number | null;
          marketing_angle: string | null;
          selling_price: number | null;
          cogs: number | null;
          shipping_cost: number | null;
          gross_margin: number | null;
          breakeven_cpa: number | null;
          target_cpa: number | null;
          product_score: number | null;
          status: 'research' | 'testing' | 'winner' | 'killed' | 'paused';
          decision: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      money_snapshots: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          cash_aud: number;
          cash_usd: number;
          cash_eur: number;
          trading_capital: number;
          emergency_fund: number;
          ecom_budget: number;
          investments: number;
          debts: number;
          total_networth_usd: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['money_snapshots']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['money_snapshots']['Insert']>;
      };
      income_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          source: string;
          category: string;
          amount: number;
          currency: string;
          recurring: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['income_entries']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['income_entries']['Insert']>;
      };
      expense_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          category: string;
          amount: number;
          currency: string;
          recurring: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expense_entries']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['expense_entries']['Insert']>;
      };
      decisions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          domain: string | null;
          decision: string;
          context: string | null;
          options_considered: string | null;
          reason: string | null;
          confidence_score: number | null;
          risk_level: 'low' | 'medium' | 'high' | 'critical' | null;
          expected_upside: string | null;
          expected_downside: string | null;
          cost: number | null;
          review_date: string | null;
          outcome: string | null;
          final_score: number | null;
          lesson: string | null;
          bias_detected: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['decisions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['decisions']['Insert']>;
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          week_end: string;
          global_score: number | null;
          trading_score: number | null;
          ecom_score: number | null;
          money_score: number | null;
          learning_score: number | null;
          health_score: number | null;
          trades_count: number;
          trading_pnl: number;
          plan_respected: number | null;
          trading_notes: string | null;
          ecom_revenue: number;
          products_tested: number;
          ecom_notes: string | null;
          wins: string | null;
          losses: string | null;
          what_worked: string | null;
          what_failed: string | null;
          what_to_delete: string | null;
          what_to_double: string | null;
          next_week_obj_1: string | null;
          next_week_obj_2: string | null;
          next_week_obj_3: string | null;
          big_move: string | null;
          main_risk: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['weekly_reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['weekly_reviews']['Insert']>;
      };
      war_modes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          goal: string | null;
          domain: string | null;
          start_date: string;
          end_date: string | null;
          active: boolean;
          rules: string | null;
          forbidden_actions: string | null;
          required_daily_actions: string | null;
          reward: string | null;
          penalty: string | null;
          final_report: string | null;
          completion_pct: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['war_modes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['war_modes']['Insert']>;
      };
    };
  };
}

// ── CONVENIENCE TYPES ──────────────────────────────────────
export type Profile = Database['public']['Tables']['users_profile']['Row'];
export type DailyReview = Database['public']['Tables']['daily_reviews']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
export type Trade = Database['public']['Tables']['trades']['Row'];
export type Backtest = Database['public']['Tables']['backtests']['Row'];
export type PropChallenge = Database['public']['Tables']['prop_challenges']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type MoneySnapshot = Database['public']['Tables']['money_snapshots']['Row'];
export type IncomeEntry = Database['public']['Tables']['income_entries']['Row'];
export type ExpenseEntry = Database['public']['Tables']['expense_entries']['Row'];
export type Decision = Database['public']['Tables']['decisions']['Row'];
export type WeeklyReview = Database['public']['Tables']['weekly_reviews']['Row'];
export type WarMode = Database['public']['Tables']['war_modes']['Row'];

// ── TRADING STATS (computed) ────────────────────────────────
export interface TradingStats {
  total: number;
  wins: number;
  losses: number;
  winrate: number;
  profitFactor: number;
  expectancy: number;
  totalPnL: number;
  avgWin: number;
  avgLoss: number;
  topMistake: string | null;
  planRespectedRate: number;
}

// ── AI MODES ───────────────────────────────────────────────
export type AIMode = 'brief' | 'audit' | 'trading' | 'ecom' | 'money' | 'weekly' | 'decision' | 'roadmap';
