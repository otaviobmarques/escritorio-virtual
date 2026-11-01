// Protótipo Full HD: escritório 3D isométrico com humanos realistas (CC0, Innerscene/MakeHuman).
// Ver docs/especificacao/visual-fullhd.md e ADRs 0006–0009.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import { RoomEnvironment } from "three/addons/RoomEnvironment.js";
import { criarFonte, carregarPrivado } from "./fonte.js";

const params = new URLSearchParams(location.search);
const BASE = new URL("../", import.meta.url); // pasta prototipo-fullhd/, funciona de qualquer página que importe este módulo
const url = p => new URL(p, BASE).href;
const COR_STATUS = { trabalhando: 0x2e9e57, parado: 0x8d8a85, esperando: 0xe0a020 };
const CORES_TERNO = [0x2b3442, 0x4a4f57, 0x5b4636, 0x1e3350, 0x6a6058, 0x2f4a3a, 0x50405e, 0x7a7f86];
const hash = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const celular = () => innerWidth <= 768;

const cfg = await (await fetch(url("config/escritorio.json"), { cache: "no-store" })).json();
resolverCores(cfg);
const fonte = criarFonte(cfg, params, url);
const privado = params.get("modo") === "privado";
const palco = document.getElementById("palco"), camRot = document.getElementById("rotulos");
let vista = params.get("vista") || (celular() ? "lista" : "cena");
const grade = document.getElementById("grade"), btnVista = document.getElementById("alternar-vista");


// ---------- cores das salas: logotipo real; sem logo ou cores parecidas => neutra ----------
function lab(hex) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v > .04045 ? ((v + .055) / 1.055) ** 2.4 : v / 12.92; });
  const xyz = [(c[0] * .4124 + c[1] * .3576 + c[2] * .1805) / .95047, c[0] * .2126 + c[1] * .7152 + c[2] * .0722, (c[0] * .0193 + c[1] * .1192 + c[2] * .9505) / 1.08883]
    .map(t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * xyz[1] - 16, 500 * (xyz[0] - xyz[1]), 200 * (xyz[1] - xyz[2])];
}
export function resolverCores(c) {
  const lim = c.distanciaMinimaCor ?? 25, neutra = c.corNeutra || "#8A8580";
  for (const s of c.salas) { s.corEfetiva = s.corLogo || neutra; s.motivoCor = s.corLogo ? "logotipo" : "sem logotipo (neutra provisória)"; }
  const comLogo = c.salas.filter(s => s.corLogo);
  for (const a of comLogo) for (const b of comLogo) if (a !== b) {
    const [l1, a1, b1] = lab(a.corLogo), [l2, a2, b2] = lab(b.corLogo);
    if (Math.hypot(l1 - l2, a1 - a2, b1 - b2) < lim) { a.corEfetiva = neutra; a.motivoCor = `cor parecida com ${b.nome} (neutra)`; }
  }
  for (const s of c.salas) s.cor = s.corEfetiva; // a cena 3D e a lista usam a mesma cor
}
function textoSobre(hex) { // texto preto ou branco, o que der mais contraste (WCAG)
  const n = parseInt(hex.slice(1), 16), L = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v > .04045 ? ((v + .055) / 1.055) ** 2.4 : v / 12.92; }).reduce((t, v, i) => t + v * [.2126, .7152, .0722][i], 0);
  return (1.05) / (L + .05) >= (L + .05) / (0.0144 + .05) ? "#ffffff" : "#111111";
}
window.__cores = () => cfg.salas.map(s => ({ sala: s.nome, cor: s.corEfetiva, motivo: s.motivoCor }));

// ---------- renderizador, luz clara ----------
const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: params.has("captura") });
r.setPixelRatio(Math.min(devicePixelRatio, celular() ? 2 : 1.25));
r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
palco.prepend(r.domElement);
const cena = new THREE.Scene(); cena.background = new THREE.Color(0xf4f2ee);
const pm = new THREE.PMREMGenerator(r); cena.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
cena.add(new THREE.HemisphereLight(0xffffff, 0xd8cfc2, 0.9));
const sol = new THREE.DirectionalLight(0xfff6ea, 1.5); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); sol.shadow.bias = -0.0005; sol.shadow.normalBias = .02;
cena.add(sol, sol.target);
const cam = new THREE.OrthographicCamera(-10, 10, 10, -10, -200, 400);
const DIR_PC = new THREE.Vector3(1, 1.35, 1).normalize(), DIR_CEL = new THREE.Vector3(.3, 1.5, 1).normalize(); // isométrica no PC; mais frontal no celular (sala alta cabe na tela em pé)
let DIR_ISO = innerWidth <= 768 ? DIR_CEL : DIR_PC;

