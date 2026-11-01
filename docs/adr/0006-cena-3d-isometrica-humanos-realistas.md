# ADR-0006: Visual Full HD = cena 3D isométrica em Three.js com humanos realistas CC0
## Status
Aceito (página principal desde 01/11/2026)
## Data
2026-11-01
## Contexto
O Otávio pediu pessoas de aparência realista, Full HD e custo zero. A referência visual é um escritório isométrico claro. As opções avaliadas foram: fotos livres, SVG/CSS, 3D em tempo real e vídeos pré-renderizados no Blender.
## Decisão
Usar 3D em tempo real com Three.js r160, câmera ortográfica isométrica (azimute de 45°; no celular, mais frontal) e luz clara. Uma pessoa CC0 com esqueleto (ADR-0007) é clonada com `SkeletonUtils`. O status escolhe a pose a partir do clipe "sentar e levantar", e pequenos ajustes por código fazem digitar, respirar, olhar e gesticular. O piso de madeira usa textura gerada em canvas (sem imagem de terceiros).
## Alternativas consideradas
Fotos livres (sem animação e com rostos de pessoas reais), SVG (não realista) e pré-render no Blender (pesado de manter).
## Consequências
+ Reaproveita o Three.js e a fonte de status; animação ligada ao status. − Todos os agentes têm o mesmo rosto e corpo (só a cor do terno varia). − Desempenho em GPU real ainda não medido.
