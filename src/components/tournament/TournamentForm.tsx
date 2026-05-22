import { type FormEvent, useState } from 'react'
import type { RegistrationType, Tournament, TournamentStatus } from '../../lib/supabase/types'
import {
  registrationTypeLabels,
  type TournamentFormValues,
  tournamentFormatLabels,
  tournamentStatusLabels,
} from '../../services/tournaments'

type TournamentFormProps = {
  initialTournament?: Tournament
  submitLabel: string
  isSubmitting: boolean
  error: string
  onSubmit: (values: TournamentFormValues) => Promise<void>
}

const statusOptions: TournamentStatus[] = [
  'draft',
  'registrations_open',
  'registrations_closed',
  'ongoing',
  'finished',
  'cancelled',
]

function readNullableText(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim()
  return text.length > 0 ? text : null
}

export function TournamentForm({
  initialTournament,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
}: TournamentFormProps) {
  const [localError, setLocalError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const modality = String(formData.get('modality') ?? '').trim()
    const format = String(formData.get('format') ?? '').trim()
    const maxParticipants = Number(formData.get('max_participants') ?? 0)
    const registrationType = String(
      formData.get('registration_type') ?? 'individual',
    ) as RegistrationType
    const teamMinSize = Number(formData.get('team_min_size') ?? 1)
    const teamMaxSize = Number(formData.get('team_max_size') ?? 1)

    if (name.length < 4) {
      setLocalError('Informe um nome com pelo menos 4 caracteres.')
      return
    }

    if (modality.length < 2) {
      setLocalError('Informe a modalidade do torneio.')
      return
    }

    if (!Number.isInteger(maxParticipants) || maxParticipants < 2) {
      setLocalError('Informe pelo menos 2 participantes.')
      return
    }

    if (
      !Number.isInteger(teamMinSize) ||
      !Number.isInteger(teamMaxSize) ||
      teamMinSize < 1 ||
      teamMaxSize < teamMinSize
    ) {
      setLocalError('Informe tamanhos de equipe válidos.')
      return
    }

    await onSubmit({
      name,
      modality,
      format,
      status: String(formData.get('status') ?? 'draft') as TournamentStatus,
      max_participants: maxParticipants,
      registration_type: registrationType,
      team_min_size: registrationType === 'individual' ? 1 : teamMinSize,
      team_max_size: registrationType === 'individual' ? 1 : teamMaxSize,
      campus: readNullableText(formData.get('campus')),
      description: readNullableText(formData.get('description')),
      starts_at: readNullableText(formData.get('starts_at')),
      ends_at: readNullableText(formData.get('ends_at')),
    })
  }

  return (
    <form className="form-layout" onSubmit={handleSubmit} noValidate>
      {(error || localError) && (
        <div className="form-message form-message-error" role="alert">
          {error || localError}
        </div>
      )}

      <section className="form-section" aria-labelledby="tournament-main-data">
        <div className="section-heading">
          <h2 id="tournament-main-data">Dados principais</h2>
          <p>Esses dados aparecem na lista e na página pública do torneio.</p>
        </div>

        <div className="form-grid">
          <label className="field" htmlFor="tournament-name-real">
            <span>Nome do torneio</span>
            <input
              id="tournament-name-real"
              name="name"
              type="text"
              defaultValue={initialTournament?.name ?? ''}
              required
            />
          </label>

          <label className="field" htmlFor="tournament-modality-real">
            <span>Modalidade</span>
            <input
              id="tournament-modality-real"
              name="modality"
              type="text"
              defaultValue={initialTournament?.modality ?? ''}
              placeholder="Valorant, xadrez, futsal"
              required
            />
          </label>

          <label className="field" htmlFor="tournament-campus-real">
            <span>Campus</span>
            <input
              id="tournament-campus-real"
              name="campus"
              type="text"
              defaultValue={initialTournament?.campus ?? ''}
              placeholder="Curitiba"
            />
          </label>

          <label className="field" htmlFor="tournament-registration-type">
            <span>Tipo de inscrição</span>
            <select
              id="tournament-registration-type"
              name="registration_type"
              defaultValue={initialTournament?.registration_type ?? 'individual'}
            >
              {Object.entries(registrationTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="field" htmlFor="tournament-max-participants">
            <span>Limite de participantes</span>
            <input
              id="tournament-max-participants"
              name="max_participants"
              type="number"
              min="2"
              defaultValue={initialTournament?.max_participants ?? 16}
              required
            />
          </label>
        </div>

        <label className="field" htmlFor="tournament-description-real">
          <span>Descrição pública</span>
          <textarea
            id="tournament-description-real"
            name="description"
            rows={5}
            defaultValue={initialTournament?.description ?? ''}
            placeholder="Explique contexto, regras iniciais e público esperado."
          />
        </label>
      </section>

      <section className="form-section" aria-labelledby="tournament-team-data">
        <div className="section-heading">
          <h2 id="tournament-team-data">Preparação para equipes</h2>
          <p>
            O cadastro completo de membros fica para uma etapa futura; estes
            campos já registram o tipo de inscrição e limites de equipe.
          </p>
        </div>

        <div className="form-grid">
          <label className="field" htmlFor="tournament-team-min-size">
            <span>Mínimo por equipe</span>
            <input
              id="tournament-team-min-size"
              name="team_min_size"
              type="number"
              min="1"
              defaultValue={initialTournament?.team_min_size ?? 1}
              required
            />
          </label>

          <label className="field" htmlFor="tournament-team-max-size">
            <span>Máximo por equipe</span>
            <input
              id="tournament-team-max-size"
              name="team_max_size"
              type="number"
              min="1"
              defaultValue={initialTournament?.team_max_size ?? 1}
              required
            />
          </label>
        </div>
      </section>

      <section className="form-section" aria-labelledby="tournament-rules-data">
        <div className="section-heading">
          <h2 id="tournament-rules-data">Formato e status</h2>
          <p>Chaves e ranking ainda não fazem parte deste módulo inicial.</p>
        </div>

        <div className="form-grid">
          <label className="field" htmlFor="tournament-format-real">
            <span>Formato planejado</span>
            <select
              id="tournament-format-real"
              name="format"
              defaultValue={initialTournament?.format ?? 'single_elimination'}
            >
              {Object.entries(tournamentFormatLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="field" htmlFor="tournament-status-real">
            <span>Status</span>
            <select
              id="tournament-status-real"
              name="status"
              defaultValue={initialTournament?.status ?? 'draft'}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {tournamentStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="field" htmlFor="tournament-starts-at">
            <span>Data inicial</span>
            <input
              id="tournament-starts-at"
              name="starts_at"
              type="date"
              defaultValue={initialTournament?.starts_at ?? ''}
            />
          </label>

          <label className="field" htmlFor="tournament-ends-at">
            <span>Data final</span>
            <input
              id="tournament-ends-at"
              name="ends_at"
              type="date"
              defaultValue={initialTournament?.ends_at ?? ''}
            />
          </label>
        </div>
      </section>

      <div className="form-actions">
        <a className="button button-secondary" href="#/torneios">
          Cancelar
        </a>
        <button className="button button-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
