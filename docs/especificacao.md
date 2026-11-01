# Escritório Virtual: especificação (PRD)

> Protótipo da Domma Tecnologia. **Todos os status exibidos são DADOS DE EXEMPLO** (inventados).

## Objetivo
Mostrar, num painel web em pixel art com visão isométrica, o time de agentes de IA do Otávio Marques trabalhando "ao vivo": quem está trabalhando, parado ou esperando, organizado por setor. Inspiração visual: extensão Pixel Agents (VS Code) e anúncios da amiatec.

## Problema
Com dezenas de agentes em vários negócios, não há uma visão rápida e agradável de quem está ativo, ocioso ou travado aguardando aprovação.

## Público
- Principal: Otávio (dono), acompanhando o time pelo computador ou celular.
- Secundário (futuro produto): empresas/agências que operam times de agentes de IA (ver `produto-domma.md`).

## Histórias de usuário
1. Como dono, quero ver todas as salas numa tela, para saber num relance o estado do time.
2. Como dono, quero distinguir "esperando" de "parado", para destravar agentes que aguardam aprovação.
3. Como dono, quero abrir pelo celular, para acompanhar fora do escritório.

## Requisitos funcionais
- RF1 Uma sala por setor: RedBox (agência), Vértice (produtora de vídeo), Restaurantes, Jurídico, Domma.
- RF2 Cada agente é um bonequinho pixel art em sua mesa, com nome e indicador de status.
- RF3 Status: `trabalhando` (digita, monitor aceso piscando), `parado` (respiração lenta, "Zz", monitor apagado), `esperando` (pulinho + balão "...").
- RF4 Contadores totais por status e lista textual por sala (acessível).
- RF5 Selo visível "Dados de exemplo" enquanto a fonte for de exemplo.
- RF6 Fonte de dados plugável via adaptador (`src/fonte-status.js`); hoje só a fonte de exemplo, que simula mudanças a cada 6 s.

## Requisitos não funcionais
- Responsivo (≥ 320 px até desktop); salas em grade que vira coluna única no celular.
- Sem dependências nem build; abre com qualquer servidor estático.
- `prefers-reduced-motion` respeitado (animações paradas).
- Canvas com `aria-label` e lista em texto para leitores de tela.
- LGPD: o painel não exibe conteúdo de tarefas reais; no futuro, mostrar só rótulo curto de tarefa.

## Requisitos 3D e animação (atualização 2026-10-31)
- RF7 Demos 3D em dois temas (executivo e jogo) com as mesmas 5 salas e 32 agentes de exemplo; página de comparação lado a lado (empilhada no celular).
- RF8 Bonecos de frente ou três quartos para quem olha.
- RF9 Ações animadas: andar, sentar, levantar, digitar, gesticular e levar pasta à mesa do colega, com botões para disparar cada uma (`demo-animacao.html`).
- RF10 Câmera com arrastar, pinça/roda para zoom, botões + − ⟲ e duplo clique para voltar (essencial no celular).
- RF11 Fonte de produção por arquivos de status (um por agente), com inatividade configurável (padrão 10 min ⇒ parado) e `status.json` público com só nome, sala e status. Fonte de exemplo continua padrão (`?fonte=arquivos` ativa a real). Ver `fonte-arquivos.md`.

## Telas
1. **Painel geral** (única): cabeçalho com título e selo; aviso de exemplo; legenda com contadores; grade de salas (cabeçalho colorido do setor, cena isométrica, lista de agentes); rodapé com a fonte ativa.
2. **Demos 3D**: `demo-3d-executivo.html`, `demo-3d-jogo.html`, `comparar-3d.html`.
3. **Demo de animação**: `demo-animacao.html` (barra de ações + seletor de agente da RedBox).
4. Futuras (fora do escopo): detalhe do agente, histórico, filtros.

## Modelo de dados do status
```json
{
  "exemplo": true,
  "aviso": "texto",
  "geradoEm": "2026-10-31T17:00:00-03:00",
  "setores": [{
    "id": "redbox", "nome": "RedBox", "descricao": "Agência", "cor": "#d64545",
    "agentes": [{
      "id": "redbox-1", "nome": "Agente Exemplo",
      "status": "trabalhando | parado | esperando",
      "tarefa": "rótulo curto", "atualizadoEm": "ISO 8601"
    }]
  }]
}
```
Regras: status desconhecido vira `parado`; a fonte de exemplo força `exemplo: true`. Sugestão futura: considerar `parado` se `atualizadoEm` passar de N minutos sem heartbeat (N a confirmar).

### Formato público (fonte de produção)
`{"agentes":[{"nome":"...","sala":"RedBox","status":"trabalhando"}]}` — sem nenhum outro campo.

## Interface do adaptador
`{ nome, exemplo, carregar(): Promise<Escritorio>, assinar?(cb): cancelar }`. Ver ADR-0001.

## Critérios de aceite
- [x] Dado o painel aberto, então as 5 salas aparecem com os 32 agentes de exemplo.
- [x] Cada status tem animação distinta.
- [x] O selo "Dados de exemplo" está sempre visível.
- [x] No celular (390 px) as salas ficam em coluna única sem rolagem horizontal.

## Fora do escopo
Publicar ou ligar agentes à fonte real (a fonte por arquivos está pronta, mas nenhum agente escreve nela); autenticação; deploy/domínio; histórico; edição de agentes; notificações; envio de mensagens.

## Dúvidas em aberto
- Onde publicar, se publicar (ver `publicacao-gratuita.md`).
- Quais agentes passarão a escrever o arquivo de status.
- Quem poderá ver o painel e com qual login, se virar produto.
