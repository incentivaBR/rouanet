# SPEC — JORNADA COMPLETA DO SERVIDOR (IncentivaBR / DestineAI)

Documento em formato de prompt/spec funcional cobrindo as três fases da jornada do servidor, da primeira visita anônima ao site até a destinação concluída e o pós-confirmação. Substitui e amplia o `SPEC_FLUXO_DESTINACAO.md` (que cobria apenas a Fase 3).

Versão 2.0 — abril/2026.

---

## 0. CONTEXTO E PERSONAGEM

### Quem chega ao site
Servidor público brasileiro entre 28 e 60 anos. Salário fixo, IR retido em folha. Declara IRPF na modalidade completa por força de dependentes, despesas médicas, plano de saúde, previdência. Conhece "Lei Rouanet" pelo noticiário, mas nunca destinou — porque parece complicado, parece arriscado, ou simplesmente nunca aparece com clareza para ele. Tem entre 5 e 30 minutos para gastar quando entra no site pela primeira vez. Não vai ler manuais. Decide por percepção, não por análise.

### Estado mental ao entrar
Curioso e cético em proporções iguais. Quer entender em poucos segundos: "isso é golpe? isso é seguro? quanto eu ganho? quanto eu perco?". Se em 30 segundos não tiver resposta clara para essas quatro perguntas, fecha a aba.

### Promessa central que o site precisa transmitir em uma frase
"Imposto que você já paga, com destino que você escolhe. Custo no seu bolso: zero. Retorno integral na sua próxima declaração."

---

## 1. PRINCÍPIOS DE UX E CONVERSÃO INEGOCIÁVEIS

P1 — **Mostre antes de pedir.** Servidor calcula quanto pode destinar SEM fazer cadastro. Cadastro só vem depois de ele estar convencido.

P2 — **Cada tela responde uma objeção.** Não há tela genérica. Cada uma resolve uma das quatro perguntas centrais (é golpe? é seguro? quanto ganho? quanto perco?).

P3 — **Prova social institucional sempre presente.** Selo INPI, PRONAC do projeto, marca do MinC, depoimentos reais aparecem em todas as páginas.

P4 — **Linguagem do servidor, não de fintech.** Sem "destinador", sem "experiência", sem "jornada". Use "você", "seu imposto", "o projeto", "o tribunal", "os jovens". Português direto.

P5 — **Mobile primeiro.** 70% dos servidores chegam pelo celular. Cada layout precisa funcionar em 375px de largura antes de pensar em desktop.

P6 — **Saída com retorno.** Servidor que sai sem se cadastrar deve poder voltar via link no e-mail/WhatsApp e retomar de onde parou. Cookies guardam progresso.

---

## 2. FASE 1 — DESCOBERTA (VISITANTE ANÔNIMO)

**Objetivo da fase:** transformar curioso em convencido. Ao final, o servidor tem certeza emocional + racional de que quer se cadastrar.

**Telas envolvidas:** `index.html`, `como-funciona.html`, `faq.html`, `calculadora.html` (versão pública).

**Tempo médio esperado nesta fase:** 4 a 8 minutos.

**Critério de saída:** clique em "Criar conta" ou "Destinar meu IR para o Themis".

### 2.1. Tela 1 — Landing page (`index.html`)

Hero principal (visível ao abrir):
- Headline: "Seu imposto vira música."
- Subtítulo: "12 jovens de Ceilândia tocaram Vivaldi para 800 pessoas no TJDFT. Com 6% do seu IR — dinheiro que você já pagaria ao governo."
- Selo de credibilidade abaixo: "R$ 0 do seu bolso · PRONAC 250347 aprovado pelo MinC"
- Dois botões primários:
  - "Quero apoiar o Projeto Themis" (rola até a seção do projeto)
  - "Calcular quanto posso destinar →" (link discreto para `calculadora.html`)
- Imagem de fundo: foto da orquestra real no TJDFT, com overlay azul navy.

