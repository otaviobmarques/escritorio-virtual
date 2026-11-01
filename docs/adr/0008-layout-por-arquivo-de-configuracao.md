# ADR-0008: Salas e mesas definidas em `config/escritorio.json`
## Status
Aceito
## Data
2026-11-01
## Contexto
As salas estavam fixas em `src/fonte-status.js` e repetidas em `scripts/gerar-status.py`.
## Decisão
O protótipo lê `prototipo-fullhd/config/escritorio.json`: nome, id, descrição, cor e colunas por sala; medidas da mesa; salas por fileira; áreas extras (reunião, descanso); e colunas no celular. Há uma mesa por agente, em grade, e a sala cresce com o número de agentes.
## Consequências
+ Mudar o layout não exige código. − O `gerar-status.py` ainda tem a lista de salas própria; unificar isso na migração (fora desta pasta, não alterado agora).
