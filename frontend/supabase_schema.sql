-- Silver Union Capital — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  step_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KYC Documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('passport_photo', 'means_of_id', 'supporting_doc')),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Profiles table (approved customers)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'deactivated')),
  application_id UUID REFERENCES applications(id),
  auth_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_number TEXT UNIQUE NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'checking'
    CHECK (account_type IN ('checking', 'savings', 'investment', 'business')),
  balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  notification_type TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin Notes table
CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  admin_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  admin_email TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL,
  transaction_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  withdrawal_request_id UUID,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Withdrawal requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'verification_required' CHECK (status IN ('pending', 'verification_required', 'completed', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- Add verification code columns for withdrawal demo workflow (safe to re-run)
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS vat_code TEXT;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS tax_code TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'withdrawal_requests'
      AND constraint_name = 'withdrawal_requests_status_check'
  ) THEN
    ALTER TABLE withdrawal_requests DROP CONSTRAINT withdrawal_requests_status_check;
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END;
$$;

ALTER TABLE withdrawal_requests
  ADD CONSTRAINT withdrawal_requests_status_check
  CHECK (status IN ('pending', 'verification_required', 'completed', 'rejected'));

-- Support Conversations (for second pass)
CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  subject TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support Messages (for second pass)
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage bucket for KYC documents
-- Run this separately if needed:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);

-- Row Level Security (enable but keep permissive for service role key access)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (no policy needed — service role bypasses RLS)
-- Allow anon to INSERT applications (account opening)
CREATE POLICY "Anyone can submit application"
  ON applications FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users to read their own profile
CREATE POLICY "Users read own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

-- Allow authenticated users to read their own notifications
CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Allow authenticated users to read their own accounts
CREATE POLICY "Users read own accounts"
  ON accounts FOR SELECT TO authenticated
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );


-- Allow authenticated users to read their own transactions
CREATE POLICY "Users read own transactions"
  ON transactions FOR SELECT TO authenticated
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Allow authenticated users to read and create their own withdrawal requests
CREATE POLICY "Users read own withdrawal requests"
  ON withdrawal_requests FOR SELECT TO authenticated
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users create own withdrawal requests"
  ON withdrawal_requests FOR INSERT TO authenticated
  WITH CHECK (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );
