import { criarFonte, marcarSelo } from "./fonte-status.js";

// Troque aqui a fonte de dados (adaptador). Hoje: apenas exemplo.
const fonte = criarFonte(); // ?fonte=arquivos para status real
const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
const TW = 32, TH = 16; // tile isométrico
const salas = new Map();

function iso(x, y, ox, oy) { return [ox + (x - y) * TW / 2, oy + (x + y) * TH / 2]; }
function px(c, x, y, w, h, cor) { c.fillStyle = cor; c.fillRect(Math.round(x), Math.round(y), w, h); }
function losango(c, x, y, cor, borda) {
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + TW / 2, y + TH / 2); c.lineTo(x, y + TH); c.lineTo(x - TW / 2, y + TH / 2); c.closePath();
  c.fillStyle = cor; c.fill(); if (borda) { c.strokeStyle = borda; c.stroke(); }
}
function hash(s) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); }
const PELES = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbac"];
const CABELOS = ["#2b1b0e", "#5a3825", "#d9a441", "#111", "#8b2e1a", "#777"];

function mesa(c, x, y, ligado, t) {
  // tampo
  c.beginPath(); c.moveTo(x, y - 10); c.lineTo(x + 18, y - 1); c.lineTo(x, y + 8); c.lineTo(x - 18, y - 1); c.closePath();
  c.fillStyle = "#a4703f"; c.fill();
  px(c, x - 18, y - 1, 2, 10, "#6b4423"); px(c, x + 16, y - 1, 2, 10, "#6b4423"); px(c, x - 1, y + 8, 2, 9, "#6b4423");
  // monitor
  px(c, x - 7, y - 22, 14, 10, "#222");
  const brilho = ligado ? (Math.floor(t / 150) % 2 ? "#5fe1ff" : "#3cb6d9") : "#333a44";
  px(c, x - 6, y - 21, 12, 8, brilho); px(c, x - 1, y - 12, 2, 3, "#222");
}

function boneco(c, x, y, a, t) {
  const h = hash(a.nome), pele = PELES[h % PELES.length], cab = CABELOS[(h >> 3) % CABELOS.length];
  const camisa = `hsl(${h % 360},55%,50%)`;
  let dy = 0, braco = 0;
  if (a.status === "trabalhando") { braco = Math.floor(t / 120) % 2; dy = 0; }
  else if (a.status === "parado") { dy = Math.floor(t / 900) % 2; }
  else { dy = -Math.abs(Math.round(Math.sin(t / 250) * 2)); }
  if (reduzir) { dy = 0; braco = 0; }
  const bx = x - 5, by = y + 4 + dy;
  px(c, bx, by + 14, 3, 5, "#2c3e66"); px(c, bx + 6, by + 14, 3, 5, "#2c3e66"); // pernas
  px(c, bx - 1, by + 6, 11, 9, camisa); // tronco
  px(c, bx - 3, by + 7 - braco, 2, 6, pele); px(c, bx + 10, by + 7 - (1 - braco), 2, 6, pele); // braços
  px(c, bx, by - 2, 9, 8, pele); px(c, bx, by - 3, 9, 3, cab); px(c, bx - 1, by - 2, 2, 4, cab); // cabeça
  px(c, bx + 2, by + 2, 1, 1, "#000"); px(c, bx + 6, by + 2, 1, 1, "#000");
  if (a.status === "esperando") { // balão "..."
    px(c, x + 6, y - 24, 16, 9, "#fff"); px(c, x + 8, y - 15, 3, 2, "#fff");
    const n = reduzir ? 3 : Math.floor(t / 400) % 4;
    for (let i = 0; i < n; i++) px(c, x + 9 + i * 4, y - 20, 2, 2, "#000");
  } else if (a.status === "parado" && !reduzir) {
    c.fillStyle = "#aab"; c.font = "8px monospace"; c.fillText(Math.floor(t / 800) % 2 ? "z" : "Z", x + 8, y - 14);
  }
  // nome + status
  const primeiro = a.nome.split(" ")[0];
  c.font = "bold 9px monospace"; c.textAlign = "center";
  c.fillStyle = "#000"; c.fillText(primeiro, x + 1, y + 32);
  c.fillStyle = "#fff"; c.fillText(primeiro, x, y + 31);
  px(c, x - 3, y + 34, 6, 3, { trabalhando: "#4cd964", parado: "#8e8e9e", esperando: "#ffb02e" }[a.status]);
  c.textAlign = "start";
}

