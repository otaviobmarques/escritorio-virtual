# ADR-0005: Fonte de produção = arquivos de status por agente + status.json gerado
## Status
Aceito (implementado só localmente; nada publicado)
## Data
2026-10-31
## Contexto
Ver `fontes-de-status.md`. Precisamos de status real sem rede externa e sem expor dados sensíveis.
## Decisão
Cada agente grava `$EV_STATUS_DIR/<slug>.json` (padrão `./status/`) com **apenas** `nome`, `sala`, `status`. O script `scripts/gerar-status.py` valida, aplica a regra de inatividade (padrão 10 min, configurável) e gera `publico/status.json` com só esses três campos. O navegador usa `?fonte=arquivos`; a fonte de exemplo continua padrão.
## Alternativas consideradas
Endpoint próprio, heartbeat por rotina, leitura de sessões — ver `fontes-de-status.md`.
## Consequências
+ Arquivo público mínimo (lista de permissão de campos); simples de auditar. − Depende de cada agente escrever o arquivo; atualização em lote (intervalo do gerador).
