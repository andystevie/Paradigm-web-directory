import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

// GET - Get activity log (any authenticated admin)
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const entries = await prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 200,
    })

    return NextResponse.json(
      entries.map((e) => ({
        id: e.id,
        type: e.type,
        action: e.action,
        details: e.details ?? '',
        author: e.author,
        timestamp: e.timestamp.toISOString(),
      }))
    )
  } catch (error) {
    console.error('Error reading activity log:', error)
    return NextResponse.json({ error: 'Failed to fetch activity log' }, { status: 500 })
  }
}
