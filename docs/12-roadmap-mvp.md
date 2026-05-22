# Roadmap MVP

## Fase 0 - Documentação e base

- **Objetivo:** criar base compreensível para avaliadores e desenvolvedores.
- **Tarefas:** documentação principal; README; regras de torneio; arquitetura; contratos; regras de autenticação, permissões, Supabase, RLS e segurança.
- **Critérios de aceite:** docs criados e linkados; próximos passos claros; regras de admin/user documentadas.
- **Riscos:** documentos anexados ausentes podem exigir revisão posterior.

## Fase 1 - Layout e navegação

- **Objetivo:** substituir template inicial por estrutura real do sistema.
- **Tarefas:** layout base; navegação; landing; dashboard mockado; tokens CSS.
- **Critérios de aceite:** interface responsiva, acessível e coerente com identidade UTFPR.
- **Riscos:** excesso de telas sem domínio pode gerar retrabalho.

## Fase 2 - Autenticação, perfis e Supabase

- **Objetivo:** integrar Supabase Auth e criar base segura de usuário.
- **Tarefas:** configurar Supabase; criar `profiles`; login; cadastro; logout; recuperação de senha; edição de perfil; `avatar_key`; RA; RLS de perfil.
- **Critérios de aceite:** usuário cria conta, faz login, edita apenas o próprio perfil e não consegue alterar role/permissões.
- **Riscos:** expor chave privada no front-end; tratar senha fora do Supabase Auth; policies permissivas demais.

## Fase 3 - Permissões, admin e pedidos

- **Objetivo:** controlar criação de torneios e ações administrativas.
- **Tarefas:** roles `admin` e `user`; pedido para criar torneios; tabela revogável de permissões; aprovação/rejeição por admin; revogação de permissão ativa; configurações globais; bloqueio/desbloqueio de ações; auditoria inicial.
- **Critérios de aceite:** usuário comum só cria torneio com permissão `active`; admin consegue decidir pedidos e revogar permissões; RLS bloqueia operações indevidas.
- **Riscos:** confiar apenas na interface; esquecer auditoria em decisões administrativas.

## Fase 4 - CRUD de torneios

- **Objetivo:** permitir criação e edição de torneios com persistência.
- **Tarefas:** tabela `tournaments`; formulários; validações; RLS; listagem pública e administrativa.
- **Critérios de aceite:** admin ou usuário com permissão ativa cria, lista, edita e visualiza torneio; usuário sem permissão ativa é bloqueado pelo banco.
- **Riscos:** regras de edição por status ficarem ambíguas.

## Fase 5 - Participantes e inscrições

- **Objetivo:** gerenciar inscritos individuais e equipes.
- **Tarefas:** participantes; equipes; capitão; status de inscrição; limites; RLS para dados próprios e administrativos.
- **Critérios de aceite:** inscrições válidas aparecem no painel e na página pública; dados privados não vazam.
- **Riscos:** regras de equipes podem variar por modalidade.

## Fase 6 - Mata-mata simples

- **Objetivo:** implementar primeiro formato competitivo.
- **Tarefas:** gerar chave; byes; seeding; sorteio; avanço de vencedores.
- **Critérios de aceite:** chaves de 3, 4, 5, 8 e 16 participantes funcionam.
- **Riscos:** alteração de resultado pode afetar partidas futuras.

## Fase 7 - Resultados e ranking básico

- **Objetivo:** registrar resultados e calcular classificação simples.
- **Tarefas:** formulário de placar; validação; ranking básico; histórico; RLS para envio, confirmação e correção.
- **Critérios de aceite:** resultado confirmado atualiza chave ou tabela; correção sensível exige permissão e auditoria.
- **Riscos:** ranking ambíguo sem critério explícito.

## Fase 8 - Round robin

- **Objetivo:** suportar pontos corridos.
- **Tarefas:** gerar tabela de jogos; folgas; pontuação; desempates.
- **Critérios de aceite:** todos enfrentam todos uma vez, com ranking correto.
- **Riscos:** número de partidas cresce rapidamente.

## Fase 9 - Grupos + playoffs

- **Objetivo:** combinar fase de grupos com chave final.
- **Tarefas:** divisão de grupos; ranking por grupo; classificados; geração de playoff.
- **Critérios de aceite:** classificados alimentam chave final corretamente.
- **Riscos:** regras de cruzamento precisam ser muito explícitas.

## Fase 10 - Disputas e auditoria

- **Objetivo:** aumentar integridade do sistema.
- **Tarefas:** abrir disputa; resolver disputa; registrar correções; audit log; RPCs transacionais para ações críticas.
- **Critérios de aceite:** resultado contestado fica rastreável até resolução; admin consegue resolver disputa com justificativa.
- **Riscos:** correções podem exigir recalcular fases dependentes.

## Fase 11 - Polimento visual

- **Objetivo:** elevar qualidade visual, responsividade e acessibilidade.
- **Tarefas:** revisar componentes; estados vazios; loading; erro; mobile; contraste.
- **Critérios de aceite:** telas passam no checklist de UI, responsividade e acessibilidade.
- **Riscos:** ajustes visuais tardios podem exigir refatorar CSS.

## Fase 12 - Sistema suíço / recursos avançados

- **Objetivo:** adicionar formatos avançados.
- **Tarefas:** pareamento suíço; Buchholz; evitar repetição; exportação; notificações.
- **Critérios de aceite:** pareamentos auditáveis e ranking explicado.
- **Riscos:** algoritmo suíço é mais complexo e deve ser amplamente testado.
