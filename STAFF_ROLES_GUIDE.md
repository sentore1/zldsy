# Staff Role System Guide
## 3-Tier Role-Based Access Control (RBAC)

---

## Overview

The system now includes a comprehensive 3-tier staff role system with role-based access control:

1. **Admin** - Full system access
2. **Supervisor / Permanent Staff** - Manage jobs and staff, view reports
3. **Normal Staff** - Limited access to assigned jobs only

---

## 🎭 The 3 Staff Roles

### 1. Administrator (Admin)
**Access Level:** Full System Access

**Permissions:**
- ✅ View and manage all modules
- ✅ Create, edit, delete any records
- ✅ Manage staff and assign roles
- ✅ Configure system settings
- ✅ View all reports and analytics
- ✅ Process payments and refunds
- ✅ Full access to bookings, jobs, customers, services, inventory, equipment

**Typical Users:**
- Business owners
- System administrators
- Top management

---

### 2. Supervisor / Permanent Staff
**Access Level:** Operations Management

**Permissions:**
- ✅ View dashboard and reports
- ✅ Create and manage bookings
- ✅ Create and manage jobs
- ✅ Assign staff to jobs
- ✅ View all jobs (not just assigned)
- ✅ Manage customers
- ✅ View all staff
- ✅ Manage inventory and equipment
- ✅ Create quotations and invoices
- ✅ Process payments
- ✅ Clock in/out
- ❌ Cannot delete critical records
- ❌ Cannot manage system roles
- ❌ Cannot configure system settings

**Typical Users:**
- Site supervisors
- Permanent staff
- Team leaders
- Operations managers

---

### 3. Normal Staff
**Access Level:** Limited - Own Jobs Only

**Permissions:**
- ✅ View jobs assigned to them
- ✅ Clock in/out for their shifts
- ❌ Cannot view other staff's jobs
- ❌ Cannot create or edit bookings
- ❌ Cannot access admin modules
- ❌ Cannot view customers, inventory, or reports

**Typical Users:**
- Casual workers
- Technicians
- Drivers
- Cleaners
- Contract staff

---

## 💼 Employment Types

The system also tracks employment type separately from role:

| Employment Type | Description |
|----------------|-------------|
| **Permanent** | Full-time permanent staff with benefits |
| **Casual** | Part-time or on-call workers |
| **Contract** | Fixed-term contract employees |
| **Part-Time** | Regular part-time employees |

**Note:** Employment type is independent of system role. A casual worker can be a supervisor if given the role.

---

## 🛠️ Implementation Files

### Backend / Database
- `lib/supabase/add-staff-roles.sql` - Database migration
  - Adds `system_role`, `employment_type`, `can_login` fields
  - Creates views for active staff and assigned jobs
  - Adds permission checking function

### Frontend / Constants
- `lib/constants/roles.ts` - Role definitions and permissions
  - Role constants
  - Permission definitions
  - Role-permission mappings
  - Permission checking functions

### Type Definitions
- `types/index.ts` - Updated Staff interface
  - Added `system_role` field
  - Added `employment_type` field
  - Added `can_login`, `date_hired` fields

### React Components
- `hooks/useAuth.ts` - Authentication hook
  - User authentication state
  - Permission checking hooks
  - Role checking utilities

- `components/PermissionGuard.tsx` - Permission guards
  - Guard components for conditional rendering
  - Permission buttons
  - Unauthorized access handling

- `components/StaffFormModal.tsx` - Enhanced staff form
  - Role selection
  - Employment type selection
  - System access toggle
  - Password management

---

## 📋 Permission List

### Dashboard & Reports
- `view_dashboard` - View dashboard
- `view_reports` - View reports
- `export_reports` - Export reports

### Bookings
- `view_bookings` - View all bookings
- `create_booking` - Create new bookings
- `edit_booking` - Edit existing bookings
- `delete_booking` - Delete bookings

### Jobs
- `view_all_jobs` - View all jobs in system
- `view_assigned_jobs` - View only assigned jobs
- `create_job` - Create new jobs
- `edit_job` - Edit existing jobs
- `delete_job` - Delete jobs
- `assign_staff` - Assign staff to jobs
- `clock_in_out` - Clock in/out functionality

