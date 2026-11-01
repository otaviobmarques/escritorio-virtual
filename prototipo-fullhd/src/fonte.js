// Fontes de status do protótipo. Contrato de entrada: {nome, sala, status} — só esses 3 campos são usados.
const NOME_OK = /^[A-Za-zÀ-ÿ' .-]{1,60}$/;
const FUNCAO_OK = /^[0-9A-Za-zÀ-ÿ' .,&/-]{1,40}$/;
const TESTES = ["trabalhando", "parado", "esperando", "misto"]; // lista fechada (sem URL livre)

export function validar(lista, cfg) {
  const salas = new Set(cfg.salas.map(s => s.nome)), st = new Set(cfg.status), out = [];
  for (const a of Array.isArray(lista) ? lista : []) {
    if (!a || typeof a.nome !== "string" || !NOME_OK.test(a.nome) || !salas.has(a.sala)) continue;
    const funcao = typeof a.funcao === "string" && FUNCAO_OK.test(a.funcao) ? a.funcao.trim() : "";
    out.push({ nome: a.nome.trim(), sala: a.sala, status: st.has(a.status) ? a.status : "parado", funcao });
  }
  return out;
}

/** Padrão = status real (publico/status.json). ?fonte=exemplo usa dados inventados; ?teste=... arquivos de teste locais. */
export function criarFonte(cfg, params = new URLSearchParams(location.search), url = p => p) {
  const fonte = params.get("fonte"), teste = params.get("teste");
  if (teste && TESTES.includes(teste)) return http(url(`teste/status-${teste}.json`), `Teste local: ${teste}`, true, cfg, 0);
  if (fonte === "exemplo") return exemplo(cfg, params.get("estatico") === "1", url);
  return http(url("../publico/status.json"), "Status real", false, cfg);
}

function http(url, selo, ehExemplo, cfg, intervalo = 30000) {
  const buscar = async () => {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error("status indisponível");
    return validar((await r.json()).agentes, cfg);
  };
  return { selo, exemplo: ehExemplo, carregar: buscar,
    assinar(cb) { if (!intervalo) return () => {}; const t = setInterval(async () => { try { cb(await buscar()); } catch {} }, intervalo); return () => clearInterval(t); } };
}

function exemplo(cfg, estatico, url) {
  let lista = [];
  return { selo: "⚠ Dados de exemplo (inventados)", exemplo: true,
    async carregar() {
      const d = await (await fetch(url("../dados/exemplo.json"), { cache: "no-store" })).json();
      lista = validar(d.setores.flatMap(s => s.agentes.map(a => ({ nome: a.nome, sala: s.nome, status: a.status }))), cfg);
      return lista.map(a => ({ ...a }));
    },
    assinar(cb) {
      if (estatico) return () => {};
      const t = setInterval(() => { const a = lista[Math.floor(Math.random() * lista.length)]; a.status = cfg.status[Math.floor(Math.random() * 3)]; cb(lista.map(x => ({ ...x }))); }, 7000);
      return () => clearInterval(t);
    } };
}

/** Modo privado: lê o arquivo privado servido SÓ pelo servidor local (ferramentas/servidor-privado.py). Nunca fica em publico/. */
export async function carregarPrivado() {
  const r = await fetch("/privado/status-privado.json", { cache: "no-store" });
  if (!r.ok) throw new Error("privado indisponível");
  return r.json();
}
