-- Migration: Partner Integration and API Tracking System
-- Purpose: Enable comprehensive tracking for Incept integration (Sep 2025 goals)
-- Created: December 2024

-- ============================================
-- 1. PARTNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  partner_code TEXT NOT NULL UNIQUE, -- e.g., 'INCEPT'
  api_key_prefix TEXT, -- For identifying partner from API key
  lms_integration_enabled BOOLEAN DEFAULT false,
  sandbox_enabled BOOLEAN DEFAULT true,
  production_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb -- Store LMS config, roster info, etc.
);

-- ============================================
-- 2. API KEYS & SEATS MANAGEMENT
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  key_hash TEXT NOT NULL UNIQUE, -- Hashed API key
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  seat_name TEXT, -- Human-readable seat identifier
  environment TEXT CHECK (environment IN ('sandbox', 'production')) DEFAULT 'sandbox',
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  request_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes separately
CREATE INDEX idx_api_keys_partner ON api_keys (partner_id);
CREATE INDEX idx_api_keys_prefix ON api_keys (key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys (is_active, environment);

-- ============================================
-- 3. API REQUEST TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS api_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL UNIQUE, -- External request ID for partner reference
  partner_id UUID REFERENCES partners(id),
  api_key_id UUID REFERENCES api_keys(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- Request details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  
  -- Timing
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  processing_time_ms INTEGER,
  
  -- Request/Response
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT
);

-- Create indexes separately
CREATE INDEX idx_api_requests_partner ON api_requests (partner_id, requested_at DESC);
CREATE INDEX idx_api_requests_request_id ON api_requests (request_id);
CREATE INDEX idx_api_requests_timing ON api_requests (requested_at, completed_at);

-- ============================================
-- 4. VIDEO GENERATION TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS video_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT UNIQUE REFERENCES api_requests(request_id),
  partner_id UUID REFERENCES partners(id),
  api_key_id UUID REFERENCES api_keys(id),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  
  -- Generation details
  manifest JSONB NOT NULL,
  script_text TEXT,
  grade_level TEXT,
  subject TEXT,
  video_type TEXT, -- 'math', 'science', etc.
  
  -- Status tracking
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  
  -- Timing (for SLA tracking)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  script_received_at TIMESTAMPTZ, -- When script was uploaded/submitted
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  
  -- Performance metrics
  total_duration_seconds FLOAT,
  manifest_to_mp4_minutes FLOAT, -- For p95 ≤15m tracking
  script_to_completion_hours FLOAT, -- For 24h SLA tracking
  
  -- Output
  video_url TEXT,
  video_duration_seconds FLOAT,
  file_size_mb FLOAT,
  
  -- Quality metrics
  render_success BOOLEAN,
  quality_score FLOAT,
  error_details JSONB,
  retry_count INTEGER DEFAULT 0
);

-- Create indexes separately
CREATE INDEX idx_video_generations_partner ON video_generations (partner_id, created_at DESC);
CREATE INDEX idx_video_generations_status ON video_generations (status, created_at DESC);
CREATE INDEX idx_video_generations_sla ON video_generations (script_received_at, processing_completed_at);

-- ============================================
-- 5. LMS INTEGRATION TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS lms_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),
  video_generation_id UUID REFERENCES video_generations(id),
  
  -- LMS details
  lms_platform TEXT, -- 'incept', 'canvas', etc.
  course_id TEXT,
  module_id TEXT,
  
  -- Publication status
  published_at TIMESTAMPTZ,
  available_to_students BOOLEAN DEFAULT false,
  student_roster_count INTEGER,
  
  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  completion_rate FLOAT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- 6. SLA TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS sla_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),
  date DATE NOT NULL,
  
  -- Daily metrics
  total_requests INTEGER DEFAULT 0,
  successful_renders INTEGER DEFAULT 0,
  failed_renders INTEGER DEFAULT 0,
  success_rate FLOAT,
  
  -- Timing metrics
  p50_manifest_to_mp4_minutes FLOAT,
  p95_manifest_to_mp4_minutes FLOAT,
  p99_manifest_to_mp4_minutes FLOAT,
  
  -- 24h SLA metrics
  jobs_within_24h INTEGER DEFAULT 0,
  jobs_beyond_24h INTEGER DEFAULT 0,
  sla_24h_compliance_rate FLOAT,
  
  -- Seat activity
  active_seats INTEGER DEFAULT 0,
  unique_api_keys_used INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(partner_id, date)
);

