import { useCallback, useEffect, useMemo, useState } from 'react'
import { TournamentRegistrationStatusBadge } from '../../components/tournament/TournamentRegistrationStatusBadge'
import { SupabaseTournamentStatusBadge } from '../../components/tournament/TournamentStatusBadge'
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell'
import { useAuth } from '../../context/auth'
import type { TournamentRegistration, TournamentRegistrationStatus } from '../../lib/supabase/types'
import {
  canManageTournament,
  fetchTournament,
  fetchTournamentRegistrations,
  publicParticipantStatuses,
  registrationTypeLabels,
  tournamentRegistrationStatusLabels,
  updateTournamentRegistrationStatus,
  type TournamentWithCount,
} from '../../services/tournaments'

function formatDateTime(value: string | null) {
  if (!value) return 'Não registrado'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

type ManageAction = Extract<
  TournamentRegistrationStatus,
  'confirmed' | 'rejected' | 'cancelled' | 'checked_in'
>

function canApplyManageAction(
  registration: TournamentRegistration,
  action: ManageAction,
) {
  if (['cancelled', 'rejected'].includes(registration.status)) return false
  if (action === 'confirmed') return registration.status === 'pending'
  if (action === 'rejected') return registration.status === 'pending'
  if (action === 'cancelled') return ['pending', 'confirmed'].includes(registration.status)
  if (action === 'checked_in') return registration.status === 'confirmed'
  return false
}

export function TournamentParticipantsPage({
  tournamentId,
}: {
  tournamentId: string
}) {
  const { user, isAdmin, canCreateTournaments } = useAuth()
  const [tournament, setTournament] = useState<TournamentWithCount | null>(null)
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([])
  const [notesByRegistration, setNotesByRegistration] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadParticipants = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const nextTournament = await fetchTournament(tournamentId)
      const nextRegistrations = await fetchTournamentRegistrations(nextTournament.id)
      setTournament(nextTournament)
      setRegistrations(nextRegistrations)
      setNotesByRegistration(
        nextRegistrations.reduce<Record<string, string>>((notes, registration) => {
          notes[registration.id] = registration.admin_notes ?? ''
          return notes
        }, {}),
      )
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

  const canManage = tournament
    ? canManageTournament(tournament, user?.id, isAdmin, canCreateTournaments)
    : false
  const visibleRegistrations = useMemo(
    () =>
      canManage
        ? registrations
        : registrations.filter((registration) =>
            publicParticipantStatuses.includes(registration.status),
          ),
    [canManage, registrations],
  )

  async function handleRegistrationAction(
    registration: TournamentRegistration,
    status: ManageAction,
  ) {
    setIsSubmitting(`${registration.id}:${status}`)
    setError('')
    setSuccess('')

    try {
      await updateTournamentRegistrationStatus(
        registration.id,
        status,
        notesByRegistration[registration.id]?.trim() || null,
      )
      await loadParticipants()
      setSuccess(`Inscrição marcada como ${tournamentRegistrationStatusLabels[status].toLowerCase()}.`)
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Não foi possível atualizar a inscrição.',
      )
    } finally {
      setIsSubmitting('')
    }
  }

  return (
    <AuthenticatedShell subtitle="Participantes">
      <div className="page-stack">
        <section className="page-header" aria-labelledby="participants-title">
          <div>
            <span className="eyebrow">Inscrições</span>
            <h1 id="participants-title">Participantes</h1>
            <p>
              Lista de inscritos com histórico de status. Participantes públicos
              mostram apenas inscrições confirmadas; gestores veem o fluxo completo.
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
        {success && (
          <div className="form-message form-message-success" role="status">
            {success}
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
            <p>O torneio não existe ou você não tem permissão para ver inscrições.</p>
            <a className="button button-primary" href="#/torneios">
              Ver torneios
            </a>
          </section>
        ) : visibleRegistrations.length === 0 ? (
          <section className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">0</span>
            <h2>Nenhum participante visível</h2>
            <p>
              Inscrições pendentes aparecem aqui para admin ou organizador do
              torneio. A página pública só mostra confirmados.
            </p>
            <a className="button button-primary" href={`#/torneios/${tournament.id}`}>
              Voltar ao torneio
            </a>
          </section>
        ) : (
          <section className="surface-panel">
            <div className="section-heading">
              <h2>{tournament.name}</h2>
              <p>
                {visibleRegistrations.length} inscrição(ões)
                {canManage ? ' no painel de gestão.' : ' confirmada(s).'}
              </p>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Participante</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Status</th>
                    <th scope="col">Inscrito em</th>
                    {canManage && <th scope="col">Gestão</th>}
                  </tr>
                </thead>
                <tbody>
                  {visibleRegistrations.map((registration) => (
                    <tr key={registration.id}>
                      <th scope="row">
                        <span className="table-title">{registration.display_name}</span>
                        <span className="row-note">{registration.user_id}</span>
                      </th>
                      <td>{registrationTypeLabels[registration.registration_type]}</td>
                      <td>
                        <TournamentRegistrationStatusBadge status={registration.status} />
                      </td>
                      <td>{formatDateTime(registration.created_at)}</td>
                      {canManage && (
                        <td>
                          <div className="registration-admin-actions">
                            <label className="field" htmlFor={`admin-note-${registration.id}`}>
                              <span>Observação administrativa</span>
                              <textarea
                                id={`admin-note-${registration.id}`}
                                rows={2}
                                value={notesByRegistration[registration.id] ?? ''}
                                onChange={(event) =>
                                  setNotesByRegistration((current) => ({
                                    ...current,
                                    [registration.id]: event.target.value,
                                  }))
                                }
                              />
                            </label>
                            <div className="button-row">
                              <button
                                className="button button-secondary"
                                type="button"
                                disabled={
                                  isSubmitting !== '' ||
                                  !canApplyManageAction(registration, 'confirmed')
                                }
                                onClick={() => void handleRegistrationAction(registration, 'confirmed')}
                              >
                                {isSubmitting === `${registration.id}:confirmed`
                                  ? 'Confirmando...'
                                  : 'Confirmar'}
                              </button>
                              <button
                                className="button button-ghost"
                                type="button"
                                disabled={
                                  isSubmitting !== '' ||
                                  !canApplyManageAction(registration, 'rejected')
                                }
                                onClick={() => void handleRegistrationAction(registration, 'rejected')}
                              >
                                {isSubmitting === `${registration.id}:rejected`
                                  ? 'Rejeitando...'
                                  : 'Rejeitar'}
                              </button>
                              <button
                                className="button button-ghost"
                                type="button"
                                disabled={
                                  isSubmitting !== '' ||
                                  !canApplyManageAction(registration, 'cancelled')
                                }
                                onClick={() => void handleRegistrationAction(registration, 'cancelled')}
                              >
                                {isSubmitting === `${registration.id}:cancelled`
                                  ? 'Cancelando...'
                                  : 'Cancelar'}
                              </button>
                            </div>
                          </div>
                        </td>
                      )}
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
