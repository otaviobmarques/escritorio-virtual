# ADR-0011: No celular (até 768 px) a vista padrão é uma lista por sala
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
## Consequências
+ Leitura imediata no celular. − Na cena 3D com muitas pessoas, alguns rótulos ficam ocultos até dar zoom.
