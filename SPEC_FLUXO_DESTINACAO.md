# SPEC — FLUXO DE DESTINAÇÃO DE IR (IncentivaBR / DestineAI)

Documento em formato de prompt/spec funcional. Descreve o passo a passo completo que o servidor público percorre, do momento em que entra na plataforma até o momento em que recebe o comprovante de destinação. Pode ser usado como brief de desenvolvimento, input para agente de IA gerar telas/código, ou referência de validação de UX.

Versão 1.0 — abril/2026.

---

## 0. CONTEXTO E PERSONA

### Quem é o usuário
Servidor público brasileiro, federal/estadual/municipal, com IR retido em folha de pagamento e declaração de IRPF na modalidade completa. Faixa de IR devido típica entre R$ 5.000 e R$ 80.000 anuais. Familiaridade média com tecnologia: usa app do banco, gov.br, WhatsApp diariamente. Familiaridade baixa com mecanismos de incentivo fiscal. Tempo disponível escasso. Receio de cometer erros que gerem malha fina.

### O que é o produto
IncentivaBR é a plataforma digital que permite ao servidor destinar parte do IR devido (até os limites legais de cada lei) para projetos sociais aprovados, com retorno de 100% do valor destinado na declaração anual seguinte. Cobre sete leis de incentivo: Rouanet, LIE, PRONON, PRONAS/PCD, LIR, FIA, Fundo do Idoso.

### Promessa central de comunicação
"O imposto que você já paga, agora com destino que você escolhe. Custo no seu bolso: R$ 0. Impacto no projeto: real."

### Princípio de UX inegociável
Em nenhum momento do fluxo o servidor deve sair da plataforma para realizar uma ação técnica e voltar para continuar. Toda ação que envolver outro sistema (banco, app gov.br, declaração) é orquestrada com instruções claras e retorno automático.

---

## 1. PRÉ-REQUISITOS DA SESSÃO

Antes de iniciar o fluxo, o sistema valida:

- Servidor autenticado via login da plataforma (credenciais próprias ou OAuth gov.br quando integrado).
- Aceite de Termos de Uso e Política de Privacidade registrado com timestamp.
- Tenant identificado (subdomínio ou query string `?org=slug`); marca, cores e catálogo de projetos do tenant carregados via `tenant.js`.
- Indicador de declaração no modelo completo confirmado pelo servidor no onboarding (não obrigatório no cadastro, mas obrigatório antes da primeira destinação).

Se algum pré-requisito falhar, redirecionar para a tela responsável (login, aceite de termos, escolha de tenant) com mensagem explicativa.

---

## 2. PASSO 1 — ENTRADA NO FLUXO DE DESTINAÇÃO

### Origem
O servidor pode chegar à tela inicial do fluxo por três caminhos:
- Botão "Destinar agora" no dashboard pessoal.
- Link direto enviado por e-mail/WhatsApp (`/destinar?projeto=PRONAC123` ou `/destinar?lei=fia&projeto=42`).
- Card de projeto sugerido no catálogo (clicado em `/projetos`).

### Tela exibida
Cabeçalho com saudação personalizada ("Olá, [primeiro nome]"), barra de progresso indicando etapa 1 de 6, e bloco principal com:
- Título: "Vamos destinar parte do seu IR"
- Subtítulo: "Em até 5 minutos você direciona até X% do imposto que já pagaria, sem custo adicional, com retorno integral na sua declaração de IRPF do próximo ano."
- Selo: "Modelo Completo de Declaração obrigatório"
- Botão primário: "Começar"

### Comportamento esperado
Ao clicar em "Começar", verificar se o servidor já preencheu o nicho profissional dele anteriormente. Se sim, pular Passo 2 e ir direto ao Passo 3. Se não, ir ao Passo 2.

---

## 3. PASSO 2 — IDENTIFICAÇÃO DO NICHO PROFISSIONAL

### Objetivo
Descobrir a área de atuação do servidor para personalizar o catálogo de projetos sugeridos. Ativa a tese central de "afinidade vocacional gera engajamento" do PI.

