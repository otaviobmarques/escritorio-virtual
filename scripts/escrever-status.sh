#!/usr/bin/env bash
# Uso (por cada agente): scripts/escrever-status.sh "Agente Exemplo" RedBox trabalhando ["Função curta"]
# Grava SÓ nome, sala, status e (opcional) função curta em $EV_STATUS_DIR/<slug>.json (escrita atômica).
set -euo pipefail
DIR="${EV_STATUS_DIR:-${STATUS_DIR:-./status}}"
case "$3" in trabalhando|parado|esperando) ;; *) echo "status inválido" >&2; exit 1;; esac
mkdir -p "$DIR"
slug=$(printf '%s' "$1" | iconv -f utf-8 -t ascii//TRANSLIT | tr 'A-Z' 'a-z' | tr -cs 'a-z0-9' '-' | sed 's/-$//')
python3 - "$1" "$2" "$3" "${4:-}" > "$DIR/.$slug.tmp" <<'PY'
import json,sys
d={"nome":sys.argv[1],"sala":sys.argv[2],"status":sys.argv[3]}
if sys.argv[4].strip(): d["funcao"]=sys.argv[4].strip()
print(json.dumps(d,ensure_ascii=False))
PY
mv "$DIR/.$slug.tmp" "$DIR/$slug.json"
