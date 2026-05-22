import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { TeamStatusBadge } from '../../components/tournament/TeamStatusBadge'
import { SupabaseTournamentStatusBadge } from '../../components/tournament/TournamentStatusBadge'
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell'
import { useAuth } from '../../context/auth'
import {
  canManageTournament,
  fetchTournament,
  registrationTypeLabels,
  type TournamentWithCount,
} from '../../services/tournaments'
import {
  createTeam,
  fetchTeamsForTournament,
  isTeamComplete,
  type TeamWithMembers,
} from '../../services/teams'

export function TournamentTeamsPage({ tournamentId }: { tournamentId: string }) {
  const { user, isAdmin, canCreateTournaments } = useAuth()
  const [tournament, setTournament] = useState<TournamentWithCount | null>(null)
  const [teams, setTeams] = useState<TeamWithMembers[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadTeams = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const nextTournament = await fetchTournament(tournamentId)
      const nextTeams = await fetchTeamsForTournament(nextTournament.id)
      setTournament(nextTournament)
      setTeams(nextTeams)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar equipes.',
      )
      setTournament(null)
      setTeams([])
    } finally {
      setIsLoading(false)
    }
  }, [tournamentId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTeams()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadTeams])

  const userTeam = useMemo(
    () => teams.find((team) => team.captain_id === user?.id),
    [teams, user?.id],
  )

  const canManage = tournament
    ? canManageTournament(tournament, user?.id, isAdmin, canCreateTournaments)
    : false
  const canCreateTeam =
    Boolean(user) &&
    tournament?.registration_type === 'team' &&
    tournament.status === 'registrations_open' &&
    !userTeam

  async function handleCreateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!user || !tournament) return

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('team_name') ?? '').trim()

    if (name.length < 2) {
      setError('Informe um nome de equipe com pelo menos 2 caracteres.')
      return
    }

    setIsSubmitting(true)

    try {
      const team = await createTeam(tournament.id, name, user.id)
      await loadTeams()
      setSuccess('Equipe criada. Você já foi registrado como capitão.')
      window.location.hash = `#/torneios/${tournament.id}/equipes/${team.id}`
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Não foi possível criar a equipe.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthenticatedShell subtitle="Equipes">
      <div className="page-stack">
        <section className="page-header" aria-labelledby="teams-title">
          <div>
            <span className="eyebrow">Equipes</span>
            <h1 id="teams-title">Equipes do torneio</h1>
            <p>Crie equipe, acompanhe membros e envie a equipe para inscrição.</p>
          </div>
          {tournament && (
            <div className="page-header-action">
              <SupabaseTournamentStatusBadge status={tournament.status} />
            </div>
          )}
        </section>

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

        {isLoading ? (
          <div className="loading-state" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>Carregando equipes...</span>
          </div>
        ) : !tournament ? (
          <section className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">?</span>
            <h2>Torneio não encontrado</h2>
            <p>O torneio não existe ou você não tem permissão para ver equipes.</p>
          </section>
        ) : tournament.registration_type !== 'team' ? (
          <section className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">1</span>
            <h2>Torneio individual</h2>
            <p>Este torneio usa inscrições individuais e não possui equipes.</p>
            <a className="button button-primary" href={`#/torneios/${tournament.id}`}>
              Ver torneio
            </a>
          </section>
        ) : (
          <>
            <section className="surface-panel">
              <div className="section-heading">
                <h2>Configuração</h2>
                <p>
                  {registrationTypeLabels[tournament.registration_type]} · mínimo {tournament.team_min_size} · máximo {tournament.team_max_size}
                </p>
              </div>
              {canCreateTeam ? (
                <form className="form-grid" onSubmit={handleCreateTeam} noValidate>
                  <label className="field" htmlFor="team-name">
                    <span>Nome da equipe</span>
                    <input id="team-name" name="team_name" type="text" required />
                  </label>
                  <div className="form-actions">
                    <button className="button button-primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Criando...' : 'Criar equipe'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="registration-state">
                  <strong>
                    {userTeam ? 'Você já capitaneia uma equipe neste torneio.' : 'Criação de equipe indisponível.'}
                  </strong>
                  <p>
                    A criação exige login, torneio por equipe e inscrições abertas.
                  </p>
                  {userTeam && (
                    <a className="button button-secondary" href={`#/torneios/${tournament.id}/equipes/${userTeam.id}`}>
                      Abrir minha equipe
                    </a>
                  )}
                </div>
              )}
            </section>

            {teams.length === 0 ? (
              <section className="empty-state">
                <span className="empty-state-mark" aria-hidden="true">0</span>
                <h2>Nenhuma equipe criada</h2>
                <p>Quando capitães criarem equipes, elas aparecerão aqui.</p>
              </section>
            ) : (
              <section className="content-grid tournament-grid" aria-label="Equipes cadastradas">
                {teams.map((team) => {
                  const complete = isTeamComplete(tournament, team)

                  return (
                    <article className="team-card" key={team.id}>
                      <div className="card-topline">
                        <TeamStatusBadge status={team.status} />
                        <span>{complete ? 'Completa' : 'Incompleta'}</span>
                      </div>
                      <h2>{team.name}</h2>
                      <dl className="definition-grid">
                        <div>
                          <dt>Membros</dt>
                          <dd>{team.memberCount}/{tournament.team_max_size}</dd>
                        </div>
                        <div>
                          <dt>Mínimo</dt>
                          <dd>{tournament.team_min_size}</dd>
                        </div>
                      </dl>
                      <div className="card-actions">
                        <a className="button button-secondary" href={`#/torneios/${tournament.id}/equipes/${team.id}`}>
                          Ver equipe
                        </a>
                        {canManage && (
                          <a className="button button-ghost" href={`#/torneios/${tournament.id}/participantes`}>
                            Gerenciar inscrição
                          </a>
                        )}
                      </div>
                    </article>
                  )
                })}
              </section>
            )}
          </>
        )}
      </div>
    </AuthenticatedShell>
  )
}