### Tela exibida
Pergunta única, grande, no centro: "Em qual área você atua hoje?"

Lista de cards clicáveis, um por nicho (referência: Quadro 5 do PI):
- Judiciário (juízes, promotores, defensores, oficiais)
- Saúde (médicos, enfermeiros, agentes, gestores)
- Educação (professores, coordenadores, diretores, pesquisadores)
- Segurança Pública (policiais, guardas, peritos, gestores)
- Administrativo (analistas, técnicos, gestores gerais)
- Meio Ambiente (analistas ambientais, fiscais, pesquisadores)
- Fazenda / Receita (auditores fiscais, analistas tributários)
- Esporte (gestores de esporte, profissionais de educação física)
- Cultura (gestores culturais, produtores, artistas servidores)
- Outro (com campo de texto livre)

Cada card mostra ícone simples + nome do nicho + uma frase de identificação ("Trabalho com formação e desenvolvimento de pessoas" para Educação, etc.).

### Regras
- Seleção única (um nicho por servidor; pode ser alterada depois nas configurações de perfil).
- Salvar a escolha em `users.nicho_profissional_id`.
- Após salvar, redirecionar para Passo 3.

### Critério de sucesso
≥ 90% dos servidores que chegam a este passo selecionam um nicho (e não saem). Tempo médio nesta tela: ≤ 30 segundos.

---

## 4. PASSO 3 — CALCULADORA DE IR E POTENCIAL DE DESTINAÇÃO

### Objetivo
Mostrar concretamente quanto o servidor pode destinar e provar o argumento dos 100% de retorno com simulação visual.

### Tela exibida
Área esquerda — input do servidor:
- Pergunta: "Qual foi o valor do seu IR devido na última declaração?"
- Campo numérico com máscara monetária (R$).
- Campo opcional: "Já fez alguma destinação este ano?" (Sim/Não; se Sim, abrir campos para registrar valores e fundos já destinados)
- Botão "Calcular meu potencial".

Área direita — saída calculada (aparece após preencher):

Bloco 1 — "Quanto você pode destinar":
- Lista das 7 leis com valor disponível por cada uma:
  - Rouanet: R$ X (6% do IR devido)
  - LIE: R$ Y (7%)
  - LIR: R$ Z (6%)
  - FIA + Idoso: R$ W (6% combinado)
  - PRONON: R$ V (1%)
  - PRONAS/PCD: R$ U (1%)
- Cada lei com tooltip explicando o que financia.
- Marcador visual nos fundos prioritários para o nicho profissional do servidor (recomendação do TINA com base no Quadro 5 do PI).

Bloco 2 — "Como fica seu IR" (simulação dos dois cenários, lado a lado):
- Cenário A — Sem destinar:
  - IR devido: R$ [valor original]
  - Já retido na fonte: R$ [estimativa]
  - Restituição estimada: R$ [diferença]
- Cenário B — Destinando 6%:
  - IR devido após dedução: R$ [original − 6%]
  - Já retido na fonte: R$ [mesmo valor]
  - Restituição estimada: R$ [diferença maior]
- Linha de fechamento, em destaque visual: "Você termina com mais R$ [valor] de restituição. O bolso é o mesmo. A diferença é onde os R$ [6% destinado] foram parar."

Botão primário ao final: "Escolher um projeto agora".

### Regras
- O cálculo é local (JavaScript), não precisa de chamada ao backend.
- Limites por lei lidos da tabela `laws.max_pf_percent`.
- Se o servidor declarou no modelo simplificado, exibir alerta vermelho: "A destinação só funciona no modelo completo de declaração. Sua restituição será maior somente se você declarar no completo no próximo ano." (continua o fluxo, mas com aviso persistente).
- Se houve destinações já feitas no ano em outras plataformas, descontar do potencial disponível.

### Critério de sucesso
Tempo médio: ≤ 90 segundos. ≥ 80% dos servidores que preenchem o IR clicam em "Escolher projeto" (validação parcial de H1 do PI).

---

