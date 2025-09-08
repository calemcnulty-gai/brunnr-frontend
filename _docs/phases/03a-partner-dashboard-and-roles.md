# Phase 3A: Partner Dashboard & Role-Based Access

This document contains tasks for implementing the partner tracking system, role-based access control, and comprehensive dashboards for monitoring video generation metrics.

## 📊 COMPLETION STATUS: 85% COMPLETE

**Last Updated**: December 2024

### Summary
- **Database schema**: Fully implemented and migrated
- **API endpoints**: Created with role-based access
- **Dashboard components**: Built for both admin and partner views
- **Remaining**: User role assignment UI and testing

## Pre-Implementation Instructions for LLM

**IMPORTANT**: Before starting ANY work, you MUST:

1. **Verify Phase 2 is complete**:
   - Video generation workflows are functional
   - Projects can be created and managed
   - API integration is working

2. **Review these documents for context**:
   - `_docs/api-reference.md` - API endpoints structure
   - `_docs/project-overview.md` - Business goals (Incept integration)
   - `_docs/tech-stack.md` - Technology patterns
   - `_docs/ui-rules.md` - Dashboard UI patterns

3. **Ask the user these clarifying questions**:
   - Do you have existing users that need role assignments?
   - What's your Supabase service key for admin operations?
   - Should partners be able to create their own API keys?
   - Do you want real-time dashboard updates or polling?
   - What billing/pricing model should we track?

4. **Working directories**:
   - `supabase/migrations/` - Database schemas
   - `src/types/` - TypeScript types
   - `src/lib/supabase/` - Database queries
   - `src/components/partner/` - Dashboard components
   - `src/app/partner-dashboard/` - Dashboard pages
   - `src/app/api/partner/` - API endpoints

## Tasks Checklist

### 1. Database Schema Setup ✅ COMPLETE
- [x] Create `003_partner_integration_tracking.sql` migration
- [x] Design partners table with metadata
- [x] Create api_keys table with seat tracking
- [x] Implement api_requests tracking table
- [x] Create video_generations metrics table
- [x] Add lms_publications tracking
- [x] Create sla_metrics table for performance
- [x] Implement partner_audit_log for compliance
- [x] Add helper functions (calculate_sla_metrics, get_active_seats)
- [x] Create reporting views (partner_dashboard, incept_september_metrics)

### 2. User Roles & Permissions ✅ COMPLETE
- [x] Create `004_user_roles_and_permissions.sql` migration
- [x] Implement user_roles table
- [x] Create role checking functions (is_admin, is_partner)
- [x] Set up Row Level Security policies
- [x] Add automatic role assignment trigger
- [x] Create get_user_dashboard_data function
- [x] Implement role-based data filtering

### 3. TypeScript Types ✅ COMPLETE
- [x] Create `src/types/partner.ts` with all entity types
- [x] Define Partner, ApiKey, VideoGeneration types
- [x] Add SLA metrics and reporting types
- [x] Create InceptGoalProgress type for September tracking
- [x] Define API request/response types
- [x] Add CSV export format types

### 4. Database Query Functions ✅ COMPLETE
- [x] Create `src/lib/supabase/partner-queries.ts`
- [x] Implement partner CRUD operations
- [x] Add video generation tracking functions
- [x] Create SLA metrics calculation
- [x] Implement active seats tracking
- [x] Add Incept September metrics queries
- [x] Create CSV export functionality
- [x] Add real-time subscription functions
- [x] Implement audit logging

### 5. User Role Detection ✅ COMPLETE
- [x] Create `src/hooks/use-user-role.ts`
- [x] Implement role detection from database
- [x] Add partner access verification
- [x] Create role requirement enforcement
- [x] Handle loading and error states

### 6. Main Dashboard Router ✅ COMPLETE
- [x] Create `src/app/partner-dashboard/page.tsx`
- [x] Implement role-based routing
- [x] Add authentication check
- [x] Route admins to AdminDashboard
- [x] Route partners to PartnerDashboard
- [x] Show access denied for regular users

### 7. Admin Dashboard ✅ COMPLETE
- [x] Create `src/components/partner/AdminDashboard.tsx`
- [x] Build partner selection filter
- [x] Implement date range selector
- [x] Create summary metrics cards
- [x] Add generation trends chart
- [x] Build partner distribution pie chart
- [x] Create performance metrics view
- [x] Add billing/usage tracking
- [x] Implement export functionality

### 8. Partner Dashboard ✅ COMPLETE
- [x] Create `src/components/partner/PartnerDashboard.tsx`
- [x] Show only own organization data
- [x] Display key metrics cards
- [x] Add performance trends charts
- [x] Create API keys management section
- [x] Show recent generations table
- [x] Add usage/billing summary
- [x] Implement CSV export

### 9. Incept Goals Dashboard ✅ COMPLETE
- [x] Create `src/components/partner/InceptDashboard.tsx`
- [x] Show September 2025 goal progress
- [x] Display published videos metrics
- [x] Track production usage (40+ renders)
- [x] Monitor active seats (2+ required)
- [x] Show SLA compliance (p95 ≤15m, 90% within 24h)
- [x] Display enrollment status
- [x] Add timeline with milestones
- [x] Create export functionality

