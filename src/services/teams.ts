import { supabase } from '../lib/supabase/client'
import type {
  ProfileLookupResult,
  Team,
  TeamMember,
  TeamMemberWithProfile,
  TeamStatus,
  Tournament,
} from '../lib/supabase/types'

export type TeamWithMembers = Team & {
  memberCount: number
  members: TeamMemberWithProfile[]
}

export const teamStatusLabels: Record<TeamStatus, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  rejected: 'Rejeitada',
}

function getTeamError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('duplicate') || normalized.includes('unique')) {
    return 'Já existe uma equipe ou membro com esses dados neste torneio.'
  }

  if (normalized.includes('tamanho máximo')) {
    return 'A equipe atingiu o tamanho máximo.'
  }

  if (normalized.includes('tamanho mínimo') || normalized.includes('incompleta')) {
    return 'A equipe ainda não atingiu o tamanho mínimo.'
  }

  if (normalized.includes('registrations_open') || normalized.includes('inscrições')) {
    return 'Equipes só podem ser alteradas enquanto as inscrições estão abertas.'
  }

  if (normalized.includes('permission') || normalized.includes('rls')) {
    return 'Permissão negada pelo banco.'
  }

  return message
}

export function canEditTeam(
  team: Pick<Team, 'captain_id'>,
  tournament: Pick<Tournament, 'status'>,
  userId: string | undefined,
  canManageTournament: boolean,
) {
  return (
    tournament.status === 'registrations_open' &&
    (canManageTournament || Boolean(userId && team.captain_id === userId))
  )
}

export function isTeamComplete(
  tournament: Pick<Tournament, 'team_min_size'>,
  team: Pick<TeamWithMembers, 'memberCount'>,
) {
  return team.memberCount >= tournament.team_min_size
}

export async function fetchTeamMembers(teamId: string) {
  const { data, error } = await supabase.rpc('get_team_members_with_profiles', {
    target_team_id: teamId,
  })

  if (error) throw new Error(getTeamError(error.message))

  return data
}

export async function fetchTeamsForTournament(tournamentId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(getTeamError(error.message))

  const withMembers = await Promise.all(
    data.map(async (team) => {
      const members = await fetchTeamMembers(team.id)
      return {
        ...team,
        members,
        memberCount: members.length,
      } satisfies TeamWithMembers
    }),
  )

  return withMembers
}

export async function fetchTeam(teamId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()

  if (error) throw new Error(getTeamError(error.message))

  const members = await fetchTeamMembers(data.id)

  return {
    ...data,
    members,
    memberCount: members.length,
  } satisfies TeamWithMembers
}

export async function createTeam(
  tournamentId: string,
  name: string,
  captainId: string,
) {
  const { data, error } = await supabase
    .from('teams')
    .insert({
      tournament_id: tournamentId,
      name,
      captain_id: captainId,
      created_by: captainId,
      status: 'draft',
    })
    .select('*')
    .single()

  if (error) throw new Error(getTeamError(error.message))

  return data
}

export async function updateTeamName(teamId: string, name: string) {
  const { data, error } = await supabase
    .from('teams')
    .update({ name })
    .eq('id', teamId)
    .select('*')
    .single()

  if (error) throw new Error(getTeamError(error.message))

  return data
}

export async function findProfileForTeamMember(identifier: string) {
  const { data, error } = await supabase.rpc('find_profile_for_team_member', {
    identifier,
  })

  if (error) throw new Error(getTeamError(error.message))

  return (data[0] ?? null) as ProfileLookupResult | null
}

export async function addTeamMember(teamId: string, userId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: userId,
      role: 'member',
      status: 'active',
    })
    .select('*')
    .single()

  if (error) throw new Error(getTeamError(error.message))

  return data
}

export async function removeTeamMember(member: Pick<TeamMember, 'id'>) {
  const { data, error } = await supabase
    .from('team_members')
    .update({ status: 'removed' })
    .eq('id', member.id)
    .select('*')
    .single()

  if (error) throw new Error(getTeamError(error.message))

  return data
}

export async function submitTeamRegistration(teamId: string) {
  const { data, error } = await supabase.rpc('submit_team_registration', {
    target_team_id: teamId,
  })

  if (error) throw new Error(getTeamError(error.message))

  return data
}

export async function deleteTeam(teamId: string) {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId)

  if (error) throw new Error(getTeamError(error.message))
}