### Customers
- `view_customers` - View customer list
- `create_customer` - Add new customers
- `edit_customer` - Edit customer details
- `delete_customer` - Delete customers

### Staff Management
- `view_all_staff` - View all staff members
- `create_staff` - Add new staff
- `edit_staff` - Edit staff details
- `delete_staff` - Remove staff
- `manage_roles` - Manage staff roles

### Services, Inventory, Equipment
- Similar permissions for each module
- View, create, edit, delete

### Financial
- `view_invoices`, `create_invoice`, etc.
- `view_payments`, `process_payment`, `refund_payment`
- `view_quotations`, `create_quotation`, etc.

### Settings
- `view_settings` - View system settings
- `edit_settings` - Modify system settings

---

## 🔧 Usage Examples

### Check Permission in Component

```typescript
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/lib/constants/roles';

function MyComponent() {
  const { hasPermission } = useAuth();
  
  if (hasPermission(PERMISSIONS.CREATE_BOOKING)) {
    return <CreateBookingButton />;
  }
  
  return null;
}
```

### Guard Content by Permission

```typescript
import { PermissionGuard } from '@/components/PermissionGuard';
import { PERMISSIONS } from '@/lib/constants/roles';

function MyPage() {
  return (
    <PermissionGuard permissions={[PERMISSIONS.VIEW_DASHBOARD]}>
      <DashboardContent />
    </PermissionGuard>
  );
}
```

### Guard by Role

```typescript
import { PermissionGuard } from '@/components/PermissionGuard';

function AdminOnlySection() {
  return (
    <PermissionGuard roles={['admin']}>
      <AdminControls />
    </PermissionGuard>
  );
}
```

### Check Multiple Permissions

```typescript
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/lib/constants/roles';

function ComplexComponent() {
  const { hasAnyPermission, hasAllPermissions } = useAuth();
  
  // User needs ANY of these permissions
  const canView = hasAnyPermission([
    PERMISSIONS.VIEW_ALL_JOBS,
    PERMISSIONS.VIEW_ASSIGNED_JOBS
  ]);
  
  // User needs ALL of these permissions
  const canManage = hasAllPermissions([
    PERMISSIONS.EDIT_JOB,
    PERMISSIONS.ASSIGN_STAFF
  ]);
  
  return (
    <div>
      {canView && <JobList />}
      {canManage && <ManagementPanel />}
    </div>
  );
}
```

---

## 🗄️ Database Schema

### Staff Table Updates

```sql
ALTER TABLE staff ADD COLUMN system_role VARCHAR(50) DEFAULT 'staff';
ALTER TABLE staff ADD COLUMN employment_type VARCHAR(50) DEFAULT 'casual';
ALTER TABLE staff ADD COLUMN date_hired DATE;
ALTER TABLE staff ADD COLUMN can_login BOOLEAN DEFAULT FALSE;
ALTER TABLE staff ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
```

### Views Created

**v_active_staff** - Active staff with role information
```sql
SELECT id, name, email, phone, 
       system_role, employment_type, 
       is_active
FROM staff 
WHERE is_active = TRUE;
```

**v_staff_assigned_jobs** - Jobs visible to normal staff
```sql
SELECT staff_id, job_id, job_number, 
       scheduled_date, customer_name
FROM job_staff 
JOIN jobs ON job_staff.job_id = jobs.id;
```

---

## 🔐 Security Best Practices

1. **Always verify permissions server-side**
   - Frontend guards are UX, not security
   - Check permissions in API routes

2. **Use principle of least privilege**
   - Give minimum permissions needed
   - Promote to higher roles only when necessary

3. **Audit role changes**
   - Log when roles are modified
   - Track who made changes

4. **Regular permission reviews**
   - Review staff permissions quarterly
   - Remove access for terminated staff

5. **Password security**
   - Enforce strong passwords for login access
   - Require password change on first login

---

## 🎯 Next Steps

1. Run database migration:
   ```bash
   # Execute: lib/supabase/add-staff-roles.sql
   ```

2. Update existing staff records with roles

3. Implement login authentication system

4. Add permission checks to API routes

5. Test each role's access thoroughly

---

## 📞 Support

For questions about the role system:
- Review this guide
- Check `lib/constants/roles.ts` for permission definitions
- Review component examples in `components/PermissionGuard.tsx`

**Last Updated:** January 2025
