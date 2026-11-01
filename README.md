# Escritório Virtual (Domma)
Painel que mostra o time de agentes de IA do Otávio por sala (RedBox, Vértice, Restaurantes, Jurídico, Domma) e o status de cada um: trabalhando, parado ou esperando.

- **Página principal** (`index.html`): cena 3D isométrica em Full HD com pessoas realistas (modelo CC0, ver `docs/licencas-assets.md`). Usa por padrão o **status real** de `publico/status.json`.
  - `?fonte=exemplo` mostra dados inventados; `?sala=redbox` abre focado numa sala.
  - Clique numa sala ou pessoa para ver os detalhes. A versão pública mostra só nome, sala e status.
- **Versão clássica** (pixel art): `classico.html`. Demos 3D antigas: `demo-3d-jogo.html`, `demo-3d-executivo.html`, `comparar-3d.html`, `demo-animacao.html`.
- O código do visual novo fica em `prototipo-fullhd/` (layout em `prototipo-fullhd/config/escritorio.json`).

## O que é público
`publico/status.json` contém **somente** `{nome, sala, status}` (primeiro nome). Tarefa e projeto nunca são publicados: ficam num arquivo privado no computador de trabalho (ADR-0010).

## Como o status é gerado
- **Registro próprio:** cada agente registra o próprio status (ver `docs/instrucoes-agentes.md`). Esse registro vale por 30 minutos e tem prioridade.
- **Sinal de arquivos:** sem registro válido, o status vem da atividade recente dos arquivos do agente no computador de trabalho: "trabalhando" se houve mudança em 10 minutos, senão "parado".
- **Publicação:** um processo local regenera `publico/status.json` e só faz commit quando o conteúdo muda, no máximo a cada 5 minutos.

## Rodar localmente
```bash
python3 -m http.server 3200 --bind 127.0.0.1   # abra http://127.0.0.1:3200/
```
## Documentação
`docs/especificacao/visual-fullhd.md` (PRD), `docs/adr/0001–0010`, `docs/licencas-assets.md`, `docs/fonte-arquivos.md`, `docs/instrucoes-agentes.md`.
