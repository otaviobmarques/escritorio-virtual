# ADR-0002: Cena 3D com Three.js local e temas (jogo / executivo)
## Status
Aceito
## Data
2026-10-31
## Contexto
Pedido de demos 3D para comparar dois visuais, sem build e sem depender de internet.
## Decisão
Three.js 0.160.0 copiado para `vendor/three.module.min.js`, importado como módulo ES. Uma única cena (`src/cena3d.js`) com objeto de tema (cores, materiais, rótulos); câmera ortográfica isométrica; geometria de caixas (estilo voxel), sem modelos externos.
## Alternativas consideradas
- **CDN do Three.js:** mais simples, mas depende de rede e de terceiro. Rejeitada.
- **Babylon.js / PlayCanvas:** mais pesados para o escopo.
- **Modelos glTF:** visual melhor, porém exigem arte/licença e pesam no celular. Fica para depois.
## Consequências
+ Funciona offline; trocar tema não duplica código. − ~670 KB de biblioteca; WebGL obrigatório (sem WebGL, usar o painel 2D).
