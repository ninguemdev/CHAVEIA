import type { AvatarKey } from '../../lib/supabase/types'

export type AvatarOption = {
  key: AvatarKey
  label: string
  initials: string
  tone: 'blue' | 'green' | 'gold' | 'purple' | 'gray'
}

export const avatarOptions: AvatarOption[] = [
  {
    key: 'avatar_arcade_blue',
    label: 'Arcade azul',
    initials: 'P1',
    tone: 'blue',
  },
  {
    key: 'avatar_arcade_green',
    label: 'Arcade verde',
    initials: 'P2',
    tone: 'green',
  },
  {
    key: 'avatar_arcade_gold',
    label: 'Arcade dourado',
    initials: 'GG',
    tone: 'gold',
  },
  {
    key: 'avatar_competition',
    label: 'Competição',
    initials: 'VS',
    tone: 'purple',
  },
  {
    key: 'avatar_academic',
    label: 'Clássico',
    initials: 'OG',
    tone: 'gray',
  },
]

export function getAvatarOption(avatarKey?: AvatarKey | null) {
  return (
    avatarOptions.find((option) => option.key === avatarKey) ??
    avatarOptions[0]
  )
}
