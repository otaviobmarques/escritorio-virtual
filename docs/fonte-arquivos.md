# Fonte de produção: arquivos de status (local)

> Implementado e testado só localmente. **Nenhum agente foi configurado para escrever, nada foi publicado.**

## Pasta e formato
- Pasta: `./status/` (padrão; mude com `EV_STATUS_DIR`).
- Um arquivo por agente, `<slug-do-nome>.json`, até 1 KB, **exatamente** estes campos:
```json
{"nome": "Agente Exemplo", "sala": "RedBox", "status": "trabalhando"}
```
- `sala` ∈ `RedBox`, `Vértice`, `Restaurantes`, `Jurídico`, `Domma`.
- `status` ∈ `trabalhando`, `parado`, `esperando`.
- `nome`: só letras, espaços, `'`, `.`, `-` (até 60) — impede URLs, e-mails, tokens.
- Arquivo com campo extra, valor inválido, link simbólico ou > 1 KB é **ignorado**.
- O "quando" vem da data de modificação do arquivo (não há campo de data).

## Como cada agente escreve
```bash
scripts/escrever-status.sh "Agente Exemplo" RedBox trabalhando
```
(escrita atômica: grava temporário e renomeia.)

## Inatividade
Sem atualizar há mais de **10 min** ⇒ `parado`. Configure: `--limite-min 15` ou `EV_LIMITE_MIN=15`.

## Geração do status.json público
```bash
python3 scripts/gerar-status.py            # gera publico/status.json
# periódico, local (exemplo, NÃO iniciado):
while true; do python3 scripts/gerar-status.py; sleep 60; done
```
Saída: `{"agentes":[{"nome","sala","status"}]}` — nada além disso (sem horários, tarefas, chaves, tokens, dados de clientes ou conversas).

## Ver no painel
- Exemplo (padrão): `http://127.0.0.1:3200/`
- Real: `http://127.0.0.1:3200/?fonte=arquivos` (também nas páginas 3D). O selo muda para "Status real (arquivos)". O navegador relê o `status.json` a cada 30 s.

## Teste feito
Pasta de teste com 4 arquivos: 2 válidos → mantidos; 1 com mais de 11 min → `parado`; 1 com campo extra `token` → ignorado.
