# Requisitos funcionais

Prioridades:

- **MVP:** necessário para a primeira versão avaliável.
- **Importante:** recomendado para uma versão completa.
- **Futuro:** recurso avançado ou dependente de backend/autenticação.

## Autenticação

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-001 | Permitir cadastro de usuário com nome, e-mail e senha. | Futuro | Usuário consegue criar conta válida e receber erro para e-mail inválido ou duplicado. |
| RF-002 | Permitir login e logout. | Futuro | Sessão é iniciada e encerrada sem expor dados sensíveis. |
| RF-003 | Permitir recuperação de senha. | Futuro | Usuário solicita recuperação e recebe fluxo seguro de redefinição. |

## Perfis e permissões

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-004 | Definir perfis de administrador, organizador, capitão, jogador e visitante. | Importante | Cada perfil possui permissões explícitas no sistema. |
| RF-005 | Restringir ações administrativas ao organizador ou administrador. | Importante | Usuário sem permissão recebe estado "sem permissão" e não executa ação protegida. |

## Torneios

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-006 | Criar torneio com nome, modalidade, descrição, datas, formato e regras básicas. | MVP | Torneio aparece na listagem após criação válida. |
| RF-007 | Editar dados do torneio antes da publicação. | MVP | Alterações são salvas e exibidas no detalhe. |
| RF-008 | Publicar, pausar, finalizar ou cancelar torneio. | Importante | Status altera comportamento das inscrições, partidas e página pública. |

## Inscrições

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-009 | Abrir e fechar período de inscrição. | MVP | Participantes só conseguem se inscrever dentro da janela aberta. |
| RF-010 | Validar limite mínimo e máximo de participantes. | MVP | Sistema impede fechamento ou geração de tabela quando limites não são atendidos. |
| RF-011 | Permitir aprovação manual de inscrições. | Importante | Organizador aprova ou recusa inscrição com justificativa. |

## Participantes e equipes

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-012 | Cadastrar participante individual. | MVP | Participante aparece na lista do torneio. |
| RF-013 | Criar equipe com capitão e membros. | MVP | Equipe possui membros válidos e capitão identificável. |
| RF-014 | Definir tamanho mínimo e máximo da equipe. | Importante | Sistema bloqueia equipe fora dos limites configurados. |

## Check-in

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-015 | Permitir check-in de participante ou equipe. | Importante | Status de presença é exibido ao organizador. |
| RF-016 | Configurar janela de check-in. | Futuro | Check-in fora da janela é recusado ou marcado como pendente de aprovação. |

## Formatos

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-017 | Suportar mata-mata simples. | MVP | Sistema gera chave e avança vencedores. |
| RF-018 | Suportar disputa de terceiro lugar. | Importante | Perdedoras das semifinais geram partida de terceiro lugar. |
| RF-019 | Suportar séries melhor de 3, 5 ou 7. | Importante | Vencedor da partida depende da quantidade mínima de jogos vencidos. |
| RF-020 | Suportar pontos corridos. | MVP | Sistema gera partidas e calcula tabela. |
| RF-021 | Suportar grupos + playoffs. | Importante | Classificados dos grupos alimentam a chave final. |
| RF-022 | Planejar sistema suíço. | Futuro | Documentação define limitações e critérios antes da implementação. |

## Sorteio

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-023 | Permitir sorteio aleatório de posições. | MVP | Participantes são distribuídos sem viés manual não registrado. |
| RF-024 | Permitir seeding por ranking/semente. | Importante | Cabeças de chave ficam distribuídos para evitar confronto precoce. |
| RF-025 | Registrar histórico do sorteio. | Futuro | Auditoria mostra data, usuário, método e participantes envolvidos. |

## Chaves

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-026 | Exibir chave eliminatória responsiva. | MVP | Chave é legível no celular e desktop. |
| RF-027 | Marcar chave como provisória ou publicada. | Importante | Página pública indica quando a chave ainda pode mudar. |

## Grupos

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-028 | Criar grupos com participantes distribuídos. | Importante | Grupos têm tamanho equilibrado quando possível. |
| RF-029 | Exibir tabela de classificação por grupo. | Importante | Ranking por grupo mostra critérios aplicados. |

## Partidas

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-030 | Criar partida com data, horário, local/servidor, fase, rodada e status. | MVP | Partida exibe todos os metadados obrigatórios. |
| RF-031 | Detectar conflito de agenda para participante. | Importante | Sistema alerta quando o mesmo participante tem partidas sobrepostas. |
| RF-032 | Permitir status pendente, ao vivo, finalizada, cancelada e em disputa. | MVP | Status altera visual e ações disponíveis. |

## Resultados

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-033 | Registrar placar de partida. | MVP | Resultado válido atualiza partida. |
| RF-034 | Validar vencedor conforme formato. | MVP | Sistema impede resultado incoerente com as regras. |
| RF-035 | Registrar histórico de correções. | Importante | Correções ficam vinculadas a usuário, data e justificativa. |

## Ranking

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-036 | Calcular ranking por pontos, vitórias, empates, derrotas, saldo e pontos marcados. | MVP | Tabela ordena participantes e exibe critérios usados. |
| RF-037 | Aplicar confronto direto como desempate. | Importante | Empate é resolvido quando houver confronto válido. |
| RF-038 | Indicar empate não resolvido. | MVP | Sistema não inventa critério e mostra status ambíguo. |

## Disputas

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-039 | Permitir contestação de resultado. | Importante | Partida muda para "em disputa" e organizador é notificado. |
| RF-040 | Permitir decisão do organizador com justificativa. | Importante | Resultado é confirmado, corrigido ou anulado com registro. |

## Notificações

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-041 | Notificar alteração de partida ou resultado. | Futuro | Usuários afetados recebem aviso no sistema. |
| RF-042 | Notificar disputa aberta ou resolvida. | Futuro | Organizador e participantes veem alerta claro. |

## Dashboard

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-043 | Exibir resumo de torneios, inscrições, partidas pendentes e disputas. | MVP | Dashboard mostra indicadores úteis e estados vazios. |
| RF-044 | Destacar ações pendentes do organizador. | Importante | Organizador identifica rapidamente o próximo trabalho. |

## Página pública

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-045 | Exibir informações públicas do torneio. | MVP | Visitante acessa regulamento, participantes, partidas e ranking. |
| RF-046 | Exibir chave, grupos e resultados publicados. | MVP | Informações públicas são coerentes com status de publicação. |

## Exportação

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-047 | Exportar participantes, partidas e ranking. | Futuro | Organizador consegue gerar arquivo CSV ou PDF. |

## Auditoria

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-048 | Registrar ações críticas em log. | Importante | Criação de chave, correção de resultado e decisões de disputa ficam auditáveis. |

