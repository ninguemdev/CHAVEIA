import type { TeamStatus } from '../../lib/supabase/types'
import { teamStatusLabels } from '../../services/teams'

const teamStatusTone: Record<TeamStatus, string> = {
  draft: 'pending',
  pending: 'pending',
  confirmed: 'success',
  cancelled: 'cancelled',
  rejected: 'danger',
}

export function TeamStatusBadge({ status }: { status: TeamStatus }) {
  return (
    <span className={`badge badge-${teamStatusTone[status]}`}>
      {teamStatusLabels[status]}
    </span>
  )
}
