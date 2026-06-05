import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkDirectoryPassword, setViewerCookie } from '@/lib/viewer-session'
import { parseBody } from '@/lib/schemas'
import { getLimiter, enforce, clientId } from '@/lib/rate-limit'

const BodySchema = z.object({
  password: z.string().min(1).max(200),
})

// 10 attempts per IP per 5 minutes for the directory password gate too.
const limiter = getLimiter('viewer-login', 10, '5 m')

export async function POST(request: NextRequest) {
  const limited = await enforce(limiter, clientId(request))
  if (limited) return limited

  const parsed = parseBody(BodySchema, await request.json().catch(() => ({})))
  if (parsed instanceof NextResponse) return parsed

  if (!checkDirectoryPassword(parsed.password)) {
    // Generic message — don't tell attackers whether DIRECTORY_PASSWORD is set
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  await setViewerCookie()
  return NextResponse.json({ success: true })
}
