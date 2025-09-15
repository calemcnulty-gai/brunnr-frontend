-- Export key usage data for grader review
-- This provides the proof elements requested

-- 1. Partners and API Keys (showing provisioned keys)
\copy (
  SELECT 
    p.partner_code,
    p.name as partner_name,
    p.production_enabled,
    p.lms_integration_enabled,
    ak.seat_name,
    ak.environment,
    ak.is_active,
    ak.request_count,
    ak.last_used_at,
    ak.created_at
  FROM partners p
  LEFT JOIN api_keys ak ON p.id = ak.partner_id
  ORDER BY p.partner_code, ak.seat_name
) TO '/tmp/partners_and_api_keys.csv' WITH CSV HEADER;

-- 2. API Requests (showing request_id and seat IDs)
\copy (
  SELECT 
    ar.request_id,
    p.partner_code,
    ak.seat_name,
    ar.endpoint,
    ar.status_code,
    ar.processing_time_ms,
    ar.requested_at,
    ar.completed_at
  FROM api_requests ar
  LEFT JOIN partners p ON ar.partner_id = p.id
  LEFT JOIN api_keys ak ON ar.api_key_id = ak.id
  WHERE ar.requested_at >= '2025-09-01'
  ORDER BY ar.requested_at DESC
) TO '/tmp/api_requests.csv' WITH CSV HEADER;

-- 3. Video Generations (showing success rates)
\copy (
  SELECT 
    vg.request_id,
    p.partner_code,
    ak.seat_name,
    vg.status,
    vg.render_success,
    vg.manifest_to_mp4_minutes,
    vg.script_to_completion_hours,
    vg.grade_level,
    vg.subject,
    vg.video_type,
    vg.created_at,
    vg.processing_completed_at
  FROM video_generations vg
  LEFT JOIN partners p ON vg.partner_id = p.id
  LEFT JOIN api_keys ak ON vg.api_key_id = ak.id
  WHERE vg.created_at >= '2025-09-01'
  ORDER BY vg.created_at DESC
) TO '/tmp/video_generations.csv' WITH CSV HEADER;

-- 4. SLA Metrics (showing p95 and SLA compliance rates)
\copy (
  SELECT 
    sm.date,
    p.partner_code,
    sm.total_requests,
    sm.successful_renders,
    sm.success_rate,
    sm.p50_manifest_to_mp4_minutes,
    sm.p95_manifest_to_mp4_minutes,
    sm.p99_manifest_to_mp4_minutes,
    sm.jobs_within_24h,
    sm.jobs_beyond_24h,
    sm.sla_24h_compliance_rate,
    sm.active_seats,
    sm.unique_api_keys_used
  FROM sla_metrics sm
  LEFT JOIN partners p ON sm.partner_id = p.id
  WHERE sm.date >= '2025-09-01'
  ORDER BY sm.date DESC, p.partner_code
) TO '/tmp/sla_metrics.csv' WITH CSV HEADER;

-- 5. Manifest Templates (showing preloaded content)
\copy (
  SELECT 
    video_id,
    title,
    description,
    content_kind,
    subject,
    grade_level,
    recipe,
    visual_intent,
    is_active,
    created_at
  FROM manifest_templates
  WHERE is_active = true
  ORDER BY subject, grade_level, content_kind
) TO '/tmp/manifest_templates.csv' WITH CSV HEADER;
