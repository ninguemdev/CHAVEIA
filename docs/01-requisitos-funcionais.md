# Requisitos funcionais

Prioridades:

- **MVP:** necessário para a primeira versão avaliável.
- **Importante:** recomendado para uma versão completa.
- **Futuro:** recurso avançado ou dependente de backend/autenticação.

## Autenticação

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-001 | Permitir cadastro de usuário com nome, e-mail e senha usando Supabase Auth. | MVP | Usuário cria conta válida; senha não é armazenada em tabela própria do sistema. |
| RF-002 | Permitir login e logout com sessão segura do Supabase. | MVP | Sessão é iniciada e encerrada; rotas privadas exigem usuário autenticado. |
| RF-003 | Permitir recuperação de senha pelo fluxo nativo do provedor de autenticação. | Importante | Usuário solicita recuperação e redefine senha sem exposição de credenciais. |
| RF-004 | Manter perfil público/administrativo vinculado ao usuário autenticado. | MVP | Cada usuário autenticado possui registro em `profiles` associado a `auth.users.id`. |
| RF-005 | Permitir edição do próprio perfil. | MVP | Usuário altera apenas nome exibido, RA e avatar próprio. |
| RF-006 | Permitir escolha de avatar entre opções pré-definidas via `avatar_key`. | MVP | Perfil salva uma chave de avatar válida; upload de imagem não faz parte do MVP. |

## Perfis e permissões

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-007 | Definir dois tipos principais de usuário: `admin` e `user`. | MVP | Perfil possui `role` controlado no banco; usuários comuns não conseguem promover a si mesmos. |
| RF-008 | Permitir que usuários comuns solicitem permissão para criar torneios. | MVP | Solicitação é registrada com status pendente e visível para admins. |
| RF-009 | Permitir que admins aprovem ou rejeitem pedidos de permissão. | MVP | Decisão altera o status da solicitação, registra auditoria e habilita/bloqueia criação de torneios. |
| RF-010 | Restringir ações administrativas a admins ou usuários autorizados no torneio. | MVP | Usuário sem permissão recebe estado "sem permissão" e a operação também é negada por RLS no banco. |
| RF-011 | Permitir que admins bloqueiem ou desbloqueiem ações sensíveis quando necessário. | Importante | Bloqueio impede operações afetadas e registra justificativa. |
| RF-012 | Validar permissões no banco, não apenas na interface. | MVP | Policies RLS ou RPCs protegidas impedem leitura/escrita indevida mesmo com requisição manual. |

## Torneios

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-013 | Criar torneio com nome, modalidade, descrição, datas, formato e regras básicas. | MVP | Admin ou usuário com permissão aprovada cria torneio válido. |
| RF-014 | Editar dados do torneio antes da publicação. | MVP | Alterações são salvas e exibidas no detalhe para usuários autorizados. |
| RF-015 | Publicar, pausar, finalizar ou cancelar torneio. | Importante | Status altera comportamento das inscrições, partidas e página pública. |
| RF-016 | Permitir que admins alterem torneios em andamento ou encerrados. | Importante | Admin consegue aplicar ajuste excepcional com justificativa e auditoria. |

## Inscrições

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-017 | Abrir e fechar período de inscrição. | MVP | Participantes só conseguem se inscrever dentro da janela aberta. |
| RF-018 | Validar limite mínimo e máximo de participantes. | MVP | Sistema impede fechamento ou geração de tabela quando limites não são atendidos. |
| RF-019 | Permitir aprovação manual de inscrições. | Importante | Usuário autorizado ou admin aprova/recusa inscrição com justificativa. |

## Participantes e equipes

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-020 | Cadastrar participante individual. | MVP | Participante aparece na lista do torneio e fica vinculado ao perfil autenticado quando aplicável. |
| RF-021 | Criar equipe com capitão e membros. | MVP | Equipe possui membros válidos e capitão identificável. |
| RF-022 | Definir tamanho mínimo e máximo da equipe. | Importante | Sistema bloqueia equipe fora dos limites configurados. |

## Check-in

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-023 | Permitir check-in de participante ou equipe. | Importante | Status de presença é exibido ao usuário autorizado. |
| RF-024 | Configurar janela de check-in. | Futuro | Check-in fora da janela é recusado ou marcado como pendente de aprovação. |

## Formatos

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-025 | Suportar mata-mata simples. | MVP | Sistema gera chave e avança vencedores. |
| RF-026 | Suportar disputa de terceiro lugar. | Importante | Perdedoras das semifinais geram partida de terceiro lugar. |
| RF-027 | Suportar séries melhor de 3, 5 ou 7. | Importante | Vencedor da partida depende da quantidade mínima de jogos vencidos. |
| RF-028 | Suportar pontos corridos. | MVP | Sistema gera partidas e calcula tabela. |
| RF-029 | Suportar grupos + playoffs. | Importante | Classificados dos grupos alimentam a chave final. |
| RF-030 | Planejar sistema suíço. | Futuro | Documentação define limitações e critérios antes da implementação. |

