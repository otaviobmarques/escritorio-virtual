# Onde daria para publicar sem login, sem conta paga e sem gasto (análise)

> **Nada foi publicado e nenhuma conta foi criada.** Publicar exige OK explícito do Otávio. Condições de serviços de terceiros mudam: confirmar na hora.

O painel é estático (HTML/JS/CSS + `status.json`), então qualquer hospedagem estática serve. O ponto crítico é **"sem login"**: praticamente todo serviço gratuito confiável exige uma conta (mesmo grátis).

| Opção | Precisa de login/conta? | Custo | Observações |
|---|---|---|---|
| **Só na rede local** (`python3 -m http.server` em `0.0.0.0` numa máquina do escritório) | Não | Zero | Único caminho realmente sem conta. Visível só na mesma rede; atualização do status é imediata. |
| **Túnel temporário sem conta** (ex.: modo "quick tunnel" do Cloudflare `cloudflared tunnel --url`, a confirmar termos atuais) | Não (no modo rápido) | Zero | URL aleatória e efêmera; sem garantia de disponibilidade; expõe a máquina local — usar só servidor estático, só leitura. |
| GitHub Pages | Sim (conta GitHub grátis) | Zero (repositório público) | Repositório público expõe o código e o `status.json`; atualizar status = novo commit/push. |
| Cloudflare Pages / Netlify / Vercel (planos grátis) | Sim (conta grátis) | Zero no plano gratuito, com limites | Bons para estático; status atualizado exige novo deploy ou função. |
| Hospedagem que já exista de algum negócio do Otávio | Já tem acesso | Sem gasto novo | A confirmar se existe e se pode ser usada. |

## Recomendação
1. **Sem conta e sem gasto de verdade:** rede local. É o mais seguro.
2. Se precisar acesso de fora **sem conta**: túnel rápido temporário, só para demonstração, desligando depois.
3. Para uso contínuo fora da rede: aceitar criar **conta gratuita** (GitHub Pages ou Cloudflare Pages) — decisão do Otávio.

## Cuidados em qualquer opção
- Publicar só `index.html`, `src/`, `vendor/`, páginas 3D e `publico/status.json` — nunca a pasta de status bruta.
- `status.json` contém só nome, sala e status; mesmo assim, revelar nomes dos agentes e setores publicamente é decisão do dono.
- Sem login no painel = qualquer pessoa com a URL vê. Se isso for problema, a opção "sem login" não serve.
