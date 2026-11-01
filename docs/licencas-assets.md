# Licenças dos assets do protótipo Full HD

| Asset | Fonte (página lida) | Autor | Licença (como consta na fonte) | Uso |
|---|---|---|---|---|
| "Sit down and stand up - Harper 3D Person, Animated" (GLB, 18.815.188 bytes, sha256 `2a7b1637ca9096714d71c9cbff12acdc36ed841c3017c95d6010ef35e2007cf4`) | https://www.innerscene.com/tools/library/3d-parts/sit-down-and-stand-up-harper-3d-person-animated-a5e90c16 (download direto, sem conta, em 2026-10-31) | Innerscene Corp. A página diz "Built from MakeHuman/MPFB CC0 body, rig and skin assets" | **CC0 1.0**. A página diz "released CC0". O próprio GLB traz no campo `asset.copyright`: "Public domain: dedicated under CC0 1.0 Universal". Termos da biblioteca: https://www.innerscene.com/tools/library/terms | Original em `prototipo-fullhd/assets/original/`. Versões otimizadas: `harper-otimizado.glb` (34 mil triângulos) e `harper-leve.glb` (15,6 mil triângulos, usada na cena). Foram removidos maleta, dentes, cílios e sobrancelhas, a malha foi reduzida (meshoptimizer) e as texturas viraram WebP 1024 px. |
| Three.js r160: `GLTFLoader.js`, `SkeletonUtils.js`, `BufferGeometryUtils.js`, `RoomEnvironment.js` | pacote npm `three@0.160.0` (mesma versão de `vendor/three.module.min.js`) | Three.js Authors | MIT (cópia em `prototipo-fullhd/vendor/addons/LICENSE-three`) | código |
| Textura de madeira, plantas, móveis, sinuca e sofá | gerados por código no próprio `src/cena.js` | — | próprio | — |

Observações:
- A página da Innerscene informa que o arquivo fica disponível até 2029-10-08. A cópia local garante o uso.
- Ferramentas usadas só localmente para otimizar (não vão para o site): `@gltf-transform/*` (MIT), `meshoptimizer` (MIT) e `sharp` (Apache-2.0).
- Não foi usado Mixamo, Sketchfab nem nenhum asset que exija conta.
