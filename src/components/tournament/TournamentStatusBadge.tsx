import type { TournamentStatus } from '../../lib/supabase/types'
import { tournamentStatusLabels } from '../../services/tournaments'

export function SupabaseTournamentStatusBadge({
  status,
}: {
  status: TournamentStatus
}) {
  return (
    <span className={`badge badge-tournament-${status}`}>
      {tournamentStatusLabels[status]}
    </span>
  )
}