## 5. PASSO 4 — CATÁLOGO DE PROJETOS PERSONALIZADO

### Objetivo
Apresentar projetos relevantes ao nicho profissional do servidor, criando vínculo emocional com o impacto.

### Tela exibida
Cabeçalho: "Projetos selecionados para [Nicho do servidor]"
Subtítulo: "Cada projeto foi aprovado pelo órgão competente. Você pode destinar para um ou para vários."

Filtros laterais:
- Lei (multi-seleção: Rouanet, LIE, FIA, etc.)
- Faixa de valor mínimo (slider: R$ 50 a R$ 5.000)
- ODS vinculado (10 cards visuais clicáveis)
- Localização (cidade do servidor + opção "qualquer estado")
- Botão "Limpar filtros"

Grade de cards de projetos (3 por linha em desktop, 1 em mobile):
- Imagem do projeto (capa, com ícone do ODS sobreposto)
- Nome do projeto
- Lei e número (ex: "Rouanet — PRONAC 250347")
- Resumo em uma linha (até 80 caracteres)
- Valor mínimo sugerido
- Selo "Recomendado para você" se for da lista do nicho do servidor
- Botão secundário: "Saber mais"
- Botão primário: "Destinar para este"

### Comportamento dos cards
Ao clicar em "Saber mais", abrir modal com descrição completa, equipe, impacto estimado, fotos, vídeo, contrapartidas, prestação de contas (link), e botão "Destinar para este" no rodapé.

Ao clicar em "Destinar para este" (do card ou do modal), avançar para Passo 5 com o projeto selecionado.

### Regras
- Listar primeiro os projetos do nicho do servidor (ordem de relevância).
- Depois os outros, ordenados por proximidade geográfica.
- Mostrar pelo menos 6 projetos no primeiro carregamento.
- Lazy-loading para projetos adicionais ao rolar.

### Critério de sucesso
≥ 70% dos servidores que entram nesta tela clicam em "Destinar para este" em algum projeto. Tempo médio: ≤ 2 minutos.

---

## 6. PASSO 5 — CONFIRMAÇÃO DO VALOR

### Objetivo
Servidor define o valor exato a destinar, dentro do limite calculado no Passo 3.

### Tela exibida
Cabeçalho: "Confirmar destinação"

Bloco "Resumo":
- Projeto: [Nome do projeto] — [Número oficial]
- Lei: [Nome da lei]
- Beneficiário: [CNPJ e razão social do proponente]

Bloco "Valor":
- Slider visual com valor disponível para esta lei (mínimo R$ 50, máximo o limite calculado).
- Campo numérico com input direto também (sincronizado com o slider).
- Indicador: "Você está destinando X% do limite disponível desta lei".
- Avisos automáticos:
  - Se valor < R$ 50: "Mínimo recomendado é R$ 50 para que valha o esforço operacional."
  - Se valor > 80% do limite: "Você ainda terá R$ Y disponível em outras leis depois desta."

Bloco "O que acontece quando você confirma":
- "Você fará uma transferência via PIX de R$ [valor] para a conta oficial do projeto."
- "O dinheiro vai DIRETO ao beneficiário. A INCENTIVABR não recebe nem retém."
- "Você receberá o recibo oficial em até 48 horas, vinculado ao seu CPF."
- "Esse valor volta integralmente para você na sua declaração do IRPF do ano que vem."

Botão primário: "Continuar para o pagamento"
Botão secundário: "Voltar para escolher outro projeto"

### Regras
- Valor não pode passar do limite calculado.
- Valor mínimo: R$ 50 (ajustável por configuração).
- Multiplicador de R$ 10 (não permite centavos quebrados em valores baixos, simplifica).

### Critério de sucesso
≥ 90% dos servidores que confirmam o valor seguem para o pagamento (não voltam atrás).

---

## 7. PASSO 6 — PAGAMENTO

### Comportamento condicional
Esse passo tem dois fluxos possíveis dependendo do beneficiário:

**Fluxo A — Beneficiário cadastrado em PSP integrado (Modelo 2 — quando ativado)**

