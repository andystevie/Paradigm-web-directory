import prisma from './db'

export type ActivityType =
  | 'publish'
  | 'rollback'
  | 'sync'
  | 'login'
  | 'user-add'
  | 'user-delete'

/**
 * Record an admin activity event. Never throws — logging failures must not
 * break the underlying action.
 */
export async function recordActivity(args: {
  type: ActivityType
  action: string
  author: string
  details?: string
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        type: args.type,
        action: args.action,
        author: args.author,
        details: args.details ?? null,
      },
    })
  } catch (e) {
    console.error('Failed to record activity:', e)
  }
}
