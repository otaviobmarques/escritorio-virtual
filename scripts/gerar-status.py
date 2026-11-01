#!/usr/bin/env python3
"""Junta os arquivos de status (um por agente) num status.json público.

Entrada: PASTA/<qualquer-nome>.json com EXATAMENTE {"nome", "sala", "status"} e, opcional, "funcao" (texto curto)
Saída:   {"agentes": [{"nome","sala","status"[,"funcao"]}, ...]}  — nada além disso.
Regra:   arquivo sem atualização (mtime) há mais de LIMITE minutos => status "parado".
Uso:     python3 scripts/gerar-status.py [--pasta DIR] [--saida ARQ] [--limite-min 10]
         (variáveis: EV_STATUS_DIR, EV_SAIDA, EV_LIMITE_MIN)
"""
import argparse, json, os, re, sys, time, tempfile

SALAS = {"RedBox", "Vértice", "Restaurantes", "Jurídico", "Domma"}
STATUS = {"trabalhando", "parado", "esperando"}
FUNCAO_OK = re.compile(r"^[0-9A-Za-zÀ-ÿ' .,&/-]{1,40}$")  # função curta (trecho do nome após "·"), nunca a description
NOME_OK = re.compile(r"^[A-Za-zÀ-ÿ' .-]{1,60}$")  # só letras/espaços: impede vazar tokens, e-mails, URLs
MAX_BYTES = 1024

def ler(caminho, limite_s, agora):
    if os.path.islink(caminho) or not os.path.isfile(caminho): return None
    st = os.stat(caminho)
    if st.st_size > MAX_BYTES: return None
    try:
        d = json.load(open(caminho, encoding="utf-8"))
    except (ValueError, OSError):
        return None
    if not isinstance(d, dict) or set(d) - {"funcao"} != {"nome", "sala", "status"}: return None  # campo extra => rejeita
    funcao = d.get("funcao")
    if funcao is not None and not (isinstance(funcao, str) and FUNCAO_OK.match(funcao)): return None
    nome, sala, status = d["nome"], d["sala"], d["status"]
    if not (isinstance(nome, str) and NOME_OK.match(nome) and sala in SALAS and status in STATUS): return None
    if agora - st.st_mtime > limite_s: status = "parado"
    out = {"nome": nome.strip(), "sala": sala, "status": status}
    if funcao: out["funcao"] = funcao.strip()
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pasta", default=os.environ.get("EV_STATUS_DIR", os.environ.get("STATUS_DIR", "./status")))
    ap.add_argument("--saida", default=os.environ.get("EV_SAIDA", os.path.join(os.path.dirname(__file__), "..", "publico", "status.json")))
    ap.add_argument("--limite-min", type=float, default=float(os.environ.get("EV_LIMITE_MIN", 10)))
    a = ap.parse_args()
    agora, agentes, rejeitados = time.time(), [], 0
    if os.path.isdir(a.pasta):
        for f in sorted(os.listdir(a.pasta)):
            if not f.endswith(".json"): continue
            r = ler(os.path.join(a.pasta, f), a.limite_min * 60, agora)
            if r: agentes.append(r)
            else: rejeitados += 1
    agentes.sort(key=lambda x: (x["sala"], x["nome"]))
    os.makedirs(os.path.dirname(os.path.abspath(a.saida)), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(a.saida)))
    with os.fdopen(fd, "w", encoding="utf-8") as o: json.dump({"agentes": agentes}, o, ensure_ascii=False, indent=1)
    os.chmod(tmp, 0o644); os.replace(tmp, a.saida)  # escrita atômica
    print(f"{len(agentes)} agentes gravados em {a.saida}; {rejeitados} arquivo(s) ignorado(s)", file=sys.stderr)

if __name__ == "__main__": main()