function desenharSala(s, t) {
  const { canvas: cv, setor } = s, c = cv.getContext("2d");
  const cols = 4, linhas = Math.ceil(setor.agentes.length / cols);
  const gw = cols * 3 + 1, gh = linhas * 3 + 1;
  const W = (gw + gh) * TW / 2 + 20, H = (gw + gh) * TH / 2 + 90;
  if (cv.width !== W) { cv.width = W; cv.height = H; }
  c.imageSmoothingEnabled = false; c.clearRect(0, 0, W, H);
  const ox = gh * TW / 2 + 10, oy = 40;
  // paredes
  const [lx, ly] = iso(0, gh, ox, oy), [rx, ry] = iso(gw, 0, ox, oy);
  c.fillStyle = setor.cor; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox, oy - 30); c.lineTo(rx, ry - 30); c.lineTo(rx, ry); c.fill();
  c.fillStyle = "#00000055"; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox, oy - 30); c.lineTo(lx, ly - 30); c.lineTo(lx, ly); c.fill();
  c.fillStyle = setor.cor; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox, oy - 30); c.lineTo(lx, ly - 30); c.lineTo(lx, ly); c.globalAlpha = .6; c.fill(); c.globalAlpha = 1;
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const [px_, py_] = iso(x, y, ox, oy); losango(c, px_, py_, (x + y) % 2 ? "#3a3d55" : "#33364c", "#2a2c3e");
  }
  setor.agentes.forEach((a, i) => {
    const gx = 1 + (i % cols) * 3 + 1, gy = 1 + Math.floor(i / cols) * 3 + 1;
    const [x, y] = iso(gx, gy, ox, oy);
    mesa(c, x, y - 6, a.status === "trabalhando", t + i * 53);
    boneco(c, x, y + 4, a, t + i * 97); // boneco à frente da mesa, de costas p/ o monitor
  });
}

function montar(d) {
  document.getElementById("aviso").textContent = d.aviso || "";
  document.getElementById("fonte").textContent = fonte.nome + (d.exemplo ? " (dados de exemplo)" : "");
  const main = document.getElementById("salas");
  main.innerHTML = "";
  salas.clear();
  for (const setor of d.setores) {
    const el = document.createElement("section"); el.className = "sala";
    const h = document.createElement("h2"); h.style.background = setor.cor;
    h.innerHTML = `<span></span><small></small>`;
    h.firstChild.textContent = setor.nome; h.lastChild.textContent = setor.descricao;
    const cv = document.createElement("canvas"); cv.setAttribute("role", "img");
    const ul = document.createElement("ul");
    el.append(h, cv, ul); main.append(el);
    salas.set(setor.id, { canvas: cv, setor, ul });
  }
  atualizarListas(d);
}

function atualizarListas(d) {
  const cont = { trabalhando: 0, parado: 0, esperando: 0 };
  for (const setor of d.setores) {
    const s = salas.get(setor.id); s.setor = setor; s.ul.innerHTML = "";
    s.canvas.setAttribute("aria-label", `Sala ${setor.nome}: ` + setor.agentes.map(a => `${a.nome} ${a.status}`).join(", "));
    for (const a of setor.agentes) {
      cont[a.status]++;
      const li = document.createElement("li"); const i = document.createElement("i"); i.className = "st " + a.status;
      li.append(i, `${a.nome} — ${a.status}`); li.title = a.tarefa; s.ul.append(li);
    }
  }
  for (const k in cont) document.getElementById("c-" + k).textContent = cont[k];
}

function loop(t) { for (const s of salas.values()) desenharSala(s, t); requestAnimationFrame(loop); }

const dados = await fonte.carregar();
montar(dados); marcarSelo(dados);
fonte.assinar?.(atualizarListas);
requestAnimationFrame(loop);
