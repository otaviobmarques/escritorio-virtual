// Cena 3D compartilhada (demos jogo/executivo e demo-animacao). Usa SÓ a fonte de exemplo.
import * as THREE from "../vendor/three.module.min.js";
import { criarFonte, marcarSelo } from "./fonte-status.js";

const TEMAS = {
  jogo: { fundo: 0x1a0f3d, piso: (c) => c, mesa: 0xffc94d, cadeira: 0xff3d81, monitor: 0x111111, tela: 0x39f3ff,
    parede: (c) => c, luz: 1.3, corStatus: { trabalhando: 0x39ff6a, parado: 0x9a9ab0, esperando: 0xffb000 },
    rotulo: { fundo: "#000c", texto: "#fff", borda: "#ffd84d", fonte: "bold 44px monospace" }, plano: false },
  executivo: { fundo: 0xe9e6e1, piso: () => 0xc9c2b8, mesa: 0x5a4636, cadeira: 0x2a2a2a, monitor: 0x1e1e1e, tela: 0xd6e2ea,
    parede: () => 0xf4f1ec, luz: 1.0, corStatus: { trabalhando: 0x4f7d5c, parado: 0x9b968e, esperando: 0xb08a3e },
    rotulo: { fundo: "#ffffffe6", texto: "#2b2b2b", borda: "#b9b1a6", fonte: "600 48px Georgia, serif" }, plano: true },
};

function rotulo(texto, t) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 96;
  const g = c.getContext("2d"); g.font = t.rotulo.fonte;
  const w = Math.min(1010, g.measureText(texto).width + 40);
  g.fillStyle = t.rotulo.fundo; g.fillRect((1024 - w) / 2, 8, w, 80);
  g.strokeStyle = t.rotulo.borda; g.lineWidth = 4; g.strokeRect((1024 - w) / 2, 8, w, 80);
  g.fillStyle = t.rotulo.texto; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(texto, 512, 48);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false }));
  s.renderOrder = 10; return s;
}
const caixa = (w, h, d, cor) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: cor, roughness: .8 })); m.castShadow = true; return m; };
const hash = (s) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };
const lerp = (a, b, k) => a + (b - a) * k;

// Boneco articulado: pivôs de quadril e ombro. Olha para +z (para a câmera, em três quartos).
function criarBoneco(a, nomeTema) {
  const h = hash(a.nome);
  const roupa = nomeTema === "jogo" ? new THREE.Color().setHSL((h % 360) / 360, .8, .55).getHex() : [0x2f3540, 0x46505c, 0x5b4a3f, 0x1f2a36][h % 4];
  const pele = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524][h % 4];
  const raiz = new THREE.Group(), corpo = new THREE.Group(); raiz.add(corpo);
  const tronco = caixa(.56, .62, .32, roupa); tronco.position.y = .93; corpo.add(tronco);
  const cabeca = caixa(.4, .4, .4, pele); cabeca.position.y = 1.47; corpo.add(cabeca);
  const cabelo = caixa(.42, .12, .42, [0x2b1b0e, 0x5a3825, 0x111111, 0x8b2e1a][(h >> 2) % 4]); cabelo.position.y = 1.71; corpo.add(cabelo);
  const franja = caixa(.42, .16, .08, cabelo.material.color); franja.position.set(0, 1.62, -.17); corpo.add(franja);
  for (const x of [-.09, .09]) { const o = caixa(.06, .06, .02, 0x111111); o.position.set(x, 1.5, .205); corpo.add(o); }
  const boca = caixa(.12, .03, .02, 0x7a3b2e); boca.position.set(0, 1.38, .205); corpo.add(boca);
  const membro = (x, y, comp, cor, larg) => { const p = new THREE.Group(); p.position.set(x, y, 0); const m = caixa(larg, comp, larg, cor); m.position.y = -comp / 2; p.add(m); corpo.add(p); return p; };
  const calca = nomeTema === "jogo" ? 0x2c3e88 : 0x2a2a2a;
  const pernas = [membro(-.14, .62, .62, calca, .22), membro(.14, .62, .62, calca, .22)];
  const bracos = [membro(-.37, 1.2, .55, roupa, .16), membro(.37, 1.2, .55, roupa, .16)];
  for (const b of bracos) { const m = caixa(.14, .12, .14, pele); m.position.y = -.58; b.add(m); }
  return { raiz, corpo, pernas, bracos, pose: { y: 0, inc: 0, pE: 0, pD: 0, bE: 0, bD: 0, bDz: 0 } };
}

