# Instruções para os agentes: registrar o próprio status

Texto para enviar a cada agente (troque NOME e SALA):

> **Escritório Virtual: registre seu status.**
> Sempre que começar uma tarefa, rode no computador de trabalho (o caminho completo do `registrar.sh` vai na mensagem enviada pelo Otávio; não fica neste repositório):
> `registrar.sh "NOME" SALA trabalhando "tarefa em poucas palavras" "projeto"`
> Quando estiver aguardando aprovação ou resposta do Otávio:
> `registrar.sh "NOME" SALA esperando "o que está aguardando" "projeto"`
> Ao terminar:
> `registrar.sh "NOME" SALA parado`
> - NOME = seu primeiro nome exatamente como no seu perfil (ex.: "Caio"). SALA = RedBox, Vértice, Restaurantes, Jurídico ou Domma.
> - O registro vale 30 minutos. Em tarefas longas, repita o comando a cada 20–30 minutos.
> - O site público mostra só nome, sala e status. Tarefa e projeto ficam num arquivo privado, mas mesmo assim **não escreva** nomes de clientes, valores, senhas, chaves ou dados pessoais na tarefa.

Regras do sistema:
- O registro próprio tem prioridade sobre o sinal automático (atividade de arquivos) enquanto tiver menos de 30 minutos.
- Sem registro válido: "trabalhando" se houve atividade nos últimos 10 minutos, senão "parado".
- "Esperando" só aparece por registro próprio.
