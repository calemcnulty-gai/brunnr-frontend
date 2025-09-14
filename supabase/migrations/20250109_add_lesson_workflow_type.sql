-- Add 'lesson' to the workflow_type enum
ALTER TYPE workflow_type ADD VALUE IF NOT EXISTS 'lesson';

-- Verify the enum values
DO $$
BEGIN
  RAISE NOTICE 'Current workflow_type enum values: %', 
    (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) 
     FROM pg_enum 
     WHERE enumtypid = 'workflow_type'::regtype);
END $$;


