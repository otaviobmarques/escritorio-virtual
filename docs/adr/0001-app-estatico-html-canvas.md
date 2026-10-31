# ADR-0001: Protótipo como app estático HTML/Canvas/CSS (sem Next.js)

## Status
Aceito

## Data
2026-10-31

## Contexto
Precisamos de um protótipo responsivo, pixel art isométrico e animado, rodando rápido localmente, sem fonte real e com troca futura de fonte de dados.

## Decisão
HTML + CSS + JavaScript (módulos ES) com `<canvas>` 2D, sem dependências nem build. Servido por qualquer servidor estático (`python3 -m http.server`). Fonte de dados isolada em `src/fonte-status.js` (adaptador) e dados em `dados/exemplo.json`.

## Alternativas consideradas
### Next.js
Prós: rotas de API prontas para um endpoint futuro, ecossistema React. Contras: `npm install`/build para um protótipo de uma tela; o desenho em canvas não ganha nada com React. Pode ser adotado quando houver API/login.
### Motor de jogo (Phaser/PixiJS)
Prós: sprites e animação ricos. Contras: dependência extra, exagero para o escopo.

## Consequências
+ Abre em segundos, zero dependências, fácil de embutir em outro sistema depois.
− Sem SSR/API; ao virar produto, provável migração para Next.js (novo ADR), reaproveitando `app.js` e o contrato do adaptador.
