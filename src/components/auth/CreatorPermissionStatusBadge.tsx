import type { CreatorPermissionStatus } from '../../lib/supabase/types'

const LABELS: Record<CreatorPermissionStatus, string> = {
  active: 'Permissao ativa',
  revoked: 'Permissao revogada',
}

export function CreatorPermissionStatusBadge({
  status,
}: {
  status: CreatorPermissionStatus
}) {
  return (
    <span className={`badge badge-permission-${status}`}>
      {LABELS[status]}
    </span>
  )
}
