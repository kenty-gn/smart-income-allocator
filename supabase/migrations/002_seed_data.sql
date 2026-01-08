-- Smart Income Allocator - Seed Data
-- Run this AFTER the initial schema migration
-- This creates default categories for new users

-- ============================================
-- FUNCTION: Create default categories for user
-- ============================================
CREATE OR REPLACE FUNCTION create_default_categories(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- 固定費カテゴリ
  INSERT INTO categories (user_id, name, type, color) VALUES
    (user_uuid, '家賃', 'fixed', '#ef4444'),
    (user_uuid, '水道光熱費', 'fixed', '#f97316'),
    (user_uuid, '通信費', 'fixed', '#eab308'),
    (user_uuid, '保険', 'fixed', '#22c55e'),
    (user_uuid, 'サブスクリプション', 'fixed', '#06b6d4');
  
  -- 変動費カテゴリ
  INSERT INTO categories (user_id, name, type, target_percentage, color) VALUES
    (user_uuid, '食費', 'variable', 15, '#8b5cf6'),
    (user_uuid, '交通費', 'variable', 5, '#ec4899'),
    (user_uuid, '娯楽', 'variable', 10, '#6366f1'),
    (user_uuid, '日用品', 'variable', 5, '#14b8a6'),
    (user_uuid, 'その他', 'variable', 10, '#64748b');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Create default categories on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_categories();
