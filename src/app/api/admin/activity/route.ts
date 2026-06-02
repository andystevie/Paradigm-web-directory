import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { requireAuth } from '@/lib/auth-helpers'

const ACTIVITY_LOG_FILE = path.join(process.cwd(), 'data', 'activity-log.json')

// GET - Get activity log (any authenticated admin)
// TODO: move from filesystem to Prisma ActivityLog model — fs is ephemeral on Vercel.
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    if (!fs.existsSync(ACTIVITY_LOG_FILE)) {
      return NextResponse.json([])
    }

    const log = JSON.parse(fs.readFileSync(ACTIVITY_LOG_FILE, 'utf-8'))
    return NextResponse.json(log)
  } catch (error) {
    console.error('Error reading activity log:', error)
    return NextResponse.json({ error: 'Failed to fetch activity log' }, { status: 500 })
  }
}
