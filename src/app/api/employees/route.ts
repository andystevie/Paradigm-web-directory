import { NextRequest, NextResponse } from 'next/server'
import { getAllEmployees, addEmployee, saveEmployees } from '@/lib/database'

export async function GET() {
  try {
    const employees = await getAllEmployees()
    return NextResponse.json(employees)
  } catch (error) {
    console.error('GET /api/employees error:', error)
    return NextResponse.json({ error: 'Failed to fetch employees', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newEmployee = await addEmployee(body)

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const employees = await request.json()
    await saveEmployees(employees)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update employees' }, { status: 500 })
  }
}