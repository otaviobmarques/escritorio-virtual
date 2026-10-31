# ADR-0004: Controles de câmera próprios (arrastar, pinça, roda, botões)
## Status
Aceito
## Data
2026-10-31
## Contexto
No celular a cena inteira fica pequena; é preciso zoom e arrastar sem perder a vista isométrica.
## Decisão
Controles próprios em `src/cena3d.js` com Pointer Events: 1 ponteiro arrasta (desloca alvo da câmera no plano da tela), 2 ponteiros fazem pinça, roda do mouse dá zoom (0,6×–6×), duplo clique reseta; botões + − ⟲ acessíveis. `touch-action: none` no canvas.
## Alternativas consideradas
- **OrbitControls do Three.js:** permite girar, o que quebra a leitura isométrica e confunde no toque; precisaria travar quase tudo.
## Consequências
+ Leve e previsível; acessível por botões. − Sem inércia; sem rotação.
