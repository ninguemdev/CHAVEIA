# Modelo de dados

Este modelo é uma proposta inicial para orientar TypeScript, armazenamento futuro e contratos de API.

## Entidades

### User

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Profile, AuditLog | Identificador único. |
| email | string | Sim | Profile | Deve ser único. |
| passwordHash | string | Futuro | - | Nunca armazenar senha em texto puro. |
| createdAt | datetime | Sim | - | Data de criação. |

### Profile

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | User | Identificador único. |
| userId | string | Sim | User | Dono do perfil. |
| displayName | string | Sim | Participant, AuditLog | Nome público. |
| role | enum | Sim | - | admin, organizer, captain, player, visitor. |
| institutionId | string | Opcional | - | RA, SIAPE ou referência acadêmica quando aplicável. |

### Tournament

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | TournamentSettings, TournamentStage | Identificador. |
| name | string | Sim | - | Nome público. |
| slug | string | Sim | - | URL amigável. |
| description | string | Opcional | - | Descrição curta. |
| organizerId | string | Sim | User/Profile | Responsável. |
| status | enum | Sim | - | draft, published, registration_open, running, finished, cancelled. |
| startsAt | datetime | Opcional | Match | Início previsto. |
| endsAt | datetime | Opcional | - | Fim previsto. |

### TournamentSettings

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Tournament | Identificador. |
| tournamentId | string | Sim | Tournament | Torneio. |
| minParticipants | number | Sim | Registration | Limite mínimo. |
| maxParticipants | number | Sim | Registration | Limite máximo. |
| teamBased | boolean | Sim | Team | Define individual/equipe. |
| checkInRequired | boolean | Sim | CheckIn | Exige presença. |
| allowDraw | boolean | Sim | Seed | Sorteio permitido. |
| allowSeeding | boolean | Sim | Seed | Seeds permitidos. |

### TournamentFormat

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | TournamentStage | Identificador. |
| type | enum | Sim | - | single_elimination, round_robin, groups_playoffs, swiss. |
| bestOf | number | Opcional | MatchGame | 1, 3, 5 ou 7. |
| thirdPlaceMatch | boolean | Opcional | Match | Apenas mata-mata. |
| scoringConfig | object | Opcional | Standing | Pontuação customizada. |

### TournamentStage

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Tournament | Identificador. |
| tournamentId | string | Sim | Tournament | Torneio. |
| name | string | Sim | Group, Match | Ex.: grupos, semifinal. |
| order | number | Sim | - | Ordem de execução. |
| formatId | string | Sim | TournamentFormat | Formato da fase. |
| status | enum | Sim | - | draft, provisional, published, running, completed. |

### Group

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | TournamentStage | Identificador. |
| stageId | string | Sim | TournamentStage | Fase. |
| name | string | Sim | Participant | Ex.: Grupo A. |
| order | number | Sim | - | Ordenação. |

### Participant

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Registration, Match | Identificador competitivo. |
| tournamentId | string | Sim | Tournament | Escopo do torneio. |
| profileId | string | Opcional | Profile | Participante individual. |
| teamId | string | Opcional | Team | Participante por equipe. |
| displayName | string | Sim | Standing | Nome exibido. |
| status | enum | Sim | - | pending, approved, checked_in, withdrawn, disqualified. |

### Team

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | TeamMember, Participant | Identificador. |
| name | string | Sim | Participant | Nome da equipe. |
| captainProfileId | string | Sim | Profile | Capitão. |
| status | enum | Sim | - | active, incomplete, disqualified. |

### TeamMember

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Team | Identificador. |
| teamId | string | Sim | Team | Equipe. |
| profileId | string | Sim | Profile | Jogador. |
| role | enum | Sim | - | captain, player, substitute. |

### Registration

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Tournament, Participant | Identificador. |
| tournamentId | string | Sim | Tournament | Torneio. |
| participantId | string | Sim | Participant | Inscrito. |
| status | enum | Sim | - | pending, approved, rejected, cancelled. |
| submittedAt | datetime | Sim | - | Data de envio. |

### CheckIn

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Participant | Identificador. |
| tournamentId | string | Sim | Tournament | Torneio. |
| participantId | string | Sim | Participant | Presença. |
| status | enum | Sim | - | pending, confirmed, missed, late. |
| checkedAt | datetime | Opcional | - | Momento do check-in. |

### Seed

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Participant | Identificador. |
| tournamentId | string | Sim | Tournament | Torneio. |
| participantId | string | Sim | Participant | Participante. |
| seedNumber | number | Sim | BracketNode | Ordem da semente. |
| source | enum | Sim | AuditLog | manual, ranking, draw. |

### Match

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | MatchGame, MatchResult | Identificador. |
| tournamentId | string | Sim | Tournament | Torneio. |
| stageId | string | Sim | TournamentStage | Fase. |
| groupId | string | Opcional | Group | Grupo quando aplicável. |
| round | number | Sim | - | Rodada. |
| participantAId | string | Opcional | Participant | Pode ficar vazio antes de avanço. |
| participantBId | string | Opcional | Participant | Pode ser BYE. |
| scheduledAt | datetime | Opcional | Venue/Server | Data e hora. |
| status | enum | Sim | - | pending, scheduled, live, finished, cancelled, disputed. |

