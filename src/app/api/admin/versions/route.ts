import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

// GET - Get all version history (any authenticated admin)
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const versions = await prisma.version.findMany({
      orderBy: { timestamp: 'desc' },
      select: {
        versionId: true,
        timestamp: true,
        author: true,
        changeCount: true,
        description: true,
        // Don't include snapshot to reduce payload
      }
    })

    // Map to expected format
    const mappedVersions = versions.map((v: { versionId: string; timestamp: Date; author: string; changeCount: number; description: string | null }) => ({
      id: v.versionId,
      timestamp: v.timestamp.toISOString(),
      author: v.author,
      changeCount: v.changeCount,
      description: v.description
    }))

    return NextResponse.json(mappedVersions)
  } catch (error) {
    console.error('Error reading versions:', error)
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 })
  }
}
