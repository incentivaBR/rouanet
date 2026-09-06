# PRD — Product Requirements Document

> Extraído do CLAUDE.md em 06/09/2026, sem alteração de conteúdo. O CLAUDE.md passa a ser só a memória operacional do projeto; o PRD vive aqui.
>
> Atenção: a stack descrita na seção 4 (React, Supabase, Auth0, Vercel) nunca foi construída. O que existe é Node/Express + PostgreSQL + HTML sem build, na Railway. Ver README.md.

> Fonte: PRD_IncentivaBR_v1.md | Versão 1.0 | Março 2026
> Registro INPI: BR512025000647-0 | Vinculação: MBA IA & Analytics — FGV (PA II)
> Status: Em desenvolvimento — Piloto: Maio/Jun 2026 | Classificação: Confidencial

---

## 1. Propósito da Plataforma

#### Visão Geral
O IncentivaBR é uma plataforma digital que conecta contribuintes brasileiros (PF/PJ) a oportunidades de destinação de recursos via incentivos fiscais federais — Lei Rouanet, Lei do Esporte, FIA/FCA, FDS, PRONON, PRONAS, Fundo Nacional do Idoso, entre outros.

A proposta central é transformar a destinação de recursos tributários em um processo simples, orientado e automatizado via inteligência artificial.

#### Problema que Resolve
O Brasil possui mais de R$ 20 bilhões anuais disponíveis para destinação via incentivos fiscais, mas a maioria dos contribuintes elegíveis não utiliza esses mecanismos por três barreiras:
- **Complexidade técnica:** regras distintas por mecanismo, formulários e sistemas governamentais fragmentados
- **Desconhecimento:** contribuintes não sabem que podem destinar parte do IR já devido sem custo adicional
- **Fricção operacional:** processo manual, burocrático e sujeito a erros

#### Proposta de Valor
- **Simulação personalizada:** quanto o contribuinte pode destinar e para quais mecanismos
- **Matching inteligente:** conexão entre perfil do doador e projetos/causas elegíveis
- **Orientação guiada por IA:** passo a passo para efetivação da destinação
- **Painel de impacto:** visualização do impacto social gerado pela destinação

#### Contexto Acadêmico — PA II / FGV
Este PRD serve simultaneamente como documento técnico do MVP e estrutura do Projeto Aplicado II (PA II) do MBA em IA e Analytics da FGV, com entrega prevista para junho de 2026. O piloto será conduzido com 40 a 70 participantes simulados, utilizando APIs mockadas do Gov.br e validação via Google Forms.

---

## 2. Hipóteses de Validação (H1 e H2)

#### H1 — Hipótese de Usabilidade e Compreensão
**Afirmação:** Contribuintes sem conhecimento prévio sobre incentivos fiscais conseguem, com o auxílio da plataforma IncentivaBR, compreender e iniciar o processo de destinação de recursos em até 10 minutos.

| Elemento | Descrição |
|---|---|
| Variável independente | Uso da plataforma IncentivaBR (vs. sem plataforma) |
| Variável dependente | Taxa de compreensão do processo e intenção de destinar |
| Métrica primária | ≥ 70% dos participantes completam a simulação sem abandono |
| Métrica secundária | Score de compreensão ≥ 4/5 no pós-teste |
| Instrumento | Google Forms — pré-teste + pós-teste |
| Critério de validação | Variação estatisticamente significativa entre pré e pós-teste |

#### H2 — Hipótese de Propensão à Destinação
**Afirmação:** Contribuintes que utilizam o IncentivaBR apresentam maior propensão a efetivar a destinação de recursos do que os que não utilizam.

| Elemento | Descrição |
|---|---|
| Variável independente | Acesso à plataforma com simulação personalizada |
| Variável dependente | Intenção declarada de destinar recursos (escala Likert 1–5) |
| Métrica primária | Score médio de intenção ≥ 4,0 no grupo experimental |
| Métrica secundária | Diferença de ≥ 1,5 pontos entre grupo experimental e controle |
| Instrumento | Google Forms — questões de intenção comportamental |
| Critério de validação | p-valor ≤ 0,05 no teste estatístico aplicado |

#### Design do Piloto

