import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell'
import { SupabaseTournamentStatusBadge } from '../../components/tournament/TournamentStatusBadge'
import { useAuth } from '../../context/auth'
import type {
  BracketMatch,
  BracketSeedingMethod,
  TournamentRegistration,
} from '../../lib/supabase/types'
import {
  bracketMatchStatusLabels,
  bracketSeedingMethodLabels,
  completeBracketMatch,
  fetchBracketParticipants,
  fetchTournamentBracket,
  generateTournamentBracket,
  type TournamentBracketWithMatches,
} from '../../services/brackets'
import {
  canManageTournament,
  fetchTournament,
  type TournamentWithCount,
} from '../../services/tournaments'

type ScoresByMatch = Record<string, { scoreA: string; scoreB: string }>

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getRoundTitle(roundNumber: number, roundsCount: number) {
  if (roundNumber === roundsCount) return 'Final'
  if (roundNumber === roundsCount - 1) return 'Semifinais'
  if (roundNumber === roundsCount - 2) return 'Quartas de final'
  if (roundNumber === roundsCount - 3) return 'Oitavas de final'
  return `Rodada ${roundNumber}`
}

function getParticipantName(
  participantId: string | null,
  participantsById: Record<string, TournamentRegistration>,
  fallback: string,
) {
  if (!participantId) return fallback
  return participantsById[participantId]?.display_name ?? 'Participante removido'
}