## Sorteio

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-031 | Permitir sorteio aleatório de posições. | MVP | Participantes são distribuídos sem viés manual não registrado. |
| RF-032 | Permitir seeding por ranking/semente. | Importante | Cabeças de chave ficam distribuídos para evitar confronto precoce. |
| RF-033 | Registrar histórico do sorteio. | Futuro | Auditoria mostra data, usuário, método e participantes envolvidos. |

## Chaves

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-034 | Exibir chave eliminatória responsiva. | MVP | Chave é legível no celular e desktop. |
| RF-035 | Marcar chave como provisória ou publicada. | Importante | Página pública indica quando a chave ainda pode mudar. |

## Grupos

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-036 | Criar grupos com participantes distribuídos. | Importante | Grupos têm tamanho equilibrado quando possível. |
| RF-037 | Exibir tabela de classificação por grupo. | Importante | Ranking por grupo mostra critérios aplicados. |

## Partidas

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-038 | Criar partida com data, horário, local/servidor, fase, rodada e status. | MVP | Partida exibe todos os metadados obrigatórios. |
| RF-039 | Detectar conflito de agenda para participante. | Importante | Sistema alerta quando o mesmo participante tem partidas sobrepostas. |
| RF-040 | Permitir status pendente, ao vivo, finalizada, cancelada e em disputa. | MVP | Status altera visual e ações disponíveis. |

## Resultados

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-041 | Registrar placar de partida. | MVP | Resultado válido atualiza partida. |
| RF-042 | Validar vencedor conforme formato. | MVP | Sistema impede resultado incoerente com as regras. |
| RF-043 | Registrar histórico de correções. | Importante | Correções ficam vinculadas a usuário, data e justificativa. |

## Ranking

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-044 | Calcular ranking por pontos, vitórias, empates, derrotas, saldo e pontos marcados. | MVP | Tabela ordena participantes e exibe critérios usados. |
| RF-045 | Aplicar confronto direto como desempate. | Importante | Empate é resolvido quando houver confronto válido. |
| RF-046 | Indicar empate não resolvido. | MVP | Sistema não inventa critério e mostra status ambíguo. |

## Disputas

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-047 | Permitir contestação de resultado. | Importante | Partida muda para "em disputa" e organizador é notificado. |
| RF-048 | Permitir decisão do organizador com justificativa. | Importante | Resultado é confirmado, corrigido ou anulado com registro. |

## Notificações

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-049 | Notificar alteração de partida ou resultado. | Futuro | Usuários afetados recebem aviso no sistema. |
| RF-050 | Notificar disputa aberta ou resolvida. | Futuro | Organizador e participantes veem alerta claro. |

## Dashboard

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-051 | Exibir resumo de torneios, inscrições, partidas pendentes e disputas. | MVP | Dashboard mostra indicadores úteis e estados vazios. |
| RF-052 | Destacar ações pendentes do organizador. | Importante | Usuário autorizado identifica rapidamente o próximo trabalho. |

## Página pública

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-053 | Exibir informações públicas do torneio. | MVP | Visitante acessa regulamento, participantes, partidas e ranking. |
| RF-054 | Exibir chave, grupos e resultados publicados. | MVP | Informações públicas são coerentes com status de publicação. |

## Exportação

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-055 | Exportar participantes, partidas e ranking. | Futuro | Admin ou usuário autorizado consegue gerar arquivo CSV ou PDF. |

## Auditoria

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-056 | Registrar ações críticas em log. | Importante | Criação de chave, correção de resultado e decisões de disputa ficam auditáveis. |

## Banco de dados e segurança

| Código | Descrição | Prioridade | Critério de aceite |
| --- | --- | --- | --- |
| RF-057 | Usar Supabase como solução recomendada de autenticação, PostgreSQL e RLS. | MVP | Documentação e arquitetura indicam Supabase; implementação futura não cria backend paralelo sem justificativa. |
| RF-058 | Habilitar Row Level Security em tabelas importantes. | MVP | Tabelas de perfis, torneios, inscrições, equipes, partidas, resultados, disputas e auditoria possuem policies. |
| RF-059 | Não expor chaves privadas no front-end. | MVP | Apenas URL pública e chave anon são usadas no cliente; service role fica fora do browser. |
| RF-060 | Não armazenar senha manualmente em tabelas próprias. | MVP | Senhas são tratadas exclusivamente pelo Supabase Auth. |
| RF-061 | Validar no banco se o usuário pode criar, editar ou administrar torneios. | MVP | Operações diretas contra o banco são negadas sem role/policy adequada. |
| RF-062 | Proteger dados administrativos e pessoais. | MVP | Usuários comuns acessam apenas dados públicos, próprios ou autorizados por policy. |