Seção 2 — Projeto Themis (`#themis`):
- Card grande com 4 indicadores numéricos (12 jovens, 800 espectadores, TJDFT, R$ 0 custo)
- Selo "PRONAC 250347 · Aprovado pelo MinC"
- Botão CTA: "Destinar meu IR para o Themis" (leva ao login se não logado)

Seção 3 — Como funciona em 4 passos (`#como-funciona`):
- 4 cards numerados: (1) Calcule seu IR, (2) Confirme o projeto, (3) Transfira via PIX, (4) Declare no IR — código 41
- Mensagem secundária: "4 passos. Menos de 5 minutos."

Seção 4 — Objeções respondidas (3 cards):
- "Isso sai do meu bolso?" → Não.
- "Quanto posso destinar?" → Até 6% do IR devido.
- "É seguro?" → PRONAC aprovado pelo MinC, INPI BR512025000647-0.

Seção 5 — CTA final em fundo dourado:
- "Seu IR já está sendo cobrado. Falta só você escolher para onde vai."
- Botão "Destinar agora — é grátis"

Seção 6 — FAQ resumido (5 perguntas mais frequentes):
- Cada uma com resposta curta e link "Ver todas as perguntas" para `faq.html`

Footer:
- Marca DestineAI + tagline + link para política de privacidade e termos.
- Selos discretos: INPI, MinC.

