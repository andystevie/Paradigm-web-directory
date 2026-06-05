import { NextResponse } from 'next/server'
import { clearViewerCookie } from '@/lib/viewer-session'

export async function POST() {
  await clearViewerCookie()
  return NextResponse.json({ success: true })
}