| Parâmetro | Especificação |
|---|---|
| Período de execução | Maio 2026 (4 semanas) |
| Total de participantes | 40 a 70 (simulados/beta-testers) |
| Grupos | Experimental (com plataforma) e Controle (sem plataforma) |
| Recrutamento | Rede profissional, LinkedIn, grupos FGV/UnB |
| Incentivo | Certificado de beta-tester + crédito "Founders" na plataforma |
| Ambiente | MVP com APIs Gov.br mockadas |
| Coleta de dados | Google Forms (pré-teste D0 + pós-teste D30) |
| Análise | Teste t pareado / Mann-Whitney conforme distribuição |

---

## 3. Funcionalidades do MVP

#### In Scope

| ID | Funcionalidade | Prioridade | Descrição |
|---|---|---|---|
| F01 | Onboarding guiado | Alta | Cadastro simplificado com perfil do contribuinte (PF/PJ, faixa de renda/faturamento) |
| F02 | Simulador fiscal | Alta | Cálculo do potencial de destinação baseado no perfil (IR devido estimado) |
| F03 | Matching de projetos | Alta | Sugestão de projetos/causas elegíveis com base em preferências do usuário |
| F04 | Guia passo a passo | Alta | Orientação sequencial para efetivação da destinação (IA conversacional) |
| F05 | Painel do contribuinte | Média | Dashboard com simulações salvas e histórico de intenções |
| F06 | Coleta de feedback | Alta | Integração com Google Forms para pré/pós-teste do piloto |
| F07 | Autenticação | Alta | Login via Auth0 (mock Gov.br no piloto) |
| F08 | Relatório de impacto | Média | Visualização do impacto social estimado da destinação |

#### Out of Scope
- Integração real com sistemas Gov.br / Receita Federal (apenas mock no piloto)
- Processamento de pagamentos ou movimentação financeira real
- App mobile nativo (apenas web responsivo)
- Módulo para gestores de projetos culturais/esportivos (fase futura)
- Integração com contabilidade e ERP

#### Jornada do Usuário (User Flow Principal)

| Etapa | Ação do Usuário | Ação do Sistema |
|---|---|---|
| 1. Acesso | Entra na plataforma | Apresenta proposta de valor e CTA de simulação |
| 2. Perfil | Informa perfil (PF/PJ, renda estimada) | Calcula potencial de destinação |
| 3. Descoberta | Visualiza valor disponível para destinar | Exibe simulação personalizada e mecanismos elegíveis |
| 4. Matching | Escolhe causas de interesse | Sugere projetos compatíveis com filtros aplicados |
| 5. Orientação | Solicita guia de destinação | IA gera passo a passo personalizado |
| 6. Confirmação | Declara intenção de destinar | Registra intenção e agenda lembrete |
| 7. Feedback | Responde pós-teste | Coleta dados para validação de H1 e H2 |

---

## 4. Arquitetura e Agentes de IA

#### Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express |
| IA / LLM | Claude API (Anthropic) — modelo: `claude-sonnet-4-6` |
| Autenticação | Auth0 (mock Gov.br no piloto) |
| Banco de dados | Supabase (PostgreSQL) |
| Formulários | Google Forms + Apps Script |
| Armazenamento | Google Drive |
| Deploy | Vercel (frontend) + Railway (backend) |
| APIs Gov.br | Mockadas no piloto → reais na produção |

#### Agentes de IA e Responsabilidades

| Agente | Função | Input | Output |
|---|---|---|---|
| Simulador | Calcula potencial de destinação fiscal | Perfil do contribuinte (PF/PJ, renda) | Valor estimado por mecanismo |
| Matching | Sugere projetos elegíveis | Preferências + mecanismos elegíveis | Lista ranqueada de projetos |
| Orientador | Guia passo a passo da destinação | Mecanismo escolhido + perfil | Roteiro personalizado de ação |
| Compliance | Valida conformidade LGPD e fiscal | Dados do usuário + regras | Alertas e orientações de conformidade |
| Relatório | Gera painel de impacto | Destinação confirmada | Visualização de impacto social estimado |

#### Regras Inegociáveis dos Agentes
- Todo agente recebe: este CLAUDE.md + system prompt específico + dados do usuário da sessão
- Agentes **NUNCA** inventam valores de incentivo fiscal — usar apenas base de conhecimento validada
- Agentes **NUNCA** dão orientação jurídica ou contábil definitiva
- Formato de saída: sempre em português brasileiro, linguagem acessível (não técnica)
- A plataforma **NÃO** processa pagamentos nem movimenta recursos financeiros reais
- A plataforma **NÃO** substitui contador ou advogado — sempre incluir disclaimer

