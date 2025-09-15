-- Migration: Add Video Views Tracking Table
-- Purpose: Track unique video views, watch time, and engagement metrics
-- Created: September 2025

-- ============================================
-- 1. VIDEO VIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Video identification
  video_url TEXT NOT NULL,
  video_id TEXT, -- Extracted from URL or metadata
  request_id TEXT, -- Links to video_generations table
  
  -- User identification
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- For anonymous users
  ip_address INET,
  user_agent TEXT,
  
  -- Partner tracking
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  
  -- View details
  view_started_at TIMESTAMPTZ DEFAULT NOW(),
  view_ended_at TIMESTAMPTZ,
  watch_duration_seconds FLOAT, -- How long they actually watched
  video_duration_seconds FLOAT, -- Total video length
  completion_percentage FLOAT, -- watch_duration / video_duration * 100
  
  -- Engagement metrics
  is_complete_view BOOLEAN DEFAULT false, -- Watched >90%
  max_progress_seconds FLOAT, -- Furthest point reached
  replay_count INTEGER DEFAULT 0, -- Times they replayed sections
  
  -- Context
  referrer TEXT, -- Where they came from
  platform TEXT, -- web, mobile, etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_video_views_video_url ON video_views (video_url, view_started_at DESC);
CREATE INDEX idx_video_views_user ON video_views (user_id, view_started_at DESC);
CREATE INDEX idx_video_views_partner ON video_views (partner_id, view_started_at DESC);
CREATE INDEX idx_video_views_session ON video_views (session_id, view_started_at DESC);
CREATE INDEX idx_video_views_request_id ON video_views (request_id);
CREATE INDEX idx_video_views_completion ON video_views (completion_percentage DESC);

-- ============================================
-- 2. VIDEO ANALYTICS SUMMARY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Video identification
  video_url TEXT NOT NULL UNIQUE,
  video_id TEXT,
  request_id TEXT,
  
  -- Aggregated metrics
  total_views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  
  -- Engagement metrics
  avg_watch_duration_seconds FLOAT,
  avg_completion_percentage FLOAT,
  complete_views INTEGER DEFAULT 0, -- Views >90%
  bounce_rate FLOAT, -- Views <10%
  
  -- Time-based metrics
  peak_concurrent_viewers INTEGER DEFAULT 0,
  first_view_at TIMESTAMPTZ,
  last_view_at TIMESTAMPTZ,
  
  -- Partner metrics
  partner_views INTEGER DEFAULT 0,
  student_views INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_video_analytics_video_url ON video_analytics (video_url);
CREATE INDEX idx_video_analytics_request_id ON video_analytics (request_id);
CREATE INDEX idx_video_analytics_views ON video_analytics (total_views DESC);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view their own video views
CREATE POLICY "Users can view own video views" ON video_views
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all video views
CREATE POLICY "Admins can view all video views" ON video_views
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Partners can view video views for their content
CREATE POLICY "Partners can view own video views" ON video_views
  FOR SELECT USING (
    partner_id IN (
      SELECT partner_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Video analytics are viewable by admins and content owners
CREATE POLICY "Admins can view all video analytics" ON video_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 4. FUNCTIONS FOR ANALYTICS
-- ============================================

-- Function to update video analytics when views are added
CREATE OR REPLACE FUNCTION update_video_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert video analytics
  INSERT INTO video_analytics (
    video_url,
    video_id,
    request_id,
    total_views,
    unique_viewers,
    unique_sessions,
    avg_watch_duration_seconds,
    avg_completion_percentage,
    complete_views,
    first_view_at,
    last_view_at,
    updated_at
  )
  SELECT 
    NEW.video_url,
    NEW.video_id,
    NEW.request_id,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_viewers,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(watch_duration_seconds) as avg_watch_duration,
    AVG(completion_percentage) as avg_completion,
    COUNT(*) FILTER (WHERE completion_percentage >= 90) as complete_views,
    MIN(view_started_at) as first_view,
    MAX(view_started_at) as last_view,
    NOW()
  FROM video_views 
  WHERE video_url = NEW.video_url
  GROUP BY video_url
  ON CONFLICT (video_url) 
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_viewers = EXCLUDED.unique_viewers,
    unique_sessions = EXCLUDED.unique_sessions,
    avg_watch_duration_seconds = EXCLUDED.avg_watch_duration_seconds,
    avg_completion_percentage = EXCLUDED.avg_completion_percentage,
    complete_views = EXCLUDED.complete_views,
    last_view_at = EXCLUDED.last_view_at,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics when views are added/updated
CREATE TRIGGER trigger_update_video_analytics
  AFTER INSERT OR UPDATE ON video_views
  FOR EACH ROW
  EXECUTE FUNCTION update_video_analytics();

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to get video analytics for a specific video
CREATE OR REPLACE FUNCTION get_video_analytics(p_video_url TEXT)
RETURNS TABLE (
  video_url TEXT,
  total_views INTEGER,
  unique_viewers INTEGER,
  avg_completion_percentage FLOAT,
  complete_views INTEGER,
  bounce_rate FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    va.video_url,
    va.total_views,
    va.unique_viewers,
    va.avg_completion_percentage,
    va.complete_views,
    (COUNT(*) FILTER (WHERE vv.completion_percentage < 10)::FLOAT / COUNT(*) * 100) as bounce_rate
  FROM video_analytics va
  LEFT JOIN video_views vv ON va.video_url = vv.video_url
  WHERE va.video_url = p_video_url
  GROUP BY va.video_url, va.total_views, va.unique_viewers, va.avg_completion_percentage, va.complete_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
