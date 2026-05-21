# UTFPR Torneios

Sistema web acadêmico da UTFPR para organização de torneios, e-sports e competições gerais.

O objetivo é oferecer uma plataforma clara, responsiva e acessível para organizadores criarem torneios, gerenciarem inscrições, participantes, equipes, partidas, resultados, rankings, chaves e disputas.

## Stack

- Vite
- React
- TypeScript
- CSS próprio
- ESLint
- npm

## Comandos

Instalar dependências:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Validar lint:

```bash
npm run lint
```

Gerar build:

```bash
npm run build
```

## Documentação

- [00 - Visão geral](docs/00-visao-geral.md)
- [01 - Requisitos funcionais](docs/01-requisitos-funcionais.md)
- [02 - Regras de torneios](docs/02-regras-de-torneios.md)
- [03 - Formatos e algoritmos](docs/03-formatos-e-algoritmos.md)
- [04 - Modelo de dados](docs/04-modelo-de-dados.md)
- [05 - Fluxos de usuário](docs/05-fluxos-de-usuario.md)
- [06 - Arquitetura](docs/06-arquitetura.md)
- [07 - Rotas e telas](docs/07-rotas-e-telas.md)
- [08 - API e contratos](docs/08-api-e-contratos.md)
- [09 - UI/UX e design system](docs/09-ui-ux-design-system.md)
- [10 - CSS, responsividade e acessibilidade](docs/10-css-responsividade-acessibilidade.md)
- [11 - Testes e validação](docs/11-testes-e-validacao.md)
- [12 - Roadmap MVP](docs/12-roadmap-mvp.md)
- [13 - Checklist de code review](docs/13-checklist-code-review.md)

## Escopo inicial

O MVP deve priorizar:

- Documentação e arquitetura clara.
- Layout responsivo e acessível.
- CRUD inicial de torneios.
- Participantes, equipes e inscrições.
- Mata-mata simples.
- Resultados e ranking básico.
- Pontos corridos.
- Grupos + playoffs.
- Disputas e auditoria.

## Observação sobre documentos de referência

O projeto cita como referências obrigatórias:

- `Funcionamento de torneios.pdf`
- `AGENTS.md`
- `checklist-responsividade-design.md`
- `code_review.md`
- `frontend-boas-praticas.md`

No estado atual do repositório, apenas `AGENTS.md` foi localizado. A documentação em `docs/` foi criada com base no `AGENTS.md` e no escopo informado para o projeto, e deve ser revisada quando os demais arquivos forem adicionados.

