import { NextRequest, NextResponse } from 'next/server'
import { fetchEntraEmployees } from '@/lib/msgraph'
import prisma from '@/lib/db'
import { checkBearer } from '@/lib/auth-helpers'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  if (!checkBearer(request, [process.env.SYNC_SECRET])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runSync()
}

// GET is used by Vercel Cron (CRON_SECRET) or manual trigger (SYNC_SECRET).
export async function GET(request: NextRequest) {
  if (!checkBearer(request, [process.env.CRON_SECRET, process.env.SYNC_SECRET])) {
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
          mobilePhone: emp.mobilePhone || null,
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
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
