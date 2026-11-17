-- ========================================================================
-- PREEDHAR TECHNICAL SERVICES CO. L.L.C. (DUBAI, UAE)
-- Migration: WCR Photos & Audit Logs Tables and RBAC Policies
-- Phase 12 & 14: Storage Architecture & Security Matrix
-- ========================================================================

-- 1. WCR Photo Attachments Table
CREATE TABLE IF NOT EXISTS public.wcr_photos (
  id TEXT PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.work_completion_reports(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  file_size BIGINT NOT NULL DEFAULT 0,
  caption TEXT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_wcr_photos_report_id ON public.wcr_photos(report_id);
CREATE INDEX IF NOT EXISTS idx_wcr_photos_uploaded_by ON public.wcr_photos(uploaded_by);

-- 2. Audit Logs Table (Append-Only Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL DEFAULT 'STAFF',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- 3. Storage Bucket Configuration (Private - 10MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wcr-photos',
  'wcr-photos',
  FALSE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.wcr_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function for Role Checks (ADMIN & MANAGER)
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('ADMIN', 'MANAGER')
  );
$$;

-- 6. WCR Photos RLS Policies
-- SELECT: All authenticated roles (ADMIN, MANAGER, STAFF) can view WCR photos
CREATE POLICY "wcr_photos_select_auth"
  ON public.wcr_photos FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Authenticated users can upload photos
CREATE POLICY "wcr_photos_insert_auth"
  ON public.wcr_photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Photo uploader or ADMIN / MANAGER can update caption / metadata
CREATE POLICY "wcr_photos_update_owner_or_admin"
  ON public.wcr_photos FOR UPDATE
  TO authenticated
  USING (
    public.is_admin_or_manager()
    OR uploaded_by = (auth.jwt() ->> 'email')
    OR uploaded_by = auth.uid()::text
  )
  WITH CHECK (
    public.is_admin_or_manager()
    OR uploaded_by = (auth.jwt() ->> 'email')
    OR uploaded_by = auth.uid()::text
  );

-- DELETE: Restricted to ADMIN, MANAGER, or original uploader
CREATE POLICY "wcr_photos_delete_owner_or_admin"
  ON public.wcr_photos FOR DELETE
  TO authenticated
  USING (
    public.is_admin_or_manager()
    OR uploaded_by = (auth.jwt() ->> 'email')
    OR uploaded_by = auth.uid()::text
  );

-- 7. Audit Logs RLS Policies
-- INSERT: Authenticated users insert audit events during transactional workflows
CREATE POLICY "audit_logs_insert_auth"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- SELECT: Restricted to ADMIN and MANAGER roles (STAFF access denied per Phase 14 RBAC)
CREATE POLICY "audit_logs_select_admin_manager"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin_or_manager());

-- NOTE: No UPDATE or DELETE policies are created for audit_logs to guarantee append-only immutability.

-- 8. Storage Object Policies for wcr-photos bucket
-- SELECT: Authenticated users can download/view photos
CREATE POLICY "wcr_storage_select_auth"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'wcr-photos');

-- INSERT: Authenticated users can upload photos to wcr-photos bucket
CREATE POLICY "wcr_storage_insert_auth"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'wcr-photos');

-- DELETE: Restricted to ADMIN and MANAGER roles
CREATE POLICY "wcr_storage_delete_admin_manager"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'wcr-photos'
    AND public.is_admin_or_manager()
  );