Tela mostra QR Code PIX gerado pela API do PSP em nome do beneficiário, com:
- QR Code grande, escaneável
- Botão "Copiar código PIX"
- Valor confirmado: R$ X
- Beneficiário: [CNPJ]
- Aviso: "Você tem 30 minutos para concluir o pagamento. Após esse prazo, gere um novo QR Code."
- Indicador "Aguardando pagamento..." com pulse visual
- Auto-detect via webhook: assim que o PSP confirmar o pagamento, avançar automaticamente para Passo 7.

Tempo médio neste passo: ≤ 60 segundos (tempo de o servidor abrir o app do banco, escanear, confirmar).

**Fluxo B — Beneficiário não cadastrado em PSP (Modelo 1 — fallback)**

Tela mostra os dados bancários do beneficiário em formato cópia-fácil:
- "Para destinar R$ X, faça uma transferência PIX para a conta abaixo:"
- Card com:
  - CNPJ: [com botão copiar]
  - Banco: [nome]
  - Agência: [número]
  - Conta: [número]
  - Chave PIX: [chave + botão copiar]
  - Beneficiário: [razão social]
- Instruções passo a passo:
  1. Abra o app do seu banco
  2. Vá em PIX → Transferir
  3. Cole a chave PIX ou digite os dados
  4. Confirme o valor exato: R$ X
  5. Volte aqui e suba o comprovante
- Botão primário: "Já fiz a transferência, subir comprovante"
- Link: "Tem dúvida? Fale com a TINA"

### Regras de segurança
- Em ambos os fluxos: NUNCA permitir que o servidor digite os dados bancários (eles são apresentados pela plataforma a partir do banco de dados).
- Mostrar timestamp de validação do CNPJ ("CNPJ verificado em [data]")
- Banner discreto: "Plataforma protegida pelo registro INPI BR512025000647-0 e Selo de Confiança IncentivaBR"

### Critério de sucesso
- Fluxo A: confirmação automática em ≤ 90 segundos após a tela aparecer.
- Fluxo B: ≥ 70% dos servidores que entram sobem comprovante em até 24 horas.

---

## 8. PASSO 7 — UPLOAD DO COMPROVANTE (apenas no Fluxo B)

### Objetivo
Capturar o comprovante de transferência para registro e auditoria.

### Tela exibida
Área de drop com instrução: "Arraste o comprovante aqui ou clique para selecionar"
- Aceita PDF, JPG, PNG
- Tamanho máximo: 5 MB
- Após o upload, mostrar preview com nome do arquivo e tamanho.

Validação automática (semi-OCR via TINA com Claude Vision):
- Identifica valor da transferência → bate com o valor confirmado?
- Identifica CNPJ do destinatário → bate com o CNPJ do beneficiário?
- Identifica data → dentro das últimas 48 horas?

Se todas as validações OK: status "Comprovante validado automaticamente" em verde. Avança para Passo 8.

Se alguma falha: status "Comprovante registrado, em análise manual" em amarelo. Avança para Passo 8 com flag de revisão. Admin do tenant recebe notificação para revisar.

Botão primário: "Confirmar destinação"

### Critério de sucesso
≥ 95% dos comprovantes são validados automaticamente sem intervenção humana.

---

## 9. PASSO 8 — CONFIRMAÇÃO E DASHBOARD PÓS-DESTINAÇÃO

### Objetivo
Celebrar a ação realizada, capturar o sentimento (NPS), e plantar a próxima destinação.

### Tela exibida
Animação de sucesso (3 a 5 segundos): confetti suave + ícone do projeto.

Mensagem central: "Pronto, [primeiro nome]! Sua destinação de R$ X para [Nome do projeto] está registrada."

Bloco "Próximos passos automatizados pela plataforma":
- ✓ Recibo oficial em nome de [CPF] será enviado em até 48h
- ✓ Comprovante de transferência arquivado no seu painel
- ✓ Lembrete agendado para março/2027 com instruções de declaração no IRPF
- ✓ Atualizações sobre o impacto do projeto chegarão por e-mail