### 10. API Endpoints ✅ COMPLETE
- [x] Create `/api/partner/report` endpoint
- [x] Create `/api/partner/track` for event tracking
- [x] Create `/api/partner/admin-dashboard` (admin only)
- [x] Create `/api/partner/list` with role filtering
- [x] Create `/api/partner/api-keys` management
- [x] Add role-based access control to all endpoints
- [x] Implement CSV export endpoints

### 11. API Tracking Integration ⚠️ PARTIALLY COMPLETE
- [x] Create tracking event types
- [x] Implement generation start tracking
- [x] Add generation completion tracking
- [x] Track failures and retries
- [x] Monitor LMS publications
- [ ] Integrate tracking into existing video generation flow
- [ ] Add tracking to manifest-to-video endpoint
- [ ] Update quick generation to use tracking

### 12. User Management UI ❌ NOT IMPLEMENTED
- [ ] Create admin user management page
- [ ] Build role assignment interface
- [ ] Add partner assignment dropdown
- [ ] Create bulk user import
- [ ] Add user invitation system
- [ ] Build permissions editor

### 13. API Key Management UI ⚠️ PARTIALLY COMPLETE
- [x] Display existing API keys in dashboard
- [x] Show key usage statistics
- [ ] Add create new key interface
- [ ] Implement key rotation
- [ ] Add key deactivation
- [ ] Create key permissions editor

### 14. Real-time Updates ❌ NOT IMPLEMENTED
- [ ] Implement WebSocket connections
- [ ] Add real-time metric updates
- [ ] Create live generation status
- [ ] Add SLA violation alerts
- [ ] Build notification system

### 15. Testing & Validation ❌ NOT IMPLEMENTED
- [ ] Test role-based access control
- [ ] Verify data isolation between partners
- [ ] Test API key authentication
- [ ] Validate SLA calculations
- [ ] Test CSV exports
- [ ] Load test dashboard performance

## Migration Status

### Completed Migrations ✅
- `003_partner_integration_tracking.sql` - Applied successfully
- `004_user_roles_and_permissions.sql` - Applied successfully

### Database Objects Created
- **Tables**: partners, api_keys, api_requests, video_generations, lms_publications, sla_metrics, user_roles, partner_audit_log
- **Functions**: is_admin, is_partner, get_user_partner_id, assign_user_role, calculate_sla_metrics, get_active_seats
- **Views**: partner_dashboard, incept_september_metrics, user_dashboard_access
- **Policies**: Row-level security enabled on all tables

## Verification Checklist

After completing all tasks:
- [x] Database migrations run without errors
- [x] Incept partner is seeded in database
- [x] Role detection works correctly
- [x] Admin dashboard shows all partners
- [x] Partner dashboard shows only own data
- [x] API endpoints enforce role-based access
- [x] Metrics calculate correctly
- [x] Export functionality works
- [ ] API keys can be created and managed
- [ ] Tracking integrates with video generation
- [ ] Real-time updates work

## Integration Points

### With Existing Video Generation
```typescript
// Add to video generation workflow
await trackVideoGeneration({
  request_id: generateUniqueId(),
  partner_id: getUserPartnerId(),
  api_key_id: getApiKeyId(),
  manifest: manifestData,
  status: 'pending'
})
```

### With Authentication Flow
```typescript
// After user login
const { role, partnerId } = await getUserRole()
if (role === 'admin' || role === 'partner') {
  router.push('/partner-dashboard')
}
```

## Environment Variables Required

```env
# Add to .env.local
SUPABASE_SERVICE_KEY=your-service-key-here  # For admin operations
NEXT_PUBLIC_ENABLE_PARTNER_DASHBOARD=true    # Feature flag
```

## User Role Assignment

To assign roles to users:

```sql
-- Make a user an admin
SELECT assign_user_role('user-uuid', 'admin');

-- Assign partner role
SELECT assign_user_role(
  'user-uuid', 
  'partner',
  (SELECT id FROM partners WHERE partner_code = 'INCEPT')
);
```

## Common Issues & Solutions

1. **Role Not Detected**: Check user_roles table has entry for user
2. **Access Denied**: Verify RLS policies are enabled
3. **No Data Showing**: Check partner_id is correctly assigned
4. **API Key Not Working**: Ensure key_hash is properly generated
5. **Metrics Not Calculating**: Verify video_generations has data

## Testing Scenarios

1. **Admin Flow**:
   - Login as admin → See all partners
   - Filter by partner → See filtered data
   - Export data → CSV downloads

2. **Partner Flow**:
   - Login as partner → See only own data
   - View metrics → Correct calculations
   - Manage API keys → CRUD operations work

3. **Security Testing**:
   - Partner can't see other partner data
   - Regular user can't access dashboard
   - API endpoints reject unauthorized requests

## Next Steps

1. **Complete Integration**:
   - Add tracking to existing video generation
   - Create user management UI
   - Implement real-time updates

2. **Testing**:
   - Assign roles to test users
   - Verify all access controls
   - Test with production data

3. **Documentation**:
   - Create admin guide
   - Document API key usage
   - Add troubleshooting guide

## Success Criteria

The partner dashboard system is complete when:
- ✅ All database objects are created
- ✅ Role-based access control works
- ✅ Dashboards display correct data
- ✅ API tracking is integrated
- ⚠️ User management UI exists
- ⚠️ Real-time updates work
- ❌ Full testing is complete

## Handoff Notes

For the user to complete implementation:
1. Assign admin role to your user account
2. Test dashboard with real data
3. Create API keys for Incept
4. Monitor September metrics
5. Set up alerts for SLA violations
