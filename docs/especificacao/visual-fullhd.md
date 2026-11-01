# Especificação (PRD): visual Full HD com pessoas realistas — protótipo

Status: publicado como página principal com aprovação do Otávio em 01/11/2026; código em `prototipo-fullhd/`. Data: 2026-11-01.

## Problema
O painel em pixel art não passa a imagem de "escritório de verdade". O Otávio quer uma cena em Full HD (1920x1080), com pessoas de aparência realista e um estilo isométrico claro (paredes brancas baixas, piso de madeira, plantas, sala de reunião e área de descanso). E tudo isso sem custo.

## Solução
Uma cena 3D com Three.js r160 (já presente em `vendor/`) e câmera ortográfica isométrica. A pessoa é um único modelo CC0 com esqueleto e o clipe "sentar e levantar" (Innerscene, base MakeHuman). Ela é clonada para cada agente. O status muda a pose:
| Status | Pose |
|---|---|
| trabalhando | sentado, braços à frente digitando, tela acesa, anel verde no chão |
| parado | sentado recostado, olhando em volta, tela apagada, anel cinza |
| esperando | levanta (parte final do clipe), fica em pé ao lado da mesa olhando ao redor e gesticula de vez em quando; cadeira afastada; anel âmbar |
As trocas de status tocam a transição real do clipe (sentar ou levantar, cerca de 3,6 s).

## Histórias
- Como Otávio, vejo todas as salas numa tela Full HD e sei quem está trabalhando.
- Como Otávio, toco numa sala ou pessoa e vejo os detalhes. Projeto e tarefa aparecem só no modo privado local (ADR-0010).
- No celular (até 768 px), abro em páginas de 4 quadrantes (2x2), uma sala por quadrante, com a cor do logotipo, contagem e pessoas (nome + cor + texto do status). Mais de 4 salas: rolo para o lado. O topo fica fixo (contagem, filtro e botão da cena 3D) (ADR-0011).
- Cores das salas vêm dos logotipos reais; sem logotipo ou cores parecidas (distância < 25 em Lab), a sala usa cor neutra.

## Requisitos (atendidos no protótipo)
- O contrato de entrada continua `{nome, sala, status}`. Campos a mais são descartados no navegador.
- O padrão é o status real em `publico/status.json`; `?fonte=exemplo` usa `dados/exemplo.json`. `?teste=trabalhando|parado|esperando|misto` lê arquivos de teste locais de uma lista fechada.
- O layout vem de `prototipo-fullhd/config/escritorio.json`: salas, cores, colunas, áreas extras e regras do celular. Há uma mesa por agente.
- Os rótulos são HTML, presos às bordas da tela, e não se sobrepõem: em colisão sobem ou são ocultados (o nome segue na lista e no painel). Também são clicáveis.
- Há uma lista oculta para leitor de tela com nome, sala e status.
- Câmera: arrastar move a vista, roda ou pinça dá zoom, e as abas focam uma sala.

## Medição (2026-11-01, box sem GPU: Chrome 156 headless com renderização por software SwiftShader, Xeon de 8 núcleos)
| Captura | Agentes | Triângulos | Chamadas de desenho | Quadros/s | Carga (s) |
|---|---|---|---|---|---|
| fullhd-teste-misto-todas | 32 | 521200 | 757 | 2.8 | 1.06 |
| fullhd-trabalhando | 32 | 505060 | 362 | 3.4 | 0.84 |
| fullhd-parado | 32 | 505060 | 362 | 3.6 | 0.89 |
| fullhd-esperando | 32 | 505060 | 362 | 3.6 | 0.78 |
| fullhd-real-publico-todas | 57 | 922200 | 1207 | 1.9 | 1.14 |
| fullhd-real-publico-painel | 57 | 910032 | 896 | 2.0 | 1.14 |
| fullhd-real-privado-painel | 57 | 910032 | 896 | 2.0 | 1.06 |
| celular-teste-misto | 32 | 507620 | 411 | 4.0 | 0.75 |
| celular-real-publico-painel | 57 | 901836 | 665 | 2.4 | 0.93 |

Leitura honesta: os quadros por segundo acima são de **renderização por software (sem placa de vídeo)**. Eles não representam um PC comum com GPU, onde ainda **não foi medido**. Com 57 agentes a cena tem cerca de 0,9 milhão de triângulos e cerca de 1.200 chamadas de desenho, o que é viável em GPU integrada moderna, mas precisa ser confirmado num PC real. O modelo leve tem 15,6 mil triângulos e 1,7 MB.

## Decisões de teste
`prototipo-fullhd/ferramentas/capturar.py` gera as capturas e o arquivo `medicoes.json`. Os dados de teste foram gerados com os próprios `scripts/escrever-status.sh` e `gerar-status.py`, em pasta temporária.

## Fora do escopo
Usar rostos ou corpos diferentes por agente.

## Capturas da versão celular (01/11/2026)
`prototipo-fullhd/capturas/`: `celular-quadrantes-real-p1.png`, `celular-quadrantes-real-p2.png`, `celular-quadrantes-teste-misto-p1.png`, `celular-quadrantes-teste-misto-p2.png`, `celular-quadrantes-teste-misto-painel.png`, `celular-cena-real.png`, `celular-cena-teste-misto.png`, `fullhd-cena-real.png`, `fullhd-cena-teste-misto.png` e `fullhd-lista-teste-misto.png`. Em todas, a verificação automática encontrou 0 rótulos fora da área visível e nenhum erro de página.

## Dúvidas em aberto
- Ter mais de um modelo de pessoa CC0 para dar variedade.
- Medir desempenho num PC com GPU.
- Sobreposição de rótulos em salas cheias no celular.
