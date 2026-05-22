import { useState } from 'react'
import type { TournamentCreatorPermission } from '../../lib/supabase/types'
import type { CreatorPermissionWithProfile } from '../../services/tournamentCreatorRequests'
import { CreatorPermissionStatusBadge } from './CreatorPermissionStatusBadge'

type CreatorPermissionCardProps = {
  permission: CreatorPermissionWithProfile | TournamentCreatorPermission
  mode: 'user' | 'admin'
  isBusy?: boolean
  onRevoke?: (permissionId: string, reason: string) => void
}

function formatDate(value: string | null) {
  if (!value) return 'Nao informado'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function CreatorPermissionCard({
  permission,
  mode,
  isBusy = false,
  onRevoke,
}: CreatorPermissionCardProps) {
  const [revokeReason, setRevokeReason] = useState('')
  const user = 'user' in permission ? permission.user : undefined
  const isActive = permission.status === 'active'

  return (
    <article className="request-card">
      <div className="card-topline">
        <CreatorPermissionStatusBadge status={permission.status} />
        <span>Concedida em {formatDate(permission.granted_at)}</span>
      </div>

      {mode === 'admin' && user && (
        <div className="requester-summary">
          <strong>{user.display_name}</strong>
          <span>{user.email ?? 'Email nao disponivel'}</span>
          <span>RA: {user.ra || 'Nao informado'}</span>
        </div>
      )}

      <dl className="definition-grid">
        <div>
          <dt>Status</dt>
          <dd>{permission.status}</dd>
        </div>
        <div>
          <dt>Revogada em</dt>
          <dd>{formatDate(permission.revoked_at)}</dd>
        </div>
      </dl>

      {permission.grant_reason && (
        <div className="admin-notes">
          <strong>Motivo da concessao</strong>
          <p>{permission.grant_reason}</p>
        </div>
      )}

      {permission.revoke_reason && (
        <div className="admin-notes">
          <strong>Motivo da revogacao</strong>
          <p>{permission.revoke_reason}</p>
        </div>
      )}

      {mode === 'admin' && isActive && (
        <div className="review-form">
          <label className="field" htmlFor={`revoke-reason-${permission.id}`}>
            <span>Motivo da revogacao opcional</span>
            <textarea
              id={`revoke-reason-${permission.id}`}
              value={revokeReason}
              rows={3}
              onChange={(event) => setRevokeReason(event.target.value)}
              placeholder="Registre uma justificativa para auditoria."
            />
          </label>
          <button
            className="button button-secondary"
            type="button"
            disabled={isBusy}
            onClick={() => onRevoke?.(permission.id, revokeReason)}
          >
            {isBusy ? 'Revogando...' : 'Revogar permissao'}
          </button>
        </div>
      )}
    </article>
  )
}