// Poses-alvo (rotação x: negativo = para frente).
const POSES = {
  empe: { y: 0, inc: 0, pE: 0, pD: 0, bE: 0, bD: 0, bDz: 0 },
  sentado: { y: -.17, inc: 0, pE: -1.57, pD: -1.57, bE: -.3, bD: -.3, bDz: 0 },
};

export async function iniciar(nomeTema, alvo, opcoes = {}) {
  const t = TEMAS[nomeTema];
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.shadowMap.enabled = true;
  r.domElement.style.touchAction = "none"; r.domElement.style.display = "block";
  alvo.append(r.domElement);
  const cena = new THREE.Scene(); cena.background = new THREE.Color(t.fundo);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 500);
  cena.add(new THREE.HemisphereLight(0xffffff, nomeTema === "jogo" ? 0x5522aa : 0xbbb0a0, t.luz));
  const sol = new THREE.DirectionalLight(0xffffff, nomeTema === "jogo" ? 1.6 : 1.1);
  sol.position.set(20, 40, 25); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40 }); cena.add(sol);

  const fonte = criarFonte();
  const dados = await fonte.carregar(); marcarSelo(dados);
  const agentes = new Map(), salasObj = new Map();
  const W = 11, D = 9, gap = 2, cols = 3, mundo = new THREE.Group(); cena.add(mundo);
  dados.setores.forEach((s, si) => {
    const sala = new THREE.Group();
    sala.position.set((si % cols) * (W + gap), 0, Math.floor(si / cols) * (D + gap + 1));
    const cor = new THREE.Color(s.cor).getHex();
    const piso = caixa(W, .3, D, t.piso(cor)); piso.position.set(W / 2, -.15, D / 2); piso.receiveShadow = true; piso.castShadow = false; sala.add(piso);
    if (!t.plano) for (let x = 0; x < W; x++) for (let z = 0; z < D; z++) if ((x + z) % 2) {
      const q = caixa(1, .02, 1, new THREE.Color(cor).multiplyScalar(.7).getHex()); q.castShadow = false; q.receiveShadow = true; q.position.set(x + .5, .01, z + .5); sala.add(q); }
    const p1 = caixa(W, 1.6, .2, t.parede(cor)); p1.position.set(W / 2, .8, 0); sala.add(p1);
    const p2 = caixa(.2, 1.6, D, t.parede(cor)); p2.position.set(0, .8, D / 2); sala.add(p2);
    if (t.plano) { const f = caixa(W, .12, .22, cor); f.position.set(W / 2, 1.55, .02); sala.add(f); }
    const placa = rotulo(`${s.nome} · ${s.descricao}`, t); placa.scale.set(9, .85, 1); placa.position.set(W / 2, 3.5, .3); sala.add(placa);
    s.agentes.forEach((a, i) => {
      const mx = 1.6 + (i % 4) * 2.6, mz = 2.2 + Math.floor(i / 4) * 2.6; // centro da mesa
      const mesa = caixa(1.8, .12, .9, t.mesa); mesa.position.set(mx, .75, mz); sala.add(mesa);
      for (const [x, z] of [[-.8, -.35], [.8, -.35], [-.8, .35], [.8, .35]]) { const p = caixa(.08, .75, .08, t.mesa); p.position.set(mx + x, .37, mz + z); sala.add(p); }
      // monitor de costas para a câmera; o boneco senta atrás da mesa olhando para quem vê
      const mon = caixa(.8, .45, .06, t.monitor); mon.position.set(mx + .45, 1.06, mz + .2); mon.rotation.y = .5; sala.add(mon);
      const tela = new THREE.Mesh(new THREE.PlaneGeometry(.72, .38), new THREE.MeshBasicMaterial({ color: t.tela }));
      tela.position.set(mx + .435, 1.06, mz + .168); tela.rotation.y = Math.PI + .5; sala.add(tela);
      const assento = caixa(.5, .08, .5, t.cadeira); assento.position.set(mx, .45, mz - .8); sala.add(assento);
      const encosto = caixa(.5, .55, .08, t.cadeira); encosto.position.set(mx, .75, mz - 1.05); sala.add(encosto);
      const b = criarBoneco(a, nomeTema); b.raiz.position.set(mx, 0, mz - .78); sala.add(b.raiz);
      const marcador = new THREE.Mesh(nomeTema === "jogo" ? new THREE.OctahedronGeometry(.16) : new THREE.SphereGeometry(.09, 16, 12),
        new THREE.MeshBasicMaterial({ color: t.corStatus[a.status] }));
      marcador.position.y = 2.1; b.raiz.add(marcador);
      const nome = rotulo(a.nome.split(" ")[0], t); nome.scale.set(4.5, .42, 1); nome.position.y = 2.45; b.raiz.add(nome);
      agentes.set(a.id, { ...b, a, marcador, tela, sala, cadeira: new THREE.Vector3(mx, 0, mz - .78), mesa: new THREE.Vector3(mx, .81, mz), acao: null, emPe: false, objetos: [] });
      Object.assign(b.pose, POSES.sentado);
    });
    salasObj.set(s.id, sala); mundo.add(sala);
  });

  // ---------- câmera: arrastar, pinça, roda e botões ----------
  const caixaMundo = new THREE.Box3().setFromObject(mundo), centroIni = caixaMundo.getCenter(new THREE.Vector3());
  const alvoCam = centroIni.clone(), OFF = new THREE.Vector3(30, 30, 30);
  function posicionar() { cam.position.copy(alvoCam).add(OFF); cam.lookAt(alvoCam); }
  function ajustar() {
    const w = alvo.clientWidth, h = alvo.clientHeight; r.setSize(w, h);
    const asp = w / h, base = asp < 1 ? 15 / asp : 13.5;
    Object.assign(cam, { left: -base * asp, right: base * asp, top: base, bottom: -base }); cam.updateProjectionMatrix();
  }
  const ZMIN = .6, ZMAX = 6;
  function zoom(f) { cam.zoom = Math.min(ZMAX, Math.max(ZMIN, cam.zoom * f)); cam.updateProjectionMatrix(); }
  function arrastar(dx, dy) {
    const k = (cam.right - cam.left) / (alvo.clientWidth * cam.zoom);
    const dir = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 0), cima = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 1);
    alvoCam.addScaledVector(dir, -dx * k).addScaledVector(cima, dy * k); posicionar();
  }
  function resetar() { alvoCam.copy(centroIni); cam.zoom = 1; cam.updateProjectionMatrix(); posicionar(); }
  function focar(salaId, z = 2.6, dz = 0) {
    const s = salasObj.get(salaId); alvoCam.set(s.position.x + W / 2, 0, s.position.z + D / 2 + dz); cam.zoom = z; cam.updateProjectionMatrix(); posicionar();
  }
  const ponteiros = new Map(); let distAnt = 0;
  const el = r.domElement;
  el.addEventListener("pointerdown", (e) => { el.setPointerCapture(e.pointerId); ponteiros.set(e.pointerId, [e.clientX, e.clientY]); });
  el.addEventListener("pointermove", (e) => {
    if (!ponteiros.has(e.pointerId)) return;
    const [ax, ay] = ponteiros.get(e.pointerId); ponteiros.set(e.pointerId, [e.clientX, e.clientY]);
    if (ponteiros.size === 1) arrastar(e.clientX - ax, e.clientY - ay);
    else if (ponteiros.size === 2) {
      const [p, q] = [...ponteiros.values()], d = Math.hypot(p[0] - q[0], p[1] - q[1]);
      if (distAnt) zoom(d / distAnt); distAnt = d;
    }
  });
  const soltar = (e) => { ponteiros.delete(e.pointerId); distAnt = 0; };
  el.addEventListener("pointerup", soltar); el.addEventListener("pointercancel", soltar);
  el.addEventListener("wheel", (e) => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12); }, { passive: false });
  el.addEventListener("dblclick", resetar);
  const ctl = document.createElement("div"); ctl.className = "ctl-camera";
  ctl.style.cssText = "position:absolute;right:10px;bottom:10px;display:flex;gap:6px;z-index:3";
  for (const [txt, rot, fn] of [["+", "Aproximar", () => zoom(1.25)], ["−", "Afastar", () => zoom(.8)], ["⟲", "Visão geral", resetar]]) {
    const b = document.createElement("button"); b.textContent = txt; b.setAttribute("aria-label", rot); b.title = rot;
    b.style.cssText = `width:40px;height:40px;font-size:20px;cursor:pointer;border:${nomeTema === "jogo" ? "3px solid #000;background:#ffd84d" : "1px solid #b9b1a6;background:#fff"};color:#222`;
    b.onclick = fn; ctl.append(b);
  }
  if (getComputedStyle(alvo).position === "static") alvo.style.position = "relative";
  alvo.append(ctl);
  new ResizeObserver(ajustar).observe(alvo); ajustar(); posicionar();

  // ---------- ações (andar, sentar, digitar, gesticular, levar pasta) ----------
  const aplicarAlvo = (e, alvoPose, k) => { for (const c in alvoPose) e.pose[c] = lerp(e.pose[c], alvoPose[c], k); };
  const virarPara = (e, x, z, k) => {
    const ang = Math.atan2(x - e.raiz.position.x, z - e.raiz.position.z);
    let d = ang - e.raiz.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); e.raiz.rotation.y += d * k;
  };
  // passo = função(e, dt, tempoNoPasso) -> true quando terminar
  const P = {
    levantar: () => (e, dt, tp) => { aplicarAlvo(e, POSES.empe, Math.min(1, dt * 8)); e.emPe = true; return tp > .45; },
    sentar: () => (e, dt, tp) => { virarPara(e, e.raiz.position.x, e.raiz.position.z + 5, Math.min(1, dt * 8)); aplicarAlvo(e, POSES.sentado, Math.min(1, dt * 8)); e.emPe = tp < .3; return tp > .5; },
    ir: (x, z) => (e, dt, tp) => {
      const p = e.raiz.position, dx = x - p.x, dz = z - p.z, dist = Math.hypot(dx, dz), v = 1.6 * dt;
      virarPara(e, x, z, Math.min(1, dt * 10));
      const s = Math.sin(tp * 9) * .6;
      aplicarAlvo(e, { y: Math.abs(Math.sin(tp * 9)) * .04, inc: .05, pE: s, pD: -s, bE: -s * .8, bD: e.levandoPasta ? -1.2 : s * .8, bDz: 0 }, .5);
      if (dist <= v) { p.x = x; p.z = z; return true; } p.x += dx / dist * v; p.z += dz / dist * v; return false;
    },
    olhar: (x, z) => (e, dt, tp) => { virarPara(e, x, z, Math.min(1, dt * 8)); return tp > .35; },
    pose: (alvoPose, dur, osc) => (e, dt, tp) => { aplicarAlvo(e, osc ? osc(tp) : alvoPose, Math.min(1, dt * 10)); return tp > dur; },
    fazer: (fn) => (e) => { fn(e); return true; },
  };
  const digitar = (dur = 3) => (e, dt, tp) => { e.digitando = tp < dur; aplicarAlvo(e, { ...POSES.sentado, inc: -.08, bE: -1.15 + Math.sin(tp * 22) * .12, bD: -1.15 - Math.sin(tp * 22) * .12 }, Math.min(1, dt * 10)); return tp > dur; };
  function sequencia(e, passos) { e.acao = { passos, i: 0, tp: 0 }; }
  function pasta(cor = 0xc9a227) { const m = caixa(.34, .05, .26, cor); return m; }

  const acoes = {
    andar(id) { const e = agentes.get(id), c = e.cadeira; sequencia(e, [P.levantar(), P.ir(c.x, c.z - .6), P.ir(c.x + 1.3, c.z - .6), P.ir(c.x + 1.3, c.z - 1.3), P.ir(c.x - 1.3, c.z - 1.3), P.ir(c.x - 1.3, c.z - .6), P.ir(c.x, c.z - .6), P.olhar(c.x, c.z + 5)]); },
    sentar(id) { const e = agentes.get(id), c = e.cadeira; sequencia(e, e.emPe ? [P.ir(c.x, c.z), P.sentar()] : [P.sentar()]); },
    levantar(id) { sequencia(agentes.get(id), [P.levantar()]); },
    digitar(id) { const e = agentes.get(id), c = e.cadeira; sequencia(e, [...(e.emPe ? [P.ir(c.x, c.z), P.sentar()] : []), digitar(4)]); },
    gesticular(id) {
      const e = agentes.get(id);
      sequencia(e, [P.pose(null, 3, (tp) => ({ ...(e.emPe ? POSES.empe : POSES.sentado), bD: -.2, bDz: 2.5 + Math.sin(tp * 10) * .4, bE: -.9 + Math.sin(tp * 5) * .3 }))]);
    },
    levarPasta(id, idColega) {
      const e = agentes.get(id), col = agentes.get(idColega), c = e.cadeira, k = col.cadeira;
      const lado = k.x > c.x ? -1 : 1, destinoX = k.x + lado * .75;
      let p;
      sequencia(e, [
        P.levantar(),
        P.fazer(() => { p = pasta(); p.position.set(0, -.6, .12); p.rotation.x = Math.PI / 2; e.bracos[1].add(p); e.levandoPasta = true; }),
        P.ir(c.x, c.z - .6), P.ir(destinoX, c.z - .6), P.ir(destinoX, k.z), P.olhar(k.x, k.z),
        P.pose({ ...POSES.empe, bD: -1.4 }, .6),
        P.fazer(() => { e.bracos[1].remove(p); p.rotation.set(0, .3, 0); p.position.set(col.mesa.x - .4, col.mesa.y + .03, col.mesa.z - .1); col.sala.add(p); e.levandoPasta = false; col.objetos.push(p); }),
        P.pose({ ...POSES.empe }, .3),
        P.pose(null, 1.6, (tp) => ({ ...POSES.empe, bD: -.2, bDz: 2.5 + Math.sin(tp * 10) * .4 })),
        P.ir(destinoX, c.z - .6), P.ir(c.x, c.z - .6), P.ir(c.x, c.z), P.sentar(),
      ]);
      // colega reage: olha e acena
      sequencia(col, [P.pose(null, 2.2, () => ({ ...POSES.sentado })), P.pose(null, 1.6, (tp) => ({ ...POSES.sentado, bE: -1.1, bDz: 0, bD: -1.1 }))]);
    },
  };

  function aplicar(d) {
    for (const s of d.setores) for (const a of s.agentes) { const e = agentes.get(a.id); if (e) { e.a = a; e.marcador.material.color.setHex(t.corStatus[a.status]); } }
  }
  if (!opcoes.semMudancas) fonte.assinar(aplicar);
  const relogio = new THREE.Clock(); let tempo = 0, i;
  r.setAnimationLoop(() => {
    const dt = Math.min(.05, relogio.getDelta()); tempo += reduzir ? 0 : dt; i = 0;
    for (const e of agentes.values()) {
      const k = tempo + i++ * .37, st = e.a.status;
      if (e.acao) {
        const a = e.acao; a.tp += dt;
        if (a.passos[a.i](e, dt, a.tp)) { a.i++; a.tp = 0; if (a.i >= a.passos.length) e.acao = null; }
      } else if (!e.emPe) {
        const base = POSES.sentado;
        const alvoPose = st === "trabalhando" ? { ...base, inc: -.08, bE: -1.15 + Math.sin(k * 22) * .12, bD: -1.15 - Math.sin(k * 22) * .12 }
          : st === "parado" ? { ...base, inc: .18 + Math.sin(k) * .04, bE: -.1, bD: -.1 }
          : { ...base, y: base.y + Math.abs(Math.sin(k * 4)) * .1, bD: -.2, bDz: 2.6 + Math.sin(k * 3) * .2 };
        aplicarAlvo(e, alvoPose, Math.min(1, dt * 10));
      }
      const p = e.pose;
      e.corpo.position.y = p.y; e.corpo.rotation.x = p.inc;
      e.pernas[0].rotation.x = p.pE; e.pernas[1].rotation.x = p.pD;
      e.bracos[0].rotation.x = p.bE; e.bracos[1].rotation.x = p.bD; e.bracos[1].rotation.z = p.bDz;
      const ativa = e.digitando || (!e.acao && !e.emPe && st === "trabalhando");
      e.tela.material.color.setHex(ativa ? (Math.sin(k * 8) > 0 ? t.tela : 0xffffff) : 0x333a44);
      e.marcador.rotation.y = k * 2; e.marcador.position.y = 2.1 + Math.sin(k * 3) * .05;
    }
    r.render(cena, cam);
  });
  return { acoes, agentes, focar, zoom, resetar, arrastar, dados };
}
