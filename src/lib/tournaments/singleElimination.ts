import type { TournamentStatus } from '../supabase/types'

export type BracketSeedingMethod = 'draw' | 'seeded'
export type GeneratedMatchStatus = 'pending' | 'ready' | 'bye' | 'completed'
export type MatchSlot = 'a' | 'b'

export type BracketParticipant = {
  id: string
  displayName: string
  seed: number | null
}

export type BracketSlot = {
  position: number
  participant: BracketParticipant | null
  isBye: boolean
}

export type GeneratedBracketMatch = {
  temporaryId: string
  roundNumber: number
  matchNumber: number
  participantAId: string | null
  participantBId: string | null
  winnerParticipantId: string | null
  status: GeneratedMatchStatus
  isBye: boolean
  nextMatchKey: string | null
  nextMatchSlot: MatchSlot | null
}

export type GeneratedBracket = {
  size: number
  byeCount: number
  roundsCount: number
  seedingMethod: BracketSeedingMethod
  slots: BracketSlot[]
  matches: GeneratedBracketMatch[]
}

export function calculateNextPowerOfTwo(value: number) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('A quantidade de participantes deve ser positiva.')
  }

  let power = 1
  while (power < value) power *= 2
  return power
}

export function calculateByeCount(participantCount: number) {
  return calculateNextPowerOfTwo(participantCount) - participantCount
}

export function generateSeedPositions(size: number): number[] {
  if (!Number.isInteger(size) || size < 2 || (size & (size - 1)) !== 0) {
    throw new Error('O tamanho da chave precisa ser uma potência de 2.')
  }

  let positions = [1, 2]

  while (positions.length < size) {
    const nextSize = positions.length * 2
    positions = positions.flatMap((seed) => [seed, nextSize + 1 - seed])
  }

  return positions
}

export function applyDraw(
  participants: BracketParticipant[],
  size: number,
  random: () => number = Math.random,
) {
  const shuffled = shuffle(participants, random)
  return fillSlots(shuffled, size)
}

export function applySeeding(
  participants: BracketParticipant[],
  size: number,
  random: () => number = Math.random,
) {
  const slots = Array<BracketParticipant | null>(size).fill(null)
  const seedPositions = generateSeedPositions(size)
  const usedIds = new Set<string>()
  const usedSeeds = new Set<number>()

  for (const participant of participants) {
    if (
      participant.seed === null ||
      !Number.isInteger(participant.seed) ||
      participant.seed < 1 ||
      participant.seed > size ||
      usedSeeds.has(participant.seed)
    ) {
      continue
    }

    const slotIndex = seedPositions.indexOf(participant.seed)
    if (slotIndex >= 0 && !slots[slotIndex]) {
      slots[slotIndex] = participant
      usedIds.add(participant.id)
      usedSeeds.add(participant.seed)
    }
  }

  const remaining = shuffle(
    participants.filter((participant) => !usedIds.has(participant.id)),
    random,
  )
  let remainingIndex = 0

  for (let index = 0; index < slots.length; index += 1) {
    if (!slots[index]) {
      slots[index] = remaining[remainingIndex] ?? null
      remainingIndex += 1
    }
  }

  return slotsToBracketSlots(slots)
}

export function generateFirstRoundMatches(slots: BracketSlot[]) {
  const matches: GeneratedBracketMatch[] = []

  for (let index = 0; index < slots.length; index += 2) {
    const slotA = slots[index]
    const slotB = slots[index + 1]
    const hasA = Boolean(slotA?.participant)
    const hasB = Boolean(slotB?.participant)
    const isBye = hasA !== hasB

    matches.push({
      temporaryId: matchKey(1, matches.length + 1),
      roundNumber: 1,
      matchNumber: matches.length + 1,
      participantAId: slotA?.participant?.id ?? null,
      participantBId: slotB?.participant?.id ?? null,
      winnerParticipantId: isBye
        ? (slotA?.participant?.id ?? slotB?.participant?.id ?? null)
        : null,
      status: isBye ? 'bye' : hasA && hasB ? 'ready' : 'pending',
      isBye,
      nextMatchKey: null,
      nextMatchSlot: null,
    })
  }

  return matches
}

export function generateNextRounds(size: number) {
  const roundsCount = Math.log2(size)
  const matches: GeneratedBracketMatch[] = []

  for (let roundNumber = 2; roundNumber <= roundsCount; roundNumber += 1) {
    const matchesInRound = size / 2 ** roundNumber

    for (let matchNumber = 1; matchNumber <= matchesInRound; matchNumber += 1) {
      matches.push({
        temporaryId: matchKey(roundNumber, matchNumber),
        roundNumber,
        matchNumber,
        participantAId: null,
        participantBId: null,
        winnerParticipantId: null,
        status: 'pending',
        isBye: false,
        nextMatchKey: null,
        nextMatchSlot: null,
      })
    }
  }

  return matches
}

