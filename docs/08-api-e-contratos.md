# API e contratos

Os contratos abaixo podem ser implementados como actions locais no MVP e virar endpoints HTTP no futuro. Entradas e saídas usam nomes em inglês para facilitar tipos TypeScript.

## Criar torneio

- **Ação:** `createTournament`
- **Entrada:** `{ name, modality, description, startsAt, endsAt, settings }`
- **Saída:** `{ tournament }`
- **Validações:** nome obrigatório; datas coerentes; limites válidos.
- **Erros possíveis:** `VALIDATION_ERROR`, `PERMISSION_DENIED`.
- **Permissões:** organizador ou admin.

## Atualizar torneio

- **Ação:** `updateTournament`
- **Entrada:** `{ tournamentId, patch }`
- **Saída:** `{ tournament }`
- **Validações:** torneio existente; campos permitidos por status.
- **Erros possíveis:** `NOT_FOUND`, `VALIDATION_ERROR`, `TOURNAMENT_LOCKED`.
- **Permissões:** organizador dono ou admin.

## Inscrever participante

- **Ação:** `registerParticipant`
- **Entrada:** `{ tournamentId, profileId, teamId?, displayName }`
- **Saída:** `{ registration, participant }`
- **Validações:** inscrições abertas; limite não excedido; participante não duplicado.
- **Erros possíveis:** `REGISTRATION_CLOSED`, `DUPLICATED_PARTICIPANT`, `LIMIT_REACHED`.
- **Permissões:** participante, capitão, organizador ou admin.

## Criar equipe

- **Ação:** `createTeam`
- **Entrada:** `{ tournamentId, name, captainProfileId, members }`
- **Saída:** `{ team }`
- **Validações:** nome obrigatório; capitão presente; tamanho válido.
- **Erros possíveis:** `INVALID_TEAM_SIZE`, `DUPLICATED_MEMBER`.
- **Permissões:** capitão, organizador ou admin.

## Confirmar check-in

- **Ação:** `confirmCheckIn`
- **Entrada:** `{ tournamentId, participantId }`
- **Saída:** `{ checkIn }`
- **Validações:** participante aprovado; janela aberta quando configurada.
- **Erros possíveis:** `CHECKIN_CLOSED`, `PARTICIPANT_NOT_APPROVED`.
- **Permissões:** participante, capitão, organizador ou admin.

## Gerar chave

- **Ação:** `generateBracket`
- **Entrada:** `{ tournamentId, stageId, method: "seed" | "draw" | "manual" }`
- **Saída:** `{ bracketNodes, matches, auditLog }`
- **Validações:** participantes suficientes; inscrições fechadas; seeds válidos.
- **Erros possíveis:** `NOT_ENOUGH_PARTICIPANTS`, `INVALID_SEEDS`, `STAGE_LOCKED`.
- **Permissões:** organizador ou admin.

## Gerar grupos

- **Ação:** `generateGroups`
- **Entrada:** `{ tournamentId, stageId, groupCount, method }`
- **Saída:** `{ groups, groupParticipants, auditLog }`
- **Validações:** quantidade de grupos válida; participantes suficientes.
- **Erros possíveis:** `INVALID_GROUP_COUNT`, `NOT_ENOUGH_PARTICIPANTS`.
- **Permissões:** organizador ou admin.

## Gerar tabela round robin

- **Ação:** `generateRoundRobinSchedule`
- **Entrada:** `{ tournamentId, stageId, participants, doubleRound? }`
- **Saída:** `{ rounds, matches }`
- **Validações:** pelo menos 2 participantes; fase em status editável.
- **Erros possíveis:** `NOT_ENOUGH_PARTICIPANTS`, `STAGE_LOCKED`.
- **Permissões:** organizador ou admin.

## Registrar resultado

- **Ação:** `submitMatchResult`
- **Entrada:** `{ matchId, scoreA, scoreB, games?, winnerId?, note? }`
- **Saída:** `{ result, match }`
- **Validações:** status permite resultado; placar não negativo; vencedor coerente.
- **Erros possíveis:** `INVALID_SCORE`, `INVALID_WINNER`, `MATCH_LOCKED`.
- **Permissões:** participante vinculado, capitão, organizador ou admin.

## Confirmar resultado

- **Ação:** `confirmMatchResult`
- **Entrada:** `{ matchId, resultId }`
- **Saída:** `{ result, match, standingUpdates?, bracketUpdates? }`
- **Validações:** resultado submetido; sem disputa aberta.
- **Erros possíveis:** `RESULT_NOT_FOUND`, `DISPUTE_OPEN`.
- **Permissões:** organizador ou admin; opcionalmente ambos participantes conforme regra.

## Contestar resultado

- **Ação:** `contestMatchResult`
- **Entrada:** `{ matchId, resultId, reason }`
- **Saída:** `{ dispute, match }`
- **Validações:** motivo obrigatório; prazo válido; usuário vinculado.
- **Erros possíveis:** `DISPUTE_WINDOW_CLOSED`, `PERMISSION_DENIED`.
- **Permissões:** participante vinculado, capitão, organizador ou admin.

## Calcular ranking

- **Ação:** `calculateRanking`
- **Entrada:** `{ tournamentId, stageId, tieBreakers }`
- **Saída:** `{ standings, unresolvedTies }`
- **Validações:** critérios conhecidos; resultados confirmados.
- **Erros possíveis:** `INVALID_TIEBREAKER`, `INSUFFICIENT_DATA`.
- **Permissões:** leitura pública quando fase publicada; cálculo administrativo para organizador.

## Finalizar torneio

- **Ação:** `finishTournament`
- **Entrada:** `{ tournamentId, summary? }`
- **Saída:** `{ tournament, finalStandings, auditLog }`
- **Validações:** sem partidas pendentes críticas; sem disputas abertas; classificação final definida.
- **Erros possíveis:** `PENDING_MATCHES`, `OPEN_DISPUTES`, `UNRESOLVED_RANKING`.
- **Permissões:** organizador ou admin.