export function TournamentBracketPage({ tournamentId }: { tournamentId: string }) {
  const { user, isAdmin, canCreateTournaments } = useAuth()
  const [tournament, setTournament] = useState<TournamentWithCount | null>(null)
  const [bracketData, setBracketData] = useState<TournamentBracketWithMatches | null>(null)
  const [eligibleCount, setEligibleCount] = useState(0)
  const [seedingMethod, setSeedingMethod] = useState<BracketSeedingMethod>('draw')
  const [scoresByMatch, setScoresByMatch] = useState<ScoresByMatch>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canManage = tournament
    ? canManageTournament(tournament, user?.id, isAdmin, canCreateTournaments)
    : false

  const matchesByRound = useMemo(() => {
    return (bracketData?.matches ?? []).reduce<Record<number, BracketMatch[]>>(
      (rounds, match) => {
        rounds[match.round_number] = rounds[match.round_number] ?? []
        rounds[match.round_number].push(match)
        return rounds
      },
      {},
    )
  }, [bracketData])

  const loadBracket = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const nextTournament = await fetchTournament(tournamentId)
      const [nextBracket, participants] = await Promise.all([
        fetchTournamentBracket(nextTournament.id),
        fetchBracketParticipants(nextTournament),
      ])
      setTournament(nextTournament)
      setBracketData(nextBracket)
      setEligibleCount(participants.length)
      setSeedingMethod(nextBracket?.bracket.seeding_method ?? 'draw')
    } catch (loadError) {
      setTournament(null)
      setBracketData(null)
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar a chave.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [tournamentId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBracket()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadBracket])

  async function handleGenerateBracket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tournament || !user) return

    const forceRegenerate = Boolean(bracketData)

    if (
      forceRegenerate &&
      !window.confirm(
        'Regerar a chave remove a estrutura atual e altera avanços/resultados já lançados. Deseja continuar?',
      )
    ) {
      return
    }

    setIsSubmitting('generate')
    setError('')
    setSuccess('')

    try {
      const nextBracket = await generateTournamentBracket({
        tournament,
        userId: user.id,
        seedingMethod,
        forceRegenerate,
      })
      setBracketData(nextBracket)
      await loadBracket()
      setSuccess(forceRegenerate ? 'Chave regerada.' : 'Chave gerada.')
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : 'Não foi possível gerar a chave.',
      )
    } finally {
      setIsSubmitting('')
    }
  }

  async function handleCompleteMatch(match: BracketMatch) {
    const scores = scoresByMatch[match.id] ?? { scoreA: '', scoreB: '' }
    const scoreA = Number(scores.scoreA)
    const scoreB = Number(scores.scoreB)

    if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
      setError('Informe placares inteiros e não negativos.')
      return
    }

    if (scoreA === scoreB) {
      setError('Mata-mata simples não permite empate.')
      return
    }

    const winnerRegistrationId =
      scoreA > scoreB
        ? match.participant_a_registration_id
        : match.participant_b_registration_id

    if (!winnerRegistrationId) {
      setError('A partida ainda não possui participante vencedor válido.')
      return
    }

    setIsSubmitting(match.id)
    setError('')
    setSuccess('')

    try {
      await completeBracketMatch({
        matchId: match.id,
        winnerRegistrationId,
        scoreA,
        scoreB,
      })
      await loadBracket()
      setSuccess('Resultado confirmado e vencedor avançado.')
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : 'Não foi possível confirmar o resultado.',
      )
    } finally {
      setIsSubmitting('')
    }
  }

  if (isLoading) {
    return (
      <AuthenticatedShell subtitle="Chave">
        <div className="loading-state" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Carregando chave...</span>
        </div>
      </AuthenticatedShell>
    )
  }

  if (!tournament) {
    return (
      <AuthenticatedShell subtitle="Chave">
        <section className="empty-state">
          <span className="empty-state-mark" aria-hidden="true">?</span>
          <h1>Torneio não encontrado</h1>
          <p>{error || 'O torneio não existe ou você não tem permissão para ver esta chave.'}</p>
          <a className="button button-primary" href="#/torneios">
            Ver torneios
          </a>
        </section>
      </AuthenticatedShell>
    )
  }

  return (
    <AuthenticatedShell subtitle="Chave">
      <div className="page-stack">
        <section className="page-header" aria-labelledby="bracket-title">
          <div>
            <span className="eyebrow">Mata-mata simples</span>
            <h1 id="bracket-title">Chave</h1>
            <p>
              Gere e acompanhe rodadas, byes, status de partidas e avanço de
              vencedores para {tournament.name}.
            </p>
          </div>
          <div className="page-header-action">
            <SupabaseTournamentStatusBadge status={tournament.status} />
          </div>
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

        <section className="surface-panel">
          <div className="section-heading">
            <h2>Configuração</h2>
            <p>
              {eligibleCount} participante(s) confirmado(s) entram na geração.
              O sorteio é salvo no banco apenas no momento da geração.
            </p>
          </div>

          {canManage ? (
            <form className="toolbar" onSubmit={handleGenerateBracket}>
              <label className="field" htmlFor="bracket-seeding-method">
                <span>Método</span>
                <select
                  id="bracket-seeding-method"
                  value={seedingMethod}
                  onChange={(event) =>
                    setSeedingMethod(event.target.value as BracketSeedingMethod)
                  }
                >
                  <option value="draw">Sorteio aleatório</option>
                  <option value="seeded">Seeding</option>
                </select>
              </label>
              <button
                className="button button-primary"
                type="submit"
                disabled={isSubmitting !== ''}
              >
                {isSubmitting === 'generate'
                  ? 'Gerando...'
                  : bracketData
                    ? 'Regerar chave'
                    : 'Gerar chave'}
              </button>
            </form>
          ) : (
            <p>Somente admin ou organizador autorizado pode gerar ou alterar a chave.</p>
          )}
        </section>

        {!bracketData ? (
          <section className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">0</span>
            <h2>Chave ainda não gerada</h2>
            <p>
              A chave aparecerá aqui depois que a organização escolher sorteio
              ou seeding e gerar a estrutura.
            </p>
          </section>
        ) : (
          <>
            <section className="surface-panel">
              <div className="section-heading">
                <h2>Resumo da chave</h2>
                <p>
                  Método: {bracketSeedingMethodLabels[bracketData.bracket.seeding_method]}.
                  Tamanho: {bracketData.bracket.size}. Rodadas: {bracketData.bracket.rounds_count}.
                  Gerada em {formatDateTime(bracketData.bracket.generated_at)}.
                </p>
              </div>
              {bracketData.bracket.winner_registration_id && (
                <div className="form-message form-message-success" role="status">
                  Campeão: {getParticipantName(
                    bracketData.bracket.winner_registration_id,
                    bracketData.participantsById,
                    'Campeão definido',
                  )}
                </div>
              )}
            </section>

            <section className="bracket" aria-label="Chave mata-mata">
              {Object.entries(matchesByRound).map(([roundNumber, matches]) => (
                <section
                  className="bracket-round"
                  aria-labelledby={`round-${roundNumber}-title`}
                  key={roundNumber}
                >
                  <h2 id={`round-${roundNumber}-title`}>
                    {getRoundTitle(Number(roundNumber), bracketData.bracket.rounds_count)}
                  </h2>
                  <div className="bracket-round-stack">
                    {matches.map((match) => (
                      <BracketMatchCard
                        key={match.id}
                        match={match}
                        participantsById={bracketData.participantsById}
                        canManage={canManage}
                        isSubmitting={isSubmitting === match.id}
                        scores={scoresByMatch[match.id] ?? { scoreA: '', scoreB: '' }}
                        onScoreChange={(slot, value) =>
                          setScoresByMatch((current) => ({
                            ...current,
                            [match.id]: {
                              scoreA: current[match.id]?.scoreA ?? '',
                              scoreB: current[match.id]?.scoreB ?? '',
                              [slot]: value,
                            },
                          }))
                        }
                        onComplete={() => void handleCompleteMatch(match)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </section>
          </>
        )}
      </div>
    </AuthenticatedShell>
  )
}

function BracketMatchCard({
  match,
  participantsById,
  canManage,
  isSubmitting,
  scores,
  onScoreChange,
  onComplete,
}: {
  match: BracketMatch
  participantsById: Record<string, TournamentRegistration>
  canManage: boolean
  isSubmitting: boolean
  scores: { scoreA: string; scoreB: string }
  onScoreChange: (slot: 'scoreA' | 'scoreB', value: string) => void
  onComplete: () => void
}) {
  const participantAName = getParticipantName(
    match.participant_a_registration_id,
    participantsById,
    'Aguardando vencedor',
  )
  const participantBName = getParticipantName(
    match.participant_b_registration_id,
    participantsById,
    match.is_bye ? 'BYE' : 'Aguardando vencedor',
  )
  const canComplete =
    canManage &&
    ['ready', 'live'].includes(match.status) &&
    Boolean(match.participant_a_registration_id && match.participant_b_registration_id)

  return (
    <article className="bracket-match">
      <div className="card-topline">
        <span>Partida {match.match_number}</span>
        <span className={`badge badge-match-${match.status}`}>
          {bracketMatchStatusLabels[match.status]}
        </span>
      </div>
      <div className="bracket-slots">
        <BracketSlot
          name={participantAName}
          score={match.score_a}
          isWinner={match.winner_registration_id === match.participant_a_registration_id}
        />
        <BracketSlot
          name={participantBName}
          score={match.score_b}
          isWinner={match.winner_registration_id === match.participant_b_registration_id}
          isBye={match.is_bye && !match.participant_b_registration_id}
        />
      </div>
      {match.is_bye && (
        <p className="subtle-note">Bye registrado. O participante avançou automaticamente.</p>
      )}
      {canComplete && (
        <form
          className="score-form-grid compact-score-form"
          onSubmit={(event) => {
            event.preventDefault()
            onComplete()
          }}
        >
          <label className="field" htmlFor={`score-a-${match.id}`}>
            <span>Placar A</span>
            <input
              id={`score-a-${match.id}`}
              type="number"
              min="0"
              value={scores.scoreA}
              onChange={(event) => onScoreChange('scoreA', event.target.value)}
            />
          </label>
          <label className="field" htmlFor={`score-b-${match.id}`}>
            <span>Placar B</span>
            <input
              id={`score-b-${match.id}`}
              type="number"
              min="0"
              value={scores.scoreB}
              onChange={(event) => onScoreChange('scoreB', event.target.value)}
            />
          </label>
          <button className="button button-secondary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Confirmando...' : 'Confirmar vencedor'}
          </button>
        </form>
      )}
    </article>
  )
}

function BracketSlot({
  name,
  score,
  isWinner,
  isBye = false,
}: {
  name: string
  score: number | null
  isWinner: boolean
  isBye?: boolean
}) {
  return (
    <div className={isWinner ? 'bracket-slot is-winner' : 'bracket-slot'}>
      <span>{name}</span>
      <strong>{isBye ? 'BYE' : score ?? '-'}</strong>
    </div>
  )
}
