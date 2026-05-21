# Roadmap MVP

## Fase 0 - Documentação e base

- **Objetivo:** criar base compreensível para avaliadores e desenvolvedores.
- **Tarefas:** documentação principal; README; regras de torneio; arquitetura; contratos.
- **Critérios de aceite:** docs criados e linkados; próximos passos claros.
- **Riscos:** documentos anexados ausentes podem exigir revisão posterior.

## Fase 1 - Layout e navegação

- **Objetivo:** substituir template inicial por estrutura real do sistema.
- **Tarefas:** layout base; navegação; landing; dashboard mockado; tokens CSS.
- **Critérios de aceite:** interface responsiva, acessível e coerente com identidade UTFPR.
- **Riscos:** excesso de telas sem domínio pode gerar retrabalho.

## Fase 2 - CRUD de torneios

- **Objetivo:** permitir criação e edição visual de torneios.
- **Tarefas:** tipos de torneio; formulários; validações; dados mockados.
- **Critérios de aceite:** criar, listar, editar e visualizar torneio.
- **Riscos:** sem backend, persistência inicial será limitada.

## Fase 3 - Participantes e inscrições

- **Objetivo:** gerenciar inscritos individuais e equipes.
- **Tarefas:** participantes; equipes; capitão; status de inscrição; limites.
- **Critérios de aceite:** inscrições válidas aparecem no painel e na página pública.
- **Riscos:** regras de equipes podem variar por modalidade.

## Fase 4 - Mata-mata simples

- **Objetivo:** implementar primeiro formato competitivo.
- **Tarefas:** gerar chave; byes; seeding; sorteio; avanço de vencedores.
- **Critérios de aceite:** chaves de 3, 4, 5, 8 e 16 participantes funcionam.
- **Riscos:** alteração de resultado pode afetar partidas futuras.

## Fase 5 - Resultados e ranking básico

- **Objetivo:** registrar resultados e calcular classificação simples.
- **Tarefas:** formulário de placar; validação; ranking básico; histórico local.
- **Critérios de aceite:** resultado confirmado atualiza chave ou tabela.
- **Riscos:** ranking ambíguo sem critério explícito.

## Fase 6 - Round robin

- **Objetivo:** suportar pontos corridos.
- **Tarefas:** gerar tabela de jogos; folgas; pontuação; desempates.
- **Critérios de aceite:** todos enfrentam todos uma vez, com ranking correto.
- **Riscos:** número de partidas cresce rapidamente.

## Fase 7 - Grupos + playoffs

- **Objetivo:** combinar fase de grupos com chave final.
- **Tarefas:** divisão de grupos; ranking por grupo; classificados; geração de playoff.
- **Critérios de aceite:** classificados alimentam chave final corretamente.
- **Riscos:** regras de cruzamento precisam ser muito explícitas.

## Fase 8 - Disputas e auditoria

- **Objetivo:** aumentar integridade do sistema.
- **Tarefas:** abrir disputa; resolver disputa; registrar correções; audit log.
- **Critérios de aceite:** resultado contestado fica rastreável até resolução.
- **Riscos:** correções podem exigir recalcular fases dependentes.

## Fase 9 - Polimento visual

- **Objetivo:** elevar qualidade visual, responsividade e acessibilidade.
- **Tarefas:** revisar componentes; estados vazios; loading; erro; mobile; contraste.
- **Critérios de aceite:** telas passam no checklist de UI, responsividade e acessibilidade.
- **Riscos:** ajustes visuais tardios podem exigir refatorar CSS.

## Fase 10 - Sistema suíço / recursos avançados

- **Objetivo:** adicionar formatos avançados.
- **Tarefas:** pareamento suíço; Buchholz; evitar repetição; exportação; notificações.
- **Critérios de aceite:** pareamentos auditáveis e ranking explicado.
- **Riscos:** algoritmo suíço é mais complexo e deve ser amplamente testado.

