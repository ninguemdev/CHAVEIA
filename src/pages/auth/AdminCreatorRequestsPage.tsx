import { useCallback, useEffect, useMemo, useState } from 'react'
import { CreatorPermissionCard } from '../../components/auth/CreatorPermissionCard'
import { CreatorRequestCard } from '../../components/auth/CreatorRequestCard'
import { CreatorRequestStatusBadge } from '../../components/auth/CreatorRequestStatusBadge'
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell'
import type { TournamentCreatorRequestStatus } from '../../lib/supabase/types'
import {
  type CreatorPermissionWithProfile,
  type CreatorRequestWithProfile,
  fetchAllCreatorPermissions,
  fetchAllCreatorRequests,
  revokeCreatorPermission,
  reviewCreatorRequest,
} from '../../services/tournamentCreatorRequests'

type AdminFilter = TournamentCreatorRequestStatus | 'all'
type AdminView = 'requests' | 'active' | 'revoked'

export function AdminCreatorRequestsPage() {
  const [requests, setRequests] = useState<CreatorRequestWithProfile[]>([])
  const [permissions, setPermissions] = useState<CreatorPermissionWithProfile[]>([])
  const [filter, setFilter] = useState<AdminFilter>('pending')
  const [view, setView] = useState<AdminView>('requests')
  const [isLoading, setIsLoading] = useState(true)
  const [busyRequestId, setBusyRequestId] = useState('')
  const [busyPermissionId, setBusyPermissionId] = useState('')
  const [error, setError] = useState('')

  const filteredRequests = useMemo(() => {
    if (filter === 'all') return requests
    return requests.filter((request) => request.status === filter)
  }, [filter, requests])

  const pendingCount = requests.filter((request) => request.status === 'pending').length
  const activePermissions = permissions.filter((permission) => permission.status === 'active')
  const revokedPermissions = permissions.filter((permission) => permission.status === 'revoked')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [nextRequests, nextPermissions] = await Promise.all([
        fetchAllCreatorRequests(),
        fetchAllCreatorPermissions(),
      ])
      setRequests(nextRequests)
      setPermissions(nextPermissions)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Nao foi possivel carregar dados administrativos.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadData])

  async function handleReview(
    requestId: string,
    decision: 'approved' | 'rejected',
    adminNotes: string,
  ) {
    setBusyRequestId(requestId)
    setError('')

    try {
      await reviewCreatorRequest(requestId, decision, adminNotes)
      await loadData()
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : 'Nao foi possivel revisar o pedido.',
      )
    } finally {
      setBusyRequestId('')
    }
  }

  async function handleRevoke(permissionId: string, reason: string) {
    setBusyPermissionId(permissionId)
    setError('')

    try {
      await revokeCreatorPermission(permissionId, reason)
      await loadData()
    } catch (revokeError) {
      setError(
        revokeError instanceof Error
          ? revokeError.message
          : 'Nao foi possivel revogar a permissao.',
      )
    } finally {
      setBusyPermissionId('')
    }
  }

  return (
    <AuthenticatedShell subtitle="Administracao">
      <div className="page-stack">
        <section className="page-header" aria-labelledby="admin-requests-title">
          <div>
            <span className="eyebrow">Permissoes</span>
            <h1 id="admin-requests-title">Permissoes de criacao de torneio</h1>
            <p>
              Pedidos ficam como historico. A permissao ativa e separada e pode
              ser revogada por admins globais.
            </p>
          </div>
          <div className="page-header-action">
            <span className="metric-pill">
              {pendingCount} pendente{pendingCount === 1 ? '' : 's'}
            </span>
          </div>
        </section>

        <div className="tabs" role="tablist" aria-label="Areas de permissao">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'requests'}
            onClick={() => setView('requests')}
          >
            Pedidos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'active'}
            onClick={() => setView('active')}
          >
            Permissoes ativas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'revoked'}
            onClick={() => setView('revoked')}
          >
            Historico revogado
          </button>
        </div>

        {view === 'requests' && (
          <section className="toolbar" aria-label="Filtro de pedidos">
            <label className="field" htmlFor="request-status-filter">
              <span>Status</span>
              <select
                id="request-status-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value as AdminFilter)}
              >
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovados</option>
                <option value="rejected">Rejeitados</option>
                <option value="cancelled">Cancelados</option>
                <option value="all">Todos</option>
              </select>
            </label>
            <div className="status-preview" aria-label="Status disponiveis">
              <CreatorRequestStatusBadge status="pending" />
              <CreatorRequestStatusBadge status="approved" />
              <CreatorRequestStatusBadge status="rejected" />
            </div>
          </section>
        )}

        {error && (
          <div className="form-message form-message-error" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-state" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>Carregando permissoes...</span>
          </div>
        ) : view === 'requests' && filteredRequests.length === 0 ? (
          <section className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">0</span>
            <h2>Nenhum pedido neste filtro</h2>
            <p>Quando usuarios solicitarem permissao, os pedidos aparecerao aqui.</p>
          </section>
        ) : view === 'requests' ? (
          <section className="request-list" aria-label="Pedidos administrativos">
            {filteredRequests.map((request) => (
              <CreatorRequestCard
                key={request.id}
                request={request}
                mode="admin"
                isBusy={busyRequestId === request.id}
                onReview={handleReview}
              />
            ))}
          </section>
        ) : view === 'active' && activePermissions.length === 0 ? (
          <section className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">0</span>
            <h2>Nenhuma permissao ativa</h2>
            <p>Aprovar um pedido cria uma permissao ativa revogavel.</p>
          </section>
        ) : view === 'active' ? (
          <section className="request-list" aria-label="Permissoes ativas">
            {activePermissions.map((permission) => (
              <CreatorPermissionCard
                key={permission.id}
                permission={permission}
                mode="admin"
                isBusy={busyPermissionId === permission.id}
                onRevoke={handleRevoke}
              />
            ))}
          </section>
        ) : revokedPermissions.length === 0 ? (
          <section className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">0</span>
            <h2>Nenhuma permissao revogada</h2>
            <p>Permissoes revogadas ficam preservadas para auditoria.</p>
          </section>
        ) : (
          <section className="request-list" aria-label="Historico de permissoes revogadas">
            {revokedPermissions.map((permission) => (
              <CreatorPermissionCard
                key={permission.id}
                permission={permission}
                mode="admin"
              />
            ))}
          </section>
        )}
      </div>
    </AuthenticatedShell>
  )
}
