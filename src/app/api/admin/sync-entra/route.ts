import { NextRequest, NextResponse } from 'next/server'
import { fetchEntraEmployees } from '@/lib/msgraph'
import prisma from '@/lib/db'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  // Require the sync secret for manual triggers
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.SYNC_SECRET}`
  if (!process.env.SYNC_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return runSync()
}

// GET is used by Vercel Cron (which passes a bearer token via CRON_SECRET automatically)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const isManual = authHeader === `Bearer ${process.env.SYNC_SECRET}`

  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return runSync()
}

async function runSync() {
  try {
    const entraEmployees = await fetchEntraEmployees()

    if (entraEmployees.length === 0) {
      return NextResponse.json({ error: 'No users returned from Entra' }, { status: 500 })
    }

    // Full replace: delete all + insert fresh
    await prisma.$transaction([
      prisma.employee.deleteMany(),
      prisma.employee.createMany({
        data: entraEmployees.map((emp) => ({
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email || null,
          extension: emp.extension || null,
          phoneNumber: emp.phoneNumber || null,
          location: emp.location,
          team: emp.team,
          title: emp.title || null,
          department: emp.department || null,
        })),
      }),
    ])

    return NextResponse.json({
      success: true,
      synced: entraEmployees.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Entra sync failed:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: String(error) },
      { status: 500 }
    )
  }
}