-- Create index separately
CREATE INDEX idx_sla_metrics_date ON sla_metrics (partner_id, date DESC);

-- ============================================
-- 7. AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS partner_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index separately
CREATE INDEX idx_audit_log_partner ON partner_audit_log (partner_id, created_at DESC);

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to calculate SLA metrics for a date range
CREATE OR REPLACE FUNCTION calculate_sla_metrics(
  p_partner_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  date DATE,
  total_requests BIGINT,
  successful_renders BIGINT,
  success_rate FLOAT,
  p50_minutes FLOAT,
  p95_minutes FLOAT,
  within_24h_count BIGINT,
  sla_24h_rate FLOAT,
  active_seats BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT 
      DATE(vg.created_at) as gen_date,
      COUNT(*) as total_reqs,
      COUNT(*) FILTER (WHERE vg.render_success = true) as success_count,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY vg.manifest_to_mp4_minutes) as p50,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY vg.manifest_to_mp4_minutes) as p95,
      COUNT(*) FILTER (WHERE vg.script_to_completion_hours <= 24) as within_24h,
      COUNT(DISTINCT vg.api_key_id) as unique_seats
    FROM video_generations vg
    WHERE vg.partner_id = p_partner_id
      AND DATE(vg.created_at) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(vg.created_at)
  )
  SELECT 
    gen_date,
    total_reqs,
    success_count,
    CASE WHEN total_reqs > 0 THEN success_count::FLOAT / total_reqs ELSE 0 END,
    p50,
    p95,
    within_24h,
    CASE WHEN total_reqs > 0 THEN within_24h::FLOAT / total_reqs ELSE 0 END,
    unique_seats
  FROM daily_stats
  ORDER BY gen_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get active seats for a period
CREATE OR REPLACE FUNCTION get_active_seats(
  p_partner_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
) RETURNS TABLE (
  api_key_id UUID,
  seat_name TEXT,
  request_count BIGINT,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ak.id,
    ak.seat_name,
    COUNT(ar.id) as req_count,
    MAX(ar.requested_at) as last_act
  FROM api_keys ak
  LEFT JOIN api_requests ar ON ar.api_key_id = ak.id
  WHERE ak.partner_id = p_partner_id
    AND ar.requested_at BETWEEN p_start_date AND p_end_date
  GROUP BY ak.id, ak.seat_name
  HAVING COUNT(ar.id) > 0
  ORDER BY req_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. VIEWS FOR REPORTING
-- ============================================

-- Real-time partner dashboard view
CREATE OR REPLACE VIEW partner_dashboard AS
SELECT 
  p.id as partner_id,
  p.name as partner_name,
  p.partner_code,
  COUNT(DISTINCT vg.id) as total_generations,
  COUNT(DISTINCT vg.id) FILTER (WHERE vg.render_success = true) as successful_renders,
  COUNT(DISTINCT vg.id) FILTER (WHERE vg.created_at >= NOW() - INTERVAL '30 days') as last_30_days,
  COUNT(DISTINCT ak.id) FILTER (WHERE ak.last_used_at >= NOW() - INTERVAL '30 days') as active_seats_30d,
  AVG(vg.manifest_to_mp4_minutes) as avg_processing_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY vg.manifest_to_mp4_minutes) as p95_processing_time
FROM partners p
LEFT JOIN video_generations vg ON vg.partner_id = p.id
LEFT JOIN api_keys ak ON ak.partner_id = p.id
GROUP BY p.id, p.name, p.partner_code;

