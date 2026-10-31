/**
 * Interface de fonte de status (adaptador).
 * Toda fonte deve expor: { nome, exemplo:boolean, carregar(): Promise<Escritorio>, assinar?(cb): () => void }
 * Escritorio = { exemplo, aviso, geradoEm, setores:[{id,nome,descricao,cor,agentes:[{id,nome,status,tarefa,atualizadoEm}]}] }
 * status ∈ "trabalhando" | "parado" | "esperando"
 * Hoje só existe a fonte de EXEMPLO. Nenhuma fonte real está ligada (ver docs/fontes-de-status.md).
 */
export const STATUS_VALIDOS = ["trabalhando", "parado", "esperando"];

export function validarEscritorio(d) {
  if (!d || !Array.isArray(d.setores)) throw new Error("Formato inválido");
  for (const s of d.setores) for (const a of s.agentes) {
    if (!STATUS_VALIDOS.includes(a.status)) a.status = "parado";
  }
  return d;
}

/** Fonte de exemplo: lê dados/exemplo.json e sorteia mudanças de status para simular "ao vivo". */
export function criarFonteExemplo(url = "dados/exemplo.json", intervaloMs = 6000) {
  let dados = null;
  return {
    nome: "exemplo",
    exemplo: true,
    async carregar() {
      const r = await fetch(url, { cache: "no-store" });
      dados = validarEscritorio(await r.json());
      dados.exemplo = true; // fonte de exemplo SEMPRE marca como exemplo
      return dados;
    },
    assinar(cb) {
      const t = setInterval(() => {
        if (!dados) return;
        const todos = dados.setores.flatMap(s => s.agentes);
        const a = todos[Math.floor(Math.random() * todos.length)];
        a.status = STATUS_VALIDOS[Math.floor(Math.random() * 3)];
        a.tarefa = { trabalhando: "Tarefa de exemplo em andamento", parado: "Sem tarefa (exemplo)", esperando: "Aguardando aprovação (exemplo)" }[a.status];
        a.atualizadoEm = new Date().toISOString();
        cb(dados);
      }, intervaloMs);
      return () => clearInterval(t);
    },
  };
}

/* Esqueleto para fonte futura (NÃO ligado):
export function criarFonteHttp(url) { return { nome:"http", exemplo:false, async carregar(){ ... }, assinar(cb){ ... } }; }
*/

/* ---------- Fonte de produção: status.json gerado a partir dos arquivos por agente ---------- */
const SALAS = {
  "RedBox": { id: "redbox", descricao: "Agência", cor: "#d64545" },
  "Vértice": { id: "vertice", descricao: "Produtora de vídeo", cor: "#7b5cd6" },
  "Restaurantes": { id: "restaurantes", descricao: "Operação de restaurantes", cor: "#e08a2e" },
  "Jurídico": { id: "juridico", descricao: "Departamento jurídico", cor: "#3a8f6b" },
  "Domma": { id: "domma", descricao: "Sistemas", cor: "#2f7fd0" },
};
function montarEscritorio(lista) {
  const setores = Object.entries(SALAS).map(([nome, s]) => ({ id: s.id, nome, descricao: s.descricao, cor: s.cor, agentes: [] }));
  const porNome = new Map(setores.map(s => [s.nome, s]));
  for (const a of lista) {
    const s = porNome.get(a.sala); if (!s) continue;
    s.agentes.push({ id: `${s.id}-${s.agentes.length + 1}`, nome: String(a.nome), status: a.status, tarefa: "", atualizadoEm: "" });
  }
  return validarEscritorio({ exemplo: false, aviso: "", setores: setores.filter(s => s.agentes.length) });
}
/** Lê publico/status.json ({agentes:[{nome,sala,status}]}) e relê a cada intervaloMs. */
export function criarFonteArquivos(url = "publico/status.json", intervaloMs = 30000) {
  let dados = null;
  const buscar = async () => { const r = await fetch(url, { cache: "no-store" }); if (!r.ok) throw new Error("status.json indisponível"); return montarEscritorio((await r.json()).agentes || []); };
  return {
    nome: "arquivos", exemplo: false,
    async carregar() { dados = await buscar(); return dados; },
    assinar(cb) {
      const t = setInterval(async () => {
        try { const novo = await buscar();
          // atualiza status por nome, mantendo os ids já desenhados
          const mapa = new Map(novo.setores.flatMap(s => s.agentes.map(a => [s.nome + "|" + a.nome, a.status])));
          for (const s of dados.setores) for (const a of s.agentes) a.status = mapa.get(s.nome + "|" + a.nome) ?? "parado";
          cb(dados);
        } catch { /* mantém o último estado */ }
      }, intervaloMs);
      return () => clearInterval(t);
    },
  };
}
/** Escolhe a fonte: ?fonte=arquivos para produção; padrão = exemplo. */
export function criarFonte(params = new URLSearchParams(location.search)) {
  return params.get("fonte") === "arquivos" ? criarFonteArquivos() : criarFonteExemplo();
}
/** Ajusta o selo conforme a fonte. */
export function marcarSelo(d) {
  if (d.exemplo) return;
  document.querySelectorAll(".selo").forEach(e => { e.textContent = "Status real (arquivos)"; });
  const av = document.getElementById("aviso"); if (av) av.textContent = "";
}
