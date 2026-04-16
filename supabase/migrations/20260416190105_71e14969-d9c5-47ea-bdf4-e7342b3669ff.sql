-- Schedule tasks table for cross-device sync of auto-publish plan + execution history
CREATE TABLE IF NOT EXISTS public.schedule_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL DEFAULT 'default',
  user_id text,
  -- Config snapshot (one row per device represents current plan if kind='config')
  kind text NOT NULL DEFAULT 'config', -- 'config' | 'log'
  -- Config fields (used when kind='config')
  enabled boolean NOT NULL DEFAULT false,
  frequency text NOT NULL DEFAULT 'daily',
  days_of_week integer[] NOT NULL DEFAULT '{1,3,5}',
  platforms text[] NOT NULL DEFAULT '{xiaohongshu}',
  topics text[] NOT NULL DEFAULT '{}',
  style text NOT NULL DEFAULT '',
  posts_per_day integer NOT NULL DEFAULT 1,
  scheduled_times text[] NOT NULL DEFAULT '{09:00}',
  -- Log fields (used when kind='log')
  log_topic text,
  log_platform text,
  log_status text,             -- 'success' | 'error' | 'pending'
  log_content_id text,
  log_error text,
  log_timestamp timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_device_kind ON public.schedule_tasks(device_id, kind);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_log_ts ON public.schedule_tasks(device_id, kind, log_timestamp DESC) WHERE kind = 'log';

-- Only one config row per device
CREATE UNIQUE INDEX IF NOT EXISTS uniq_schedule_tasks_device_config
  ON public.schedule_tasks(device_id) WHERE kind = 'config';

-- updated_at trigger (reuse existing set_updated_at)
DROP TRIGGER IF EXISTS trg_schedule_tasks_updated_at ON public.schedule_tasks;
CREATE TRIGGER trg_schedule_tasks_updated_at
BEFORE UPDATE ON public.schedule_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS (consistent with other tables: open access for now, device_id scopes data)
ALTER TABLE public.schedule_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to schedule_tasks"
  ON public.schedule_tasks FOR ALL
  USING (true) WITH CHECK (true);

-- Enable realtime for cross-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_tasks;