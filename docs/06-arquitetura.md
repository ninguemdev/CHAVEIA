# Arquitetura

## Stack respeitada

O projeto já utiliza:

- Vite.
- React.
- TypeScript.
- CSS próprio.
- ESLint.
- npm.

Essa stack deve ser mantida no MVP por ser simples, moderna e adequada a um projeto acadêmico revisável.

## Estrutura de pastas recomendada

```text
src/
├─ app/
│  ├─ App.tsx
│  └─ routes.tsx
├─ components/
│  ├─ ui/
│  ├─ tournament/
│  ├─ matches/
│  └─ layout/
├─ pages/
│  ├─ DashboardPage.tsx
│  ├─ TournamentListPage.tsx
│  ├─ TournamentDetailPage.tsx
│  └─ PublicTournamentPage.tsx
├─ domain/
│  ├─ tournaments/
│  ├─ participants/
│  ├─ matches/
│  ├─ ranking/
│  └─ scheduling/
├─ data/
│  ├─ mockData.ts
│  └─ repositories/
├─ styles/
│  ├─ tokens.css
│  ├─ base.css
│  ├─ layout.css
│  └─ utilities.css
├─ tests/
│  ├─ algorithms/
│  └─ components/
└─ utils/
```

## Camadas do sistema

### UI

Componentes React, páginas e estados visuais. Não deve conter regras complexas de torneio.

### Lógica de torneio

Funções puras em `src/domain/`, responsáveis por gerar chave, round robin, ranking, desempates, avanço de fase e validações.

### Dados

No MVP pode usar mocks e repositórios locais. Futuramente essa camada comunica com backend/API.

### Validação

Validações de formulário podem ficar próximas da UI. Validações de negócio devem ficar no domínio.

## Onde ficam algoritmos

Algoritmos devem ficar em módulos puros, por exemplo:

- `src/domain/brackets/generateSingleElimination.ts`
- `src/domain/roundRobin/generateRoundRobin.ts`
- `src/domain/ranking/calculateStandings.ts`
- `src/domain/scheduling/detectScheduleConflict.ts`
- `src/domain/results/validateMatchResult.ts`

## Onde ficam componentes visuais

- Componentes genéricos: `src/components/ui/`.
- Cards e listas de torneio: `src/components/tournament/`.
- Partidas: `src/components/matches/`.
- Layouts: `src/components/layout/`.

## Onde ficam estilos

CSS global e tokens devem ficar em `src/styles/`. CSS específico pode ficar junto do componente quando a base crescer, desde que siga padrões consistentes.

## Onde ficam testes

Testes de algoritmo devem ficar próximos do domínio ou em `src/tests/algorithms/`. Testes de componentes devem validar estados vazio, loading, erro, sucesso e sem permissão.

## Como evitar acoplamento

- UI chama funções de domínio, mas domínio não importa React.
- Funções de ranking não devem depender de CSS, rotas ou componentes.
- Dados mockados devem implementar contratos parecidos com os repositórios futuros.
- Tipos compartilhados devem ficar em módulos de domínio.
- Componentes devem receber dados por props e evitar buscar dados diretamente quando possível.

## Como o projeto deve crescer

1. Começar com documentação, tipos e dados mockados.
2. Implementar páginas estáticas funcionais.
3. Extrair algoritmos para funções puras testáveis.
4. Adicionar persistência.
5. Adicionar autenticação e permissões.
6. Expandir formatos avançados.

