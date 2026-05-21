import { useState } from 'react'
import { TournamentForm } from '../../components/tournament/TournamentForm'
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell'
import { useAuth } from '../../context/auth'
import { AccessDeniedPage } from '../auth/AccessDeniedPage'
import {
  createTournament,
  type TournamentFormValues,
} from '../../services/tournaments'

export function CreateTournamentPage() {
  const { user, canCreateTournaments } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!canCreateTournaments) {
    return (
      <AccessDeniedPage
        title="Permissão necessária"
        description="Você precisa ser admin ou ter pedido aprovado para criar torneios."
        actionHref="#/solicitar-criacao-torneio"
        actionLabel="Solicitar permissão"
      />
    )
  }

  async function handleSubmit(values: TournamentFormValues) {
    if (!user) return

    setIsSubmitting(true)
    setError('')

    try {
      const tournament = await createTournament(values, user.id)
      window.location.hash = `#/torneios/${tournament.id}`
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Não foi possível criar o torneio.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthenticatedShell subtitle="Criar torneio">
      <div className="page-stack">
        <section className="page-header" aria-labelledby="create-tournament-title">
          <div>
            <span className="eyebrow">Organização</span>
            <h1 id="create-tournament-title">Criar torneio</h1>
            <p>
              Crie um torneio básico no Supabase. Chaves e ranking serão
              módulos posteriores.
            </p>
          </div>
        </section>

        <TournamentForm
          submitLabel="Criar torneio"
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    </AuthenticatedShell>
  )
}