// ---------- texturas procedurais (sem arquivos de imagem de terceiros) ----------
function texMadeira() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512; const g = c.getContext("2d");
  const base = ["#c9a27a", "#c29a71", "#d0aa82", "#bf966c", "#cba57d"];
  for (let i = 0; i < 8; i++) { g.fillStyle = base[i % 5]; g.fillRect(0, i * 64, 512, 64);
    for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(90,60,30,${.04 + Math.random() * .05})`; g.beginPath(); const y = i * 64 + Math.random() * 64; g.moveTo(0, y); g.bezierCurveTo(170, y + 3, 340, y - 3, 512, y + 1); g.stroke(); }
    g.fillStyle = "rgba(70,45,25,.35)"; g.fillRect(0, i * 64, 512, 1.5); const off = (i * 197) % 512; g.fillRect(off, i * 64, 1.5, 64); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const madeira = texMadeira();

// ---------- materiais e geometrias compartilhados ----------
const M = (cor, o = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: .7, ...o });
const mat = { tampo: M(0xf7f7f5, { roughness: .45 }), metal: M(0x2d3035, { metalness: .5, roughness: .45 }), cadeira: M(0x222428, { roughness: .8 }),
  monitor: M(0x111214, { roughness: .35 }), parede: M(0xfafafa, { roughness: .95 }), base: M(0xe2ddd6, { roughness: .95 }),
  vaso: M(0xf1efe9, { roughness: .6 }), folha: M(0x4f8a3c, { roughness: .8 }), folha2: M(0x3e7432, { roughness: .8 }), teclado: M(0x2a2a2d),
  sofa: M(0x7d8794, { roughness: .95 }), feltro: M(0x2f7a4d, { roughness: 1 }), madeiraEsc: M(0x6b4a2f, { roughness: .6 }), vidro: new THREE.MeshPhysicalMaterial({ color: 0xe8f1f3, transparent: true, opacity: .3, roughness: .05 }) };
const md = cfg.mesa;
const G = { tampo: new THREE.BoxGeometry(md.largura, .04, md.profundidade), perna: new THREE.BoxGeometry(.04, md.altura - .04, .6),
  tela: new THREE.BoxGeometry(.62, .38, .03), haste: new THREE.BoxGeometry(.05, .2, .05), teclado: new THREE.BoxGeometry(.44, .02, .14),
  assento: new THREE.BoxGeometry(.5, .08, .48), encosto: new THREE.BoxGeometry(.46, .3, .05), coluna: new THREE.CylinderGeometry(.03, .03, .38),
  base: new THREE.CylinderGeometry(.28, .28, .03, 20), anel: new THREE.RingGeometry(.42, .52, 40), vaso: new THREE.CylinderGeometry(.2, .15, .42, 16), folha: new THREE.IcosahedronGeometry(.28, 1) };
const malha = (g, m, sombra = true) => { const x = new THREE.Mesh(g, m); x.castShadow = sombra; x.receiveShadow = true; return x; };
function planta(escala = 1) {
  const g = new THREE.Group(); const v = malha(G.vaso, mat.vaso); v.position.y = .21; g.add(v);
  [[0, .62, 0, 1], [.13, .85, .05, .8], [-.1, .9, -.06, .75], [.02, 1.1, .02, .6]].forEach(([x, y, z, s], i) => { const f = malha(G.folha, i % 2 ? mat.folha2 : mat.folha); f.position.set(x, y, z); f.scale.setScalar(s); g.add(f); });
  g.scale.setScalar(escala); return g;
}

// ---------- personagem (CC0) ----------
const gltf = await new GLTFLoader().loadAsync(url(cfg.modeloPessoa || "assets/harper-leve.glb"));
const clip = gltf.animations[0], base = gltf.scene;
base.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
const T_EMPE = 0, T_FIM = clip.duration, T_SENTADO = (() => { // instante mais sentado, medido no próprio clipe
  const m = SkeletonUtils.clone(base), mx = new THREE.AnimationMixer(m), ac = mx.clipAction(clip); ac.play();
  const pel = m.getObjectByName("pelvis"), v = new THREE.Vector3(); let melhor = 0, yMin = Infinity;
  for (let i = 0; i <= 120; i++) { ac.time = clip.duration * i / 120; mx.update(0); m.updateMatrixWorld(true); pel.getWorldPosition(v); if (v.y < yMin - 1e-4) { yMin = v.y; melhor = ac.time; } }
  return melhor; })();
function criarPessoa(a) {
  const h = hash(a.nome), raiz = SkeletonUtils.clone(base);
  raiz.traverse(o => { if (o.isMesh && /suit|fabric/i.test(o.material.name)) { o.material = o.material.clone(); o.material.color.setHex(CORES_TERNO[h % CORES_TERNO.length]).multiplyScalar(2.2); } });
  const mixer = new THREE.AnimationMixer(raiz), acao = mixer.clipAction(clip); acao.play(); acao.paused = true;
  const ossos = {}; for (const n of ["spine_02", "spine_03", "head", "upperarm_l", "upperarm_r", "lowerarm_l", "lowerarm_r", "hand_l", "hand_r", "pelvis"]) ossos[n] = raiz.getObjectByName(n);
  const repouso = Object.entries(ossos).filter(([, o]) => o).map(([, o]) => [o, o.quaternion.clone()]);
  return { raiz, mixer, acao, ossos, repouso, fase: h % 7 };
}
function criarMesa() {
  const g = new THREE.Group();
  const tampo = malha(G.tampo, mat.tampo); tampo.position.y = md.altura - .02; g.add(tampo);
  for (const x of [-md.largura / 2 + .05, md.largura / 2 - .05]) { const p = malha(G.perna, mat.metal); p.position.set(x, (md.altura - .04) / 2, 0); g.add(p); }
  const telaMat = M(0x101010, { roughness: .3 });
  const tela = malha(G.tela, telaMat); tela.position.set(0, md.altura + .3, .2); g.add(tela);
  const haste = malha(G.haste, mat.metal); haste.position.set(0, md.altura + .1, .22); g.add(haste);
  const tec = malha(G.teclado, mat.teclado); tec.position.set(0, md.altura + .01, -.08); g.add(tec);
  const cad = new THREE.Group(); const as = malha(G.assento, mat.cadeira); as.position.y = .44; cad.add(as);
  const enc = malha(G.encosto, mat.cadeira); enc.position.set(0, .66, -.26); cad.add(enc);
  const col = malha(G.coluna, mat.metal); col.position.y = .22; cad.add(col); const bs = malha(G.base, mat.metal); bs.position.y = .02; cad.add(bs);
  cad.position.z = -.55; g.add(cad);
  const anel = new THREE.Mesh(G.anel, new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: .9 })); anel.rotation.x = -Math.PI / 2; anel.position.set(0, .008, -.55); g.add(anel);
  return { g, telaMat, cad, anel };
}

// ---------- ambientes ----------
function piso(grupo, w, d) {
  const t = madeira.clone(); t.needsUpdate = true; t.repeat.set(w / 3, d / 3);
  const p = malha(new THREE.BoxGeometry(w, .08, d), [mat.base, mat.base, M(0xffffff, { map: t, roughness: .6 }), mat.base, mat.base, mat.base], false); p.position.y = -.04; grupo.add(p);
}
function paredes(grupo, w, d, cor) { // paredes baixas brancas "cortadas" no fundo e à esquerda, faixa da cor da sala
  const h = .9, e = .12;
  const fundo = malha(new THREE.BoxGeometry(w, h, e), mat.parede); fundo.position.set(0, h / 2, -d / 2 + e / 2); grupo.add(fundo);
  const esq = malha(new THREE.BoxGeometry(e, h, d * .62), mat.parede); esq.position.set(-w / 2 + e / 2, h / 2, -d / 2 + d * .31); grupo.add(esq);
  const faixa = new THREE.Mesh(new THREE.BoxGeometry(w, .05, e + .01), M(cor)); faixa.position.set(0, h + .025, -d / 2 + e / 2); grupo.add(faixa);
  const vid = new THREE.Mesh(new THREE.BoxGeometry(e * .4, h * .9, d * .3), mat.vidro); vid.position.set(-w / 2 + e / 2, h * .45, d * .3); grupo.add(vid);
}
function areaExtra(grupo, a) {
  const w = a.largura, d = a.profundidade;
  if (a.tipo === "reuniao") {
    const mesa = malha(new THREE.BoxGeometry(3.4, .05, 1.3), mat.madeiraEsc); mesa.position.y = .74; grupo.add(mesa);
    const pe = malha(new THREE.BoxGeometry(2.6, .7, .3), mat.metal); pe.position.y = .37; grupo.add(pe);
    for (const sx of [-1.1, 0, 1.1]) for (const sz of [-1, 1]) { const c = new THREE.Group(); const as = malha(G.assento, mat.cadeira); as.position.y = .44; c.add(as); const en = malha(G.encosto, mat.cadeira); en.position.set(0, .78, -.26); c.add(en); const co = malha(G.coluna, mat.metal); co.position.y = .22; c.add(co); c.position.set(sx, 0, sz * 1.05); c.rotation.y = sz > 0 ? Math.PI : 0; grupo.add(c); }
    const tv = malha(new THREE.BoxGeometry(2.2, 1.2, .06), mat.monitor); tv.position.set(0, 1.3, -d / 2 + .25); grupo.add(tv);
  } else {
    const sofa = new THREE.Group(); const as = malha(new THREE.BoxGeometry(2.4, .42, .9), mat.sofa); as.position.y = .21; sofa.add(as);
    const en = malha(new THREE.BoxGeometry(2.4, .5, .22), mat.sofa); en.position.set(0, .62, -.34); sofa.add(en);
    for (const sx of [-1, 1]) { const br = malha(new THREE.BoxGeometry(.22, .6, .9), mat.sofa); br.position.set(sx * 1.2, .3, 0); sofa.add(br); }
    sofa.position.set(-1.6, 0, -d / 2 + 1); grupo.add(sofa);
    const mc = malha(new THREE.BoxGeometry(1, .35, .6), mat.madeiraEsc); mc.position.set(-1.6, .18, -d / 2 + 2.2); grupo.add(mc);
    const sinuca = new THREE.Group(); const tp = malha(new THREE.BoxGeometry(2.5, .1, 1.4), mat.feltro); tp.position.y = .8; sinuca.add(tp);
    for (const [bx, bz, bw, bd] of [[0, .72, 2.7, .12], [0, -.72, 2.7, .12], [1.29, 0, .12, 1.56], [-1.29, 0, .12, 1.56]]) { const b = malha(new THREE.BoxGeometry(bw, .14, bd), mat.madeiraEsc); b.position.set(bx, .86, bz); sinuca.add(b); }
    for (const [lx, lz] of [[-1.1, -.55], [1.1, -.55], [-1.1, .55], [1.1, .55]]) { const l = malha(new THREE.BoxGeometry(.14, .75, .14), mat.madeiraEsc); l.position.set(lx, .375, lz); sinuca.add(l); }
    for (let i = 0; i < 6; i++) { const bola = malha(new THREE.SphereGeometry(.035, 12, 8), M([0xffffff, 0xe0b000, 0x1d4fbf, 0xc0262c, 0x5a2a7a, 0x111111][i], { roughness: .2 })); bola.position.set(-.5 + (i % 3) * .3, .89, -.2 + Math.floor(i / 3) * .35); sinuca.add(bola); }
    sinuca.position.set(1.3, 0, .9); grupo.add(sinuca);
  }
}

// ---------- layout a partir de config/escritorio.json ----------
const salas = new Map(), agentes = new Map();
const mundo = new THREE.Group(); cena.add(mundo);
const colunasDe = s => celular() ? Math.min(cfg.colunasCelular || 2, s.colunas) : s.colunas; // no celular as salas ficam altas (sem faixa vazia)
const dimSala = (s, n) => { const k = colunasDe(s), cols = Math.max(1, Math.min(k, n)), linhas = Math.max(1, Math.ceil(n / k)); return { w: cols * md.espacoX + 1.6, d: linhas * md.espacoZ + 1.4, cols, k }; };
function montar(lista) {
  mundo.clear(); camRot.replaceChildren(); salas.clear();
  const antigos = new Map(agentes); agentes.clear();
  const porSala = new Map(cfg.salas.map(s => [s.nome, []])); for (const a of lista) porSala.get(a.sala)?.push(a);
  const celulas = cfg.salas.filter(s => porSala.get(s.nome).length).map(s => ({ s, ...dimSala(s, porSala.get(s.nome).length) }));
  for (const a of cfg.areasExtras || []) celulas.push({ extra: a, w: a.largura, d: a.profundidade });
  let z0 = 0;
  const porFil = celular() ? (cfg.salasPorFileiraCelular || 1) : cfg.salasPorFileira;
  for (let i = 0; i < celulas.length; i += porFil) {
    const f = celulas.slice(i, i + porFil), prof = Math.max(...f.map(c => c.d));
    const largTot = f.reduce((t, c) => t + c.w, 0) + cfg.espacoEntreSalas * (f.length - 1); let x0 = -largTot / 2;
    for (const c of f) {
      const grupo = new THREE.Group(); grupo.position.set(x0 + c.w / 2, 0, z0 + prof / 2); mundo.add(grupo);
      const cor = c.s?.cor ?? "#b9b1a6"; piso(grupo, c.w, prof); paredes(grupo, c.w, prof, cor);
      const pl = planta(1); pl.position.set(-c.w / 2 + .45, 0, -prof / 2 + .45); grupo.add(pl);
      const pl2 = planta(.8); pl2.position.set(c.w / 2 - .45, 0, -prof / 2 + .45); grupo.add(pl2);
      const id = c.s?.id ?? c.extra.id;
      const el = document.createElement("button"); el.className = "rot-sala"; el.style.background = cor; el.style.color = textoSobre(cor); el.innerHTML = "<span></span><small></small>";
      el.firstChild.textContent = c.s?.nome ?? c.extra.nome; el.lastChild.textContent = c.s?.descricao ?? ""; camRot.append(el);
      if (c.s) el.onclick = () => abrirPainel({ sala: c.s.nome });
      const caixa = new THREE.Box3(new THREE.Vector3(-c.w / 2, 0, -prof / 2), new THREE.Vector3(c.w / 2, 1.8, prof / 2)).translate(grupo.position);
      salas.set(id, { s: c.s, extra: c.extra, el, grupo, ancora: new THREE.Vector3(-c.w / 2 + 1.2, 1.25, -prof / 2 + .1).add(grupo.position), caixa });
      if (c.extra) areaExtra(grupo, c.extra);
      else porSala.get(c.s.nome).forEach((a, k) => {
        const col = k % c.k, lin = Math.floor(k / c.k);
        const px = (col - (c.cols - 1) / 2) * md.espacoX, pz = -prof / 2 + 1.5 + lin * md.espacoZ;
        const chave = a.sala + "|" + a.nome, ant = antigos.get(chave);
        const p = ant?.pessoa ?? criarPessoa(a), m = criarMesa();
        const posto = new THREE.Group(); posto.position.set(px, 0, pz + .3); posto.rotation.y = Math.PI; grupo.add(posto); // costas para a câmera, tela acesa visível
        m.g.position.set(0, 0, .25); posto.add(m.g); p.raiz.position.set(0, 0, -.3); posto.add(p.raiz);
        const rot = document.createElement("button"); rot.className = "rot"; rot.innerHTML = '<i class="b"></i><span></span>'; rot.lastChild.textContent = a.nome;
        rot.title = `${a.nome} — ${a.sala}`; rot.onclick = () => abrirPainel({ sala: a.sala, nome: a.nome }); camRot.append(rot);
        const ag = { a: { ...a }, pessoa: p, mesa: m, rot, t: ant?.t ?? 0, alvo: 0 }; agentes.set(chave, ag); aplicarStatus(ag, a.status, !ant);
      });
      x0 += c.w + cfg.espacoEntreSalas;
    }
    z0 += prof + cfg.espacoEntreSalas;
  }
  const tudo = new THREE.Box3(); for (const s of salas.values()) tudo.union(s.caixa);
  const ctr = tudo.getCenter(new THREE.Vector3()), t = tudo.getSize(new THREE.Vector3()), raio = Math.max(t.x, t.z) * .75 + 2;
  sol.target.position.copy(ctr); sol.position.copy(ctr).add(new THREE.Vector3(-8, 20, 10));
  Object.assign(sol.shadow.camera, { left: -raio, right: raio, top: raio, bottom: -raio, near: 1, far: 70 }); sol.shadow.camera.updateProjectionMatrix();
  criarAbas(); enquadrar();
}
function aplicarStatus(ag, status, inicial) {
  ag.a.status = status; ag.alvo = status === "esperando" ? T_FIM : T_SENTADO;
  if (inicial) ag.t = ag.alvo;
  else if (status === "esperando" && ag.t <= T_SENTADO + 1e-3) ag.t = T_SENTADO;   // levanta: T_SENTADO → fim do clipe
  else if (status !== "esperando" && ag.t >= T_FIM - 1e-3) ag.t = T_EMPE;          // senta: início → T_SENTADO
  ag.rot.querySelector(".b").className = "b " + status;
  ag.mesa.anel.material.color.setHex(COR_STATUS[status]);
  ag.mesa.telaMat.emissive.setHex(status === "trabalhando" ? 0x7ab4e0 : 0); ag.mesa.telaMat.emissiveIntensity = status === "trabalhando" ? 1.2 : 0;
  ag.mesa.cad.position.z = status === "esperando" ? -.85 : -.55; // cadeira afastada quando a pessoa está em pé
}
let listaAtual = [];
function atualizarLista(l) {
  const ch = l.map(a => a.sala + "|" + a.nome).sort().join(",");
  if (ch !== [...agentes.keys()].sort().join(",")) montar(l);
  else for (const a of l) { const ag = agentes.get(a.sala + "|" + a.nome); if (ag.a.status !== a.status) aplicarStatus(ag, a.status, false); }
  listaAtual = l;
  for (const st of cfg.status) document.getElementById("c-" + st).textContent = l.filter(a => a.status === st).length;
  document.getElementById("lista").replaceChildren(...l.map(a => { const li = document.createElement("li"); li.textContent = `${a.nome}, sala ${a.sala}: ${a.status}`; return li; }));
  if (painelAberto) abrirPainel(painelAberto);
  if (vista === "lista") desenharLista();
}

// ---------- painel lateral (detalhes de projeto/tarefa só no modo privado) ----------
const painel = document.getElementById("painel"); let painelAberto = null, dadosPriv = null;
async function abrirPainel(sel) {
  painelAberto = sel; painel.hidden = false;
  if (privado && !dadosPriv) dadosPriv = await carregarPrivado().catch(() => null);
  const priv = new Map((dadosPriv?.agentes || []).map(a => [a.sala + "|" + a.nome, a]));
  const pessoas = listaAtual.filter(a => a.sala === sel.sala && (!sel.nome || a.nome === sel.nome));
  const h = document.createElement("div");
  const tit = document.createElement("h2"); tit.textContent = sel.nome ? sel.nome : sel.sala; h.append(tit);
  const sub = document.createElement("p"); sub.className = "sub"; sub.textContent = sel.nome ? `Sala ${sel.sala}` : `${pessoas.length} agente(s)`; h.append(sub);
  if (!privado) { const p = document.createElement("p"); p.className = "nota"; p.textContent = "Versão pública: só nome, sala e status. Projeto e tarefa aparecem apenas no modo privado local."; h.append(p); }
  else if (!dadosPriv) { const p = document.createElement("p"); p.className = "nota"; p.textContent = "Modo privado indisponível aqui (o arquivo privado só é servido pelo servidor local)."; h.append(p); }
  const ul = document.createElement("ul");
  for (const a of pessoas) {
    const li = document.createElement("li"); const pv = priv.get(a.sala + "|" + a.nome);
    const linha = (rot, val) => { const d = document.createElement("div"); const b = document.createElement("b"); b.textContent = rot + ": "; d.append(b, document.createTextNode(val)); return d; };
    const n = document.createElement("div"); n.className = "nome"; n.innerHTML = `<i class="b ${a.status}"></i>`; n.append(document.createTextNode(`${a.nome} — ${a.status}`)); li.append(n);
    if (privado && dadosPriv) { li.append(linha("Função", pv?.funcao || "sem informação"), linha("Projeto", pv?.projeto || "sem informação"), linha("Tarefa", pv?.tarefa || "sem informação"), linha("Última atividade no box", pv?.ultimaAtividade || "sem informação")); }
    ul.append(li);
  }
  h.append(ul);
  const fechar = document.createElement("button"); fechar.className = "fechar"; fechar.textContent = "Fechar ✕"; fechar.onclick = () => { painel.hidden = true; painelAberto = null; enquadrar(); };
  painel.replaceChildren(fechar, h); enquadrar();
}

// ---------- câmera isométrica, abas, gestos ----------
let foco = params.get("sala") || null;
function criarAbas() {
  const nav = document.getElementById("abas"); nav.replaceChildren();
  const ids = [...salas.keys()].filter(id => salas.get(id).s); if (foco === null || (foco !== "todas" && !salas.has(foco))) foco = celular() && vista !== "lista" ? ids[0] : "todas";
  for (const id of ["todas", ...ids]) { const b = document.createElement("button"); b.textContent = id === "todas" ? "Todas" : salas.get(id).s.nome; b.setAttribute("aria-pressed", String(id === foco)); b.onclick = () => { foco = id; criarAbas(); if (vista === "lista") desenharLista(); else enquadrar(); }; nav.append(b); }
}
let alvo = new THREE.Vector3(), meiaAlt = 10, zoom = 1, pan = new THREE.Vector3();
function enquadrar() {
  const w = palco.clientWidth, h = palco.clientHeight; if (!w || !h) return; r.setSize(w, h, false); DIR_ISO = celular() ? DIR_CEL : DIR_PC;
  const cx = new THREE.Box3(); if (foco === "todas") for (const s of salas.values()) cx.union(s.caixa); else if (salas.get(foco)) cx.copy(salas.get(foco).caixa);
  if (cx.isEmpty()) return;
  alvo = cx.getCenter(new THREE.Vector3()); cam.position.copy(alvo).addScaledVector(DIR_ISO, 60); cam.lookAt(alvo); cam.updateMatrixWorld();
  const inv = cam.matrixWorldInverse, v = new THREE.Vector3(); let mx = 0, my = 0;
  for (const x of [cx.min.x, cx.max.x]) for (const y of [cx.min.y, cx.max.y + .8]) for (const z of [cx.min.z, cx.max.z]) { v.set(x, y, z).applyMatrix4(inv); mx = Math.max(mx, Math.abs(v.x)); my = Math.max(my, Math.abs(v.y)); }
  meiaAlt = Math.max(my, mx * h / w) * 1.04; zoom = Number(params.get("zoom")) || 1; pan.set(0, 0, 0);
}
let eraCel = celular();
addEventListener("resize", () => { if (vista === "lista") { desenharLista(); return; } if (celular() !== eraCel) { eraCel = celular(); if (eraCel && foco === "todas") foco = null; agentes.clear(); montar(listaAtual); return; } enquadrar(); });
const toques = new Map(); let arr = null;
r.domElement.addEventListener("pointerdown", e => { toques.set(e.pointerId, e); arr = { x: e.clientX, y: e.clientY }; r.domElement.setPointerCapture(e.pointerId); });
r.domElement.addEventListener("pointermove", e => {
  if (toques.size === 2) { const [a, b] = [...toques.values()], d0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); toques.set(e.pointerId, e); const [c, d] = [...toques.values()]; zoom = THREE.MathUtils.clamp(zoom * d0 / Math.hypot(c.clientX - d.clientX, c.clientY - d.clientY), .25, 2); return; }
  if (!arr) return; const k = 2 * meiaAlt * zoom / palco.clientHeight; const dir = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), cima = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
  pan.addScaledVector(dir, -(e.clientX - arr.x) * k).addScaledVector(cima, (e.clientY - arr.y) * k); arr = { x: e.clientX, y: e.clientY }; });
const fim = e => { toques.delete(e.pointerId); if (!toques.size) arr = null; };
r.domElement.addEventListener("pointerup", fim); r.domElement.addEventListener("pointercancel", fim);
r.domElement.addEventListener("wheel", e => { e.preventDefault(); zoom = THREE.MathUtils.clamp(zoom * (e.deltaY > 0 ? 1.1 : .9), .25, 2); }, { passive: false });

// ---------- animação procedural sobre o clipe sentar/levantar ----------
const q = new THREE.Quaternion(), eu = new THREE.Euler();
const giro = (o, x, y, z) => { if (o) o.quaternion.multiply(q.setFromEuler(eu.set(x, y, z))); };
const POSE = window.__POSE = JSON.parse(params.get("pose") || "null") || { b: [0.9, 0, -0.25], a: [0.6, 0, 0] }; // braços à frente para digitar (calibrado por captura)
function animar(ag, dt, tempo) {
  const p = ag.pessoa; if (ag.t < ag.alvo) ag.t = Math.min(ag.alvo, ag.t + dt); else if (ag.t > ag.alvo) ag.t = Math.max(ag.alvo, ag.t - dt);
  for (const [o, qq] of p.repouso) o.quaternion.copy(qq); // o clipe não grava todos os ossos: volta ao repouso antes de somar ajustes
  p.acao.time = ag.t; p.mixer.update(0);
  const o = p.ossos, f = p.fase, sentado = Math.abs(ag.t - T_SENTADO) < 1e-3, emPe = ag.t >= T_FIM - 1e-3, st = ag.a.status;
  giro(o.spine_03, Math.sin(tempo * 1.6 + f) * .015, 0, 0); // respiração
  if (sentado && st === "trabalhando") {
    giro(o.spine_02, .06, 0, 0); giro(o.head, .12 + Math.sin(tempo * .7 + f) * .03, Math.sin(tempo * .4 + f) * .1, 0);
    for (const [l, s] of [["l", 1], ["r", -1]]) { giro(o["upperarm_" + l], POSE.b[0], POSE.b[1] * s, POSE.b[2] * s);
      giro(o["lowerarm_" + l], POSE.a[0] + Math.sin(tempo * 11 + f + (s > 0 ? 0 : 1.7)) * .05, POSE.a[1] * s, POSE.a[2] * s); giro(o["hand_" + l], Math.sin(tempo * 13 + f + s) * .12, 0, 0); }
  } else if (sentado) { giro(o.spine_02, -.08, 0, 0); giro(o.head, -.05, Math.sin(tempo * .3 + f) * .35, 0); }           // parado: recostado
  else if (emPe && st === "esperando") { giro(o.head, 0, Math.sin(tempo * .5 + f) * .4, 0);                                  // esperando: em pé
    const g = Math.max(0, Math.sin(tempo * .6 + f * 2)) ** 3; giro(o.upperarm_r, -g * .5, 0, 0); giro(o.lowerarm_r, -g * 1.1, 0, 0); }
}

// ---------- rótulos HTML presos às bordas (nunca cortam) ----------
const v = new THREE.Vector3();
function rotulos() {
  const W = palco.clientWidth, H = palco.clientHeight, ocupados = [];
  const por = (el, pos, emCima) => { v.copy(pos).project(cam); const vis = v.x > -1.15 && v.x < 1.15 && v.y > -1.15 && v.y < 1.15; if (!vis) { el.style.display = "none"; return; }
    el.style.display = ""; const w = el.offsetWidth, hh = el.offsetHeight; let x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
    x = Math.min(W - w / 2 - 4, Math.max(w / 2 + 4, x)); y = Math.min(H - 4, Math.max(emCima ? hh + 4 : hh / 2 + 4, y));
    // evita sobreposição: sobe o rótulo até 3 vezes; se ainda colidir, esconde (o nome continua na lista e no painel)
    const caixa = () => emCima ? [x - w / 2, y - hh, x + w / 2, y] : [x - w / 2, y - hh / 2, x + w / 2, y + hh / 2];
    const bate = c => ocupados.some(o => c[0] < o[2] && c[2] > o[0] && c[1] < o[3] && c[3] > o[1]);
    let c = caixa(), k = 0; while (bate(c) && k < 3) { y -= hh + 2; c = caixa(); k++; }
    if (bate(c) || c[1] < 0) { el.style.display = "none"; return; }
    ocupados.push(c); el.style.left = x + "px"; el.style.top = y + "px"; };
  for (const s of salas.values()) por(s.el, s.ancora, false);
  const lista = [...agentes.values()].map(ag => { ag.pessoa.ossos.head.getWorldPosition(v); v.y += .45; return [ag, v.clone()]; });
  lista.sort((a, b) => b[1].z + b[1].x - (a[1].z + a[1].x)); // mais perto da câmera primeiro
  for (const [ag, p] of lista) por(ag.rot, p, true);
}

// ---------- vista em lista (padrão no celular) ----------
const ROT_ST = { trabalhando: "Trabalhando", parado: "Parado", esperando: "Esperando" };
function cartaoPessoa(a, compacto) {
  const li = document.createElement("li"); const b = document.createElement("button"); b.className = (compacto ? "q-pessoa " : "g-cartao ") + a.status;
  b.setAttribute("aria-label", `${a.nome}, sala ${a.sala}, ${ROT_ST[a.status]}`); b.onclick = () => abrirPainel({ sala: a.sala, nome: a.nome });
  const n = document.createElement("span"); n.className = compacto ? "q-nome" : "g-nome"; n.textContent = a.nome;
  const st = document.createElement("span"); st.className = compacto ? "q-st" : "g-st"; const i = document.createElement("i"); i.className = "b " + a.status; i.setAttribute("aria-hidden", "true");
  st.append(i, document.createTextNode(ROT_ST[a.status])); b.append(n, st); li.append(b); return li;
}
function contagem(pessoas) { return cfg.status.map(st => [st, pessoas.filter(a => a.status === st).length]); }
let paginaInicial = Number(params.get("pagina")) || 1;
function desenharLista() {
  const salasCfg = cfg.salas.filter(s => (foco === "todas" || s.id === foco) && listaAtual.some(a => a.sala === s.nome));
  if (celular()) return desenharQuadrantes(salasCfg);
  const frag = document.createDocumentFragment();
  for (const s of salasCfg) {
    const pessoas = listaAtual.filter(a => a.sala === s.nome);
    const sec = document.createElement("section"); sec.className = "g-sala"; sec.setAttribute("aria-labelledby", "g-" + s.id);
    const h = document.createElement("h2"); h.id = "g-" + s.id; h.style.borderColor = s.cor; h.textContent = s.nome + " ";
    const sm = document.createElement("small"); sm.textContent = `${s.descricao} · ${pessoas.length}`; h.append(sm); sec.append(h);
    const ul = document.createElement("ul"); ul.className = "g-cartoes"; for (const a of pessoas) ul.append(cartaoPessoa(a, false));
    sec.append(ul); frag.append(sec);
  }
  grade.className = "grade"; grade.replaceChildren(frag);
}
// Celular: 4 quadrantes (2x2) por página, uma sala por quadrante; mais de 4 salas => páginas lado a lado (scroll-snap)
function desenharQuadrantes(salasCfg) {
  const paginas = []; for (let i = 0; i < salasCfg.length; i += 4) paginas.push(salasCfg.slice(i, i + 4));
  const trilho = document.createElement("div"); trilho.className = "q-trilho"; trilho.setAttribute("role", "region"); trilho.setAttribute("aria-roledescription", "carrossel"); trilho.setAttribute("aria-label", "Salas, 4 por página"); trilho.tabIndex = 0;
  paginas.forEach((pg, ip) => {
    const p = document.createElement("div"); p.className = "q-pagina" + (pg.length === 1 ? " uma" : pg.length === 2 ? " duas" : "");
    p.setAttribute("role", "group"); p.setAttribute("aria-roledescription", "página"); p.setAttribute("aria-label", `Página ${ip + 1} de ${paginas.length}`);
    for (const s of pg) {
      const pessoas = listaAtual.filter(a => a.sala === s.nome);
      const q = document.createElement("section"); q.className = "q-sala"; q.style.setProperty("--cor", s.cor); q.setAttribute("aria-labelledby", "q-" + s.id);
      const h = document.createElement("h2"); h.id = "q-" + s.id; h.textContent = s.nome; q.append(h);
      const c = document.createElement("p"); c.className = "q-cont";
      for (const [st, n] of contagem(pessoas)) { const sp = document.createElement("span"); const i = document.createElement("i"); i.className = "b " + st; i.setAttribute("aria-hidden", "true"); sp.append(i, document.createTextNode(String(n))); sp.title = ROT_ST[st]; sp.setAttribute("aria-label", `${ROT_ST[st]}: ${n}`); c.append(sp); }
      q.append(c);
      const mini = document.createElement("div"); mini.className = "q-cena"; mini.dataset.sala = s.id; mini.setAttribute("aria-hidden", "true"); // a lista abaixo é o acesso acessível
      mini.addEventListener("click", e => tocarMini(s.id, e)); q.append(mini);
      const ul = document.createElement("ul"); ul.className = "q-pessoas"; ul.setAttribute("aria-label", `Pessoas da sala ${s.nome}`); ul.tabIndex = 0;
      for (const a of pessoas) ul.append(cartaoPessoa(a, true));
      q.append(ul); p.append(q);
    }
    trilho.append(p);
  });
  const ind = document.createElement("div"); ind.className = "q-ind"; ind.setAttribute("aria-label", "Páginas");
  const pontos = paginas.map((_, i) => { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", `Ir para a página ${i + 1}`); b.onclick = () => trilho.scrollTo({ left: i * trilho.clientWidth, behavior: "smooth" }); ind.append(b); return b; });
  const marcar = () => { const i = Math.round(trilho.scrollLeft / Math.max(1, trilho.clientWidth)); pontos.forEach((b, k) => b.setAttribute("aria-current", k === i ? "page" : "false")); };
  trilho.addEventListener("scroll", () => requestAnimationFrame(marcar), { passive: true });
  const antes = grade.querySelector(".q-trilho")?.scrollLeft || 0;
  grade.className = "grade quad"; grade.replaceChildren(trilho, ...(paginas.length > 1 ? [ind] : []), r.domElement);
  const pos = () => { if (paginaInicial > 1 && trilho.clientWidth) { trilho.scrollLeft = (paginaInicial - 1) * trilho.clientWidth; paginaInicial = 1; } else if (antes) trilho.scrollLeft = antes; marcar(); };
  pos(); requestAnimationFrame(pos);
}
function modoQuad() { return vista === "lista" && celular(); }
function aplicarVista() {
  const lista = vista === "lista";
  grade.hidden = !lista; palco.hidden = lista;
  btnVista.textContent = lista ? "Ver cena 3D" : "Ver lista"; btnVista.setAttribute("aria-pressed", String(!lista));
  if (modoQuad()) { grade.append(r.domElement); r.domElement.classList.add("q-canvas"); r.setPixelRatio(Math.min(devicePixelRatio, 1.5)); }
  else { palco.prepend(r.domElement); r.domElement.classList.remove("q-canvas"); r.setPixelRatio(Math.min(devicePixelRatio, celular() ? 2 : 1.25)); }
  if (lista) desenharLista(); else { if (celular() && foco === "todas") foco = null; criarAbas(); enquadrar(); }
  if (modoQuad()) grade.append(r.domElement);
}
btnVista.onclick = () => { vista = vista === "lista" ? "cena" : "lista"; aplicarVista(); };

// ---------- celular: salas em miniatura nos quadrantes, UM renderer com viewport/scissor ----------
const DIR_Q = new THREE.Vector3(.18, 1.25, 1).normalize(), camQ = new THREE.OrthographicCamera(-1, 1, 1, -1, -200, 400), fundoQ = new THREE.Color(), BRANCO = new THREE.Color(0xffffff);
const ultimaCam = new Map(); // sala -> {cam, rect} do último quadro, para tocar na pessoa
function fitCam(c, caixa, w, h) {
  const centro = caixa.getCenter(new THREE.Vector3()); c.position.copy(centro).addScaledVector(DIR_Q, 60); c.lookAt(centro); c.updateMatrixWorld();
  const inv = c.matrixWorldInverse, v = new THREE.Vector3(); let mx = 0, my = 0;
  for (const x of [caixa.min.x, caixa.max.x]) for (const y of [caixa.min.y, caixa.max.y]) for (const z of [caixa.min.z, caixa.max.z]) { v.set(x, y, z).applyMatrix4(inv); mx = Math.max(mx, Math.abs(v.x)); my = Math.max(my, Math.abs(v.y)); }
  const mh = Math.max(my, mx * h / w) * 1.02; Object.assign(c, { left: -mh * w / h, right: mh * w / h, top: mh, bottom: -mh }); c.updateProjectionMatrix();
}
function quadrosVisiveis() {
  const g = grade.getBoundingClientRect(); const out = [];
  for (const el of grade.querySelectorAll(".q-cena")) { const q = el.getBoundingClientRect(); if (q.right <= g.left + 1 || q.left >= g.right - 1 || q.bottom <= g.top || q.top >= g.bottom || q.width < 4 || q.height < 4) continue; out.push([el.dataset.sala, q]); }
  return [g, out];
}
function renderQuad(dt, tempo) {
  const [g, vis] = quadrosVisiveis(); const W = Math.round(g.width), H = Math.round(g.height);
  const tam = r.getSize(new THREE.Vector2()); if (tam.x !== W || tam.y !== H) r.setSize(W, H, false);
  const ids = new Set(vis.map(v => v[0]));
  const nomeDe = new Map(cfg.salas.map(s => [s.nome, s.id]));
  for (const ag of agentes.values()) if (ids.has(nomeDe.get(ag.a.sala))) animar(ag, dt, tempo); // só anima o que aparece
  const fundoAnt = cena.background; r.setScissorTest(false); r.setClearColor(0x000000, 0); r.clear();
  r.setScissorTest(true);
  for (const [id, q] of vis) {
    const sl = salas.get(id); if (!sl) continue;
    for (const o of salas.values()) o.grupo.visible = o === sl;
    const x = q.left - g.left, y = g.bottom - q.bottom; r.setViewport(x, y, q.width, q.height);
    r.setScissor(Math.max(0, x), Math.max(0, y), Math.min(W, x + q.width) - Math.max(0, x), Math.min(H, y + q.height) - Math.max(0, y));
    fitCam(camQ, sl.caixa, q.width, q.height);
    cena.background = fundoQ.set(sl.s.corEfetiva).lerp(BRANCO, .88);
    r.render(cena, camQ); ultimaCam.set(id, { cam: camQ.clone(), q });
  }
  r.setScissorTest(false); for (const o of salas.values()) o.grupo.visible = true; cena.background = fundoAnt;
}
function tocarMini(id, e) { // toque na mini-cena: pessoa mais próxima (até 36 px) abre o painel
  const u = ultimaCam.get(id); if (!u) return; const q = e.currentTarget.getBoundingClientRect(); const v = new THREE.Vector3(); let melhor = null, dmin = 36;
  for (const ag of agentes.values()) { if (salas.get(id)?.s.nome !== ag.a.sala) continue; ag.pessoa.ossos.head.getWorldPosition(v); v.project(u.cam);
    const px = q.left + (v.x + 1) / 2 * q.width, py = q.top + (1 - v.y) / 2 * q.height, d = Math.hypot(px - e.clientX, py - e.clientY); if (d < dmin) { dmin = d; melhor = ag; } }
  if (melhor) abrirPainel({ sala: melhor.a.sala, nome: melhor.a.nome });
}

// ---------- laço ----------
const relogio = new THREE.Clock(); const perf = window.__perf = { quadros: 0, tempos: [] };
function laco() {
  requestAnimationFrame(laco);
  if (document.hidden) return; // pausa fora da tela
  const t0 = performance.now();
  const dt = Math.min(relogio.getDelta(), .1), tempo = relogio.elapsedTime;
  if (vista === "lista") { if (!modoQuad()) return; renderQuad(dt, tempo); }
  else {
    for (const ag of agentes.values()) animar(ag, dt, tempo);
    const a = alvo.clone().add(pan), aspecto = palco.clientWidth / palco.clientHeight, mh = meiaAlt * zoom;
    cam.position.copy(a).addScaledVector(DIR_ISO, 60); cam.lookAt(a); Object.assign(cam, { left: -mh * aspecto, right: mh * aspecto, top: mh, bottom: -mh }); cam.updateProjectionMatrix();
    r.setViewport(0, 0, palco.clientWidth, palco.clientHeight); r.render(cena, cam); rotulos();
  }
  perf.quadros++; perf.tempos.push(performance.now() - t0); if (perf.tempos.length > 300) perf.tempos.shift();
}
const selo = document.getElementById("selo"); selo.textContent = fonte.selo + (privado ? " · modo privado" : ""); if (!fonte.exemplo) selo.classList.add("real");
try { atualizarLista(await fonte.carregar()); } catch (e) { selo.textContent = "Falha ao ler status: " + e.message; }
fonte.assinar(atualizarLista);
document.getElementById("carregando").remove();
aplicarVista();
if (params.get("painel")) abrirPainel(JSON.parse(params.get("painel")));
window.__ag = agentes; window.__pronto = true; window.__info = () => ({ agentes: agentes.size, triangulos: r.info.render.triangles, chamadas: r.info.render.calls, T_SENTADO, T_FIM });
laco();
