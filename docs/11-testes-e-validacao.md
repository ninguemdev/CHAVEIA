# Testes e validação

## Objetivo

Garantir que regras de torneio, ranking, geração de partidas, permissões e interfaces funcionem de forma previsível e auditável.

## Testes unitários para algoritmos

- Geração de chave mata-mata.
- Aplicação de seeding.
- Sorteio com registro de método.
- Avanço de vencedores.
- Geração de round robin.
- Cálculo de ranking.
- Aplicação de desempates.
- Validação de resultado.
- Detecção de conflito de agenda.

## Testes de ranking

- Vitória, empate e derrota com pontuação padrão.
- Pontuação customizada.
- Saldo de pontos/gols/rounds.
- Pontos marcados.
- Confronto direto.
- Empate não resolvido.
- W.O. com penalidade.

## Testes de desempate

- Dois participantes empatados em pontos.
- Três participantes empatados em pontos.
- Confronto direto aplicável.
- Confronto direto não aplicável.
- Critério final ainda empatado.
- Ordem de critérios configurável.

## Testes de geração de chave

- 3 participantes com bye.
- 4 participantes sem bye.
- 5 participantes com byes.
- 8 participantes com chave completa.
- 16 participantes com chave completa.
- Seeding distribuindo favoritos.
- Sorteio sem duplicar participantes.
- Terceiro lugar habilitado.
- Melhor de 3, 5 e 7.

## Testes de round robin

- 3 participantes com folga.
- 4 participantes com 3 rodadas.
- 5 participantes com folga em cada rodada.
- Turno único.
- Turno e returno.
- Nenhum confronto duplicado no turno único.

## Testes de permissões

- Visitante não cria torneio.
- Usuário comum cria conta, faz login e edita apenas o próprio perfil.
- Usuário comum escolhe apenas `avatar_key` permitido.
- Usuário comum informa RA sem expor esse dado publicamente.
- Usuário comum não altera dados de outro usuário.
- Usuário comum não altera `role`, `can_create_tournaments` ou configurações globais.
- Usuário comum solicita permissão para criar torneios.
- Admin aprova ou rejeita pedido de criação de torneio.
- Usuário aprovado cria torneio.
- Usuário não aprovado não cria torneio mesmo tentando chamada direta.
- Participante não corrige resultado confirmado sem permissão.
- Capitão envia resultado da própria equipe.
- Usuário autorizado gerencia torneio próprio.
- Admin acessa auditoria.
- Admin altera torneio em andamento ou encerrado com justificativa.
- Admin resolve disputa e edita resultado com auditoria.

## Testes de autenticação e segurança

- Cadastro com e-mail e senha via Supabase Auth.
- Login com credenciais válidas.
- Login recusado com senha inválida.
- Logout encerra sessão.
- Recuperação de senha usa fluxo do provedor.
- Nenhuma tabela própria contém senha ou hash de senha.
- Nenhuma chave privada aparece no front-end, bundle, `.env` público ou código versionado.
- Apenas URL pública e chave anon do Supabase podem ser usadas no cliente.

## Testes de RLS e banco

Quando Supabase for implementado, criar testes ou validações manuais com usuários diferentes:

- RLS habilitado em `profiles`, `tournaments`, `registrations`, `teams`, `matches`, `match_results`, `disputes`, `audit_logs`, `global_settings` e `tournament_creator_requests`.
- Usuário A não lê dados privados do usuário B.
- Usuário A não atualiza perfil do usuário B.
- Usuário comum não altera `profiles.role`.
- Usuário comum não atualiza `global_settings`.
- Usuário comum não edita torneio sem autorização.
- Admin consegue ler dados administrativos.
- Admin consegue alterar torneio em andamento/encerrado com auditoria.
- Escrita direta no banco sem permissão é negada por policy, mesmo que a interface esconda o botão.
- RPCs sensíveis registram `AuditLog` na mesma transação.

## Testes de formulário

- Campos obrigatórios.
- Datas inválidas.
- Limites mínimo e máximo.
- Nome de equipe vazio.
- Membros duplicados.
- Mensagens de erro acessíveis.

## Testes de responsividade

Validar larguras:

- 320px.
- 375px.
- 768px.
- 1024px.
- 1440px.

Verificar:

- Sem overflow horizontal indevido.
- Botões clicáveis.
- Tabelas legíveis.
- Chaves navegáveis.
- Cards sem texto cortado.

## Testes de acessibilidade

- Apenas um `h1` por página.
- Labels em inputs.
- Foco visível.
- Navegação por teclado.
- Contraste de texto.
- Texto alternativo em imagens relevantes.
- `aria-label` em botões só com ícone.

## Testes de fluxo completo

- Organizador cria torneio.
- Abre inscrições.
- Participantes se inscrevem.
- Organizador fecha inscrições.
- Gera chave.
- Registra resultado.
- Confirma resultado.
- Ranking/chave atualiza.
- Torneio é finalizado.

## Testes de fluxo completo com autenticação

- Usuário cria conta.
- Usuário edita perfil com RA e avatar pré-definido.
- Usuário solicita permissão para criar torneios.
- Admin aprova o pedido.
- Usuário cria torneio.
- Usuário abre inscrições.
- Participante se inscreve.
- Admin resolve disputa e confirma auditoria.

## Casos específicos obrigatórios

### 3 participantes

- Mata-mata deve criar bye.
- Round robin deve criar uma folga por rodada.

### 4 participantes

- Mata-mata deve gerar semifinais e final.
- Round robin deve gerar 6 partidas em turno único.

### 5 participantes

- Mata-mata deve gerar byes.
- Round robin deve gerar 10 partidas em turno único.

### 8 participantes

- Mata-mata deve gerar quartas, semifinais e final.
- Seeding deve separar 1 e 2 em lados opostos.

### 16 participantes

- Chave completa sem bye.
- Rodadas: oitavas, quartas, semifinais e final.

### Número ímpar com bye

- Participante com bye avança sem resultado manual.
- Bye deve aparecer claramente como avanço automático.

### Empate em ranking

- Critérios devem ser aplicados em ordem.
- Empate não resolvido deve ser sinalizado.

### Resultado contestado

- Partida muda para em disputa.
- Ranking derivado deve ser marcado como provisório quando aplicável.

### Participante desistente

- Não deve receber novas partidas.
- Partidas já existentes exigem decisão do organizador.

### W.O.

- Deve aplicar placar padrão.
- Deve registrar justificativa.
- Deve permitir contestação quando dentro da regra.