Bloco "Sua jornada de destinador":
- Total destinado em 2026: R$ X (de R$ Y disponível)
- Projetos apoiados: [N]
- Impacto agregado estimado: [frase com números, ex: "Você ajudou 3 jovens a ter acesso a oficinas de música"]

Bloco "Que tal destinar para mais um?":
- Mostra um próximo projeto recomendado, do mesmo nicho ou complementar.
- Botão "Destinar para este também" (volta para Passo 5 com o novo projeto).

Pop-up NPS após 24 horas: "De 0 a 10, o quanto você recomendaria a IncentivaBR para um colega?"

### Regras
- Salvar registro completo em `donations`: user_id, project_id, lei_id, valor, comprovante_url, recibo_url (a preencher), status, timestamps, hash de auditoria.
- Disparar e-mail para o beneficiário do projeto: "Você recebeu uma destinação. Emita o recibo oficial em até 48h."
- Disparar e-mail para o servidor: "Sua destinação foi registrada. Acompanhe pelo seu painel."
- Agendar tarefa de lembrete em março de 2027 (job de cron).
- Registrar evento de analytics para tracking de funil.

### Critério de sucesso
- ≥ 30% dos servidores clicam em "Destinar para este também" e começam um novo fluxo.
- NPS médio ≥ 70 (validação parcial do KPI de equilíbrio 2 do PI).

---

## 10. JORNADA DE FOLLOW-UP

### Após 24 horas da destinação
E-mail: "Recibo oficial em emissão. Status: aguardando o beneficiário."

### Após 48 horas
- Se recibo recebido: e-mail "Seu recibo está pronto, baixe aqui."
- Se NÃO recebido: tarefa interna sobe alerta para o admin do tenant entrar em contato com o beneficiário.

### Após 7 dias
E-mail: "Como o seu projeto está indo? [resumo de execução com link para o painel do projeto]"

### Em março/2027 (4 meses antes da declaração)
E-mail: "Hora de declarar! Seu kit de destinação está pronto" — anexa todos os recibos, comprovantes, e tutorial de como preencher no DIRPF.

### Em abril/2027 (mês da declaração)
WhatsApp + e-mail: "Faltam X dias para declarar. Lembra-se da sua destinação? Aqui está o passo a passo."

### Em maio/2027 (após declarar)
E-mail: "Confirmação: sua restituição deve ser maior em R$ Y por conta da destinação. Que tal já planejar 2027?" (gancho para retenção).

---

## 11. REGRAS DE NEGÓCIO INVARIANTES

R1 — A INCENTIVABR nunca toca no dinheiro do servidor. Em qualquer modelo (manual, PSP integrado, Open Finance), o real vai direto da conta do servidor para a conta do beneficiário. Plataforma é canal técnico, não custodiante.

R2 — O recibo oficial dedutível é emitido pelo BENEFICIÁRIO, não pela INCENTIVABR. Plataforma orquestra a coleta e disponibiliza para o servidor.

R3 — Limites por lei são respeitados rigorosamente. Sistema bloqueia destinação que ultrapasse o limite calculado. Se o servidor já destinou em outras plataformas no mesmo ano, ele declara isso e o sistema desconta do potencial.

R4 — Servidor em modelo simplificado de declaração é avisado mas não impedido. A plataforma documenta que o aviso foi exibido e aceito.

R5 — Dados bancários do beneficiário só aparecem para o servidor após autenticação. Nunca em URLs públicas ou e-mails desautenticados.

R6 — Toda destinação tem trilha de auditoria imutável (append-only) com hash SHA-256, conforme seção 3.5 do PI.

R7 — A regra de soma de grupos (Grupo 1 = 6% combinado, Grupo 2 = 2% combinado) NÃO é apresentada como informação primária no primeiro contato. Cada lei é mostrada com seu percentual individual. A regra combinada vira aviso silencioso da calculadora apenas quando o servidor tentar destinar para múltiplos fundos do mesmo grupo.

