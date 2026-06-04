-- Notifications table for lightweight in-app notification system
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  org_id text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  ticket_id text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_org_id_idx ON notifications (org_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications (read);
