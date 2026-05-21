import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { SupabaseTournamentStatusBadge } from '../../components/tournament/TournamentStatusBadge'
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell'
import { useAuth } from '../../context/auth'
import type { TournamentRegistration } from '../../lib/supabase/types'
import {
  canManageTournament,
  cancelTournamentRegistration,
  fetchTournament,
  fetchTournamentRegistrations,
  findActiveRegistration,
  isPublicTournamentStatus,
  registerForTournament,
  tournamentFormatLabels,
  tournamentStatusLabels,
  type TournamentWithCount,
} from '../../services/tournaments'

function formatDate(value: string | null) {
  if (!value) return 'A definir'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`))
}

export function PublicTournamentPage({ tournamentId }: { tournamentId: string }) {
  const { user, profile, isAdmin } = useAuth()
  const [tournament, setTournament] = useState<TournamentWithCount | null>(null)
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const activeRegistrations = useMemo(
    () => registrations.filter((registration) => registration.status === 'registered'),
    [registrations],
  )

  const activeRegistration = findActiveRegistration(activeRegistrations, user?.id)
  const canRegister =
    tournament?.status === 'registrations_open' &&
    !activeRegistration &&
    activeRegistrations.length < (tournament?.max_participants ?? 0)
  const canManage = tournament ? canManageTournament(tournament, user?.id, isAdmin) : false

  const loadTournament = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const nextTournament = await fetchTournament(tournamentId)
      const nextRegistrations = await fetchTournamentRegistrations(nextTournament.id)
      setTournament(nextTournament)
      setRegistrations(nextRegistrations)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar o torneio.',
      )
      setTournament(null)
      setRegistrations([])
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

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!tournament) return

    if (!user) {
      window.location.hash = '#/login'
      return
    }

    const formData = new FormData(event.currentTarget)
    const displayName = String(formData.get('display_name') ?? '').trim()

    if (displayName.length < 2) {
      setError('Informe um nome de inscrição com pelo menos 2 caracteres.')
      return
    }

    setIsSubmitting(true)

    try {
      await registerForTournament(tournament.id, user.id, displayName)
      await loadTournament()
      setSuccess('Inscrição confirmada.')
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : 'Não foi possível realizar inscrição.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCancelRegistration() {
    if (!activeRegistration) return

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await cancelTournamentRegistration(activeRegistration.id)
      await loadTournament()
      setSuccess('Inscrição cancelada.')
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : 'Não foi possível cancelar inscrição.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <AuthenticatedShell subtitle="Torneio público">
        <div className="loading-state" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Carregando torneio...</span>
        </div>
      </AuthenticatedShell>
    )
  }

  if (!tournament) {
    return (
      <AuthenticatedShell subtitle="Torneio público">
        <section className="empty-state">
          <span className="empty-state-mark" aria-hidden="true">?</span>
          <h1>Torneio não encontrado</h1>
          <p>{error || 'O torneio não existe ou ainda não está público.'}</p>
          <a className="button button-primary" href="#/torneios">
            Ver torneios
          </a>
        </section>
      </AuthenticatedShell>
    )
  }

  return (
    <AuthenticatedShell subtitle="Torneio público">
      <div className="page-stack">
        <section className="public-cover" aria-labelledby="public-tournament-title">
          <SupabaseTournamentStatusBadge status={tournament.status} />
          <h1 id="public-tournament-title">{tournament.name}</h1>
          <p>{tournament.description || 'Torneio acadêmico cadastrado na plataforma UTFPR Torneios.'}</p>
          {!isPublicTournamentStatus(tournament.status) && (
            <p className="subtle-note">Este torneio ainda está em rascunho e não aparece publicamente.</p>
          )}
        </section>

        <section className="content-grid two-columns">
          <article className="surface-panel">
            <div className="section-heading">
              <h2>Informações</h2>
              <p>Dados principais do torneio.</p>
            </div>
            <dl className="definition-grid">
              <div>
                <dt>Modalidade</dt>
                <dd>{tournament.modality}</dd>
              </div>
              <div>
                <dt>Formato</dt>
                <dd>{tournamentFormatLabels[tournament.format] ?? tournament.format}</dd>
              </div>
              <div>
                <dt>Campus</dt>
                <dd>{tournament.campus || 'Não informado'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{tournamentStatusLabels[tournament.status]}</dd>
              </div>
              <div>
                <dt>Início</dt>
                <dd>{formatDate(tournament.starts_at)}</dd>
              </div>
              <div>
                <dt>Fim</dt>
                <dd>{formatDate(tournament.ends_at)}</dd>
              </div>
              <div>
                <dt>Inscritos</dt>
                <dd>{activeRegistrations.length}/{tournament.max_participants}</dd>
              </div>
            </dl>
            <div className="card-actions">
              <a className="button button-secondary" href={`#/torneios/${tournament.id}/participantes`}>
                Ver participantes
              </a>
              {canManage && (
                <a className="button button-ghost" href={`#/torneios/${tournament.id}/editar`}>
                  Editar torneio
                </a>
              )}
            </div>
          </article>

          <article className="surface-panel">
            <div className="section-heading">
              <h2>Inscrição</h2>
              <p>Inscrições são aceitas somente no status inscrições abertas.</p>
            </div>

            {error && (
              <div className="form-message form-message-error" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="form-message form-message-success" role="status">
                {success}
              </div>
            )}

            {activeRegistration ? (
              <div className="registration-state">
                <strong>Você já está inscrito.</strong>
                <p>Nome na inscrição: {activeRegistration.display_name}</p>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleCancelRegistration()}
                >
                  {isSubmitting ? 'Cancelando...' : 'Cancelar inscrição'}
                </button>
              </div>
            ) : canRegister ? (
              <form className="auth-form" onSubmit={handleRegister} noValidate>
                <label className="field" htmlFor="registration-display-name">
                  <span>Nome para inscrição</span>
                  <input
                    id="registration-display-name"
                    name="display_name"
                    type="text"
                    defaultValue={profile?.display_name ?? ''}
                    required
                  />
                </label>
                <button className="button button-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Inscrevendo...' : user ? 'Inscrever-se' : 'Entrar para se inscrever'}
                </button>
              </form>
            ) : (
              <div className="registration-state">
                <strong>Inscrição indisponível</strong>
                <p>
                  O torneio precisa estar com inscrições abertas e ter vagas
                  disponíveis.
                </p>
                {!user && (
                  <a className="button button-secondary" href="#/login">
                    Entrar
                  </a>
                )}
              </div>
            )}
          </article>
        </section>
      </div>
    </AuthenticatedShell>
  )
}
