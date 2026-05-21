# Fluxos de usuário

## Usuário cria conta

- **Ator:** usuário comum.
- **Pré-condições:** usuário não autenticado.
- **Passos:** acessar cadastro; informar nome, e-mail e senha; confirmar envio; Supabase Auth cria usuário; sistema cria perfil com `role = user`, `avatar_key` padrão e RA vazio/opcional.
- **Erros possíveis:** e-mail inválido; e-mail já cadastrado; senha fraca; falha na criação do perfil.
- **Estado final:** usuário autenticado ou aguardando confirmação, com perfil vinculado a `auth.users.id`.

## Usuário faz login

- **Ator:** usuário comum ou admin.
- **Pré-condições:** conta existente.
- **Passos:** informar e-mail e senha; Supabase Auth valida credenciais; aplicação carrega perfil e permissões.
- **Erros possíveis:** credenciais inválidas; conta não confirmada; perfil ausente; sessão expirada.
- **Estado final:** sessão ativa com permissões derivadas do banco.

## Usuário edita perfil

- **Ator:** usuário autenticado.
- **Pré-condições:** sessão ativa e perfil existente.
- **Passos:** acessar perfil; editar nome exibido, RA e `avatar_key`; salvar.
- **Erros possíveis:** avatar inexistente; RA em formato inválido; tentativa de alterar `role`; falha por RLS.
- **Estado final:** perfil próprio atualizado; dados de outros usuários permanecem protegidos.

## Usuário solicita permissão para criar torneios

- **Ator:** usuário comum.
- **Pré-condições:** sessão ativa.
- **Passos:** acessar pedido de permissão; informar justificativa; enviar solicitação.
- **Erros possíveis:** pedido pendente já existente; justificativa ausente; usuário bloqueado.
- **Estado final:** solicitação criada com status `pending`.

## Admin aprova ou rejeita pedido

- **Ator:** admin.
- **Pré-condições:** pedido pendente.
- **Passos:** abrir painel administrativo; revisar usuário e justificativa; aprovar ou rejeitar; registrar justificativa da decisão.
- **Erros possíveis:** pedido já decidido; admin sem sessão válida; erro de policy/RLS.
- **Estado final:** pedido fica `approved` ou `rejected`; em aprovação, usuário recebe permissão para criar torneios.

## Organizador cria torneio

- **Ator:** admin ou usuário com permissão aprovada para criar torneios.
- **Pré-condições:** usuário autenticado; `role = admin` ou `can_create_tournaments = true`.
- **Passos:** acessar dashboard; clicar em criar torneio; preencher nome, modalidade, datas e descrição; salvar rascunho.
- **Erros possíveis:** campos obrigatórios ausentes; datas inválidas; nome duplicado no mesmo contexto; usuário sem permissão; operação bloqueada por RLS.
- **Estado final:** torneio criado como rascunho.

## Organizador define formato

- **Ator:** admin ou usuário autorizado no torneio.
- **Pré-condições:** torneio em rascunho ou configuração aberta; permissão validada no banco.
- **Passos:** abrir configurações; escolher formato; definir melhor de N, terceiro lugar, pontuação e desempates; salvar.
- **Erros possíveis:** formato incompatível com número de participantes; configuração incompleta.
- **Estado final:** torneio possui formato validável.

## Organizador abre inscrições

- **Ator:** admin ou usuário autorizado no torneio.
- **Pré-condições:** torneio configurado com limites e período de inscrição; permissão validada no banco.
- **Passos:** revisar regras; definir janela; publicar inscrições.
- **Erros possíveis:** datas inválidas; limite máximo menor que mínimo; torneio sem modalidade.
- **Estado final:** status `registration_open`.

## Participante se inscreve

- **Ator:** participante.
- **Pré-condições:** inscrições abertas; usuário autenticado quando o torneio exigir vínculo de perfil.
- **Passos:** acessar página pública; preencher dados; aceitar regras; enviar inscrição.
- **Erros possíveis:** inscrições fechadas; participante duplicado; dados obrigatórios ausentes.
- **Estado final:** inscrição pendente ou aprovada.

## Capitão cria equipe

- **Ator:** capitão.
- **Pré-condições:** torneio por equipes com inscrições abertas.
- **Passos:** informar nome da equipe; adicionar membros; confirmar inscrição.
- **Erros possíveis:** equipe sem membros mínimos; membro duplicado; limite de equipe excedido.
- **Estado final:** equipe criada e vinculada à inscrição.