-- September 2025 Incept metrics view
CREATE OR REPLACE VIEW incept_september_metrics AS
WITH september_data AS (
  SELECT * FROM video_generations
  WHERE partner_id = (SELECT id FROM partners WHERE partner_code = 'INCEPT')
    AND created_at >= '2025-09-01'::DATE
    AND created_at < '2025-10-01'::DATE
)
SELECT 
  COUNT(DISTINCT request_id) as unique_requests,
  COUNT(*) FILTER (WHERE render_success = true) as successful_renders,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      (COUNT(*) FILTER (WHERE render_success = true))::FLOAT / COUNT(*) * 100
    ELSE 0 
  END as success_rate,
  COUNT(DISTINCT api_key_id) as active_seats,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY manifest_to_mp4_minutes) as p95_minutes,
  COUNT(*) FILTER (WHERE script_to_completion_hours <= 24) as within_24h_sla,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      (COUNT(*) FILTER (WHERE script_to_completion_hours <= 24))::FLOAT / COUNT(*) * 100
    ELSE 0 
  END as sla_compliance_rate,
  COUNT(*) FILTER (WHERE grade_level = '4th' AND subject = 'math') as fourth_grade_math_videos
FROM september_data;

-- ============================================
-- 10. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_metrics ENABLE ROW LEVEL SECURITY;

-- Partners can see their own data
CREATE POLICY "Partners can view own data" ON partners
  FOR SELECT USING (
    id IN (
      SELECT partner_id FROM api_keys 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Partners can view own API keys" ON api_keys
  FOR SELECT USING (
    partner_id IN (
      SELECT partner_id FROM api_keys 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Partners can view own requests" ON api_requests
  FOR SELECT USING (
    partner_id IN (
      SELECT partner_id FROM api_keys 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Partners can view own video generations" ON video_generations
  FOR SELECT USING (
    partner_id IN (
      SELECT partner_id FROM api_keys 
      WHERE user_id = auth.uid()
    )
  );

-- Admin policies (you'll need to create an admin role)
CREATE POLICY "Admins can manage all partner data" ON partners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- 11. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_video_gen_september ON video_generations(partner_id, created_at) 
  WHERE created_at >= '2025-09-01' AND created_at < '2025-10-01';

CREATE INDEX idx_api_requests_september ON api_requests(partner_id, requested_at) 
  WHERE requested_at >= '2025-09-01' AND requested_at < '2025-10-01';

-- ============================================
-- 12. TRIGGERS FOR AUTOMATED TRACKING
-- ============================================

-- Update api_keys last_used_at and request_count
CREATE OR REPLACE FUNCTION update_api_key_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE api_keys 
  SET 
    last_used_at = NEW.requested_at,
    request_count = request_count + 1
  WHERE id = NEW.api_key_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_api_key_usage
  AFTER INSERT ON api_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_api_key_usage();

-- Calculate processing times automatically
CREATE OR REPLACE FUNCTION calculate_video_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.processing_completed_at IS NOT NULL THEN
    NEW.manifest_to_mp4_minutes = 
      EXTRACT(EPOCH FROM (NEW.processing_completed_at - NEW.processing_started_at)) / 60;
    
    IF NEW.script_received_at IS NOT NULL THEN
      NEW.script_to_completion_hours = 
        EXTRACT(EPOCH FROM (NEW.processing_completed_at - NEW.script_received_at)) / 3600;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_video_metrics
  BEFORE INSERT OR UPDATE ON video_generations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_video_metrics();

-- ============================================
-- 13. INITIAL DATA
-- ============================================

-- Insert Incept as a partner
INSERT INTO partners (name, partner_code, api_key_prefix, lms_integration_enabled, metadata)
VALUES (
  'Incept', 
  'INCEPT', 
  'incept_',
  true,
  '{"lms_platform": "incept_lms", "target_grades": ["4th"], "subjects": ["math"], "roster_size": 200}'::jsonb
) ON CONFLICT (partner_code) DO NOTHING;
