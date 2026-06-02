import { NextRequest, NextResponse } from 'next/server'
import { getEmployeeById, updateEmployee, deleteEmployee } from '@/lib/database'
import { requireAuth } from '@/lib/auth-helpers'
import { EmployeeUpdateSchema, parseBody } from '@/lib/schemas'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const params = await context.params
    const employee = await getEmployeeById(params.id)

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('GET /api/employees/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const params = await context.params
    const parsed = parseBody(EmployeeUpdateSchema, await request.json())
    if (parsed instanceof NextResponse) return parsed
    const employee = await updateEmployee(params.id, parsed)

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('PATCH /api/employees/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const params = await context.params
    const success = await deleteEmployee(params.id)

    if (!success) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/employees/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
  }
}
