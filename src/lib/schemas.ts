/**
 * Zod schemas for API request validation. Each route should parse its body
 * through one of these so an attacker can't smuggle unexpected fields into
 * Prisma (e.g., a client-chosen `id` for an Employee.create or a
 * `__proto__` key in PendingChange.beforeData).
 */

import { z } from 'zod'

const isoDate = z.string().datetime({ offset: true }).optional()

// ----- Employees -----

// Minimal validation — names must be non-empty strings; other fields are
// optional text. Location must be a string; the directory normalizes it.
export const EmployeeCreateSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email().max(320).optional().or(z.literal('').transform(() => undefined)),
  extension: z.string().max(20).optional(),
  extensionNumber: z.string().max(20).optional(),
  phoneNumber: z.string().max(50).optional(),
  mobilePhone: z.string().max(50).optional(),
  did: z.string().max(50).optional(),
  location: z.string().max(100).default(''),
  team: z.string().max(100).default(''),
  title: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
  photoUrl: z.string().url().max(500).optional().or(z.literal('').transform(() => undefined)),
  avatarUrl: z.string().url().max(500).optional().or(z.literal('').transform(() => undefined)),
  region: z.string().max(50).optional(),
})

// EmployeeUpdateSchema is the same shape but every field is optional.
export const EmployeeUpdateSchema = EmployeeCreateSchema.partial()

export const EmployeesBulkSchema = z
  .array(EmployeeCreateSchema.extend({ id: z.string().min(1).max(100) }))
  .max(10000)

// ----- Pending changes -----

const ChangeTypeSchema = z.enum(['add', 'edit', 'delete'])
const PendingStatusSchema = z.enum(['pending', 'approved', 'rejected'])

export const PendingChangeCreateSchema = z.object({
  id: z.string().max(100).optional(),
  type: ChangeTypeSchema,
  employeeId: z.string().max(100).optional(),
  // before/after are arbitrary JSON but constrained to objects (not arrays
  // or scalars). Prisma stores them as Json; we'll be picky later when we
  // actually consume them in publish/rollback.
  before: z.record(z.string(), z.unknown()).optional(),
  after: z.record(z.string(), z.unknown()).optional(),
  proposedBy: z.string().min(1).max(200),
  proposedAt: isoDate,
  status: PendingStatusSchema.optional(),
  approvedBy: z.string().max(200).optional(),
  approvedAt: isoDate,
  notes: z.string().max(2000).optional(),
})

export const PendingChangePatchSchema = z.object({
  id: z.string().min(1).max(100),
  status: PendingStatusSchema,
  notes: z.string().max(2000).optional(),
  approvedBy: z.string().max(200).optional(),
  approvedAt: isoDate,
})

// ----- Users -----

const UserRoleSchema = z.enum(['superadmin', 'approver', 'editor'])

export const LoginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
})

export const UserCreateSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().trim().min(1).max(200),
  role: UserRoleSchema,
  password: z.string().min(8).max(200),
})

export const UserDeleteSchema = z.object({
  id: z.string().min(1).max(100),
})

// ----- Publish / Rollback -----

export const PublishSchema = z.object({
  author: z.string().max(200).optional(),
})

export const RollbackSchema = z.object({
  versionId: z.string().min(1).max(100),
  author: z.string().max(200).optional(),
})

// ----- Helper: parse + return either data or a NextResponse 400 -----

import { NextResponse } from 'next/server'

export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): T | NextResponse {
  const r = schema.safeParse(body)
  if (!r.success) {
    return NextResponse.json(
      { error: 'Invalid request body', issues: r.error.issues.map(i => ({ path: i.path, message: i.message })) },
      { status: 400 }
    )
  }
  return r.data
}
