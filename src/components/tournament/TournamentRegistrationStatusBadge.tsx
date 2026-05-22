import type { TournamentRegistrationStatus } from '../../lib/supabase/types'
import { tournamentRegistrationStatusLabels } from '../../services/tournaments'

const statusTone: Record<TournamentRegistrationStatus, string> = {
  pending: 'pending',
  confirmed: 'success',
  cancelled: 'cancelled',
  rejected: 'danger',
  checked_in: 'live',
  registered: 'success',
}

export function TournamentRegistrationStatusBadge({
  status,
}: {
  status: TournamentRegistrationStatus
}) {
  return (
    <span className={`badge badge-${statusTone[status]}`}>
      {tournamentRegistrationStatusLabels[status]}
    </span>
  )
}
