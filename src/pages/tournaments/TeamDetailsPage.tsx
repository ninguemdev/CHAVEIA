import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { TeamStatusBadge } from '../../components/tournament/TeamStatusBadge'
import { SupabaseTournamentStatusBadge } from '../../components/tournament/TournamentStatusBadge'
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell'
import { useAuth } from '../../context/auth'
import { canManageTournament, fetchTournament, type TournamentWithCount } from '../../services/tournaments'
import {
  addTeamMember,
  canEditTeam,
  deleteTeam,
  fetchTeam,
  findProfileForTeamMember,
  isTeamComplete,
  removeTeamMember,
  submitTeamRegistration,
  updateTeamName,
  type TeamWithMembers,
} from '../../services/teams'

export function TeamDetailsPage({
  tournamentId,
  teamId,
}: {
  tournamentId: string
  teamId: string
}) {
  const { user, isAdmin, canCreateTournaments } = useAuth()
  const [tournament, setTournament] = useState<TournamentWithCount | null>(null)
  const [team, setTeam] = useState<TeamWithMembers | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadTeam = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const nextTournament = await fetchTournament(tournamentId)
      const nextTeam = await fetchTeam(teamId)
      setTournament(nextTournament)
      setTeam(nextTeam)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar a equipe.',
      )
      setTournament(null)
      setTeam(null)
    } finally {
      setIsLoading(false)
    }
  }, [teamId, tournamentId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTeam()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadTeam])

  const canManage = tournament
    ? canManageTournament(tournament, user?.id, isAdmin, canCreateTournaments)
    : false
  const canEdit = Boolean(team && tournament && canEditTeam(team, tournament, user?.id, canManage))
  const complete = Boolean(team && tournament && isTeamComplete(tournament, team))

  async function handleRenameTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!team) return

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('team_name') ?? '').trim()

    if (name.length < 2) {
      setError('Informe um nome de equipe com pelo menos 2 caracteres.')
      return
    }

    setIsSubmitting('rename')
    setError('')
    setSuccess('')

    try {
      await updateTeamName(team.id, name)
      await loadTeam()
      setSuccess('Equipe atualizada.')
    } catch (renameError) {
      setError(
        renameError instanceof Error
          ? renameError.message
          : 'Não foi possível atualizar a equipe.',
      )
    } finally {
      setIsSubmitting('')
    }
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!team) return

    const form = event.currentTarget
    const formData = new FormData(event.currentTarget)
    const identifier = String(formData.get('member_identifier') ?? '').trim()

    if (identifier.length < 3) {
      setError('Informe email ou RA do usuário.')
      return
    }

    setIsSubmitting('add-member')
    setError('')
    setSuccess('')

    try {
      const profile = await findProfileForTeamMember(identifier)

      if (!profile) {
        setError('Nenhum usuário encontrado com esse email ou RA.')
        return
      }

      await addTeamMember(team.id, profile.id)
      await loadTeam()
      setSuccess('Membro adicionado.')
      form.reset()
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : 'Não foi possível adicionar membro.',
      )
    } finally {
      setIsSubmitting('')
    }
  }

  async function handleRemoveMember(memberId: string) {
    setIsSubmitting(memberId)
    setError('')
    setSuccess('')

    try {
      await removeTeamMember({ id: memberId })
      await loadTeam()
      setSuccess('Membro removido.')
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Não foi possível remover membro.',
      )
    } finally {
      setIsSubmitting('')
    }
  }

  async function handleSubmitTeam() {
    if (!team) return

    setIsSubmitting('submit')
    setError('')
    setSuccess('')

    try {
      await submitTeamRegistration(team.id)
      await loadTeam()
      setSuccess('Equipe enviada para inscrição.')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível enviar a equipe.',
      )
    } finally {
      setIsSubmitting('')
    }
  }

  async function handleDeleteTeam() {
    if (!team) return

    const confirmed = window.confirm(
      'Excluir esta equipe? Esta ação remove a equipe e os membros vinculados. Use apenas para equipes em rascunho.',
    )

    if (!confirmed) return

    setIsSubmitting('delete-team')
    setError('')
    setSuccess('')

    try {
      await deleteTeam(team.id)
      setSuccess('Equipe excluída.')
      window.location.hash = `#/torneios/${tournamentId}/equipes`
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Não foi possível excluir a equipe.',
      )
    } finally {
      setIsSubmitting('')
    }
  }

  return (
    <AuthenticatedShell subtitle="Equipe">
      <div className="page-stack">
        <section className="page-header" aria-labelledby="team-details-title">
          <div>
            <span className="eyebrow">Equipe</span>
            <h1 id="team-details-title">{team?.name ?? 'Detalhes da equipe'}</h1>
            <p>Gerencie membros, valide tamanho mínimo e envie a equipe para inscrição.</p>
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
            <span>Carregando equipe...</span>
          </div>
        ) : !tournament || !team ? (
          <section className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">?</span>
            <h2>Equipe não encontrada</h2>
            <p>A equipe não existe ou você não tem permissão para acessá-la.</p>
          </section>
        ) : (
          <>
            <section className="content-grid two-columns">
              <article className="surface-panel">
                <div className="section-heading">
                  <h2>Resumo</h2>
                  <p>{complete ? 'Equipe completa para inscrição.' : 'Equipe ainda incompleta.'}</p>
                </div>
                <dl className="definition-grid">
                  <div>
                    <dt>Status</dt>
                    <dd><TeamStatusBadge status={team.status} /></dd>
                  </div>
                  <div>
                    <dt>Membros</dt>
                    <dd>{team.memberCount}/{tournament.team_max_size}</dd>
                  </div>
                  <div>
                    <dt>Mínimo</dt>
                    <dd>{tournament.team_min_size}</dd>
                  </div>
                  <div>
                    <dt>Capitão</dt>
                    <dd>{team.members.find((member) => member.role === 'captain')?.display_name ?? 'Não identificado'}</dd>
                  </div>
                </dl>
                <div className="card-actions">
                  <button
                    className="button button-primary"
                    type="button"
                    disabled={!canEdit || !complete || isSubmitting !== '' || team.status !== 'draft'}
                    onClick={() => void handleSubmitTeam()}
                  >
                    {isSubmitting === 'submit' ? 'Enviando...' : 'Enviar inscrição da equipe'}
                  </button>
                  <button
                    className="button button-secondary"
                    type="button"
                    disabled={!canEdit || isSubmitting !== '' || team.status !== 'draft'}
                    onClick={() => void handleDeleteTeam()}
                  >
                    {isSubmitting === 'delete-team' ? 'Excluindo...' : 'Excluir equipe'}
                  </button>
                </div>
              </article>

              <form className="surface-panel" onSubmit={handleRenameTeam} noValidate>
                <div className="section-heading">
                  <h2>Dados da equipe</h2>
                  <p>Capitão pode editar enquanto inscrições estiverem abertas.</p>
                </div>
                <label className="field" htmlFor="team-name-edit">
                  <span>Nome da equipe</span>
                  <input
                    id="team-name-edit"
                    name="team_name"
                    type="text"
                    defaultValue={team.name}
                    disabled={!canEdit}
                    required
                  />
                </label>
                <div className="form-actions">
                  <button className="button button-secondary" type="submit" disabled={!canEdit || isSubmitting !== ''}>
                    {isSubmitting === 'rename' ? 'Salvando...' : 'Salvar nome'}
                  </button>
                </div>
              </form>
            </section>

            <section className="surface-panel">
              <div className="section-heading">
                <h2>Membros</h2>
                <p>Adição por usuário existente usando email ou RA exato.</p>
              </div>

              {canEdit && (
                <form className="toolbar" onSubmit={handleAddMember} noValidate>
                  <label className="field" htmlFor="member-identifier">
                    <span>Email ou RA</span>
                    <input id="member-identifier" name="member_identifier" type="text" required />
                  </label>
                  <button className="button button-primary" type="submit" disabled={isSubmitting !== ''}>
                    {isSubmitting === 'add-member' ? 'Adicionando...' : 'Adicionar membro'}
                  </button>
                </form>
              )}

              <div className="content-grid two-columns">
                {team.members.map((member) => (
                  <article className="participant-card" key={member.id}>
                    <span className="avatar" aria-hidden="true">
                      {member.display_name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <h3>{member.display_name}</h3>
                      <p>{member.role === 'captain' ? 'Capitão' : 'Membro'}</p>
                    </div>
                    {canEdit && member.role !== 'captain' && (
                      <button
                        className="button button-ghost"
                        type="button"
                        disabled={isSubmitting !== ''}
                        onClick={() => void handleRemoveMember(member.id)}
                      >
                        {isSubmitting === member.id ? 'Removendo...' : 'Remover'}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AuthenticatedShell>
  )
}