export function advanceParticipantWithBye(
  matches: GeneratedBracketMatch[],
  match: GeneratedBracketMatch,
) {
  if (!match.isBye || !match.winnerParticipantId || !match.nextMatchKey) return matches

  return advanceWinner(matches, match.temporaryId, match.winnerParticipantId)
}

export function advanceWinner(
  matches: GeneratedBracketMatch[],
  matchKeyToAdvance: string,
  winnerParticipantId: string,
) {
  const updated = matches.map((match) => ({ ...match }))
  const sourceMatch = updated.find((match) => match.temporaryId === matchKeyToAdvance)

  if (!sourceMatch) {
    throw new Error('Partida de origem não encontrada.')
  }

  if (
    sourceMatch.participantAId !== winnerParticipantId &&
    sourceMatch.participantBId !== winnerParticipantId
  ) {
    throw new Error('Vencedor não pertence à partida.')
  }

  sourceMatch.winnerParticipantId = winnerParticipantId
  if (sourceMatch.status !== 'bye') sourceMatch.status = 'completed'

  if (!sourceMatch.nextMatchKey || !sourceMatch.nextMatchSlot) return updated

  const nextMatch = updated.find((match) => match.temporaryId === sourceMatch.nextMatchKey)

  if (!nextMatch) {
    throw new Error('Próxima partida não encontrada.')
  }

  if (sourceMatch.nextMatchSlot === 'a') {
    nextMatch.participantAId = winnerParticipantId
  } else {
    nextMatch.participantBId = winnerParticipantId
  }

  if (nextMatch.participantAId && nextMatch.participantBId) {
    nextMatch.status = 'ready'
  }

  return updated
}

export function validateCanGenerateBracket(params: {
  format: string
  status: TournamentStatus
  participantCount: number
  existingBracket: boolean
  forceRegenerate: boolean
}) {
  if (params.format !== 'single_elimination') {
    return 'Esta etapa suporta apenas mata-mata simples.'
  }

  if (params.participantCount < 2) {
    return 'A chave precisa de pelo menos 2 participantes confirmados.'
  }

  if (['draft', 'finished', 'cancelled'].includes(params.status)) {
    return 'A chave não pode ser gerada neste status do torneio.'
  }

  if (params.existingBracket && !params.forceRegenerate) {
    return 'Já existe uma chave gerada. Confirme a regeração para substituir a estrutura atual.'
  }

  return null
}

export function generateSingleEliminationBracket(params: {
  participants: BracketParticipant[]
  seedingMethod: BracketSeedingMethod
  random?: () => number
}) {
  const size = calculateNextPowerOfTwo(params.participants.length)
  const roundsCount = Math.log2(size)
  const slots =
    params.seedingMethod === 'seeded'
      ? applySeeding(params.participants, size, params.random)
      : applyDraw(params.participants, size, params.random)
  let matches = [
    ...generateFirstRoundMatches(slots),
    ...generateNextRounds(size),
  ]

  matches = matches.map((match) => {
    const nextMatchNumber = Math.ceil(match.matchNumber / 2)
    const hasNextRound = match.roundNumber < roundsCount

    return {
      ...match,
      nextMatchKey: hasNextRound ? matchKey(match.roundNumber + 1, nextMatchNumber) : null,
      nextMatchSlot: hasNextRound ? (match.matchNumber % 2 === 1 ? 'a' : 'b') : null,
    }
  })

  for (const match of matches.filter((item) => item.isBye)) {
    matches = advanceParticipantWithBye(matches, match)
  }

  return {
    size,
    byeCount: calculateByeCount(params.participants.length),
    roundsCount,
    seedingMethod: params.seedingMethod,
    slots,
    matches,
  } satisfies GeneratedBracket
}

function fillSlots(participants: BracketParticipant[], size: number) {
  return slotsToBracketSlots(
    Array.from({ length: size }, (_, index) => participants[index] ?? null),
  )
}

function slotsToBracketSlots(slots: Array<BracketParticipant | null>) {
  return slots.map((participant, index) => ({
    position: index + 1,
    participant,
    isBye: participant === null,
  }))
}

function shuffle<T>(items: T[], random: () => number) {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

function matchKey(roundNumber: number, matchNumber: number) {
  return `${roundNumber}:${matchNumber}`
}
