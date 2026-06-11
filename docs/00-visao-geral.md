# Chaveia - Visao geral

## Nome do projeto

Chaveia é um sistema web acadêmico para organização de torneios, e-sports, jogos universitários e competições gerais no contexto da plataforma.

## Problema que resolve

Eventos acadêmicos e competições internas costumam depender de planilhas, grupos de mensagens e controles manuais para inscrições, sorteios, chaves, resultados e ranking. Isso aumenta o risco de erro, dificulta auditoria e torna a comunicação pouco clara para participantes e organizadores.

O projeto centraliza essas etapas em uma plataforma única, com regras explícitas, visual responsivo, painel do organizador e página pública do torneio.

## Público-alvo

- Organizadores de torneios acadêmicos.
- Centros acadêmicos, atléticas, projetos de extensão e grupos estudantis.
- Professores e avaliadores que precisam acompanhar a evolução técnica do projeto.
- Participantes, jogadores, capitães e equipes.
- Público que deseja acompanhar tabelas, partidas e resultados.

## Contexto a plataforma

O sistema deve refletir um ambiente universitário: confiável, claro, acessível e adequado para uso em disciplinas, eventos acadêmicos, semanas tecnológicas, campeonatos internos e competições de e-sports.

## Objetivos do sistema

- Permitir cadastro e gestão de torneios.
- Gerenciar participantes, jogadores e equipes.
- Controlar inscrições e check-in.
- Configurar formatos de competição.
- Gerar chaves, grupos, tabelas e partidas.
- Registrar, confirmar, contestar e corrigir resultados.
- Calcular rankings com critérios explícitos de desempate.
- Exibir informações públicas de forma moderna, responsiva e acessível.
- Registrar alterações importantes para rastreabilidade.

## Escopo do MVP

- Interface web com React, TypeScript, Vite e CSS próprio.
- Documentação principal do produto, regras e arquitetura.
- Cadastro visual/mockado de torneios.
- Listagem e detalhe de torneio.
- Cadastro de participantes/equipes em dados locais ou mockados.
- Geração de mata-mata simples.
- Registro básico de resultado.
- Ranking básico para pontos corridos.
- Página pública do torneio.
- Estados vazios, loading, erro e sucesso.
- Design responsivo de 320px até desktop.

## Escopo futuro

- Autenticação real.
- Backend persistente.
- Permissões por perfil.
- Sistema completo de inscrições.
- Check-in com janela configurável.
- Sorteio auditável.
- Fase de grupos + playoffs.
- Sistema suíço.
- Notificações.
- Exportação de dados.
- Auditoria completa.
- Integração com calendário.
- Painel administrativo.

## Glossário básico

**Torneio:** competição organizada com regras, participantes, formato, calendário, partidas, resultados e classificação.

**Temporada:** período ou edição que agrupa torneios relacionados, como "Jogos Acadêmicos 2026".

**Participante:** entidade inscrita no torneio. Pode ser uma pessoa individual ou uma equipe.

**Jogador:** pessoa física que participa de uma equipe ou competição individual.

**Equipe:** grupo de jogadores que compete como uma unidade.

**Organizador:** usuário responsável por criar, configurar e administrar o torneio.

**Partida:** confronto entre dois ou mais participantes, com data, horário, local/servidor, fase, rodada, status e resultado.

**Rodada:** conjunto de partidas pertencentes ao mesmo momento competitivo.

**Fase:** etapa do torneio, como grupos, quartas de final, semifinal, final ou fase suíça.

**Chave:** estrutura de confrontos eliminatórios que define avanço de vencedores.

**Grupo:** subconjunto de participantes que disputam partidas internas para formar uma classificação.

**Seeding:** distribuição baseada em sementes/ranking para evitar confrontos precoces entre favoritos.

**Draw/sorteio:** alocação aleatória de participantes em grupos, chaves ou posições.

**Ranking:** classificação calculada a partir de resultados e critérios definidos.

**Critério de desempate:** regra aplicada quando dois ou mais participantes têm pontuação equivalente.

**W.O.:** vitória atribuída quando um participante não comparece, atrasa além do limite ou descumpre regra de presença.

**Check-in:** confirmação de presença antes do início do torneio ou partida.

**Disputa/contestação:** questionamento formal de um resultado, presença, regra aplicada ou decisão do organizador.

