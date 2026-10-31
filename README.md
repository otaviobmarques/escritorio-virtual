# Escritório Virtual (protótipo Domma)
Painel em pixel art isométrico que mostra o time de agentes de IA por setor. **Usa apenas DADOS DE EXEMPLO.**

## Como rodar
```bash
cd /home/box/domma/escritorio-virtual
python3 -m http.server 3200 --bind 127.0.0.1
```
Abra http://127.0.0.1:3200/ (precisa de servidor; abrir o `index.html` direto bloqueia o `fetch` do JSON).

## Estrutura
| Caminho | O quê |
|---|---|
| `index.html`, `src/estilo.css` | página e estilos responsivos |
| `src/app.js` | desenho isométrico e animações (canvas) |
| `src/fonte-status.js` | interface/adaptador de fonte de status (hoje só exemplo) |
| `dados/exemplo.json` | dados de exemplo (status inventados) |
| `docs/` | especificação (MD/PDF), fontes de status, produto, ADR, capturas |

## Trocar a fonte de dados
Implemente um objeto `{nome, exemplo, carregar(), assinar(cb)}` em `src/fonte-status.js` e troque a linha `const fonte = ...` em `src/app.js`. Ver `docs/fontes-de-status.md`.

## Implantação
Nenhuma. Não publicar sem OK do Otávio.

## Demos 3D (Three.js local em `vendor/`, sem internet)
- http://127.0.0.1:3200/demo-3d-jogo.html — visual de videogame
- http://127.0.0.1:3200/demo-3d-executivo.html — escritório executivo sóbrio
- http://127.0.0.1:3200/comparar-3d.html — as duas lado a lado (no celular, empilhadas)
Ambas usam `src/cena3d.js` e a mesma fonte de exemplo (`dados/exemplo.json`).

## Demo de animação
http://127.0.0.1:3200/demo-animacao.html — botões: Andar, Sentar, Levantar, Digitar, Gesticular, Levar pasta ao colega. Câmera: arrastar, pinça/roda, botões + − ⟲.

## Fonte de produção (status real por arquivos) — só local
1. Cada agente: `scripts/escrever-status.sh "Nome" Sala status`
2. Gerar o público: `python3 scripts/gerar-status.py [--limite-min 10]` → `publico/status.json`
3. Abrir com `?fonte=arquivos`. Detalhes: `docs/fonte-arquivos.md`. Onde publicar (análise, nada publicado): `docs/publicacao-gratuita.md`.
