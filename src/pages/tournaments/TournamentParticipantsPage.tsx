import { useCallback, useEffect, useState } from 'react'
import { SupabaseTournamentStatusBadge } from '../../components/tournament/TournamentStatusBadge'
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell'
import type { TournamentRegistration } from '../../lib/supabase/types'
import {
  fetchTournament,
  fetchTournamentRegistrations,
  type TournamentWithCount,
} from '../../services/tournaments'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function TournamentParticipantsPage({
  tournamentId,
}: {
  tournamentId: string
}) {
  const [tournament, setTournament] = useState<TournamentWithCount | null>(null)
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadParticipants = useCallback(async () => {
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
          : 'Não foi possível carregar participantes.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [tournamentId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadParticipants()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadParticipants])

  const activeRegistrations = registrations.filter(
    (registration) => registration.status === 'registered',
  )

  return (
    <AuthenticatedShell subtitle="Participantes">
      <div className="page-stack">
        <section className="page-header" aria-labelledby="participants-title">
          <div>
            <span className="eyebrow">Inscrições</span>
            <h1 id="participants-title">Participantes</h1>
            <p>
              Lista pública de inscrições do torneio. O MVP não exibe RA nem
              email nesta página.
            </p>
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

        {isLoading ? (
          <div className="loading-state" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>Carregando participantes...</span>
          </div>
        ) : !tournament ? (
          <section className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">?</span>
            <h2>Torneio não encontrado</h2>
            <p>O torneio não existe ou ainda não está público.</p>
            <a className="button button-primary" href="#/torneios">
              Ver torneios
            </a>
          </section>
        ) : activeRegistrations.length === 0 ? (
          <section className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">0</span>
            <h2>Nenhum participante inscrito</h2>
            <p>Quando usuários se inscreverem, a lista aparecerá aqui.</p>
            <a className="button button-primary" href={`#/torneios/${tournament.id}`}>
              Voltar ao torneio
            </a>
          </section>
        ) : (
          <section className="surface-panel">
            <div className="section-heading">
              <h2>{tournament.name}</h2>
              <p>{activeRegistrations.length} inscrição ativa.</p>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Participante</th>
                    <th scope="col">Status</th>
                    <th scope="col">Inscrito em</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRegistrations.map((registration) => (
                    <tr key={registration.id}>
                      <th scope="row">{registration.display_name}</th>
                      <td>{registration.status === 'registered' ? 'Inscrito' : 'Cancelado'}</td>
                      <td>{formatDateTime(registration.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </AuthenticatedShell>
  )
}
