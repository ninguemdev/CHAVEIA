import { useCallback, useEffect, useState } from 'react'
import { TournamentForm } from '../../components/tournament/TournamentForm'
import { SupabaseTournamentStatusBadge } from '../../components/tournament/TournamentStatusBadge'
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell'
import { useAuth } from '../../context/auth'
import type { Tournament } from '../../lib/supabase/types'
import { AccessDeniedPage } from '../auth/AccessDeniedPage'
import {
  canDeleteTournament,
  canManageTournament,
  deleteTournament,
  fetchTournament,
  type TournamentFormValues,
  updateTournament,
} from '../../services/tournaments'

export function EditTournamentPage({ tournamentId }: { tournamentId: string }) {
  const { user, isAdmin, canCreateTournaments } = useAuth()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadTournament = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      setTournament(await fetchTournament(tournamentId))
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar o torneio.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [tournamentId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTournament()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadTournament])

  async function handleSubmit(values: TournamentFormValues) {
    setIsSubmitting(true)
    setError('')

    try {
      await updateTournament(tournamentId, values)
      await loadTournament()
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Não foi possível atualizar o torneio.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!tournament) return
    if (!window.confirm(`Excluir o torneio "${tournament.name}"?`)) return

    setIsSubmitting(true)
    setError('')

    try {
      await deleteTournament(tournament.id)
      window.location.hash = '#/torneios'
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Não foi possível excluir o torneio.',
      )
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <AuthenticatedShell subtitle="Editar torneio">
        <div className="loading-state" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Carregando torneio...</span>
        </div>
      </AuthenticatedShell>
    )
  }

  if (!tournament) {
    return (
      <AccessDeniedPage
        title="Torneio não encontrado"
        description={error || 'O torneio não existe ou você não tem permissão para acessá-lo.'}
        actionHref="#/torneios"
        actionLabel="Voltar para torneios"
      />
    )
  }

  if (!canManageTournament(tournament, user?.id, isAdmin, canCreateTournaments)) {
    return (
      <AccessDeniedPage
        title="Acesso negado"
        description="Usuário aprovado só pode editar torneios que criou. Admin global pode editar qualquer torneio."
        actionHref={`#/torneios/${tournament.id}`}
        actionLabel="Ver página pública"
      />
    )
  }

  return (
    <AuthenticatedShell subtitle="Editar torneio">
      <div className="page-stack">
        <section className="page-header" aria-labelledby="edit-tournament-title">
          <div>
            <span className="eyebrow">Gestão</span>
            <h1 id="edit-tournament-title">Editar torneio</h1>
            <p>Atualize dados básicos, status e período do torneio.</p>
          </div>
          <div className="page-header-action">
            <SupabaseTournamentStatusBadge status={tournament.status} />
          </div>
        </section>

        <TournamentForm
          key={tournament.updated_at}
          initialTournament={tournament}
          submitLabel="Salvar alterações"
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
        />

        {canDeleteTournament(isAdmin) && (
          <section className="form-section danger-zone" aria-labelledby="danger-zone-title">
            <div className="section-heading">
              <h2 id="danger-zone-title">Zona de risco</h2>
              <p>Excluir remove o torneio e suas inscrições. Esta ação é restrita a admin.</p>
            </div>
            <button
              className="button button-secondary"
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleDelete()}
            >
              Excluir torneio
            </button>
          </section>
        )}
      </div>
    </AuthenticatedShell>
  )
}
