import { useCallback, useEffect, useMemo, useState } from 'react'
import { CreatorPermissionCard } from '../../components/auth/CreatorPermissionCard'
import { CreatorRequestCard } from '../../components/auth/CreatorRequestCard'
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell'
import { useAuth } from '../../context/auth'
import type {
  TournamentCreatorPermission,
  TournamentCreatorRequest,
} from '../../lib/supabase/types'
import {
  cancelCreatorRequest,
  fetchMyCreatorPermissions,
  fetchMyCreatorRequests,
} from '../../services/tournamentCreatorRequests'

export function MyCreatorRequestsPage() {
  const { user, refreshCreatorPermission } = useAuth()
  const [requests, setRequests] = useState<TournamentCreatorRequest[]>([])
  const [permissions, setPermissions] = useState<TournamentCreatorPermission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyRequestId, setBusyRequestId] = useState('')
  const [error, setError] = useState('')

  const latestPendingRequest = requests.find((request) => request.status === 'pending')
  const activePermission = permissions.find((permission) => permission.status === 'active')
  const latestRevokedPermission = permissions.find((permission) => permission.status === 'revoked')

  const permissionState = useMemo(() => {
    if (activePermission) {
      return {
        title: 'Permissao aprovada',
        description: 'Voce pode criar torneios enquanto a permissao estiver ativa.',
      }
    }

    if (latestPendingRequest) {
      return {
        title: 'Pedido pendente',
        description: 'Um admin ainda precisa aprovar ou rejeitar sua solicitacao.',
      }
    }

    if (latestRevokedPermission) {
      return {
        title: 'Permissao revogada',
        description: 'Voce nao pode criar torneios no momento. Envie um novo pedido se necessario.',
      }
    }

    return {
      title: 'Sem permissao',
      description: 'Solicite autorizacao para organizar torneios academicos.',
    }
  }, [activePermission, latestPendingRequest, latestRevokedPermission])

  const loadRequests = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError('')

    try {
      const [nextRequests, nextPermissions] = await Promise.all([
        fetchMyCreatorRequests(user.id),
        fetchMyCreatorPermissions(user.id),
      ])
      setRequests(nextRequests)
      setPermissions(nextPermissions)
      await refreshCreatorPermission()
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Nao foi possivel carregar seus pedidos.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [refreshCreatorPermission, user])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequests()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadRequests])

  async function handleCancel(requestId: string) {
    setBusyRequestId(requestId)
    setError('')

    try {
      await cancelCreatorRequest(requestId)
      await refreshCreatorPermission()
      await loadRequests()
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : 'Nao foi possivel cancelar o pedido.',
      )
    } finally {
      setBusyRequestId('')
    }
  }

  return (
    <AuthenticatedShell subtitle="Meus pedidos">
      <div className="page-stack">
        <section className="page-header" aria-labelledby="my-requests-title">
          <div>
            <span className="eyebrow">Organizacao</span>
            <h1 id="my-requests-title">Meus pedidos</h1>
            <p>
              Acompanhe pedidos historicos e a situacao atual da permissao de
              criador de torneios.
            </p>
          </div>
          <div className="page-header-action">
            <a className="button button-primary" href="#/solicitar-criacao-torneio">
              Novo pedido
            </a>
          </div>
        </section>

        <section className="alert alert-info" role="status">
          <strong>{permissionState.title}</strong>
          <div>{permissionState.description}</div>
        </section>

        {error && (
          <div className="form-message form-message-error" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-state" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>Carregando pedidos...</span>
          </div>
        ) : (
          <>
            {permissions.length > 0 && (
              <section className="request-list" aria-label="Minha situacao de permissao">
                {permissions.map((permission) => (
                  <CreatorPermissionCard
                    key={permission.id}
                    permission={permission}
                    mode="user"
                  />
                ))}
              </section>
            )}

            {requests.length === 0 ? (
              <section className="empty-state">
                <span className="empty-state-mark" aria-hidden="true">0</span>
                <h2>Nenhum pedido enviado</h2>
                <p>Solicite permissao para organizar torneios academicos.</p>
                <a className="button button-primary" href="#/solicitar-criacao-torneio">
                  Solicitar permissao
                </a>
              </section>
            ) : (
              <section className="request-list" aria-label="Meus pedidos de criacao">
                {requests.map((request) => (
                  <CreatorRequestCard
                    key={request.id}
                    request={request}
                    mode="user"
                    isBusy={busyRequestId === request.id}
                    onCancel={handleCancel}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </AuthenticatedShell>
  )
}
