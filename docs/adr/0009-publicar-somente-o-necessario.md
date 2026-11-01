# ADR-0009: Publicação do visual Full HD — só o necessário, e só com OK do Otávio
## Status
Aceito. Publicado com aprovação do Otávio em 01/11/2026; a versão antiga ficou em `classico.html`
## Data
2026-11-01
## Contexto
O site no ar publica a raiz do repositório (inclui `docs/` e `scripts/`). O Otávio decidiu manter a documentação no ar. O status real exige commits periódicos de `publico/status.json` para chegar ao GitHub Pages.
## Decisão
1. Publicar só os arquivos do painel, `config/`, `assets/harper-leve.glb` e `publico/status.json`. `assets/original/` (18 MB), `teste/`, `ferramentas/` e qualquer arquivo privado ficam de fora.
3. Nenhum arquivo privado (tarefa, projeto, função, última atividade) vai para o repositório (ADR-0010).
4. O status público é atualizado por commit automático só quando o conteúdo muda, no máximo a cada 5 minutos.
## Consequências
+ Superfície pública mínima. − Atualizar o status público exige push periódico (decisão pendente).
