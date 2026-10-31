# Proposta: Escritório Virtual em 3D com animações

> Protótipo local da Domma. Todos os status nas demos são **dados de exemplo**.

## Objetivo
Evoluir o painel 2D (pixel art) para uma cena 3D isométrica em que os agentes de IA do Otávio aparecem como bonequinhos que **andam, sentam, digitam, gesticulam e levam uma pasta até a mesa do colega**, deixando o "time trabalhando" visível e agradável de acompanhar.

## O que já existe (local)
| Página | Para quê |
|---|---|
| `demo-3d-executivo.html` | visual sóbrio de escritório executivo (tons neutros) |
| `demo-3d-jogo.html` | visual vibrante de videogame |
| `comparar-3d.html` | as duas lado a lado (no celular, empilhadas) |
| `demo-animacao.html` | cena executiva com botões para disparar cada ação |

## Ações animadas (demo-animacao)
| Ação | Comportamento |
|---|---|
| Andar | levanta e dá a volta na mesa, balançando braços e pernas |
| Sentar | volta à cadeira e senta (pernas a 90°) |
| Levantar | fica de pé ao lado da mesa |
| Digitar | sentado, braços à frente alternando; monitor pisca |
| Gesticular | acena com o braço direito erguido |
| Levar pasta ao colega | pega a pasta, contorna as mesas, entrega na mesa do colega (que reage), acena e volta a sentar |

Status do painel ⇒ pose padrão: **trabalhando** = digitando; **parado** = recostado, tela apagada; **esperando** = mão levantada e pequenos pulos.

## Câmera e uso no celular
Arrastar (1 dedo/mouse) move; pinça ou roda dá zoom; duplo clique volta; botões **+ − ⟲** no canto (acessíveis por teclado). Bonecos ficam de frente/três quartos para quem olha (sentam atrás da mesa, monitor de lado).

## Recomendação
Seguir com o **visual executivo** como padrão do produto (legível, sério para clientes) e oferecer o **visual jogo** como tema opcional — mesma cena, só troca de tema (ver ADR-0002).

## Próximos passos (não feitos)
1. Ligar ações a eventos reais (ex.: "entregou tarefa" ⇒ levar pasta), depois de definida a fonte real.
2. Modelos com mais detalhe (glTF) se o desempenho no celular permitir.
3. Testes automatizados de interface e medição de desempenho em celular real.

## Fora do escopo
Publicação, deploy, domínio, contas, envio de mensagens.
