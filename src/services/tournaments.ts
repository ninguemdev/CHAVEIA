import { supabase } from '../lib/supabase/client'
import type {
  Tournament,
  TournamentRegistration,
  TournamentStatus,
} from '../lib/supabase/types'

export type TournamentWithCount = Tournament & {
  registrationCount: number
}

export type TournamentFormValues = {
  name: string
  modality: string
  description: string | null
  campus: string | null
  format: string
  status: TournamentStatus
  max_participants: number
  starts_at: string | null
  ends_at: string | null
}

export const tournamentStatusLabels: Record<TournamentStatus, string> = {
  draft: 'Rascunho',
  registrations_open: 'Inscrições abertas',
  registrations_closed: 'Inscrições encerradas',
  ongoing: 'Em andamento',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
}

export const tournamentFormatLabels: Record<string, string> = {
  single_elimination: 'Mata-mata simples',
  round_robin: 'Pontos corridos',
  groups_playoffs: 'Grupos + playoffs',
  swiss: 'Sistema suíço',
}

function getTournamentError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('duplicate') || normalized.includes('unique')) {
    return 'Já existe um registro parecido. Revise os dados e tente novamente.'
  }

  if (normalized.includes('registrations_open') || normalized.includes('inscrições')) {
    return 'Inscrições só são permitidas quando o torneio está com inscrições abertas.'
  }

  if (normalized.includes('limite') || normalized.includes('participantes')) {
    return 'O torneio atingiu o limite de participantes.'
  }

  if (normalized.includes('permission') || normalized.includes('rls')) {
    return 'Permissão negada pelo banco.'
  }

  return message
}

export function isPublicTournamentStatus(status: TournamentStatus) {
  return status !== 'draft'
}

export function canManageTournament(
  tournament: Pick<Tournament, 'created_by'>,
  userId: string | undefined,
  isAdmin: boolean,
) {
  return isAdmin || Boolean(userId && tournament.created_by === userId)
}

export function canDeleteTournament(isAdmin: boolean) {
  return isAdmin
}

export function slugifyTournamentName(name: string) {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'torneio'
}

function buildTournamentSlug(name: string) {
  return `${slugifyTournamentName(name)}-${crypto.randomUUID().slice(0, 8)}`
}

async function countRegistrations(tournaments: Tournament[]) {
  const ids = tournaments.map((tournament) => tournament.id)

  if (ids.length === 0) return new Map<string, number>()

  const { data, error } = await supabase
    .from('tournament_registrations')
    .select('tournament_id, status')
    .in('tournament_id', ids)
    .eq('status', 'registered')

  if (error) throw new Error(getTournamentError(error.message))

  return data.reduce((counts, registration) => {
    counts.set(
      registration.tournament_id,
      (counts.get(registration.tournament_id) ?? 0) + 1,
    )
    return counts
  }, new Map<string, number>())
}

export async function fetchTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(getTournamentError(error.message))

  const counts = await countRegistrations(data)

  return data.map<TournamentWithCount>((tournament) => ({
    ...tournament,
    registrationCount: counts.get(tournament.id) ?? 0,
  }))
}

export async function fetchTournament(tournamentId: string) {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single()

  if (error) throw new Error(getTournamentError(error.message))

  const counts = await countRegistrations([data])

  return {
    ...data,
    registrationCount: counts.get(data.id) ?? 0,
  } satisfies TournamentWithCount
}

export async function createTournament(
  values: TournamentFormValues,
  userId: string,
) {
  const { data, error } = await supabase
    .from('tournaments')
    .insert({
      ...values,
      slug: buildTournamentSlug(values.name),
      created_by: userId,
    })
    .select('*')
    .single()

  if (error) throw new Error(getTournamentError(error.message))

  return data
}

export async function updateTournament(
  tournamentId: string,
  values: TournamentFormValues,
) {
  const { data, error } = await supabase
    .from('tournaments')
    .update(values)
    .eq('id', tournamentId)
    .select('*')
    .single()

  if (error) throw new Error(getTournamentError(error.message))

  return data
}

export async function deleteTournament(tournamentId: string) {
  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', tournamentId)

  if (error) throw new Error(getTournamentError(error.message))
}

export async function fetchTournamentRegistrations(tournamentId: string) {
  const { data, error } = await supabase
    .from('tournament_registrations')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(getTournamentError(error.message))

  return data
}

export function findActiveRegistration(
  registrations: TournamentRegistration[],
  userId: string | undefined,
) {
  return registrations.find(
    (registration) =>
      registration.user_id === userId && registration.status === 'registered',
  )
}

export async function registerForTournament(
  tournamentId: string,
  userId: string,
  displayName: string,
) {
  const { data, error } = await supabase
    .from('tournament_registrations')
    .insert({
      tournament_id: tournamentId,
      user_id: userId,
      display_name: displayName,
    })
    .select('*')
    .single()

  if (error) throw new Error(getTournamentError(error.message))

  return data
}

export async function cancelTournamentRegistration(registrationId: string) {
  const { data, error } = await supabase
    .from('tournament_registrations')
    .update({ status: 'cancelled' })
    .eq('id', registrationId)
    .select('*')
    .single()

  if (error) throw new Error(getTournamentError(error.message))

  return data
}
