# ADR-0003: Animação por poses interpoladas e sequência de passos
## Status
Aceito
## Data
2026-10-31
## Contexto
Precisamos de andar, sentar, digitar, gesticular e levar pasta, disparáveis por botões e, no futuro, por eventos de status.
## Decisão
Boneco articulado (pivôs de quadril e ombro). Cada quadro calcula uma **pose-alvo** (altura, inclinação, ângulos de pernas/braços) e interpola a pose atual até ela. Ações são **listas de passos** (`levantar`, `ir(x,z)`, `olhar`, `pose`, `sentar`, `fazer`) executados em ordem; sem ação, a pose vem do status.
## Alternativas consideradas
- **Clipes de animação esqueletal (AnimationMixer + glTF):** mais realista; exige modelos riggados. Adiado.
- **Biblioteca de tween (GSAP/Tween.js):** dependência extra sem ganho relevante.
## Consequências
+ Ações novas = novas listas de passos; transições suaves. − Caminhos são fixos (sem desvio de obstáculos); colisão não tratada.
