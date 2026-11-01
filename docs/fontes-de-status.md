# De onde o status real poderia vir

> Análise apenas. **Nada foi conectado.** O protótipo usa só `dados/exemplo.json`.

| # | Fonte | Prós | Contras |
|---|---|---|---|
| 1 | **Transcrições/sessões dos agentes pela plataforma** (ler o andamento das sessões/rotinas) | Reflete atividade real sem mudar os agentes; detecta "esperando aprovação" pelo conteúdo | Depende de acesso/API da plataforma (a confirmar); leitura de conversas expõe conteúdo sensível; mais pesado de processar; acoplado à plataforma |
| 2 | **Arquivo de status escrito por cada agente na máquina compartilhada** (ex.: `status/<agente>.json`) | Simples, barato, sem rede; formato já igual ao modelo de dados; fácil de auditar | Depende de cada agente lembrar de escrever (instrução na skill); arquivo pode ficar velho se o agente falhar; painel precisa rodar na mesma máquina ou ter um leitor que exponha os arquivos |
| 3 | **Webhook/endpoint próprio** (`POST /v1/status` em serviço da Domma) | Padrão de produto; funciona com agentes em qualquer lugar; permite tempo real (SSE/WebSocket) | Exige servidor, autenticação por token, limite de requisições e hospedagem (deploy precisa de OK); é integração externa → aprovação |
| 4 | **Rotinas que publicam heartbeat** (rotina periódica grava "vivo às HH:MM" + status) | Detecta agente travado/morto pela ausência de batida; complementa as outras | Granularidade limitada ao intervalo; consome execuções/uso; sozinha não sabe *o que* o agente faz |

## Recomendação
1. **Curto prazo (interno):** fonte **2 (arquivo por agente)** + regra de "envelhecimento" (sem atualização há N minutos ⇒ `parado`). Escrever o adaptador `criarFonteArquivos()` que lê um índice gerado localmente. Menor custo e risco, zero rede externa.
2. **Complemento:** **4 (heartbeat)** apenas para agentes críticos, para detectar travamentos.
3. **Como produto:** evoluir para **3 (endpoint próprio)** com token por cliente, mantendo o mesmo contrato JSON.
4. **Fonte 1** só como enriquecimento opcional (ex.: detectar "aguardando aprovação"), após avaliar privacidade e acesso — não ler conteúdo de conversas no painel.

Toda ligação real exige OK explícito do Otávio (integração externa / dados sensíveis).
