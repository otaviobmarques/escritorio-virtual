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

## Adendo 2 (01/11/2026): painel lateral no PC e função pública
- **Botões no PC:** "Ver lista" e "☰ Agentes" funcionavam no navegador sem tela (link real e local, cliques reais com o mouse; nada por cima, `elementFromPoint` = o próprio botão). A captura do Otávio mostrava o CSS antigo (botões sem estilo), então a causa provável é **cache do navegador**: o GitHub Pages manda `max-age=600`, e o `index.html` novo carregava `estilo.css`/`cena.js` antigos, que não têm o menu. Correção: versão nos endereços (`estilo.css?v=6`, `cena.js?v=6`, `fonte.js?v=6`), a mudar a cada publicação.
- **PC (> 768px):** "☰ Agentes" abre um **painel fixo à direita**, na altura toda, que **encolhe a cena** (sem cobrir). Um `ResizeObserver` reenquadra a câmera. Lista por sala com nome, **função** e status, com busca. Clicar num nome realça a pessoa na cena (rótulo pulsando por 6 s) e abre o painel dela. No PC o painel não é modal: Esc fecha só com o foco dentro dele. No celular continua um diálogo sobreposto.
- **Função pública (decisão do Otávio):** campo opcional `funcao` no `status.json` = trecho do `name` do perfil depois do primeiro "·" (ex.: "Programador Escritório Virtual"). Só texto curto (até 40 caracteres, letras/números/pontuação simples), **nunca a description**. Um trecho longo ou estranho é descartado. `escrever-status.sh` aceita a função como 4º argumento opcional e `gerar-status.py` valida o campo. Tarefa e projeto continuam só no modo privado.