R8 — Toda comunicação sobre "100% retorna na declaração" inclui o disclaimer "no modelo completo de declaração".

---

## 12. COMPONENTES VISUAIS-CHAVE

| Componente | Onde aparece | Comportamento |
|------------|--------------|---------------|
| Barra de progresso 1/6 | Cabeçalho de cada passo | Visualmente preenche conforme avança |
| Botão primário | Toda tela | Cor de destaque do tenant, hover claro |
| Card de projeto | Catálogo, modais | Imagem + ODS + selo "Recomendado" |
| Calculadora dual cenário | Passo 3 | Comparação visual lado a lado |
| QR Code PIX | Passo 6 | Centralizado, ≥ 200x200px |
| Selo de confiança INPI | Footer e Passo 6 | Discreto mas presente |
| Avatar TINA flutuante | Toda tela | Click abre chat contextual |

---

## 13. INTEGRAÇÃO TINA NO FLUXO

A TINA (Tax Incentive Navigator Assistant) está disponível em todas as etapas como bolha flutuante. Comportamentos contextuais:

- Passo 2: "Não sabe qual marcar? Me conta o que você faz e eu te ajudo a achar o nicho."
- Passo 3: "Quer entender por que 100% volta? Posso te explicar com seu próprio caso."
- Passo 4: "Quer um projeto que combine com sua história? Me conta o que te toca."
- Passo 5: "Posso te ajudar a decidir quanto destinar com base no seu perfil."
- Passo 6: "Confuso com PIX? Vou te guiar passo a passo."
- Passo 8: "Já pensou em destinar pra mais alguma causa? Te mostro opções."

TINA tem acesso ao banco (laws, law_categories, law_vedacoes, projects, nichos_profissionais, donation history do usuário) e responde sempre com fundamentação. Quando não souber, encaminha para suporte humano.

---

## 14. CRITÉRIOS DE SUCESSO DO FLUXO COMPLETO (validação H1 e H2 do PI)

| Métrica | Meta piloto |
|---------|-------------|
| Taxa de cadastro → início da calculadora (H1) | ≥ 80% |
| Taxa de início → destinação concluída (H2) | ≥ 60% |
| Tempo médio total do fluxo (Passo 1 ao 8) | ≤ 5 minutos |
| Taxa de validação automática de comprovante | ≥ 95% |
| NPS pós-destinação | ≥ 70 |
| Taxa de segunda destinação (Passo 8 → novo Passo 5) | ≥ 30% |
| Taxa de retorno no ano seguinte | ≥ 75% |

---

## 15. EDGE CASES E TRATAMENTOS

- Servidor abandona no meio do fluxo: salvar progresso em sessão, e-mail de retomada após 24h.
- Servidor confirma valor mas não paga: tarefa de follow-up em 48h, depois cancela transação.
- Comprovante upado não bate com o esperado: análise manual pelo admin do tenant.
- Beneficiário não emite recibo em 48h: alerta interno, comunicação ativa com o cliente proponente.
- Lei muda durante a sessão (atualização de IN): bloquear novas destinações temporariamente, exibir aviso.
- Servidor tenta destinar para projeto fora do tenant dele: redirecionar para a vitrine pública DestineAI.

---

## 16. DEPENDÊNCIAS TÉCNICAS

- `tenant.js` carregado e funcionando no boot da página.
- Tabela `laws` populada (migration 018 já aplicada).
- Tabela `nichos_profissionais` populada (migration 020 a aplicar).
- API `/api/laws/:slug/rules` disponível.
- API `/api/projects?nicho=X&lei=Y` disponível.
- API `/api/calculate-ir` para cálculo dos cenários.
- API `/api/donations` para registro.
- TINA conectada ao banco e ao Claude SDK.
- PSP configurado (Iugu) para Fluxo A do Passo 6 quando ativado.
- PDFKit para geração de comprovantes.

---

**Fim da spec.** Esse documento é a versão 1.0 do fluxo. Cada iteração de teste com servidores reais durante o piloto deve gerar revisões pontuais, registradas como versões 1.1, 1.2 etc.
