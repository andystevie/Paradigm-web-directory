# Paradigm Home Health Staff Directory - Admin Portal User Guide

**Version 1.0** | Last Updated: November 2025
**Portal URL:** https://directory.paradigmhh.com/admin

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Role-Specific Instructions](#role-specific-instructions)
   - [Approver Guide](#approver-guide)
   - [Editor Guide](#editor-guide)
3. [Approval Workflow](#approval-workflow)
4. [Email Notifications](#email-notifications)
5. [Troubleshooting](#troubleshooting)
6. [Security Best Practices](#security-best-practices)

---

## System Overview

The Paradigm Home Health Admin Portal manages the public employee directory at https://directory.paradigmhh.com. Changes flow through a three-stage approval workflow to ensure accuracy.

### Approval Workflow Diagram

```
EDITOR          APPROVER         SUPER ADMIN
  │                │                  │
  ├─ Submits ────►│                  │
  │                ├─ Approves ─────►│
  │                │                  ├─ Publishes
  │                │                  │
  │                └─ Rejects ───────┘
```

### Available Tabs (by Role)

|                    | Super Admin | Approver | Editor |
|--------------------|:-----------:|:--------:|:------:|
| Employees Tab      |      ✅     |    ✅    |   ✅   |
| Pending Changes    |      ✅     |    ✅    |   ✅   |
| Version History    |      ✅     |    ✅    |   ✅   |
| Users Management   |      ✅     |    ❌    |   ❌   |

**Note:** SSO/OAuth integration is planned for future implementation to streamline the login process.

---

## Role-Specific Instructions

---

### Approver Guide

**Review & Approve Only**

#### Login Credentials
- **Email:** m.balderas@paradigmhh.com
- **Password:** Balderas2025!

#### What You Can Do
- ✅ View all employees in the directory
- ✅ Approve or reject pending changes
- ✅ View version history
- ❌ Cannot publish changes (Super Admin only)
- ❌ Cannot manage users (Super Admin only)

#### Common Tasks

**Review & Approve Changes**

1. Click "Pending Changes" tab
2. Review each submission carefully:
   - **ADD:** New employee being added
   - **EDIT:** Existing employee info being updated
   - **DELETE:** Employee being removed
3. Click "Approve" if change is correct
4. Click "Reject" if change has errors
5. Approved changes wait for Super Admin to publish

**Bulk Approve Multiple Changes**

1. Check the checkbox next to each valid change
2. Click "Approve Selected (X)" button
3. All selected changes move to approved status

#### What Happens After You Approve?

- Changes move to "Approved & Ready to Publish" section
- You'll see message: "X changes ready for Super Admin to publish"
- Super Admin receives daily email notification
- Super Admin will publish changes to live directory

---

### Editor Guide

**Submit Changes Only**

#### Login Credentials
- **Email:** editor@internal
- **Password:** ParadigmEditor2025

#### What You Can Do
- ✅ View all employees in the directory
- ✅ Submit new employee additions
- ✅ Submit edits to existing employees
- ✅ Submit employee removals
- ✅ View pending changes you submitted
- ❌ Cannot approve or reject changes
- ❌ Cannot publish changes
- ❌ Cannot manage users

#### Common Tasks

**Add New Employee**

1. Click "Employees" tab
2. Click "Add New Employee" button
3. Fill in all required fields:
   - First Name
   - Last Name
   - Email
   - Extension
   - Location (Tyler, Longview, Keller, Plano, Abilene, San Angelo, Temple, Whitney, Cedar Park)
   - Title (optional)
4. Click "Submit for Approval"
5. Change appears in "Pending Changes" tab with "Awaiting Approval" badge

**Edit Existing Employee**

1. Click "Employees" tab
2. Find the employee to edit
3. Click "Edit" button
4. Update the necessary fields
5. Click "Submit for Approval"
6. Change goes to pending review

**Delete Employee**

1. Click "Employees" tab
2. Find the employee to remove
3. Click "Delete" button
4. Confirm deletion
5. Deletion request goes to pending review

**View Your Submissions**

1. Click "Pending Changes" tab
2. Your submissions appear with "Awaiting Approval" badge
3. You cannot approve your own changes
4. Wait for Approver or Super Admin to review

---

## Approval Workflow

### Step-by-Step Process

**Step 1: SUBMISSION (Editor)**
- Editor makes a change in the Employees tab
- Change is saved as "pending" status
- Change appears in Pending Changes tab

**Step 2: REVIEW (Approver or Super Admin)**
- Reviewer sees change in "Pending Review" section
- Reviewer examines before/after data
- Reviewer clicks "Approve" or "Reject"

**Step 3: APPROVAL (Approver or Super Admin)**
- If approved: Change moves to "Approved & Ready to Publish"
- If rejected: Change moves to "Rejected" section (greyed out)
- Email notification sent to Super Admin (daily at 9:00 AM)

**Step 4: PUBLISH (Super Admin Only)**
- Super Admin clicks "Publish X Approved Changes"
- All approved changes apply to live directory
- Version snapshot created automatically
- Published changes removed from pending list

### Change Statuses

**🟡 Pending Review**
- Waiting for Approver or Super Admin review
- Editor sees "Awaiting Approval" badge
- Approver sees approve/reject buttons

**🟢 Approved & Ready to Publish**
- Change has been approved
- Waiting for Super Admin to publish
- Highlighted in green

**🔴 Rejected**
- Change was rejected during review
- Will not be published
- Displayed greyed out for record keeping

---

## Email Notifications

### Who Receives Emails?
- Currently, the Super Admin receives email notifications when approved changes are ready to be published
- This is an interim solution - the workflow will eventually move to a fully automated publishing process

### When Are Emails Sent?
- Daily at 9:00 AM UTC (3:00 AM CST / 4:00 AM CDT)
- Only if approved changes are waiting to be published
- No email if no approved changes exist

### What's in the Email?
- Count of approved changes waiting
- Breakdown by type (Add, Edit, Delete)
- Direct link to admin portal
- Professional Paradigm Home Health branding

### Sample Email Content

```
📋 Approved Changes Ready to Publish

There are 3 approved employee directory
changes waiting to be published:

Change Summary:
• Add: 1 employee
• Edit: 2 employees

[Review & Publish Changes] (button)
```

---

## Troubleshooting

### Can't log in / "Invalid credentials"

**Solution:**
- ✓ Verify email address is correct (case-sensitive)
- ✓ Verify password is exact (case-sensitive, includes special chars)
- ✓ Try copying password directly from this guide
- ✓ Contact support if password needs reset

### Don't see "Approve" button on pending changes

**Solution:**
- ✓ Check your role: Editors cannot approve changes
- ✓ Editor role sees "Awaiting Approval" badge instead
- ✓ Only Approvers and Super Admins can approve

### Don't see "Publish" button

**Solution:**
- ✓ Only Super Admin can publish changes
- ✓ Approvers will see message about waiting for Super Admin
- ✓ This feature is restricted to Super Admin role only

### Don't see "Users" tab

**Solution:**
- ✓ Only Super Admin has access to user management
- ✓ Approvers and Editors cannot manage users
- ✓ This is expected behavior for security

### Changes not appearing on public directory

**Solution:**
- ✓ Verify changes have been published (not just approved)
- ✓ Check directory.paradigmhh.com to confirm
- ✓ Try hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- ✓ Allow 30 seconds for CDN cache to clear

### Didn't receive email notification

**Solution:**
- ✓ Emails only sent if approved changes exist
- ✓ Emails sent once per day at 9:00 AM UTC
- ✓ Check spam/junk folder
- ✓ Email notifications are currently sent to Super Admin only
- ✓ Manually check portal instead of waiting for email

---

## Security Best Practices

### Password Security
- ✓ Change default passwords after first login
- ✓ Use strong, unique passwords (12+ characters)
- ✓ Include uppercase, lowercase, numbers, symbols
- ✓ Don't share passwords between users
- ✓ Store passwords in secure password manager

### Account Security
- ✓ Log out when finished using the portal
- ✓ Don't share login credentials
- ✓ Report suspicious activity immediately
- ✓ Use private/incognito browser on shared computers

### Session Management
- ✓ Sessions expire after 7 days of inactivity
- ✓ You'll need to log in again after expiration
- ✓ This protects against unauthorized access

### Data Protection
- ✓ Only submit accurate employee information
- ✓ Double-check data before submitting
- ✓ Don't submit personal/sensitive information beyond directory needs
- ✓ Version history maintains audit trail

---

## Support Contact

For technical support or questions about the admin portal:

📧 **Email:** support@paradigmhh.com

For Paradigm Home Health-specific questions, contact your internal IT department or authorized admin.

---

**End of User Guide**
