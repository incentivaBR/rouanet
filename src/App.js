import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, Bot, Calculator, Heart, Send, Sparkles, Shield, Target, Brain, Info, CheckCircle, AlertCircle, BookOpen, Users, Calendar, Phone, HelpCircle } from 'lucide-react';

const AssistenteTINA = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState({});
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [chatMode, setChatMode] = useState('welcome');
  const messagesEndRef = useRef(null);

  // BASE DE CONHECIMENTO EXPANDIDA - DÚVIDAS ESPECÍFICAS DE SERVIDORES
  const serverKnowledge = {
    "desconto na fonte": {
      keywords: ["desconto na fonte", "imposto retido", "salario", "contracheque", "fonte"],
      answer: "✅ **Sim! Desconto na fonte não impede destinação!**\n\n**📋 COMO FUNCIONA:**\n• Imposto retido na fonte ≠ Imposto devido\n• O que importa é o IR devido na declaração anual\n• Destinação é baseada no cálculo final da declaração\n\n**💰 EXEMPLO PRÁTICO:**\n• Servidor tem R$ 12.000 retidos no ano\n• Na declaração: IR devido = R$ 8.000\n• Destinação possível: R$ 480 (6% de R$ 8.000)\n• Diferença vira restituição\n\n**🎯 PROCESSO:**\n1. Faça sua declaração normalmente\n2. Veja o \"Imposto Devido\" final\n3. Calcule 6% desse valor\n4. Faça a destinação\n\n**💡 DICA TINA:** Servidores frequentemente têm restituição + destinação!"
    },
    "dividir entre fundos": {
      keywords: ["dividir", "varios fundos", "multiplos projetos", "sublimites", "várias causas"],
      answer: "🎯 **Sim! Pode dividir entre várias causas!**\n\n**📊 DISTRIBUIÇÃO DOS 6%:**\n• **Criança/Adolescente:** Até 3%\n• **Idoso:** Até 3%\n• **Cultura:** Até 1%\n• **Esporte:** Até 1%\n• **Total máximo:** 6%\n\n**💰 EXEMPLO PRÁTICO (IR devido R$ 10.000):**\n• Criança: R$ 200 (2%)\n• Idoso: R$ 150 (1.5%)\n• Cultura: R$ 100 (1%)\n• Esporte: R$ 100 (1%)\n• **Total:** R$ 550 em 4 causas diferentes!\n\n**🎯 ESTRATÉGIA INTELIGENTE:**\n• Diversifique seu impacto\n• Escolha causas que te motivam\n• Respeite os sublimites\n• Acompanhe múltiplos projetos\n\n**💡 DICA TINA:** Diversificação = maior impacto social!"
    },
    "malha fina": {
      keywords: ["malha fina", "risco", "auditoria", "fiscalizacao", "problema"],
      answer: "🛡️ **Zero risco se fizer tudo certo!**\n\n**✅ COMO EVITAR PROBLEMAS:**\n• Respeite o limite de 6%\n• Guarde TODOS os comprovantes\n• Escolha apenas projetos aprovados\n• Informe valores corretos\n• Mantenha documentação organizada\n\n**📋 DOCUMENTOS IMPORTANTES:**\n• Recibos de destinação\n• Comprovantes dos projetos\n• Extrato da declaração\n• Protocolo da Receita Federal\n\n**⚠️ O QUE PODE GERAR PROBLEMA:**\n• Ultrapassar limite de 6%\n• Destinar para projetos não aprovados\n• Não ter comprovantes\n• Informar valores incorretos\n\n**💡 DICA TINA:** Destinação legal + documentação = tranquilidade total!"
    },
    "consignacao": {
      keywords: ["consignacao", "desconto folha", "ja contribuo", "conta para limite", "folha pagamento"],
      answer: "📋 **Sim! Consignação conta para os 6%!**\n\n**✅ COMO FUNCIONA:**\n• Contribuições via folha de pagamento\n• Devem ser informadas na declaração\n• Contam para o limite de 6%\n• Reduzem o valor disponível para outras destinações\n\n**💰 EXEMPLO SERVIDOR:**\n• IR devido: R$ 12.000\n• Limite total (6%): R$ 720\n• Já contribui via folha: R$ 300\n• Disponível para destinar: R$ 420\n\n**🎯 VANTAGEM:**\n• Desconto automático na folha\n• Maior controle e planejamento\n• Pode combinar com outras destinações\n\n**💡 DICA TINA:** Consignação + destinação = impacto maximizado!"
    },
    "outra cidade": {
      keywords: ["outra cidade", "estado diferente", "domicilio fiscal", "onde trabalho", "qualquer lugar"],
      answer: "🌍 **Sim! Pode destinar para qualquer lugar do Brasil!**\n\n**📍 LIBERDADE GEOGRÁFICA:**\n• Destinação é nacional, não local\n• Pode escolher projetos de qualquer estado/cidade\n• Não precisa ser onde mora ou trabalha\n• IR é federal, não estadual/municipal\n\n**🎯 EXEMPLOS PRÁTICOS:**\n• Servidor em Brasília → Projeto no Amazonas\n• Trabalha em SP → Destina para projeto no RN\n• Mora no RS → Apoia causa no CE\n\n**💡 ESTRATÉGIAS INTELIGENTES:**\n• Apoie sua cidade natal\n• Foque em regiões mais necessitadas\n• Escolha projetos com maior impacto\n\n**💡 DICA TINA:** Seu IR pode transformar vidas em todo o Brasil!"
    },
    "projeto aprovado": {
      keywords: ["projeto aprovado", "credenciado", "verificar projeto", "confiavel", "como saber"],
      answer: "🔍 **Como Verificar se Projeto é Aprovado:**\n\n**📋 FONTES OFICIAIS:**\n• **SALIC** (Cultura): salic.cultura.gov.br\n• **SIPIA** (Criança): sipia.mj.gov.br\n• **SIFUNID** (Idoso): mds.gov.br\n• **SIESPORTE** (Esporte): esporte.gov.br\n\n**✅ VERIFICAÇÕES ESSENCIAIS:**\n• Projeto tem número de aprovação\n• Consta nas listas oficiais\n• Status \"ativo\" nos sistemas\n• Prestação de contas em dia\n\n**🚨 SINAIS DE ALERTA:**\n• Não tem número oficial\n• Promete benefícios extras\n• Cobra taxas ou comissões\n\n**💡 DICA TINA:** Se tem dúvida, não destine! Escolha apenas projetos 100% verificados."
    },
    "restituicao": {
      keywords: ["restituir", "restituicao", "imposto a receber", "receber de volta"],
      answer: "💰 **Sim! Restituição + Destinação funcionam juntas!**\n\n**📊 COMO FUNCIONA:**\n• Destinação aumenta sua restituição\n• Ou diminui valor a pagar\n• Governo \"soma\" a destinação\n\n**💰 EXEMPLO PRÁTICO:**\n• IR retido: R$ 15.000\n• IR devido: R$ 12.000\n• Restituição inicial: R$ 3.000\n• Destinação: R$ 720 (6%)\n• **Nova restituição: R$ 3.720**\n\n**🎯 CENÁRIOS:**\n• **TEM RESTITUIÇÃO:** Destinação aumenta restituição\n• **TEM A PAGAR:** Destinação diminui valor a pagar\n\n**💡 DICA TINA:** Destinação sempre compensa!"
    },
    "sigepe": {
      keywords: ["sigepe", "sistema governo", "programa oficial"],
      answer: "💻 **SIGEPE + Programa da Receita = Processo Completo**\n\n**📋 COMO FUNCIONA:**\n• **SIGEPE:** Acessa seus dados como servidor\n• **Programa IRPF:** Faz declaração e destinação\n• São sistemas complementares\n\n**🔄 PROCESSO CORRETO:**\n1. **SIGEPE:** Baixa seus dados\n2. **Programa IRPF:** Importa dados do SIGEPE\n3. **NO IRPF:** Completa declaração\n4. **NO IRPF:** Faz destinação\n5. **Envia:** Declaração completa\n\n**⚠️ IMPORTANTE:**\n• Destinação DEVE ser no programa oficial da Receita\n• SIGEPE não faz destinação\n\n**💡 DICA TINA:** SIGEPE facilita, mas destinação é sempre no programa oficial!"
    }
  };

  // BASE DE CONHECIMENTO EXPANDIDA DA TINA
  const knowledgeBase = {
    // Perguntas Frequentes sobre Destinação
    faq: {
      "posso destinar se já doei": {
        keywords: ["doei", "doação", "igreja", "ong", "já doei"],
        answer: "💰 **Sim, você pode destinar mesmo tendo feito doações!**\n\n**📋 REGRA IMPORTANTE:**\n• Doações regulares (igreja, ONGs) são **DIFERENTES** da destinação de IR\n• Destinação é **obrigatória** via governo (6% do IR devido)\n• Doações são **voluntárias** e têm outros limites\n\n**💡 NA PRÁTICA:**\n• Você pode doar para igreja E destinar IR para projetos aprovados\n• São processos separados e complementares\n• Ambos são 100% dedutíveis (em limites diferentes)\n\n**🎯 RESULTADO:** Maximize seu impacto social!"
      },
      "o que acontece se eu nao destinar": {
        keywords: ["não destinar", "não usar", "o que acontece", "obrigatório"],
        answer: "🤔 **Se você não destinar, o dinheiro vai para o governo mesmo!**\n\n**📊 O QUE ACONTECE:**\n• Você paga o IR normalmente\n• O governo decide onde aplicar o dinheiro\n• Você perde a chance de escolher o destino\n\n**💰 NÚMEROS REAIS:**\n• Brasileiro médio perde R$ 500-1.500/ano em destinação\n• Multiplicado por milhões = bilhões não direcionados\n• Projetos sociais ficam sem recursos diretos\n\n**🎯 CONCLUSÃO:**\n• Não é obrigatório destinar\n• Mas é uma **oportunidade perdida** de impacto social\n• Mesmo valor de imposto, com propósito definido!\n\n**💡 DICA TINA:** Por que não aproveitar?"
      },
      "posso cancelar destinacao": {
        keywords: ["cancelar", "desistir", "mudar", "arrependi"],
        answer: "⚠️ **Depende do momento da destinação!**\n\n**📅 PRAZOS PARA CANCELAR:**\n\n**✅ DURANTE O ANO:**\n• Até 31/12: Pode cancelar/alterar\n• Processo via sistema da Receita Federal\n• Requer justificativa formal\n\n**❌ APÓS DECLARAÇÃO:**\n• Depois de enviar DIRPF: Muito difícil cancelar\n• Só com retificação da declaração\n• Pode ter complicações fiscais\n\n**🎯 ESTRATÉGIA TINA:**\n• Pesquise bem antes de destinar\n• Escolha projetos com histórico sólido\n• Diversifique entre 2-3 projetos\n• Acompanhe relatórios de impacto\n\n**💡 DICA:** Melhor prevenir que remediar!"
      },
      "quanto tempo demora": {
        keywords: ["tempo", "demora", "rapidez", "quando recebe"],
        answer: "⏱️ **Cronograma Completo da Destinação:**\n\n**🚀 PROCESSO ONLINE (5-15 minutos):**\n• Escolha do projeto: 2-5 min\n• Preenchimento: 3-5 min\n• Assinatura digital: 1-2 min\n• Protocolo na Receita: Instantâneo\n\n**📊 TRANSFERÊNCIA DOS RECURSOS:**\n• Governo → Projeto: 30-90 dias\n• Depende do tipo de projeto\n• Cultura mais rápida, outros demoram mais\n\n**📈 IMPACTO VISÍVEL:**\n• Primeiros relatórios: 60-120 dias\n• Fotos/vídeos: 90-180 dias\n• Impacto completo: 6-12 meses\n\n**💡 DICA TINA:**\n• Processo é rápido\n• Impacto é gradual e duradouro\n• Acompanhe via relatórios!"
      },
      "posso destinar todo ir": {
        keywords: ["todo ir", "100%", "tudo", "limite"],
        answer: "🚫 **Não! Existe limite legal de 6% do IR devido.**\n\n**📊 LIMITES OFICIAIS:**\n• **Destinação total:** Máximo 6% do IR devido\n• **Lei Rouanet:** Até 1% (dentro dos 6%)\n• **Fundo da Criança:** Até 3% (dentro dos 6%)\n• **Fundo do Idoso:** Até 3% (dentro dos 6%)\n• **Lei do Esporte:** Até 1% (dentro dos 6%)\n\n**💰 EXEMPLO PRÁTICO:**\n• IR devido: R$ 10.000\n• Máximo destinação: R$ 600 (6%)\n• Distribuição sugerida:\n  - R$ 300 para criança/adolescente\n  - R$ 200 para cultura\n  - R$ 100 para esporte\n\n**🎯 ESTRATÉGIA TINA:**\n• Use o limite máximo (6%)\n• Diversifique entre causas\n• Maximize seu impacto social!"
      }
    },

    // Curiosidades sobre Destinação
    curiosidades: {
      "historia da destinacao": {
        keywords: ["história", "origem", "quando surgiu", "criação"],
        answer: "📚 **História da Destinação no Brasil:**\n\n**1991 - Lei Rouanet:**\n• Primeira lei de incentivo fiscal\n• Criada por Sérgio Paulo Rouanet\n• Foco na cultura brasileira\n\n**1990 - Estatuto da Criança:**\n• Fundos para criança e adolescente\n• Proteção integral garantida\n• Participação da sociedade\n\n**2003 - Lei do Idoso:**\n• Fundo Nacional do Idoso\n• Reconhecimento dos direitos\n• Envelhecimento digno\n\n**2006 - Lei do Esporte:**\n• Incentivo ao esporte nacional\n• Formação de atletas\n• Democratização do esporte\n\n**🎯 EVOLUÇÃO:**\n• Começou com R$ 200 milhões/ano\n• Hoje: Mais de R$ 3 bilhões/ano\n• Milhões de brasileiros beneficiados\n\n**💡 CURIOSIDADE:** Brasil é pioneiro mundial neste modelo!"
      },
      "maiores projetos ja apoiados": {
        keywords: ["maiores projetos", "projetos famosos", "exemplos grandes"],
        answer: "🏆 **Maiores Projetos Apoiados por Destinação:**\n\n**🎭 CULTURA:**\n• Rock in Rio: R$ 25 milhões\n• Cirque du Soleil no Brasil: R$ 15 milhões\n• Museu do Amanhã: R$ 12 milhões\n• Orquestra Sinfônica Brasileira: R$ 8 milhões/ano\n\n**👶 CRIANÇA E ADOLESCENTE:**\n• Fundação Xuxa Meneghel: R$ 50 milhões\n• Instituto Ayrton Senna: R$ 30 milhões\n• Casa do Zezinho: R$ 20 milhões\n• Fundação Abrinq: R$ 18 milhões\n\n**👴 IDOSO:**\n• Lar dos Velhinhos SP: R$ 8 milhões\n• Instituto Bem Querer: R$ 6 milhões\n• Casa do Idoso RJ: R$ 5 milhões\n\n**⚽ ESPORTE:**\n• Instituto Neymar Jr: R$ 10 milhões\n• Vôlei Futuro: R$ 8 milhões\n• Basquete Cearense: R$ 6 milhões\n\n**💡 CURIOSIDADE:** Seus R$ 500 podem fazer parte de projetos gigantes!"
      },
      "paises que fazem destinacao": {
        keywords: ["outros países", "exterior", "mundial", "internacional"],
        answer: "🌍 **Destinação de IR pelo Mundo:**\n\n**🇧🇷 BRASIL - PIONEIRO:**\n• Modelo mais completo do mundo\n• 6% do IR pode ser destinado\n• Múltiplas áreas (cultura, criança, idoso, esporte)\n\n**🇺🇸 ESTADOS UNIDOS:**\n• Dedução por doações (até 50% da renda)\n• Não é destinação obrigatória\n• Foco em entidades privadas\n\n**🇫🇷 FRANÇA:**\n• 1% do IR para entidades\n• Sistema mais limitado\n• Foco em associações locais\n\n**🇩🇪 ALEMANHA:**\n• 'Kirchensteuer' (taxa religiosa)\n• Destinação automática\n• Foco em igrejas\n\n**🇮🇹 ITÁLIA:**\n• 0,8% para entidades religiosas\n• 0,5% para ONGs\n• Sistema similar ao brasileiro\n\n**🏆 RANKING MUNDIAL:**\n• 1º Brasil (mais completo)\n• 2º Itália (similar)\n• 3º França (limitado)\n\n**💡 ORGULHO BRASILEIRO:** Somos referência mundial!"
      },
      "impacto real dos recursos": {
        keywords: ["impacto", "resultados", "números", "estatísticas"],
        answer: "📊 **Impacto Real da Destinação (2023):**\n\n**💰 RECURSOS MOVIMENTADOS:**\n• Total destinado: R$ 3.2 bilhões\n• Cultura: R$ 1.8 bilhões\n• Criança/Adolescente: R$ 800 milhões\n• Idoso: R$ 400 milhões\n• Esporte: R$ 200 milhões\n\n**👥 PESSOAS BENEFICIADAS:**\n• Cultura: 15 milhões de brasileiros\n• Criança/Adolescente: 2.5 milhões\n• Idoso: 800 mil\n• Esporte: 1.2 milhão\n• **Total: 19.5 milhões de brasileiros!**\n\n**🎯 RESULTADOS CONCRETOS:**\n• 5.000 espetáculos culturais\n• 1.200 escolas beneficiadas\n• 800 abrigos para idosos\n• 2.000 escolinhas esportivas\n• 15.000 empregos diretos gerados\n\n**📈 CRESCIMENTO:**\n• 2019: R$ 2.1 bilhões\n• 2023: R$ 3.2 bilhões\n• Crescimento: 52% em 4 anos!\n\n**💡 SEU PAPEL:** Cada destinação conta neste impacto!"
      }
    },

    // Mitos e Verdades
    mitos: {
      "destinacao e sonegacao": {
        keywords: ["sonegação", "ilegal", "crime", "problema"],
        answer: "⚖️ **MITO: Destinação é sonegação!**\n\n**❌ MITO COMUM:**\n• \"Destinação é forma de sonegar\"\n• \"Governo perde dinheiro\"\n• \"É benefício para rico\"\n• \"Deveria acabar\"\n\n**✅ VERDADE:**\n• **100% LEGAL** - Leis federais específicas\n• **MESMO VALOR** de imposto pago\n• **GOVERNO APROVA** todos os projetos\n• **CONTROLE RIGOROSO** de recursos\n\n**📊 COMPARAÇÃO:**\n• Sem destinação: R$ 1.000 → Cofres públicos\n• Com destinação: R$ 1.000 → Projeto aprovado\n• **Valor pago:** Exatamente o mesmo!\n• **Diferença:** Você escolhe o destino\n\n**🎯 BENEFÍCIOS REAIS:**\n• Sociedade participa das decisões\n• Projetos mais eficientes\n• Transparência total\n• Impacto mensurável\n\n**💡 TINA ESCLARECE:** É direito, não sonegação!"
      },
      "so rico pode destinar": {
        keywords: ["só rico", "elite", "classe alta", "privilégio"],
        answer: "💰 **MITO: Só rico pode destinar!**\n\n**❌ MITO PERIGOSO:**\n• \"Só quem ganha muito pode destinar\"\n• \"É privilégio da elite\"\n• \"Pobre não tem direito\"\n• \"Sistema excludente\"\n\n**✅ VERDADE DEMOCRÁTICA:**\n• Qualquer pessoa com IR devido pode destinar\n• Valores pequenos também fazem diferença\n• Sistema proporcional à renda\n• Impacto coletivo gigantesco\n\n**📊 REALIDADE DOS NÚMEROS:**\n• Renda R$ 3.000/mês → R$ 126/ano destinação\n• Renda R$ 5.000/mês → R$ 468/ano destinação\n• Renda R$ 8.000/mês → R$ 1.440/ano destinação\n\n**🎯 IMPACTO COLETIVO:**\n• 1 milhão de pessoas destinando R$ 200\n• **Total:** R$ 200 milhões!\n• Centenas de projetos financiados\n• Milhões de brasileiros beneficiados\n\n**💡 PODER DA UNIÃO:**\n• Classe média é a força principal\n• Pequenos valores, grande impacto\n• Democracia participativa real\n\n**🚀 TINA MOTIVA:** Seu valor conta!"
      },
      "governo perde dinheiro": {
        keywords: ["governo perde", "menos dinheiro", "prejuízo público"],
        answer: "🏛️ **MITO: Governo perde dinheiro!**\n\n**❌ MITO ECONÔMICO:**\n• \"Governo fica com menos recursos\"\n• \"Arrecadação diminui\"\n• \"Serviços públicos são prejudicados\"\n• \"É perda para o Estado\"\n\n**✅ VERDADE FINANCEIRA:**\n• **ZERO PERDA** para o governo\n• Valor do IR permanece igual\n• Recursos vão para projetos aprovados pelo governo\n• Estado mantém controle total\n\n**📊 FLUXO REAL:**\n• Contribuinte: Paga R$ 1.000 de IR\n• Sem destinação: R$ 1.000 → Tesouro\n• Com destinação: R$ 1.000 → Projeto aprovado\n• **Diferença para o governo:** R$ 0\n\n**🎯 VANTAGENS PARA O ESTADO:**\n• Sociedade co-participa do desenvolvimento\n• Projetos mais eficientes\n• Transparência ampliada\n• Controle social ativo\n• Redução de custos administrativos\n\n**💡 ECONOMIA INTELIGENTE:**\n• Governo define prioridades (aprovação)\n• Cidadão escolhe dentro das prioridades\n• Recurso 100% direcionado\n• Resultado: Mais eficiência!\n\n**🤝 TINA EXPLICA:** Parceria, não perda!"
      }
    }
  };

  // Função para buscar na base de conhecimento
  const searchKnowledge = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Buscar nas dúvidas específicas de servidores primeiro
    for (const [key, data] of Object.entries(serverKnowledge)) {
      if (data.keywords.some(keyword => input.includes(keyword))) {
        return {
          found: true,
          answer: data.answer,
          category: 'servidor_' + key
        };
      }
    }

    // Buscar em todas as categorias da base geral
    const allCategories = [
      ...Object.entries(knowledgeBase.faq),
      ...Object.entries(knowledgeBase.curiosidades),
      ...Object.entries(knowledgeBase.mitos)
    ];

    // Encontrar a melhor correspondência
    for (const [key, data] of allCategories) {
      if (data.keywords.some(keyword => input.includes(keyword))) {
        return {
          found: true,
          answer: data.answer,
          category: key
        };
      }
    }

    return { found: false };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: '👋 **Olá! Eu sou a TINA**, sua Assistente Inteligente do IncentivaBR!\n\n💫 **TINA vem de "desTINA"** - porque minha missão é te ajudar a destinar seu IR de forma inteligente!\n\n🎯 **REGRA IMPORTANTE:** Somente quem faz **DECLARAÇÃO COMPLETA** pode destinar IR!\n\n✨ **Para calcular seu potencial:**\n• Encontre o "Imposto Devido" na sua declaração\n• Digite apenas o número no chat\n• Exemplo: para R$ 7.500,00 digite: 7500\n\n🚀 **Ou escolha uma opção abaixo:**',
      timestamp: new Date(),
      quickActions: [
        { text: '🧮 Calcular meu potencial', action: 'calcular' },
        { text: '🎯 Ver projetos', action: 'projetos' },
        { text: '📚 Como funciona', action: 'explicar' },
        { text: '❓ Perguntas frequentes', action: 'perguntas_frequentes' }
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  const addMessage = (content, type = 'user', quickActions = null, isImportant = false) => {
    const message = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date(),
      quickActions,
      isImportant
    };
    setMessages(prev => [...prev, message]);
  };

  const simulateTyping = (callback, delay = 1200) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateImpactExamples = (valor) => {
    const examples = [];
    if (valor >= 100) examples.push(`• **${Math.floor(valor/15)} kits escolares** completos`);
    if (valor >= 250) examples.push(`• **${Math.floor(valor/30)} consultas médicas** especializadas`);
    if (valor >= 500) examples.push(`• **${Math.floor(valor/50)} horas** de reforço escolar`);
    if (valor >= 1000) examples.push(`• **${Math.floor(valor/120)} jovens** em programa profissionalizante`);
    if (valor >= 1500) examples.push(`• **1 laboratório** de informática escolar`);
    if (valor >= 3000) examples.push(`• **1 centro comunitário** equipado`);
    return examples.slice(0, 4);
  };

  const validateIRValue = (valor) => {
    if (valor < 50) return { valid: false, message: 'Valor muito baixo. Verifique se digitou corretamente.' };
    if (valor > 2000000) return { valid: false, message: 'Valor muito alto. Confirme o "Imposto Devido" na sua declaração.' };
    if (valor < 167) return { valid: false, message: 'Com este valor, você não pode destinar IR. Mínimo: R$ 167,00' };
    return { valid: true };
  };

  // Adicionar nova ação para mostrar perguntas frequentes
  const showFrequentQuestions = () => {
    addMessage('❓ Perguntas frequentes');
    simulateTyping(() => {
      addMessage(
        '❓ **Perguntas Mais Frequentes sobre Destinação:**\n\n**💰 FINANCEIRAS:**\n• "Posso destinar se já doei para igreja?"\n• "O que acontece se eu não destinar?"\n• "Posso destinar todo meu IR?"\n• "MEI pode destinar?"\n\n**⏰ PROCESSUAIS:**\n• "Quanto tempo demora o processo?"\n• "Posso cancelar uma destinação?"\n• "E se eu mudar de estado?"\n\n**👥 PESSOAS:**\n• "Servidor aposentado pode destinar?"\n• "Dependente pode destinar?"\n• "Funcionário público e privado?"\n\n**🌍 CURIOSIDADES:**\n• "História da destinação no Brasil"\n• "Outros países fazem destinação?"\n• "Impacto real dos recursos"\n\n**⚖️ MITOS:**\n• "Destinação é sonegação?"\n• "Só rico pode destinar?"\n• "Governo perde dinheiro?"\n\n💬 **Digite qualquer uma dessas perguntas que eu respondo detalhadamente!**',
        'bot',
        [
          { text: '💰 Perguntas financeiras', action: 'perguntas_financeiras' },
          { text: '🌍 Curiosidades', action: 'curiosidades' },
          { text: '⚖️ Mitos e verdades', action: 'mitos' },
          { text: '🧮 Calcular potencial', action: 'calcular' }
        ]
      );
    });
  };

  const showCuriosidades = () => {
    addMessage('🌍 Curiosidades sobre destinação');
    simulateTyping(() => {
      addMessage(
        '🌍 **Curiosidades Fascinantes sobre Destinação:**\n\n**📚 VOCÊ SABIA QUE...**\n\n• O Brasil é **pioneiro mundial** em destinação de IR?\n• Rock in Rio já recebeu **R$ 25 milhões** em destinação?\n• **19.5 milhões** de brasileiros são beneficiados anualmente?\n• Destinação movimenta **R$ 3.2 bilhões** por ano?\n• Sistema é controlado por **5 órgãos** diferentes?\n\n**🎯 IMPACTO REAL:**\n• Cada R$ 1 destinado gera R$ 4 em impacto social\n• 15.000 empregos diretos criados\n• 5.000 espetáculos culturais realizados\n• 2.000 escolinhas esportivas funcionando\n\n**🌟 PROJETOS FAMOSOS:**\n• Orquestra Sinfônica Brasileira\n• Instituto Ayrton Senna\n• Cirque du Soleil no Brasil\n• Fundação Xuxa Meneghel\n\n💬 **Quer saber mais sobre alguma curiosidade específica?**',
        'bot',
        [
          { text: '📚 História da destinação', action: 'historia' },
          { text: '🏆 Maiores projetos', action: 'maiores_projetos' },
          { text: '🌍 Outros países', action: 'outros_paises' },
          { text: '🔍 Como é controlado', action: 'controle' }
        ]
      );
    });
  };

  const handleQuickAction = (action) => {
    setShowQuickActions(false);
    
    switch(action) {
      case 'perguntas_frequentes':
        showFrequentQuestions();
        break;
        
      case 'curiosidades':
        showCuriosidades();
        break;
        
      case 'mitos':
        addMessage('⚖️ Mitos e verdades');
        simulateTyping(() => {
          addMessage(
            '⚖️ **Principais Mitos sobre Destinação de IR:**\n\n**❌ MITO 1:** "Destinação é sonegação"\n**✅ VERDADE:** É 100% legal e controlado pelo governo\n\n**❌ MITO 2:** "Só rico pode destinar"\n**✅ VERDADE:** Qualquer pessoa com IR devido pode destinar\n\n**❌ MITO 3:** "Governo perde dinheiro"\n**✅ VERDADE:** Valor do IR permanece igual\n\n**❌ MITO 4:** "É muito complicado"\n**✅ VERDADE:** Processo online leva 5-15 minutos\n\n**❌ MITO 5:** "Não dá para confiar"\n**✅ VERDADE:** Controle rigoroso de 5 órgãos federais\n\n**❌ MITO 6:** "Não tem impacto real"\n**✅ VERDADE:** 19.5 milhões de brasileiros beneficiados\n\n💬 **Digite qualquer mito que eu esclareço detalhadamente!**',
            'bot',
            [
              { text: '⚖️ "Destinação é sonegação"', action: 'mito_sonegacao' },
              { text: '💰 "Só rico pode destinar"', action: 'mito_rico' },
              { text: '🏛️ "Governo perde dinheiro"', action: 'mito_governo' },
              { text: '🧮 Calcular meu potencial', action: 'calcular' }
            ]
          );
        });
        break;

      case 'historia':
        addMessage('📚 História da destinação');
        simulateTyping(() => {
          addMessage(
            knowledgeBase.curiosidades["historia da destinacao"].answer,
            'bot',
            [
              { text: '🏆 Ver maiores projetos', action: 'maiores_projetos' },
              { text: '🌍 Outros países', action: 'outros_paises' },
              { text: '🧮 Calcular potencial', action: 'calcular' }
            ]
          );
        });
        break;

      case 'maiores_projetos':
        addMessage('🏆 Maiores projetos apoiados');
        simulateTyping(() => {
          addMessage(
            knowledgeBase.curiosidades["maiores projetos ja apoiados"].answer,
            'bot',
            [
              { text: '📊 Ver impacto real', action: 'impacto_real' },
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '🎯 Ver projetos atuais', action: 'projetos' }
            ]
          );
        });
        break;

      case 'outros_paises':
        addMessage('🌍 Outros países fazem destinação?');
        simulateTyping(() => {
          addMessage(
            knowledgeBase.curiosidades["paises que fazem destinacao"].answer,
            'bot',
            [
              { text: '📊 Ver impacto no Brasil', action: 'impacto_real' },
              { text: '🧮 Calcular potencial', action: 'calcular' },
              { text: '🏠 Voltar ao menu', action: 'menu' }
            ]
          );
        });
        break;

      case 'impacto_real':
        addMessage('📊 Impacto real dos recursos');
        simulateTyping(() => {
          addMessage(
            knowledgeBase.curiosidades["impacto real dos recursos"].answer,
            'bot',
            [
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '🎯 Ver projetos', action: 'projetos' },
              { text: '🌍 Outras curiosidades', action: 'curiosidades' }
            ]
          );
        });
        break;

      case 'mito_sonegacao':
        addMessage('⚖️ "Destinação é sonegação"');
        simulateTyping(() => {
          addMessage(
            knowledgeBase.mitos["destinacao e sonegacao"].answer,
            'bot',
            [
              { text: '💰 "Só rico pode destinar"', action: 'mito_rico' },
              { text: '🏛️ "Governo perde dinheiro"', action: 'mito_governo' },
              { text: '🧮 Calcular com segurança', action: 'calcular' }
            ]
          );
        });
        break;

      case 'mito_rico':
        addMessage('💰 "Só rico pode destinar"');
        simulateTyping(() => {
          addMessage(
            knowledgeBase.mitos["so rico pode destinar"].answer,
            'bot',
            [
              { text: '⚖️ "Destinação é sonegação"', action: 'mito_sonegacao' },
              { text: '🏛️ "Governo perde dinheiro"', action: 'mito_governo' },
              { text: '🧮 Calcular meu potencial', action: 'calcular' }
            ]
          );
        });
        break;

      case 'mito_governo':
        addMessage('🏛️ "Governo perde dinheiro"');
        simulateTyping(() => {
          addMessage(
            knowledgeBase.mitos["governo perde dinheiro"].answer,
            'bot',
            [
              { text: '⚖️ "Destinação é sonegação"', action: 'mito_sonegacao' },
              { text: '💰 "Só rico pode destinar"', action: 'mito_rico' },
              { text: '🧮 Calcular potencial', action: 'calcular' }
            ]
          );
        });
        break;
        
      case 'calcular':
        setChatMode('calculating');
        addMessage('🧮 Quero calcular meu potencial');
        simulateTyping(() => {
          addMessage(
            '📊 **Vou calcular seu potencial!**\n\n**⚠️ IMPORTANTE:** Somente declaração COMPLETA pode destinar IR!\n\n**🎯 ONDE ENCONTRAR O VALOR:**\n\n**💻 NO PROGRAMA IRPF 2024:**\n1. Abra o programa IRPF 2024\n2. Abra sua declaração\n3. Clique em "Resumo da Declaração"\n4. Encontre "IMPOSTO DEVIDO"\n\n**📱 NO APP MeuIR:**\n1. Abra "Meu Imposto de Renda"\n2. Acesse "Minhas Declarações"\n3. Toque em "Resumo"\n4. Encontre "IMPOSTO DEVIDO"\n\n**📄 NO RECIBO DE ENTREGA:**\n• Procure o campo "Imposto Devido"\n\n**💬 Digite apenas o número:**\n• Para R$ 7.500,00 → digite: 7500\n• Para R$ 12.350,00 → digite: 12350\n\n**🔢 Encontrou o valor? Digite abaixo:**',
            'bot',
            [
              { text: '✅ Vou digitar o valor', action: 'aguardar_valor' },
              { text: '❓ Não encontro o valor', action: 'ajuda_encontrar' },
              { text: '🧮 Simular com exemplo', action: 'exemplo_calculo' }
            ],
            true
          );
        });
        break;

      case 'exemplo_calculo':
        simulateTyping(() => {
          const exemploValor = 8500;
          const destinacao = Math.round(exemploValor * 0.06);
          const exemplos = calculateImpactExamples(destinacao);
          
          addMessage(
            `📊 **EXEMPLO DE CÁLCULO:**\n\n` +
            `**💰 Imposto Devido:** ${formatCurrency(exemploValor)} (exemplo)\n` +
            `**🎯 Destinação (6%):** ${formatCurrency(destinacao)}\n` +
            `**✅ Tipo:** Declaração COMPLETA\n\n` +
            `**🚀 COM ${formatCurrency(destinacao)} VOCÊ PODERIA:**\n${exemplos.join('\n')}\n\n` +
            `**⚡ AGORA CALCULE O SEU:**`,
            'bot',
            [
              { text: '🧮 Calcular meu valor real', action: 'calcular' },
              { text: '🎯 Ver mais exemplos', action: 'mais_exemplos' }
            ]
          );
        });
        break;

      case 'aguardar_valor':
        addMessage('✅ Vou digitar o valor no chat');
        simulateTyping(() => {
          addMessage(
            '💬 **Digite o valor do Imposto Devido:**\n\n**📝 INSTRUÇÕES:**\n• Digite apenas números\n• Sem R$, pontos ou vírgulas\n• Exemplo: para R$ 7.500,00 digite: 7500\n\n**🤖 SISTEMA AUTOMÁTICO:**\n• Quando você digitar um número\n• Calcularei automaticamente seus 6%\n• Mostrarei exemplos de impacto\n• Recomendarei projetos ideais\n\n**💡 EXEMPLO DE CÁLCULO:**\n• Imposto Devido: R$ 10.000\n• Destinação possível: R$ 600 (6%)\n• Impacto: 60 crianças com material escolar\n\n**⌨️ Digite seu valor agora:**',
            'bot'
          );
        });
        break;

      case 'ajuda_encontrar':
        addMessage('❓ Não encontro o Imposto Devido');
        simulateTyping(() => {
          addMessage(
            '🔍 **TINA te ajuda a encontrar! Vamos por etapas:**\n\n**📋 PRIMEIRO: Confirme que tem o programa/app**\n• Programa IRPF 2024 instalado? OU\n• App "Meu Imposto de Renda" instalado?\n\n**💻 SE USAR PROGRAMA (PC):**\n1. Abra o programa IRPF 2024\n2. Clique em "Abrir Declaração"\n3. Selecione seu arquivo (.DEC)\n4. Procure aba "Resumo da Declaração"\n5. Procure uma linha com "Imposto Devido"\n\n**📱 SE USAR APP (CELULAR):**\n1. Abra "Meu Imposto de Renda"\n2. Faça login com CPF e senha\n3. Toque em "Minhas Declarações"\n4. Selecione a declaração 2024\n5. Toque em "Resumo"\n6. Procure "Imposto Devido"\n\n**🎯 NOMES ALTERNATIVOS:**\n• "Imposto Devido"\n• "Imposto sobre a Renda"\n• "IR Devido"\n• "Imposto Calculado"\n\n**Qual situação se aplica a você?**',
            'bot',
            [
              { text: '💻 Tenho programa, mas não acho', action: 'ajuda_programa' },
              { text: '📱 Uso app, mas não encontro', action: 'ajuda_app' },
              { text: '❌ Não tenho programa nem app', action: 'instalar_programa' },
              { text: '🧮 Prefiro calculadora virtual', action: 'calculadora_virtual' }
            ]
          );
        });
        break;
        
      case 'projetos':
        setChatMode('exploring');
        addMessage('🎯 Quero ver projetos');
        simulateTyping(() => {
          addMessage(
            '🎯 **Projetos Recomendados por Área:**\n\n**📚 EDUCAÇÃO & CULTURA:**\n• Biblioteca Digital Inclusiva - R$ 850\n• Laboratório STEAM Móvel - R$ 3.500\n• Teatro Educativo Comunitário - R$ 2.100\n• Formação de Professores - R$ 1.800\n\n**🏥 SAÚDE & BEM-ESTAR:**\n• UTI Neonatal Digital - R$ 4.200\n• Telemedicina Rural - R$ 1.200\n• Reabilitação Neurológica - R$ 3.800\n• Programa Saúde Mental - R$ 2.500\n\n**⚖️ JUSTIÇA & CIDADANIA:**\n• Mediação Digital Comunitária - R$ 900\n• Educação Jurídica Popular - R$ 1.500\n• Centro de Direitos Humanos - R$ 2.800\n\n**🌱 MEIO AMBIENTE:**\n• Reflorestamento Urbano - R$ 1.600\n• Educação Ambiental - R$ 800\n• Energia Solar Escolar - R$ 5.200\n\n**🧮 Para ver projetos específicos para seu orçamento, calcule primeiro seu potencial!**',
            'bot',
            [
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '📋 Como escolher projeto', action: 'como_escolher' },
              { text: '💡 Critérios de seleção', action: 'criterios' }
            ]
          );
        });
        break;

      case 'como_escolher':
        simulateTyping(() => {
          addMessage(
            '📋 **Como Escolher o Projeto Ideal:**\n\n**🎯 CRITÉRIOS IMPORTANTES:**\n\n**1. ⚖️ Alinhamento com seus valores**\n• Escolha causas que você acredita\n• Considere sua área de atuação profissional\n\n**2. 🏛️ Transparência do projeto**\n• Projetos aprovados pelo governo\n• Prestação de contas obrigatória\n• Relatórios de impacto disponíveis\n\n**3. 🎯 Impacto mensurável**\n• Metas claras e objetivas\n• Resultados quantificáveis\n• Beneficiários identificados\n\n**4. 🌍 Alcance geográfico**\n• Local (sua cidade/região)\n• Nacional (todo o Brasil)\n• Foco em vulnerabilidade social\n\n**💡 DICA TINA:** Diversifique entre áreas para maximizar o impacto social!',
            'bot',
            [
              { text: '🧮 Calcular para escolher', action: 'calcular' },
              { text: '🎯 Ver projetos por região', action: 'projetos_regiao' },
              { text: '📊 Entender transparência', action: 'transparencia' }
            ]
          );
        });
        break;

      case 'explicar':
        setChatMode('expert');
        addMessage('📚 Como funciona a destinação?');
        simulateTyping(() => {
          addMessage(
            '📚 **Destinação de IR - Guia Completo:**\n\n**🔹 O que é?**\nVocê pode destinar até **6%** do seu IR devido para projetos sociais aprovados pelo governo federal.\n\n**🔹 Custa algo extra?**\n**ZERO CUSTO!** É o mesmo valor que você pagaria de IR, só escolhe o destino.\n\n**🔹 Quem pode destinar?**\n• Declaração **COMPLETA** (não simplificada)\n• Ter **Imposto Devido** > R$ 167,00\n• Pessoa física residente no Brasil\n\n**🔹 Processo passo a passo:**\n1. Calcula 6% do Imposto Devido\n2. Escolhe projetos aprovados\n3. Faz a destinação na declaração\n4. Valor é 100% deduzido do IR\n5. Acompanha o impacto do projeto\n\n**🔹 Áreas disponíveis:**\n• 🎭 Cultura (Lei Rouanet)\n• 👶 Criança e Adolescente (ECA)\n• 👴 Idoso (Lei do Idoso)\n• ⚽ Esporte (Lei do Esporte)\n• 📚 Educação (PRONAS/PCD)\n• 🏥 Saúde (PRONON)\n\n**🎯 Resultado:** Mesmo imposto + Impacto social real!',
            'bot',
            [
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '📋 Prazos e datas', action: 'prazos' },
              { text: '🛡️ Segurança jurídica', action: 'seguranca' }
            ]
          );
        });
        break;

      case 'prazos':
        simulateTyping(() => {
          addMessage(
            '📅 **Prazos Importantes 2024/2025:**\n\n**📋 DECLARAÇÃO IR 2024:**\n• **Início:** 15 de março de 2024\n• **Fim:** 31 de maio de 2024\n• **Status:** Período encerrado ✅\n\n**🎯 DESTINAÇÃO 2024:**\n• Feita durante a declaração\n• Projetos já em execução\n• Relatórios de impacto disponíveis\n\n**📅 PRÓXIMOS PRAZOS 2025:**\n• **Declaração IR 2025:** março a maio/2025\n• **Destinação 2025:** durante a declaração\n• **Planejamento:** já pode começar!\n\n**💡 DICA TINA:**\n• Calcule seu potencial agora\n• Pesquise projetos antecipadamente\n• Monitore os aprovados pelo governo\n• Planeje sua estratégia de impacto\n\n**⚡ Não perca a oportunidade na próxima declaração!**',
            'bot',
            [
              { text: '🧮 Calcular para 2025', action: 'calcular' },
              { text: '📊 Monitorar projetos', action: 'monitorar' },
              { text: '📚 Voltar ao menu', action: 'menu' }
            ]
          );
        });
        break;

      case 'seguranca':
        addMessage('🛡️ É seguro juridicamente?');
        simulateTyping(() => {
          addMessage(
            '🛡️ **100% Seguro e Legal!**\n\n**✅ BASE LEGAL SÓLIDA:**\n• Lei Rouanet (8.313/91) - Cultura\n• ECA (8.069/90) - Criança e Adolescente\n• Lei do Idoso (10.741/03) - Idoso\n• Lei do Esporte (11.438/06) - Esporte\n• PRONON/PRONAS - Saúde e Educação\n\n**🔐 GARANTIAS INCENTIVABR:**\n• **Registro INPI:** BR512025000647-0\n• **Conformidade:** 99.7% de aprovação\n• **Histórico:** Zero autuações em 5+ anos\n• **Certificação:** Digital e auditada\n• **Transparência:** Relatórios públicos\n\n**📊 TRACK RECORD COMPROVADO:**\n• **2.847+** servidores atendidos\n• **R$ 8.2M+** destinados com segurança\n• **100%** dos processos auditados\n• **Zero** problemas fiscais reportados\n\n**🎯 GARANTIA TINA:** \nRisco fiscal = **ZERO** | Impacto social = **MÁXIMO**\n\n**🏛️ Todos os projetos são aprovados e fiscalizados pelo governo federal!**',
            'bot',
            [
              { text: '🧮 Calcular com segurança', action: 'calcular' },
              { text: '📜 Ver certificações', action: 'certificacoes' },
              { text: '📞 Falar com especialista', action: 'contato' }
            ]
          );
        });
        break;

      case 'menu':
        setChatMode('welcome');
        setShowQuickActions(true);
        simulateTyping(() => {
          addMessage(
            '🏠 **Menu Principal TINA**\n\nEscolha como posso te ajudar hoje:',
            'bot',
            [
              { text: '🧮 Calcular potencial', action: 'calcular' },
              { text: '🎯 Ver projetos', action: 'projetos' },
              { text: '📚 Como funciona', action: 'explicar' },
              { text: '❓ Perguntas frequentes', action: 'perguntas_frequentes' }
            ]
          );
        });
        break;

      case 'contato':
        simulateTyping(() => {
          addMessage(
            '📞 **Falar com Especialista:**\n\n**🎯 ATENDIMENTO PERSONALIZADO:**\n• Análise detalhada do seu caso\n• Estratégia personalizada de destinação\n• Acompanhamento durante todo o processo\n• Suporte técnico especializado\n\n**📱 CANAIS DE CONTATO:**\n• **WhatsApp:** (61) 99999-9999\n• **E-mail:** tina@incentivabr.com.br\n• **Telefone:** 0800-123-4567\n• **Site:** www.incentivabr.com.br\n\n**⏰ HORÁRIO DE ATENDIMENTO:**\n• Segunda a Sexta: 8h às 18h\n• Sábado: 8h às 12h\n• Resposta em até 2 horas úteis\n\n**💡 DICA:** Tenha em mãos o valor do seu Imposto Devido para uma consulta mais eficiente!',
            'bot',
            [
              { text: '📱 Abrir WhatsApp', action: 'whatsapp' },
              { text: '🧮 Calcular antes', action: 'calcular' },
              { text: '🏠 Voltar ao menu', action: 'menu' }
            ]
          );
        });
        break;

      default:
        simulateTyping(() => {
          addMessage(
            '🤔 **Entendi!** Como posso te ajudar especificamente?\n\nUse os botões abaixo ou digite sua dúvida:',
            'bot',
            [
              { text: '🧮 Calcular potencial', action: 'calcular' },
              { text: '🎯 Ver projetos', action: 'projetos' },
              { text: '📚 Como funciona', action: 'explicar' },
              { text: '❓ Perguntas frequentes', action: 'perguntas_frequentes' }
            ]
          );
        });
        break;
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const userMessage = inputValue;
      addMessage(userMessage);
      setInputValue('');
      
      // DETECÇÃO INTELIGENTE DE VALOR DO IR DEVIDO
      const numeroMatch = inputValue.match(/\d+/g);
      if (numeroMatch && numeroMatch.length > 0) {
        const numeroDigitado = numeroMatch.join('').replace(/[^\d]/g, '');
        
        if (numeroDigitado && numeroDigitado.length >= 3) {
          const valorIR = parseInt(numeroDigitado);
          const validation = validateIRValue(valorIR);
          
          if (!validation.valid) {
            simulateTyping(() => {
              addMessage(
                `⚠️ **${validation.message}**\n\n**📋 VALORES VÁLIDOS:**\n• Mínimo: R$ 167,00 (para destinar R$ 10,00)\n• Máximo comum: R$ 100.000,00\n• Digite apenas números\n\n**💡 EXEMPLOS CORRETOS:**\n• Para R$ 1.500,00 → digite: 1500\n• Para R$ 8.750,00 → digite: 8750\n\n**🔍 Verifique o "Imposto Devido" na sua declaração e tente novamente:**`,
                'bot',
                [
                  { text: '🔍 Como encontrar o valor', action: 'calcular' },
                  { text: '🧮 Tentar outro valor', action: 'calcular' }
                ]
              );
            });
            return;
          }
          
          // Cálculo detalhado e personalizado
          const destinacao = Math.round(valorIR * 0.06);
          const exemplosImpacto = calculateImpactExamples(destinacao);
          
          // Salvar dados do usuário
          setUserData({
            ...userData,
            impostoDevido: valorIR,
            potencialDestinacao: destinacao,
            calculatedAt: new Date()
          });
          
          simulateTyping(() => {
            addMessage(
              `🎯 **ANÁLISE TINA - Seu Potencial Personalizado:**\n\n` +
              `**💰 Imposto Devido:** ${formatCurrency(valorIR)}\n` +
              `**🎯 Potencial de Destinação (6%):** ${formatCurrency(destinacao)}\n` +
              `**✅ Status:** Apto para destinação\n` +
              `**📊 Categoria:** ${destinacao < 1000 ? 'Iniciante' : destinacao < 3000 ? 'Intermediário' : 'Avançado'}\n\n` +
              `**🌟 COM ${formatCurrency(destinacao)} VOCÊ PODE GERAR:**\n${exemplosImpacto.join('\n')}\n\n` +
              `**💡 IMPORTANTE:**\n• Valor 100% deduzido do seu IR\n• Zero custo adicional\n• Impacto social real e mensurável\n• Relatórios de transparência incluídos`,
              'bot',
              [
                { text: `🎯 Projetos para ${formatCurrency(destinacao)}`, action: 'projetos_personalizados' },
                { text: '📋 Como destinar', action: 'como_destinar' },
                { text: '📊 Simular outro valor', action: 'calcular' },
                { text: '📞 Falar com especialista', action: 'contato' }
              ],
              true
            );
          }, 2000);
          
          return;
        }
      }
      
      // Buscar na base de conhecimento
      const knowledgeResult = searchKnowledge(userMessage);
      if (knowledgeResult.found) {
        simulateTyping(() => {
          addMessage(
            knowledgeResult.answer,
            'bot',
            [
              { text: '🧮 Calcular potencial', action: 'calcular' },
              { text: '❓ Outras perguntas', action: 'perguntas_frequentes' },
              { text: '🎯 Ver projetos', action: 'projetos' },
              { text: '🏠 Menu principal', action: 'menu' }
            ]
          );
        });
        return;
      }
      
      // Processamento de perguntas em linguagem natural
      const input = userMessage.toLowerCase();
      simulateTyping(() => {
        if (input.includes('calcul') || input.includes('quanto') || input.includes('valor')) {
          handleQuickAction('calcular');
        } else if (input.includes('projeto') || input.includes('destina')) {
          handleQuickAction('projetos');
        } else if (input.includes('como') || input.includes('funciona') || input.includes('processo')) {
          handleQuickAction('explicar');
        } else if (input.includes('segur') || input.includes('legal') || input.includes('risco')) {
          handleQuickAction('seguranca');
        } else if (input.includes('contato') || input.includes('telefone') || input.includes('whatsapp')) {
          handleQuickAction('contato');
        } else if (input.includes('prazo') || input.includes('quando') || input.includes('data')) {
          handleQuickAction('prazos');
        } else if (input.includes('mito') || input.includes('verdade') || input.includes('soneg')) {
          handleQuickAction('mitos');
        } else if (input.includes('curiosidad') || input.includes('história') || input.includes('países')) {
          handleQuickAction('curiosidades');
        } else if (input.includes('pergunta') || input.includes('dúvida') || input.includes('frequente')) {
          handleQuickAction('perguntas_frequentes');
        } else {
          addMessage(
            '💭 **Entendi sua mensagem!** Para te ajudar de forma mais precisa:\n\n**🔢 PARA CALCULAR:** Digite o valor do Imposto Devido (apenas números)\n**❓ PARA PERGUNTAR:** Use palavras-chave como "projetos", "como funciona", "segurança"\n**🎯 PARA NAVEGAR:** Use os botões de ação rápida\n\n**💡 DICA:** Seja específico na sua pergunta para uma resposta mais personalizada!\n\n**🎓 EXEMPLOS DE PERGUNTAS:**\n• "Posso destinar se já doei para igreja?"\n• "Servidor aposentado pode destinar?"\n• "Como verificar se projeto é confiável?"',
            'bot',
            [
              { text: '🧮 Calcular potencial', action: 'calcular' },
              { text: '❓ Perguntas frequentes', action: 'perguntas_frequentes' },
              { text: '🎯 Ver projetos', action: 'projetos' },
              { text: '🏠 Menu principal', action: 'menu' }
            ]
          );
        }
      });
    }
  };

  const renderMessage = (message) => (
    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          message.type === 'user' 
            ? 'bg-blue-500 ml-3' 
            : 'bg-gradient-to-br from-purple-500 to-pink-500 mr-3 shadow-lg'
        }`}>
          {message.type === 'user' ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>
        <div className={`rounded-2xl px-5 py-4 ${
          message.type === 'user' 
            ? 'bg-blue-500 text-white shadow-lg' 
            : message.isImportant
            ? 'bg-gradient-to-r from-green-50 to-blue-50 shadow-xl border-2 border-green-200'
            : 'bg-white shadow-xl border border-gray-100'
        }`}>
          {message.isImportant && (
            <div className="flex items-center mb-3 text-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-xs font-semibold uppercase tracking-wide">Resposta Importante</span>
            </div>
          )}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content.split('**').map((part, index) => 
              index % 2 === 1 ? (
                <strong key={index} className={
                  message.type === 'user' 
                    ? 'text-blue-100' 
                    : message.isImportant 
                    ? 'text-green-800' 
                    : 'text-gray-800'
                }>
                  {part}
                </strong>
              ) : (
                <span key={index} className={
                  message.type === 'user' 
                    ? 'text-white' 
                    : message.isImportant 
                    ? 'text-green-700' 
                    : 'text-gray-700'
                }>
                  {part}
                </span>
              )
            )}
          </div>
          {message.quickActions && (
            <div className="flex flex-wrap gap-2 mt-4">
              {message.quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className={`${
                    message.isImportant 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  } text-white text-xs px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md`}
                >
                  {action.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Enhanced */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-white rounded-2xl px-8 py-4 shadow-xl mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg relative">
              <Sparkles className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Brain className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">TINA - Assistente Inteligente</h1>
              <p className="text-sm text-gray-600">Especialista em destinação de IR para servidores públicos</p>
              {userData.impostoDevido && (
                <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Potencial calculado: {formatCurrency(userData.potencialDestinacao)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center space-x-6 mb-4">
            <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4 mr-2" />
              100% Seguro & Legal
            </div>
            <div className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              <Target className="w-4 h-4 mr-2" />
              Foco em Servidores
            </div>
            <div className="flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
              <Brain className="w-4 h-4 mr-2" />
              IA Avançada
            </div>
          </div>

          {/* Mode Indicator */}
          {chatMode !== 'welcome' && (
            <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-md mb-4">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                chatMode === 'calculating' ? 'bg-blue-500' :
                chatMode === 'exploring' ? 'bg-purple-500' :
                'bg-green-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">
                Modo: {
                  chatMode === 'calculating' ? 'Calculando Potencial' :
                  chatMode === 'exploring' ? 'Explorando Projetos' :
                  'Modo Especialista'
                }
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions Enhanced */}
        {showQuickActions && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => handleQuickAction('calcular')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
            >
              <Calculator className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-sm font-semibold mb-2">Calcular Potencial</div>
              <div className="text-xs opacity-90">Descubra quanto pode destinar</div>
            </button>
            
            <button
              onClick={() => handleQuickAction('projetos')}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
            >
              <Heart className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-sm font-semibold mb-2">Ver Projetos</div>
              <div className="text-xs opacity-90">Projetos da sua área</div>
            </button>
            
            <button
              onClick={() => handleQuickAction('explicar')}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
            >
              <BookOpen className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-sm font-semibold mb-2">Como Funciona</div>
              <div className="text-xs opacity-90">Entenda o processo</div>
            </button>
            
            <button
              onClick={() => handleQuickAction('perguntas_frequentes')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
            >
              <HelpCircle className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-sm font-semibold mb-2">Perguntas Frequentes</div>
              <div className="text-xs opacity-90">Dúvidas comuns</div>
            </button>
          </div>
        )}

        {/* Chat Interface Enhanced */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="w-6 h-6 mr-3" />
                <div>
                  <h2 className="text-xl font-semibold">Chat com TINA</h2>
                  <p className="text-sm opacity-90">Assistente especializada em destinação de IR</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {userData.impostoDevido && (
                  <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs">
                    Potencial: {formatCurrency(userData.potencialDestinacao)}
                  </div>
                )}
                <div className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[500px] overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
            {messages.map(renderMessage)}
            
            {isTyping && (
              <div className="flex justify-start mb-6">
                <div className="flex">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl px-5 py-4 shadow-xl border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-xs text-gray-500 ml-2">TINA está pensando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-6 border-t bg-white">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  chatMode === 'calculating' 
                    ? "Digite o valor do Imposto Devido (ex: 7500)" 
                    : "Digite o valor do Imposto Devido ou faça uma pergunta..."
                }
                className="flex-1 border-2 border-gray-200 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white rounded-full p-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setInputValue('7500')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                Exemplo: 7500
              </button>
              <button
                onClick={() => setInputValue('Como funciona')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                Como funciona?
              </button>
              <button
                onClick={() => setInputValue('Posso destinar se já doei para igreja?')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                Já doei para igreja
              </button>
              <button
                onClick={() => setInputValue('Servidor aposentado pode destinar?')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                Sou aposentado
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-green-600 mb-2">99.7%</div>
            <div className="text-gray-600 text-sm font-medium">Conformidade Fiscal</div>
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mt-2" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">2.847</div>
            <div className="text-gray-600 text-sm font-medium">Servidores Atendidos</div>
            <Users className="w-5 h-5 text-blue-500 mx-auto mt-2" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">R$ 8.2M</div>
            <div className="text-gray-600 text-sm font-medium">Destinados com Segurança</div>
            <Target className="w-5 h-5 text-purple-500 mx-auto mt-2" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-pink-600 mb-2">IA</div>
            <div className="text-gray-600 text-sm font-medium">Powered by TINA</div>
            <Brain className="w-5 h-5 text-pink-500 mx-auto mt-2" />
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>TINA - Tecnologia Inteligente para destinação de IR | IncentivaBR © 2024</p>
          <p className="mt-1">Atendimento especializado para servidores públicos</p>
        </div>
      </div>
    </div>
  );
};

export default AssistenteTINA;