#### Estratégia de Contexto (Anti-Alucinação)
Cada agente recebe contexto estruturado via sistema de prompts:
1. **CLAUDE.md:** regras de negócio, glossário fiscal e restrições
2. **PRD:** escopo, funcionalidades e hipóteses de validação
3. **System prompt por agente:** papel, limitações e formato de saída
4. **Dados do usuário:** perfil e histórico da sessão
5. **Base de conhecimento:** legislação atualizada dos mecanismos de incentivo fiscal

---

## 5. LGPD e Compliance

#### Dados Coletados e Base Legal

| Dado | Finalidade | Base Legal (LGPD) | Retenção |
|---|---|---|---|
| Nome e e-mail | Autenticação e comunicação | Art. 7º, V (execução de contrato) | Enquanto conta ativa |
| Perfil fiscal (renda estimada) | Simulação de destinação | Art. 7º, IX (legítimo interesse) | Sessão + 12 meses |
| Preferências de causas | Matching de projetos | Art. 7º, I (consentimento) | Enquanto conta ativa |
| Dados de uso da plataforma | Melhoria do produto e pesquisa PA II | Art. 7º, I (consentimento) | 24 meses |
| Respostas do Google Forms | Validação H1/H2 (pesquisa acadêmica) | Art. 7º, IV (pesquisa) | Até defesa + 5 anos |

#### Medidas de Proteção
- Dados do piloto são anonimizados antes da análise estatística
- Nenhum dado fiscal real é processado no piloto (apenas estimativas declaradas)
- Consentimento explícito coletado no onboarding e no formulário do piloto
- Direito de exclusão de dados garantido a qualquer momento
- Dados de pesquisa acadêmica tratados conforme Resolução CNS 510/2016

#### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Coleta de dados fiscais sem base legal | Média | Alto | Restringir ao piloto apenas estimativas declaradas |
| Vazamento de dados de beta-testers | Baixa | Alto | Criptografia em trânsito e repouso; Auth0 |
| IA gerar orientação fiscal incorreta | Média | Alto | Disclaimer: plataforma não substitui contador/advogado |
| Uso indevido dos dados para fins comerciais | Baixa | Médio | Carta-acordo com coautores + Termo de Uso |
| Não conformidade com LGPD na pesquisa | Baixa | Alto | Anonimização + orientação do professor FGV |

---

## 6. Métricas de Sucesso

#### Métricas do Piloto (PA II / FGV)

| Métrica | Meta | Instrumento | Prazo |
|---|---|---|---|
| Taxa de conclusão da simulação | ≥ 70% | Analytics da plataforma | Jun 2026 |
| Score de compreensão (H1) | ≥ 4,0 / 5,0 | Google Forms pós-teste | Jun 2026 |
| Intenção de destinar (H2) | Score médio ≥ 4,0 | Google Forms pós-teste | Jun 2026 |
| NPS dos beta-testers | ≥ 40 | Google Forms | Jun 2026 |
| Participantes que completam o fluxo | ≥ 30 (de 40–70) | Analytics | Jun 2026 |
| Taxa de resposta do pós-teste | ≥ 80% dos participantes | Google Forms | Jun 2026 |

#### Cronograma do PA II

| Fase | Período | Entregas |
|---|---|---|
| Preparação | Abril 2026 | MVP funcional, formulários, recrutamento, CLAUDE.md atualizado |
| Piloto | Maio 2026 | Execução com 40–70 participantes, coleta pré/pós-teste |
| Análise e escrita | Junho 2026 | Análise estatística H1/H2, relatório final PA II, defesa FGV |
| Pós-defesa | Julho 2026+ | Avaliação de escala, parcerias estratégicas, versão pública |

---

## 7. Decisões em Aberto
- Definir professor orientador do PA II e alinhar estrutura metodológica
- Confirmar coautores do PA II: Diego Morais, Gabriel Cavichioli, Vilander Massao
- Validar disclaimer jurídico com advogada: Maria Rita Dornas, OAB/DF 4.952
- Definir critérios de inclusão de projetos no matching do MVP
- Avaliar inclusão do FNAS como mecanismo elegível (Motion 21 — 14ª CNEAS)

