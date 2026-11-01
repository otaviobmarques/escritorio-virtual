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
  | Sala | Cor | Origem no box |
  |---|---|---|
  | RedBox | #F0222A | `redbox/agencia/redbox/design-system/cores/paleta.json` ("Vermelho RedBox") e `logo/redbox_logo_cor.svg` |
  | Vértice | #00E5A0 | `redbox/clientes/vertice/logo/final-wireframe/pacote-alta-qualidade/vertice_logo_para-fundo-claro.svg` |
  | Domma | #7B61FF | `redbox/clientes/domma-tecnologia/logo/final-sinal/gerar.py` (destaque do sinal final) |
  | Jurídico | neutra #8A8580 (provisória) | sem logotipo próprio no box |
  | Restaurantes | neutra #8A8580 (provisória) | sem logotipo único (cada restaurante tem a sua marca) |
- **Regra automática de cores parecidas:** se duas salas têm cores de logotipo a menos de 25 de distância CIE76 (espaço Lab), as duas passam a usar a cor neutra. O limite fica em `distanciaMinimaCor` no config. Distâncias atuais: RedBox–Domma 127,3, RedBox–Vértice 141,5 e Domma–Vértice 150,7, então nenhuma colide. Exemplo de colisão: #F0222A × #D3141B dá 8,8.
- **Contraste:** a cor da marca aparece numa faixa e num fundo suave (10%) atrás do título; o texto continua escuro. Nos rótulos de sala da cena 3D, o texto é preto ou branco, o que tiver mais contraste (WCAG).

## Consequências
+ Leitura imediata no celular. − Na cena 3D com muitas pessoas, alguns rótulos ficam ocultos até dar zoom.
