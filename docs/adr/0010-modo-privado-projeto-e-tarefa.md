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

## Adendo (01/11/2026): menu lateral de agentes e quadrante expandido
- Botão fixo **☰ Agentes** (celular e computador) abre um menu lateral (`role=dialog`, foco preso, Esc fecha e devolve o foco ao botão) com todos os agentes agrupados por sala e busca por nome.
- Público: só nome, sala e status. `?modo=privado` (servidor local): também **Função** = campo `title` do `profile.json` (nunca a `description`; hoje os 81 perfis têm `title` vazio, então aparece "sem função registrada") e **Fazendo** = tarefa/projeto do `registrar.sh` ("sem tarefa registrada" quando não houver).
- Celular: tocar num quadrante (fora de uma pessoa) expande a sala em tela cheia (mini-cena maior + lista embaixo) com botão "Voltar aos quadrantes"; usa `?sala=X` com `history.pushState`, então Esc e o voltar do navegador fecham. Animação de 0,28 s, desligada com `prefers-reduced-motion`. Tocar numa pessoa continua abrindo o painel.
