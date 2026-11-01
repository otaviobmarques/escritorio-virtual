# Protótipo Full HD (cena 3D isométrica, pessoas realistas CC0)
Código do visual Full HD. A página principal do site (`/index.html`) carrega este código.

## Rodar
```bash
cd /home/box/domma/escritorio-virtual && python3 -m http.server 3300 --bind 127.0.0.1
# público:  http://127.0.0.1:3300/prototipo-fullhd/
#   padrão = status real (../publico/status.json); ?fonte=exemplo  ?sala=redbox  ?zoom=0.5
#   ?modo=privado só funciona no servidor privado local (fora do repositório)
```
## Arquivos
- `index.html`, `src/cena.js` (cena, poses, rótulos, painel), `src/fonte.js` (fontes; contrato {nome,sala,status}), `src/estilo.css`
- `config/escritorio.json`: layout (salas, colunas, áreas extras, celular)
- `assets/harper-leve.glb`: pessoa CC0 otimizada (ver `docs/licencas-assets.md`). O original de 18 MB, as ferramentas de captura e otimização e os arquivos de teste ficam só no computador de trabalho (ADR-0009).
- `capturas/`: PNG 1920x1080 e 390x844 (celular), feitos com dados de teste de exemplo.
Docs: `docs/especificacao/visual-fullhd.md`, ADRs 0006–0010, `docs/licencas-assets.md`.