### MatchGame

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Match | Jogo dentro de série. |
| matchId | string | Sim | Match | Partida mãe. |
| order | number | Sim | - | Número do jogo. |
| scoreA | number | Opcional | MatchResult | Placar. |
| scoreB | number | Opcional | MatchResult | Placar. |
| winnerId | string | Opcional | Participant | Vencedor do jogo. |

### MatchResult

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Match | Identificador. |
| matchId | string | Sim | Match | Partida. |
| winnerId | string | Opcional | Participant | Pode ser nulo em empate. |
| scoreA | number | Sim | - | Placar agregado. |
| scoreB | number | Sim | - | Placar agregado. |
| status | enum | Sim | Dispute | submitted, confirmed, contested, corrected. |
| submittedBy | string | Sim | Profile | Autor do envio. |
| confirmedBy | string | Opcional | Profile | Responsável pela confirmação. |

### Standing

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | TournamentStage | Identificador. |
| stageId | string | Sim | TournamentStage | Fase. |
| participantId | string | Sim | Participant | Participante. |
| points | number | Sim | - | Pontuação. |
| wins | number | Sim | - | Vitórias. |
| draws | number | Sim | - | Empates. |
| losses | number | Sim | - | Derrotas. |
| scoreFor | number | Sim | - | Pontos pró. |
| scoreAgainst | number | Sim | - | Pontos contra. |
| unresolvedTie | boolean | Sim | TieBreakerRule | Empate não resolvido. |

### TieBreakerRule

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | TournamentFormat | Identificador. |
| tournamentId | string | Sim | Tournament | Torneio. |
| type | enum | Sim | Standing | points, wins, score_diff, head_to_head, score_for, buchholz. |
| order | number | Sim | - | Ordem de aplicação. |
| direction | enum | Sim | - | asc ou desc. |

### BracketNode

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Match | Nó da chave. |
| tournamentId | string | Sim | Tournament | Torneio. |
| stageId | string | Sim | TournamentStage | Fase. |
| matchId | string | Opcional | Match | Partida associada. |
| nextNodeId | string | Opcional | BracketNode | Avanço do vencedor. |
| slot | string | Sim | - | Posição na chave. |

### Venue ou Server

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | Match | Identificador. |
| name | string | Sim | Match | Sala, quadra, laboratório ou servidor. |
| type | enum | Sim | - | physical, online. |
| capacity | number | Opcional | - | Capacidade quando aplicável. |
| url | string | Opcional | - | Link de servidor ou transmissão. |

### Notification

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | User/Profile | Identificador. |
| recipientId | string | Sim | Profile | Destinatário. |
| type | enum | Sim | - | match_update, result, dispute, registration. |
| message | string | Sim | - | Texto curto. |
| readAt | datetime | Opcional | - | Controle de leitura. |

### Dispute

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | MatchResult | Identificador. |
| matchId | string | Sim | Match | Partida. |
| openedBy | string | Sim | Profile | Autor. |
| reason | string | Sim | - | Motivo. |
| status | enum | Sim | - | open, under_review, accepted, rejected, resolved. |
| resolution | string | Opcional | AuditLog | Decisão. |

### AuditLog

| Campo | Tipo sugerido | Obrigatório | Relações | Observações |
| --- | --- | --- | --- | --- |
| id | string | Sim | User/Profile | Identificador. |
| actorId | string | Sim | Profile | Quem executou. |
| entityType | string | Sim | - | Ex.: MatchResult. |
| entityId | string | Sim | - | Entidade afetada. |
| action | string | Sim | - | Ex.: result_corrected. |
| before | object | Opcional | - | Estado anterior. |
| after | object | Opcional | - | Estado novo. |
| createdAt | datetime | Sim | - | Data da ação. |

## Regras de integridade

- Participante deve pertencer a apenas um torneio.
- Equipe não pode ter membros duplicados.
- Resultado confirmado deve pertencer a partida existente.
- Ranking deve ser derivado de resultados confirmados.
- Alteração de resultado confirmado deve gerar `AuditLog`.
- Partida não pode ter o mesmo participante nos dois lados.
- Chave publicada não deve ser regenerada sem registrar auditoria.

## Índices úteis

- `Tournament.slug`.
- `Tournament.organizerId`.
- `Participant.tournamentId`.
- `Registration.tournamentId + participantId`.
- `Match.tournamentId + stageId + round`.
- `Match.scheduledAt`.
- `Standing.stageId + participantId`.
- `AuditLog.entityType + entityId`.

## Status possíveis

- Torneio: draft, published, registration_open, registration_closed, running, finished, cancelled.
- Participante: pending, approved, checked_in, withdrawn, disqualified.
- Inscrição: pending, approved, rejected, cancelled.
- Partida: pending, scheduled, live, finished, cancelled, disputed.
- Resultado: submitted, confirmed, contested, corrected.
- Disputa: open, under_review, accepted, rejected, resolved.

## Enumerações

- `TournamentFormatType`: single_elimination, round_robin, groups_playoffs, swiss, hybrid.
- `Role`: admin, organizer, captain, player, visitor.
- `VenueType`: physical, online.
- `SeedSource`: manual, ranking, draw.
- `TieBreakerType`: points, wins, draws, losses, score_diff, score_for, head_to_head, buchholz, wo_count.

## Cuidados com LGPD

- Coletar apenas dados necessários.
- Evitar expor e-mail, RA ou contato em página pública.
- Permitir remoção ou anonimização quando aplicável.
- Restringir acesso a dados sensíveis por permissão.
- Registrar auditoria sem vazar informações desnecessárias.

