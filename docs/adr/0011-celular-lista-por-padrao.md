# ADR-0011: No celular (até 768 px) a vista padrão é uma lista por sala em quadrantes 2x2
## Status
Aceito
## Data
2026-11-01
## Contexto
No celular a cena isométrica ficava estreita e rótulos apareciam cortados nas bordas ("Au", "Maycor"), porque um rótulo cobria o outro.
## Decisão
- Até 768 px a página abre numa **grade de cartões por sala**: nome, barra e bolinha de cor **mais o texto** do status. O cabeçalho fica fixo no topo com a contagem por status, o filtro de salas e o botão "Ver cena 3D" / "Ver lista". `?vista=cena|lista` força uma das duas.
- Na cena 3D (em qualquer tela), os rótulos não se sobrepõem: os mais próximos da câmera são posicionados primeiro, cada rótulo sobe até 3 vezes para fugir de colisão e, se ainda colidir, é escondido. O nome continua na lista, no painel e na lista para leitor de tela.
- Enquanto a lista está visível, a cena 3D não é desenhada (economiza bateria).
- Acessibilidade: cartões são botões com `aria-label` "Nome, sala X, Status"; o status nunca depende só da cor; foco visível; contagem com `aria-live`.
- O público continua só com nome, sala e status.
## Atualização 01/11/2026: quadrantes e cores (pedido do Otávio)
- No celular, a lista vira **páginas de 4 quadrantes (grade 2x2)**, uma sala por quadrante. Com mais de 4 salas, a próxima página fica ao lado: rolagem horizontal com `scroll-snap` e indicador de páginas (botões "Ir para a página N", `aria-current`). Com o filtro numa sala só, ela ocupa a página inteira.
- Cada quadrante tem o nome da sala, a contagem por status (bolinha + número, com `aria-label` "Trabalhando: N") e as pessoas (nome + bolinha + texto do status). Se não couber, há rolagem vertical dentro do quadrante. Tocar na pessoa abre o painel. `?pagina=2` abre direto na página 2.
- **Cor de cada sala = cor do logotipo real**, com a origem registrada em `prototipo-fullhd/config/escritorio.json` (`corLogo`, `origemCor`):
  | Sala | Cor | Origem |
  |---|---|---|
  | RedBox | #F0222A | Paleta oficial da marca |
  | Vértice | #00E5A0 | Paleta oficial da marca |
  | Domma | #7B61FF | Paleta oficial da marca |
  | Jurídico | neutra #8A8580 (provisória) | sem logotipo próprio |
  | Restaurantes | neutra #8A8580 (provisória) | sem logotipo único (cada restaurante tem a sua marca) |
- **Regra automática de cores parecidas:** se duas salas têm cores de logotipo a menos de 25 de distância CIE76 (espaço Lab), as duas passam a usar a cor neutra. O limite fica em `distanciaMinimaCor` no config. Distâncias atuais: RedBox–Domma 127,3, RedBox–Vértice 141,5 e Domma–Vértice 150,7, então nenhuma colide. Exemplo de colisão: #F0222A × #D3141B dá 8,8.
- **Contraste:** a cor da marca aparece numa faixa e num fundo suave (10%) atrás do título; o texto continua escuro. Nos rótulos de sala da cena 3D, o texto é preto ou branco, o que tiver mais contraste (WCAG).

## Atualização 01/11/2026 (2): sala em miniatura 3D em cada quadrante (escolha do Otávio)
- Cada quadrante mostra a **sala em miniatura**: cada agente na sua mesa, animação pelo status e fundo levemente tingido com a cor da empresa. Abaixo da mini-cena fica a **lista compacta** (nome + bolinha + texto do status), que é o acesso acessível (a mini-cena tem `aria-hidden`).
- Tocar numa pessoa da mini-cena (raio de 36 px da cabeça projetada) ou na lista abre o painel.
- **Desempenho:**
  - Um único renderer/canvas WebGL fica por cima da grade (`pointer-events:none`). Cada quadrante é desenhado com `setViewport`/`setScissor` e câmera ortográfica própria, mostrando só a sala dele.
  - Só os quadrantes visíveis são desenhados, inclusive durante a rolagem lateral, e só os agentes dessas salas são animados.
  - O pixel ratio fica limitado a 1,5 nesse modo. O laço pausa com a aba oculta (`document.hidden`) e não desenha nada quando a vista não é a de quadrantes.
  - No celular as salas usam 3 colunas (`colunasCelular`), para caberem melhor num quadrante quase quadrado.

### Medição (01/11/2026)
Navegador headless sem GPU (renderização por software), celular emulado 390x844. O "tempo de quadro" é o tempo de CPU do JavaScript por quadro; não inclui a rasterização por software.

| Captura | Quadros/s | Tempo de quadro mediana (ms) | P95 (ms) | Canvas WebGL |
|---|---|---|---|---|
| celular-quadrantes-real-p1 | 2.5 | 16.2 | 97.3 | 1 |
| celular-quadrantes-real-p2 | 5.7 | 6.1 | 9.4 | 1 |

Leitura honesta: sem placa de vídeo a página 1 (4 salas) roda a cerca de 2,5 quadros/s e a página 2 (1 sala) a cerca de 5,7. O custo de CPU por quadro fica entre 2 e 16 ms (mediana), o que cabe em 60 quadros/s. **O desempenho num celular real com GPU não foi medido.** Se ficar pesado, os próximos passos são reduzir a frequência de animação dos quadrantes ou usar um modelo de pessoa mais leve.

## Consequências
+ Leitura imediata no celular. − Na cena 3D com muitas pessoas, alguns rótulos ficam ocultos até dar zoom.