**Componentes visuais-chave:**
- Cor de fundo principal: navy (#0D1B3E)
- Cor de destaque: dourado (#FFD700)
- Tipografia: Inter (Google Fonts)
- Animação fade-up ao rolar a página (já implementada)

**Mecanismos psicológicos ativados:**
- Storytelling concreto (12 jovens, 800 espectadores) — ativa empatia.
- Selo institucional (MinC, PRONAC) — reduz desconfiança.
- "R$ 0" no headline e em todos os CTAs — desarma objeção financeira.
- Pergunta retórica final ("Falta só você escolher para onde vai") — instaura senso de agência.

### 2.2. Tela 2 — Como funciona (`como-funciona.html`)

Estrutura:
- Cabeçalho: "Como funciona em 5 minutos"
- Bloco 1 — Diagrama dos 4 passos com setas, cada um com ícone e descrição expandida.
- Bloco 2 — "Por que 99% não destinam?" — explicação dos 7 fatores de não-destinação (do PI):
  - Cada fator com card próprio: descrição + como o IncentivaBR resolve.
- Bloco 3 — "Sou servidor público. Por que isso é especialmente para mim?":
  - Renda fixa = previsibilidade do limite
  - IR retido em folha = você já paga, só não escolheu
  - Modelo completo de declaração = aproveita a dedução
  - Quadro comparativo: servidor vs autônomo
- Bloco 4 — "E na hora de declarar?" → tutorial visual mostrando código 41 no DIRPF.
- Bloco 5 — CTA: "Calcular quanto eu posso destinar →"

**Tempo de leitura projetado:** 2 a 3 minutos.

### 2.3. Tela 3 — FAQ (`faq.html`)

Estrutura accordion (perguntas que abrem ao clicar). Mínimo 12 perguntas, organizadas em 4 seções:

**Seção A — O básico:**
- O que é destinação de IR?
- Quem pode destinar?
- Sou servidor público, isso muda algo?
- O que é a Lei Rouanet?

**Seção B — Custo e retorno:**
- Isso sai do meu bolso?
- Como recebo o valor de volta?
- E se eu declarar no modelo simplificado?
- Posso destinar mesmo com IR retido na fonte?

**Seção C — Segurança:**
- A INCENTIVABR recebe meu dinheiro?
- O PRONAC é confiável?
- Posso cair na malha fina?
- Como funcionam as auditorias?

**Seção D — Operacional:**
- Qual o limite que posso destinar?
- Posso destinar para vários projetos?
- E se eu errar o valor?
- Posso destinar agora e declarar depois?

**CTA fixo no rodapé do FAQ:**
- "Não achou sua dúvida? Fale com a TINA →" (abre chat)
- "Pronto para destinar? Criar conta →"

### 2.4. Tela 4 — Calculadora rápida pública (`calculadora.html`)

Sem necessidade de cadastro. Único objetivo: provar que vale a pena.

Estrutura simplificada:
- Pergunta única: "Qual foi seu IR devido na última declaração?"
- Campo numérico com máscara monetária + slider opcional para faixas comuns (R$ 1.000 / R$ 5.000 / R$ 15.000 / R$ 30.000).
- Botão "Calcular".

Resultado em destaque:
- "Você pode destinar até R$ X (6% do seu IR)."
- Dois cenários comparativos lado a lado:
  - Sem destinar: IR R$ Y / Restituição R$ A
  - Com destinação: IR R$ (Y − X) / Restituição R$ A + X
- Linha de fechamento gritando visualmente: "Seu bolso fica igual. Mas R$ X agora vão para um projeto que você escolhe, e não somem na máquina pública."

CTAs após o resultado:
- "Quero destinar para o Projeto Themis →" (botão primário, leva ao cadastro/login)
- "Quero ver outros projetos →" (botão secundário)
- "Salvar este cálculo no meu e-mail" (captura lead — opcional)

**Critério de sucesso desta tela:** ≥ 60% dos servidores que calculam clicam em algum CTA principal.

### 2.5. Critérios de sucesso da FASE 1

| Métrica | Meta |
|---------|------|
| Visitantes únicos por mês na landing | ≥ 5.000 (escala piloto) |
| Taxa de scroll completo da landing | ≥ 50% |
| Cliques em "Como funciona" ou "FAQ" | ≥ 30% dos visitantes |
| Taxa de uso da calculadora pública | ≥ 25% |
| Taxa de conversão Fase 1 → Fase 2 (calculadora → cadastro) | ≥ 20% |

---

## 3. FASE 2 — DECISÃO (CADASTRO E PRIMEIRO LOGIN)

**Objetivo da fase:** converter visitante convencido em usuário cadastrado, com fricção mínima.

**Telas envolvidas:** `login.html` (com aba "Cadastrar"), confirmação de e-mail (opcional), boas-vindas pós-login.

**Tempo médio esperado nesta fase:** 90 a 180 segundos.

**Critério de saída:** servidor logado e redirecionado para o início da Fase 3.

### 3.1. Acionamento

Servidor chega à Fase 2 clicando em qualquer botão de conversão das Fases anteriores:
- "Criar conta" no nav (sempre visível)
- "Destinar meu IR para o Themis" (botões CTA da landing)
- "Quero destinar →" (após calcular na calculadora pública)
- "Pronto para destinar? Criar conta" (FAQ)

Em todos os casos, abre `login.html` na aba "Cadastrar" por padrão (não em "Entrar"). Se vier com query string `?action=login`, abre diretamente em "Entrar".

### 3.2. Tela de cadastro (`login.html` aba Cadastrar)

Cabeçalho:
- Logo DestineAI
- Subtítulo: "Crie sua conta — leva menos de 1 minuto"

Tabs no topo: "Entrar" / "Cadastrar" (ativa).

Formulário curto, vertical, sem distração:
- Nome completo* (mínimo 3 caracteres)
- CPF* (com máscara automática 000.000.000-00, validação de algoritmo)
- E-mail* (validação de formato)
- Telefone (opcional, com máscara)
- Senha* (mínimo 8 caracteres, indicador visual de força)
- Confirmar senha* (precisa bater)

Campo de aceite (obrigatório):
- "[ ] Li e aceito a Política de Privacidade e os Termos de Uso *"
- Links abrem em nova aba sem perder progresso do formulário.

Botão primário: "Criar conta" (cor de destaque, full width).

Link discreto abaixo: "Já tenho conta — Entrar"

Link de retorno: "← Voltar para o início"

### 3.3. Validações inline

- Nome: validar ao perder o foco (mínimo 3 caracteres).
- CPF: validar ao perder o foco (algoritmo de dígito verificador).
- E-mail: validar ao perder o foco (regex de formato).
- Senha: indicador visual em tempo real (fraca/média/forte) com critérios:
  - Mínimo 8 caracteres
  - Pelo menos uma letra maiúscula (recomendado)
  - Pelo menos um número (recomendado)
- Confirmar senha: verificar match em tempo real após começar a digitar.
- Aceite: obrigatório, mensagem se não marcado.

Toda validação com feedback visual imediato (borda vermelha + mensagem em texto pequeno abaixo do campo).

### 3.4. Submissão

Ao clicar "Criar conta":
- Botão muda para "Aguarde..." com spinner.
- Backend cria usuário em `users` com hash bcrypt da senha.
- Registra `lgpd_aceite_timestamp` e versão dos termos.
- Se houver organização parceira na URL (`?org=X`), associa o usuário ao tenant.
- Sucesso: toast verde "Conta criada com sucesso! Faça login para continuar."
- Aba muda automaticamente para "Entrar" e o e-mail vem pré-preenchido.

### 3.5. Login

Tela "Entrar":
- Campo: "CPF ou E-mail"
- Campo: "Senha" (com botão "olho" para revelar)
- Botão primário: "Entrar"
- Link: "Esqueci minha senha"

Após login bem-sucedido:
- Toast: "Olá, [primeiro nome]! Vamos começar?"
- Redirecionamento automático em 1 segundo para `dashboard.html` (se primeiro acesso, vai direto para Fase 3 com o projeto que motivou o cadastro).

### 3.6. Boas-vindas pós-primeiro login

Tela rápida (modal ou intersticial) só na primeira vez:
- "Bem-vindo(a), [primeiro nome]"
- "Antes de destinar, só uma confirmação importante:"
- Pergunta: "Você declara seu IR no modelo completo?"
  - Botão "Sim, modelo completo" → segue para Fase 3 normalmente
  - Botão "Não / não sei" → mostra modal explicativo com botões:
    - "Quero entender a diferença" (link para FAQ)
    - "Vou declarar no completo este ano" → segue para Fase 3 com flag
    - "Vou continuar no simplificado" → mensagem: "A destinação não retornará para você no modelo simplificado. Quer continuar conhecendo a plataforma mesmo assim?" → segue ou volta

### 3.7. Critérios de sucesso da FASE 2

| Métrica | Meta |
|---------|------|
| Taxa de conclusão do formulário (preenchimento → submissão) | ≥ 70% |
| Tempo médio para concluir cadastro | ≤ 90 segundos |
| Taxa de erro no preenchimento (validações que falham) | ≤ 15% |
| Taxa de login no primeiro acesso | ≥ 90% |
| Taxa de conclusão do passo "modelo completo" | ≥ 95% |

---

## 4. FASE 3 — DESTINAÇÃO (USUÁRIO LOGADO)

**Objetivo da fase:** servidor logado executa a destinação completa, recebendo recibo e comprovante.

**Telas envolvidas:** `dashboard.html`, `destinar-rouanet.html` (e equivalentes para outras leis), `comprovante.html`.

**Tempo médio esperado nesta fase:** 4 a 6 minutos.

**Critério de saída:** tela "Destinação Registrada!" com confirmação visual e e-mail enviado.

### 4.1. Passo 1 — Visualização do projeto

Servidor logado clica em "Destinar meu IR para o Themis" (ou qualquer outro projeto). Tela exibe:

Cabeçalho com barra de progresso "1 de 6".

Card grande do projeto:
- Imagem do projeto
- Nome: "Projeto Themis"
- PRONAC + lei (Rouanet)
- Resumo em 2-3 linhas
- 4 indicadores: 12 jovens, 800 espectadores, TJDFT, R$ 0 custo
- Selo "Aprovado pelo MinC"

Bloco "Antes de continuar, confira":
- Lei: Rouanet
- Limite individual: até 6% do IR devido
- Sua dedução: 100% do valor destinado abate do IR na próxima declaração
- Modelo completo: obrigatório (já confirmado no onboarding)

Botão primário: "Calcular meu IR"
Botão secundário: "Ver outros projetos"

### 4.2. Passo 2 — Calculadora personalizada

Cabeçalho: "Quanto você pode destinar?"

Campo: "IR devido na última declaração: R$ ___"
Botão "Calcular"

Resultado:
- "Você pode destinar até R$ X (6% × R$ Y de IR)"
- Simulação dos dois cenários lado a lado (mesmo padrão da calculadora pública)
- Linha de fechamento: "Seu bolso fica igual. R$ X vão para o Projeto Themis em vez de somem na máquina pública."

Botão primário: "Definir valor"

### 4.3. Passo 3 — Definição do valor

Slider visual (mínimo R$ 50, máximo o limite calculado).
Campo numérico sincronizado.
Indicador: "Você está destinando X% do limite disponível."

Checkbox obrigatório:
- "[ ] Confirmo que declararei meu IR no modelo completo no próximo exercício e que esse valor será informado no campo Doações Efetuadas - Código 41."

Botão primário: "Confirmar valor: R$ X"

### 4.4. Passo 4 — Pagamento

Tela com dados bancários do beneficiário (Modelo 1 manual nesta versão; Modelo 2 PSP integrado em versão futura):

Cabeçalho: "Faça a transferência"
Subtítulo: "O dinheiro vai DIRETO para a conta oficial do projeto. A INCENTIVABR não recebe nem retém."

Card com QR Code PIX gerado a partir dos dados do beneficiário + dados em texto:
- QR Code grande (≥ 200x200px)
- "Copiar PIX copia-cola" (botão)
- CNPJ: [com botão copiar]
- Banco: [nome]
- Agência: [número]
- Conta: [número]
- Beneficiário: [razão social]
- Valor a transferir: R$ X (em destaque)

Aviso de segurança:
- "Confira sempre o CNPJ antes de transferir. CNPJ verificado em [data]."
- Selo "Plataforma protegida pelo registro INPI BR512025000647-0"

Instruções passo a passo:
1. Abra o app do seu banco
2. Vá em PIX → Transferir → Cole o código ou escaneie o QR
3. Confira o valor R$ X e o nome do beneficiário
4. Confirme

Botão primário: "Já realizei o pagamento — Subir comprovante"
Link discreto: "Tive dificuldade — Falar com a TINA"

### 4.5. Passo 5 — Upload do comprovante

Cabeçalho: "Anexe seu comprovante"

Área de drop:
- "Arraste o comprovante aqui ou clique para selecionar"
- Aceita PDF, JPG, PNG até 5MB
- Após upload, mostra preview (nome + miniatura)

Validação automática (TINA + Claude Vision):
- Identifica valor → bate com R$ X?
- Identifica CNPJ destinatário → bate com o cadastrado?
- Identifica data → dentro das últimas 48h?

Status visual:
- ✅ "Comprovante validado" (verde) → segue
- ⚠️ "Comprovante registrado, em análise" (amarelo) → segue com flag
- ❌ "Comprovante não confere — tente outro arquivo" (vermelho) → não segue

Botão primário: "Confirmar destinação"

### 4.6. Passo 6 — Confirmação

Animação de sucesso (confetti + ícone do projeto).

Mensagem central:
- "Pronto, [primeiro nome]! Sua destinação de R$ X para o Projeto Themis está registrada."

Bloco "Próximos passos automáticos":
- ✅ Recibo oficial em nome do seu CPF chegará em até 48h
- ✅ Comprovante arquivado no seu painel
- ✅ Lembrete agendado para março/2027 com instruções de declaração
- ✅ Atualizações sobre o impacto do projeto chegarão por e-mail

Bloco "Seu impacto":
- "Total destinado este ano: R$ X (de R$ Y disponível)"
- "Você apoiou: 1 projeto"
- "Que tal apoiar mais um?" → card de projeto recomendado

Botões:
- "Destinar para outro projeto" (volta ao Passo 1 com novo projeto)
- "Ir para meu painel" (vai para `dashboard.html`)
- "Compartilhar minha história" (gera card visual para o servidor postar em redes — gatilho de viralidade orgânica)

E-mail automático disparado:
- Para o servidor: confirmação + comprovante anexo + agenda de próximos passos
- Para o beneficiário: notificação + pedido de emissão de recibo em até 48h

### 4.7. Critérios de sucesso da FASE 3

| Métrica | Meta piloto |
|---------|-------------|
| Taxa de conclusão completa (Passo 1 → Passo 6) | ≥ 60% (H2 do PI) |
| Tempo médio do fluxo completo | ≤ 5 minutos |
| Taxa de validação automática de comprovante | ≥ 95% |
| NPS pós-destinação | ≥ 70 |
| Taxa de segunda destinação imediata (clique em "Destinar para outro projeto") | ≥ 25% |

---

## 5. MECANISMOS DE CONQUISTA — GATILHOS PSICOLÓGICOS POR FASE

### Fase 1 — Descoberta
- **Curiosidade:** headline poético ("Seu imposto vira música") gera dúvida produtiva.
- **Prova concreta:** números reais do projeto (12 jovens, 800 espectadores, TJDFT) eliminam abstração.
- **Reciprocidade:** calculadora gratuita sem cadastro entrega valor antes de pedir algo.
- **Autoridade:** PRONAC, MinC, INPI ancoram credibilidade institucional.
- **Quebra de objeção financeira:** "R$ 0 do seu bolso" repetido em todos os CTAs.

### Fase 2 — Decisão
- **Compromisso e consistência:** servidor que calculou já investiu energia, cadastro vira coerência natural.
- **Senso de oportunidade:** "Comece agora — leva menos de 1 minuto" reduz fricção.
- **Aceite explícito do modelo completo:** consolida que ele entende a regra do retorno.
- **Boas-vindas personalizadas:** uso do primeiro nome cria conexão imediata.

### Fase 3 — Destinação
- **Confirmação progressiva:** cada passo confirma o anterior, reduz ansiedade.
- **Transparência radical:** "o dinheiro vai DIRETO ao beneficiário, plataforma não recebe" tira medo de golpe.
- **Selo de segurança visível em cada passo:** INPI, MinC, "CNPJ verificado em".
- **Celebração ao concluir:** confetti + animação + lista de próximos passos automáticos cria sensação de competência.
- **Compartilhamento orgânico:** botão "Compartilhar minha história" no Passo 6 transforma servidor em embaixador (Fator 6 do PI: ausência de incentivos sociais).

---

## 6. MÉTRICAS DE FUNIL — TAXA DE CONVERSÃO ENTRE FASES

| De → Para | Métrica | Meta piloto | Meta nacional |
|-----------|---------|-------------|---------------|
| Visita anônima → Calculadora | Taxa de exploração | ≥ 25% | ≥ 35% |
| Calculadora → Cadastro | Taxa de conversão da calculadora | ≥ 20% | ≥ 30% |
| Cadastro → Login concluído | Taxa de ativação | ≥ 90% | ≥ 95% |
| Login → Início da Fase 3 | Taxa de iniciação (H1) | ≥ 80% | ≥ 85% |
| Início da Fase 3 → Destinação concluída | Taxa de conversão (H2) | ≥ 60% | ≥ 70% |
| **Visita anônima → Destinação concluída** | **Taxa de conversão total** | **≥ 2,5%** | **≥ 5%** |

A multiplicação das taxas individuais define a meta agregada. Se cada elo se mantém, o funil entrega.

---

## 7. EDGE CASES E TRATAMENTOS

### Fase 1
- Servidor entra direto pelo link com `?action=destinar&projeto=X` sem ter feito calculadora: a tela do projeto traz a calculadora embutida no Passo 2 da Fase 3.
- Servidor com bloqueador de scripts: alertar discretamente e oferecer modo simplificado.
- Servidor que sai depois da calculadora pública sem cadastrar: cookie + e-mail capture opcional para retomar via link.

### Fase 2
- E-mail já cadastrado: redirecionar para "Entrar" com sugestão "Você já tem conta. Esqueceu a senha?"
- CPF já cadastrado: bloquear cadastro, mostrar mensagem clara.
- Servidor declara que está no simplificado: continuar mas com flag persistente (ele pode mudar para completo este ano).

### Fase 3
- Servidor abandona após Passo 4 (pagamento): cookie guarda progresso, e-mail em 24h "Você está a um passo de concluir."
- Comprovante não validado automaticamente: revisão manual em até 24h pelo admin do tenant.
- Beneficiário não emite recibo em 48h: alerta interno, comunicação ativa com o cliente proponente, e-mail ao servidor avisando.
- Servidor tenta destinar acima do limite: bloqueio com explicação clara.
- Múltiplas destinações no mesmo dia: permitir, mas exibir aviso "Você já destinou R$ X hoje. Confira se faz sentido continuar."

---

## 8. DEPENDÊNCIAS TÉCNICAS

- `tenant.js` carregando marca, cores e catálogo de projetos por tenant.
- Tabela `laws` populada (migration 018 já aplicada na branch).
- Tabela `nichos_profissionais` populada (migration 020 a aplicar na Semana 1).
- Tabela `projects` com dados completos do projeto e do beneficiário (CNPJ, conta, chave PIX).
- API `/api/calculate-ir` para a calculadora dos dois cenários.
- API `/api/donations` para registro completo da destinação.
- API `/api/projects?tenant=X` para o catálogo personalizado.
- TINA conectada ao banco e ao Claude SDK para validação de comprovante e suporte.
- PDFKit para geração de comprovantes consolidados.
- Resend (já configurado) para disparo de e-mails transacionais.
- WhatsApp via wa.me na Fase 1; API real em fases futuras.
- PSP integrado (Iugu) na Fase 3, Passo 4 versão 2 (substituindo o Modelo 1 manual).

---

## 9. PRINCÍPIOS DE COPY POR TELA — RESUMO ACIONÁVEL

| Tela | Frase central que NÃO pode faltar | Tom |
|------|-----------------------------------|-----|
| Landing hero | "Seu imposto vira música" | Poético, surpreendente |
| Landing — projeto | "PRONAC 250347 · Aprovado pelo MinC" | Institucional, técnico |
| Como funciona | "4 passos. Menos de 5 minutos." | Direto, simples |
| FAQ | "Não achou sua dúvida? Fale com a TINA" | Acessível, próximo |
| Calculadora pública | "Seu bolso fica igual. R$ X vão para um projeto que você escolhe." | Comparativo, claro |
| Cadastro | "Crie sua conta — leva menos de 1 minuto" | Promessa de baixo esforço |
| Boas-vindas | "Olá, [nome]! Vamos começar?" | Personalizado, convidativo |
| Passo 4 (pagamento) | "O dinheiro vai DIRETO ao projeto. A INCENTIVABR não recebe." | Transparente, tranquilizador |
| Passo 6 (confirmação) | "Pronto, [nome]! Sua destinação está registrada." | Celebrativo, conclusivo |

---

## 10. EVOLUÇÃO PREVISTA DESTA SPEC

Versão 2.0 (atual): jornada completa em 3 fases para Rouanet (DestineAI Themis).

Versão 2.1 (Semana 3 do cronograma TCC): incorporação do nicho profissional no fluxo (Passo 2 da Fase 3) + catálogo personalizado.

Versão 2.2 (Semana 4): integração TINA contextual em todas as fases.

Versão 3.0 (pós-defesa PII): expansão multifundo — servidor pode escolher entre 7 leis no Passo 1, com migrações 018-020 plenamente integradas ao fluxo B2C.

Versão 4.0 (pós-rollout nacional): consignação em folha como alternativa de pagamento para servidores cujos órgãos têm convênio.

---

**Fim da spec.**
Cada iteração com servidor real durante o piloto deve gerar revisões pontuais. Documentar mudanças aqui, mantendo histórico.
