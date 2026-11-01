# ADR-0010: Projeto e tarefa só no modo privado local
## Status
Aceito (pedido do Otávio, 2026-11-01)
## Data
2026-11-01
## Contexto
O Otávio quer um painel lateral com o projeto e a tarefa de cada agente, aberto ao clicar na sala ou na pessoa. Projeto e tarefa podem conter dados de clientes ou estratégia, então não podem ir para a página pública.
## Decisão
- A versão pública continua só com `{nome, sala, status}`. O painel público mostra apenas isso e um aviso.
- `?modo=privado` lê `/privado/status-privado.json`. Essa rota só existe num servidor local (127.0.0.1) que roda no computador de trabalho e lê um arquivo privado fora do repositório (pasta 0700, arquivo 0600). No GitHub Pages a rota não existe (404) e o painel diz "modo privado indisponível".
- Conteúdo do arquivo privado, gerado por um coletor local fora do repositório: nome, sala, status, função (título do perfil do agente), última atividade no box e regra usada para a sala. **Projeto e tarefa vêm só do registro próprio de cada agente** (ver `docs/instrucoes-agentes.md`, aprovado pelo Otávio em 01/11/2026). Sem registro, aparece "sem informação". Nada é inventado.
## Consequências
+ Dados sensíveis nunca saem do box. − Projeto e tarefa dependem de cada agente registrar.
