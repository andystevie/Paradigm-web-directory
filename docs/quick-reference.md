# Paradigm Home Health Admin Portal - Quick Reference Guide

**Portal URL:** https://directory.paradigmhh.com/admin

---

## User Roles

### Approver (Review & Approve)
- Can approve or reject pending changes
- Cannot publish changes to live site
- Cannot manage user accounts

### Editor (Submit Changes)
- Can submit new employees, edits, and deletions
- Cannot approve or reject changes
- All submissions require approval

**Note:** Login credentials are provided separately by your administrator.

---

## Role Permissions Matrix

| Action                    | Super Admin | Approver | Editor |
|---------------------------|:-----------:|:--------:|:------:|
| View Employees            |      ✅     |    ✅    |   ✅   |
| Submit Changes            |      ✅     |    ✅    |   ✅   |
| Approve/Reject Changes    |      ✅     |    ✅    |   ❌   |
| Publish Changes           |      ✅     |    ❌    |   ❌   |
| Rollback Versions         |      ✅     |    ❌    |   ❌   |
| Manage Users              |      ✅     |    ❌    |   ❌   |

---

## Approval Workflow

1. **EDITOR** submits change → Status: Pending Review
2. **APPROVER** reviews → Approves or Rejects
3. If approved → Status: Ready to Publish
4. **SUPER ADMIN** publishes → Live on directory.paradigmhh.com

---

## Common Tasks

### For Editors

**Submit New Employee**
**Employees Tab** → **Add New Employee** → **Fill Form** → **Submit**

**Edit Employee**
**Employees Tab** → **Find Employee** → **Edit** → **Submit**

**Delete Employee**
**Employees Tab** → **Find Employee** → **Delete** → **Confirm**

### For Approvers

**Approve Single Change**
**Pending Changes Tab** → **Review** → **Click Approve**

**Bulk Approve Changes**
**Pending Changes** → **Check boxes** → **Approve Selected**

**Reject Change**
**Pending Changes Tab** → **Review** → **Click Reject**

### Administrative Functions
*(Super Admin only - contact administrator if needed)*

- Publish approved changes to live directory
- Rollback to previous versions
- Manage user accounts and permissions

---

## Email Notifications

**Who:** Currently sent to Super Admin only (interim solution)
**When:** Daily at 9:00 AM UTC (3:00 AM CST / 4:00 AM CDT)
**Why:** Notifies when approved changes are ready to publish
**What:** Count of changes + breakdown by type + portal link
**Future:** Workflow will eventually move to fully automated publishing

---

## Change Types

| Badge | Type | Description |
|-------|------|-------------|
| 🟢 | ADD | New employee being added to directory |
| 🔵 | EDIT | Existing employee information being updated |
| 🔴 | DELETE | Employee being removed from directory |

---

## Troubleshooting Quick Fixes

### Can't log in?
→ Verify email/password exactly (case-sensitive)

### Don't see approve button?
→ Editors can't approve (only submit)

### Don't see publish button?
→ Only Super Admin can publish

### Don't see Users tab?
→ Only Super Admin has user management access

### Changes not on live site?
→ Must be published, not just approved
→ Hard refresh browser: Ctrl+F5

---

## Important URLs

| Purpose | URL |
|---------|-----|
| Admin Portal | https://directory.paradigmhh.com/admin |
| Login Page | https://directory.paradigmhh.com/admin/login |
| Public Directory | https://directory.paradigmhh.com |

---

## Security Reminders

- ✓ Change default passwords after first login
- ✓ Log out when finished
- ✓ Don't share credentials
- ✓ Sessions expire after 7 days
- ✓ Double-check data before submitting

---

## Support

📧 **Email:** support@paradigmhh.com

For technical support or questions about the admin portal, contact the support team.

---

**Quick Reference Guide v1.0**
