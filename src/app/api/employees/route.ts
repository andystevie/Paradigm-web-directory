import { NextRequest, NextResponse } from 'next/server'
import { getAllEmployees, addEmployee, saveEmployees } from '@/lib/database'
import { requireAuth, canPublish } from '@/lib/auth-helpers'
import { EmployeeCreateSchema, EmployeesBulkSchema, parseBody } from '@/lib/schemas'

// GET - list employees (admin only — for editor UI; public homepage uses
// getAllEmployees() directly server-side, not this endpoint)
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const employees = await getAllEmployees()
    return NextResponse.json(employees)
  } catch (error) {
    console.error('GET /api/employees error:', error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

// POST - add a single employee (any logged-in admin)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const parsed = parseBody(EmployeeCreateSchema, await request.json())
    if (parsed instanceof NextResponse) return parsed
    const newEmployee = await addEmployee(parsed)

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error) {
    console.error('POST /api/employees error:', error)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}

// PUT - bulk replace the entire employee table — destructive, superadmin only.
export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request, { role: canPublish })
  if (auth instanceof NextResponse) return auth

  try {
    const parsed = parseBody(EmployeesBulkSchema, await request.json())
    if (parsed instanceof NextResponse) return parsed
    await saveEmployees(parsed)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/employees error:', error)
    return NextResponse.json({ error: 'Failed to update employees' }, { status: 500 })
  }
}
