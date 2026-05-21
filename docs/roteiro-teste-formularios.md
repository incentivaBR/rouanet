# Roteiro de Teste — Formulários FGV (Pré + Pós)

**Objetivo:** testar todos os caminhos possíveis para identificar onde participantes travam.
**Links:**
- Pré-teste: https://forms.gle/aUDyt5AbVL7nW8EA9
- Pós-teste: https://forms.gle/bGTxUvR39MECNBMC9
- Piloto: https://destineai.com.br/frontend/piloto-start.html

---

## PROBLEMA REPORTADO

> Participantes não conseguem passar da **Pergunta 3** do pré-teste (sobre modelo da declaração IR).

**Causa mais provável:** a seção intermediária para "modelo simplificado" está configurada como **"Enviar formulário"** em vez de **"Ir para a próxima seção"**.

---

## COMO ACESSAR AS CONFIGURAÇÕES NO GOOGLE FORMS

1. Abra o formulário em modo edição (como proprietário)
2. Clique na seção intermediária criada para o SIMPLIFICADO
3. No rodapé da seção, verifique o dropdown:
   - ❌ Se estiver "Enviar formulário" → **troca para "Ir para a próxima seção"** (ou a seção correta)
   - ✅ Deve estar na seção que contém a Pergunta 4 (contador)
4. Repetir verificação para todas as seções com ramificação

---

## PRÉ-TESTE — CAMINHOS A TESTAR

Use um código anônimo diferente para cada teste (ex: TST01, TST02, TST03, TST04).

### CAMINHO A — Contador faz, modelo completo (elegível)
| Pergunta | Resposta a escolher |
|---|---|
| P1 — Área | Qualquer (ex: Educação) |
| P2 — Tempo servidor | Qualquer (ex: De 3 a 10 anos) |
| **P3 — Como declara** | **"Meu contador faz para mim"** |
| P4 — Contador falou sobre destinação? | Nunca conversamos |
| P5 — Sabia que pode destinar? | Não sabia nada |
| P6 — Canal (opcional) | Pular |
| P7 — Intenção 0-10 | 5 |
| P8 — O que impediria? (opcional) | Parece burocrático demais |
| P9 — Dificuldade sem sistema | 3 |

**Resultado esperado:** formulário envia normalmente sem travar. ✅

---

### CAMINHO B — Faz sozinho, modelo COMPLETO (elegível)
| Pergunta | Resposta a escolher |
|---|---|
| P1 — Área | Qualquer |
| P2 — Tempo servidor | Qualquer |
| **P3 — Como declara** | **"Faço sozinho — uso o modelo COMPLETO"** |
| P4 → P9 | Qualquer resposta válida |

**Resultado esperado:** fluxo normal sem seção intermediária. ✅

---

### CAMINHO C — Faz sozinho, modelo SIMPLIFICADO ⚠️ CAMINHO COM BUG REPORTADO
| Pergunta | Resposta a escolher |
|---|---|
| P1 — Área | Qualquer |
| P2 — Tempo servidor | Qualquer |
| **P3 — Como declara** | **"Faço sozinho — uso o modelo SIMPLIFICADO"** |

**O que deve acontecer:**
1. Aparece aviso: *"Para destinar IR para projetos culturais, é necessário usar o modelo COMPLETO..."*
2. Há botão para **continuar para a Pergunta 4** (NÃO encerra o formulário)
3. Sequência continua normalmente até P9 e envio

**O que provavelmente está acontecendo:**
- A seção do aviso está com "**Enviar formulário**" → formulário encerra aqui
- Ou a seção não tem botão "Próximo" → participante fica preso

**Como verificar no editor do Forms:**
- Vá para a seção do aviso → rodapé da seção → verificar destino → deve ser a seção da P4, NÃO "Enviar formulário"

**Fix:**
- Alterar destino da seção intermediária para a seção que contém P4 (contador)

---

### CAMINHO D — Não declara / isento ⚠️ CAMINHO SEM RAMIFICAÇÃO DEFINIDA
| Pergunta | Resposta a escolher |
|---|---|
| P1 — Área | Qualquer |
| P2 — Tempo servidor | Qualquer |
| **P3 — Como declara** | **"Não declaro / sou isento"** |

**O que deve acontecer:**
- Aviso: *"Inelegível para destinação, mas sua percepção ainda é valiosa"*
- Continua para P4 normalmente (ou encerra com mensagem amigável)

**O que pode estar acontecendo:**
- Sem ramificação configurada → vai para P4 normalmente (pode funcionar)
- Ou cai na mesma seção do SIMPLIFICADO → mesmo bug do Caminho C

**Ação:** testar este caminho e verificar se vai para alguma seção que trava.

---

## PÓS-TESTE — CAMINHOS A TESTAR

Use o mesmo código anônimo de um dos testes acima (ex: TST01).

### CAMINHO E — Completou tudo
| Pergunta | Resposta a escolher |
|---|---|
| P1 — Completou o fluxo? | "Sim, completei tudo" |
| P2 — Onde parou? (opcional) | Pular |
| P3 — Quanto tempo? | Entre 3 e 5 minutos |
| P4 — Facilidade 1-5 | 4 |
| P5 — Intenção pós 0-10 | 8 |
| P6 — O que mudou? | Entendi que é mais simples... |
| P7 — O que faria a seguir? | Faria a destinação real |
| P8 — Indicação do contador seria suficiente? | Sim |
| P9 — NPS 0-10 | 9 |
| P10 — Outros fundos? | Esporte |
| P11 — Comentário (opcional) | Pular |

**Resultado esperado:** envio sem travar. ✅

---

### CAMINHO F — Não completou
| Pergunta | Resposta a escolher |
|---|---|
| P1 — Completou o fluxo? | "Completei a maior parte, mas parei em algum ponto" |
| P2 — Onde parou? | "Travou no login" |
| P3 → P11 | Qualquer válida |

**Resultado esperado:** envio sem travar. ✅

---

## CHECKLIST DE VERIFICAÇÃO NO EDITOR DO FORMS

### Pré-teste
- [ ] P3 (SIMPLIFICADO) → seção intermediária → destino = seção da P4 (**NÃO** "Enviar formulário")
- [ ] P3 (Não declaro) → verifica se há ramificação ou segue fluxo normal
- [ ] Seção intermediária do SIMPLIFICADO → tem botão "Próximo" visível?
- [ ] P6 (canal de descoberta) → configurada como opcional (não bloqueia)
- [ ] P8 (o que impediria) → configurada como opcional (não bloqueia)
- [ ] Confirmação de envio → mostra mensagem de agradecimento, NÃO redireciona automaticamente

### Pós-teste
- [ ] P2 (onde parou) → configurada como opcional
- [ ] P11 (comentário) → configurada como opcional
- [ ] Nenhuma seção com destino "Enviar formulário" no meio do fluxo

---

## RESUMO DOS FIXES PRIORITÁRIOS

1. **URGENTE** — Seção intermediária do SIMPLIFICADO (Pré P3): trocar destino de "Enviar formulário" para "Próxima seção (P4)"
2. **VERIFICAR** — Caminho "Não declaro": definir ramificação explícita
3. **VERIFICAR** — Todos os campos opcionais estão marcados como não-obrigatórios no Forms

---

*Criado: 2026-05-21 — baseado em relatos de participantes travando na P3 do pré-teste*