## Organizador fecha inscrições

- **Ator:** admin ou usuário autorizado no torneio.
- **Pré-condições:** inscrições abertas; permissão validada no banco.
- **Passos:** revisar inscritos; aprovar ou recusar pendências; fechar inscrições.
- **Erros possíveis:** participantes abaixo do mínimo; inscrições pendentes sem decisão.
- **Estado final:** status `registration_closed`.

## Organizador gera chave/tabela

- **Ator:** admin ou usuário autorizado no torneio.
- **Pré-condições:** inscrições fechadas, participantes aprovados e permissão validada no banco.
- **Passos:** escolher seeding ou sorteio; gerar estrutura; revisar; publicar ou manter provisória.
- **Erros possíveis:** participantes insuficientes; seeds duplicados; conflito de configuração.
- **Estado final:** chave, grupos ou tabela criada.

## Jogador faz check-in

- **Ator:** jogador ou capitão.
- **Pré-condições:** check-in aberto.
- **Passos:** acessar torneio; confirmar presença; receber confirmação.
- **Erros possíveis:** janela fechada; participante não aprovado; equipe incompleta.
- **Estado final:** participante marcado como confirmado.

## Partida acontece

- **Ator:** participantes e organizador.
- **Pré-condições:** partida agendada e participantes aptos.
- **Passos:** participantes entram no local/servidor; partida muda para ao vivo; jogo é disputado.
- **Erros possíveis:** atraso; ausência; problema técnico; participante irregular.
- **Estado final:** partida pronta para receber resultado, W.O. ou contestação.

## Resultado é enviado

- **Ator:** capitão, jogador ou organizador.
- **Pré-condições:** partida permite envio de resultado.
- **Passos:** informar placar; anexar observação quando necessário; enviar.
- **Erros possíveis:** placar inválido; empate não permitido; série incompleta.
- **Estado final:** resultado submetido.

## Resultado é confirmado

- **Ator:** admin ou usuário autorizado no torneio, conforme regra de confirmação.
- **Pré-condições:** resultado submetido; permissão validada no banco.
- **Passos:** revisar placar; confirmar; atualizar chave/ranking.
- **Erros possíveis:** resultado inconsistente; contestação aberta.
- **Estado final:** resultado confirmado e efeitos aplicados.

## Resultado é contestado

- **Ator:** participante, capitão ou organizador.
- **Pré-condições:** resultado submetido ou confirmado dentro do prazo de contestação.
- **Passos:** abrir contestação; informar motivo; enviar.
- **Erros possíveis:** prazo encerrado; usuário sem vínculo com partida; motivo vazio.
- **Estado final:** partida marcada como em disputa.

## Organizador resolve disputa

- **Ator:** admin ou usuário autorizado a resolver disputas.
- **Pré-condições:** disputa aberta; permissão validada no banco.
- **Passos:** analisar motivo; decidir manter, corrigir ou anular resultado; registrar justificativa.
- **Erros possíveis:** decisão sem justificativa; impacto em partidas dependentes.
- **Estado final:** disputa resolvida e auditoria registrada.

## Ranking é atualizado

- **Ator:** sistema.
- **Pré-condições:** resultado confirmado ou corrigido.
- **Passos:** recalcular tabela; aplicar desempates; marcar empates não resolvidos; atualizar exibição.
- **Erros possíveis:** critério de desempate inválido; dados incompletos.
- **Estado final:** ranking atualizado e critérios visíveis.

## Torneio é finalizado

- **Ator:** admin ou usuário autorizado no torneio.
- **Pré-condições:** partidas decisivas finalizadas ou decisão administrativa registrada.
- **Passos:** revisar campeão/classificação; publicar resultado final; finalizar torneio.
- **Erros possíveis:** partidas pendentes; disputas abertas; ranking ambíguo sem decisão.
- **Estado final:** status `finished`.

## Admin altera torneio em andamento ou encerrado

- **Ator:** admin.
- **Pré-condições:** sessão ativa; torneio existente; justificativa administrativa.
- **Passos:** acessar painel administrativo; abrir torneio; alterar configuração, resultado, inscrição ou bloqueio; informar justificativa; confirmar.
- **Erros possíveis:** ausência de justificativa; impacto em partidas dependentes; falha de policy; tentativa de alteração sem auditoria.
- **Estado final:** alteração aplicada, auditoria criada e dados derivados marcados para recálculo quando necessário.
