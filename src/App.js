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
        
      case 'perguntar_mais':
        addMessage('💬 Quero fazer outra pergunta');
        simulateTyping(() => {
          addMessage(
            '💬 **Perfeito! Sou especialista em destinação de IR.**\n\n**📋 CATEGORIAS DE PERGUNTAS:**\n\n**💰 FINANCEIRAS:**\n• Valores, limites, cálculos\n• Compatibilidade com doações\n• Situações específicas de renda\n\n**⏰ PROCESSUAIS:**\n• Prazos, cancelamentos, alterações\n• Documentação, comprovantes\n• Mudanças de estado/situação\n\n**👥 PESSOAS:**\n• Aposentados, dependentes, MEI\n• Funcionários públicos vs privados\n• Brasileiros no exterior\n\n**🎯 PROJETOS:**\n• Como escolher, avaliar qualidade\n• Acompanhar resultados\n• Diversificar destinações\n\n**🌍 CURIOSIDADES:**\n• História, números, impacto\n• Comparações internacionais\n• Casos de sucesso\n\n✨ **Digite sua pergunta que eu respondo com detalhes!**',
            'bot',
            [
              { text: '❓ Ver perguntas frequentes', action: 'perguntas_frequentes' },
              { text: '🧮 Calcular potencial', action: 'calcular' },
              { text: '🎯 Ver projetos', action: 'projetos' }
            ]
          );
        });
        break;
        
      case 'calcular':
        addMessage('🧮 Quero calcular meu potencial');
        simulateTyping(() => {
          addMessage(
            '📊 **Vou calcular seu potencial!**\n\n**⚠️ IMPORTANTE:** Somente declaração COMPLETA pode destinar IR!\n\n**Você faz declaração COMPLETA?**',
            'bot',
            [
              { text: '✅ Sim, faço COMPLETA', action: 'completa_sim' },
              { text: '❌ Faço SIMPLIFICADA', action: 'simplificada' },
              { text: '🤔 Não sei', action: 'nao_sei' }
            ]
          );
        });
        break;
        
      case 'completa_sim':
        addMessage('✅ Sim, faço declaração COMPLETA');
        simulateTyping(() => {
          addMessage(
            '🎉 **Perfeito! Você pode destinar IR!**\n\n**Qual sua faixa de renda anual?**',
            'bot',
            [
              { text: 'Até R$ 50.000', action: 'renda_50k' },
              { text: 'R$ 50k - R$ 100k', action: 'renda_100k' },
              { text: 'R$ 100k - R$ 200k', action: 'renda_200k' },
              { text: 'Acima de R$ 200k', action: 'renda_200k_plus' }
            ]
          );
        });
        break;

      case 'renda_50k':
        addMessage('💰 Até R$ 50.000/ano');
        simulateTyping(() => {
          addMessage(
            '🎯 **Seu Potencial Calculado:**\n\n**💰 Renda:** R$ 40.000\n**📊 IR Devido:** R$ 2.100\n**🎯 Destinação (6%):** R$ 126\n\n**🚀 Com R$ 126 você pode:**\n• Material escolar para 12 crianças\n• 5 consultas médicas gratuitas\n• Livros para uma biblioteca comunitária\n\n**✅ Todo valor é 100% deduzido do seu IR!**\n\n**💡 DICA TINA:** Valores pequenos, impacto gigante!',
            'bot',
            [
              { text: '🎯 Ver projetos recomendados', action: 'projetos' },
              { text: '💬 "Como meu valor faz diferença?"', action: 'valor_pequeno' },
              { text: '📋 Como fazer destinação', action: 'como_fazer' }
            ]
          );
        });
        break;

      case 'renda_100k':
        addMessage('💰 R$ 50k - R$ 100k/ano');
        simulateTyping(() => {
          addMessage(
            '🎯 **Seu Potencial Calculado:**\n\n**💰 Renda:** R$ 75.000\n**📊 IR Devido:** R$ 7.800\n**🎯 Destinação (6%):** R$ 468\n\n**🚀 Com R$ 468 você pode:**\n• Material escolar para 46 crianças\n• 18 consultas médicas especializadas\n• Equipar uma pequena biblioteca\n• Apoiar 7 jovens em cursos profissionalizantes\n\n**✅ Todo valor é 100% deduzido do seu IR!**\n\n**🏆 PERFIL:** Transformador Ativo da classe média!',
            'bot',
            [
              { text: '🎯 Ver projetos recomendados', action: 'projetos' },
              { text: '💬 "Como diversificar destinação?"', action: 'diversificar' },
              { text: '📋 Como fazer destinação', action: 'como_fazer' }
            ]
          );
        });
        break;

      case 'renda_200k':
        addMessage('💰 R$ 100k - R$ 200k/ano');
        simulateTyping(() => {
          addMessage(
            '🎯 **Seu Potencial Calculado:**\n\n**💰 Renda:** R$ 150.000\n**📊 IR Devido:** R$ 24.000\n**🎯 Destinação (6%):** R$ 1.440\n\n**🚀 Com R$ 1.440 você pode:**\n• Material escolar para 144 crianças\n• 57 consultas médicas especializadas\n• Equipar uma biblioteca completa\n• Apoiar 24 jovens em cursos profissionalizantes\n• Financiar uma pequena reforma escolar\n\n**✅ Todo valor é 100% deduzido do seu IR!**\n\n**🏆 PERFIL:** Agente de Mudança Social!',
            'bot',
            [
              { text: '🎯 Ver projetos recomendados', action: 'projetos' },
              { text: '💬 "Como maximizar impacto?"', action: 'maximizar' },
              { text: '📋 Como fazer destinação', action: 'como_fazer' }
            ]
          );
        });
        break;

      case 'renda_200k_plus':
        addMessage('💰 Acima de R$ 200k/ano');
        simulateTyping(() => {
          addMessage(
            '🎯 **Seu Potencial Calculado:**\n\n**💰 Renda:** R$ 300.000\n**📊 IR Devido:** R$ 63.000\n**🎯 Destinação (6%):** R$ 3.780\n\n**🚀 Com R$ 3.780 você pode:**\n• Material escolar para 378 crianças\n• 150 consultas médicas especializadas\n• Equipar 3 bibliotecas completas\n• Apoiar 63 jovens em cursos profissionalizantes\n• Financiar um laboratório de informática\n• Criar uma escolinha esportiva\n\n**✅ Todo valor é 100% deduzido do seu IR!**\n\n**🏆 PERFIL:** Líder Filantrópico - Transformador de Vidas!',
            'bot',
            [
              { text: '🎯 Ver projetos estruturantes', action: 'projetos' },
              { text: '💬 "Como ser referência social?"', action: 'referencia' },
              { text: '📋 Estratégia de destinação', action: 'estrategia' }
            ]
          );
        });
        break;

      case 'simplificada':
        addMessage('❌ Faço declaração SIMPLIFICADA');
        simulateTyping(() => {
          addMessage(
            '😔 **Infelizmente, declaração SIMPLIFICADA não pode destinar IR.**\n\n**📋 Por que não pode?**\n• Usa desconto padrão de 20%\n• Não gera imposto devido suficiente\n• Foco em simplificação, não personalização\n\n**💡 Mas posso te ajudar a mudar!**\n\n**🔄 Você pode mudar para COMPLETA se:**\n• Suas despesas dedutíveis > 20% da renda\n• Tem gastos médicos, educação, previdência\n• Quer participar do desenvolvimento social\n\n**📊 SIMULAÇÃO RÁPIDA:**\n• Renda R$ 60.000/ano\n• 20% = R$ 12.000\n• Se seus gastos > R$ 12.000 → Vale mudar!\n\n**🎯 BENEFÍCIOS:**\n• Pagar menos IR + poder destinar\n• Dupla vantagem fiscal e social',
            'bot',
            [
              { text: '💡 Como mudar para completa?', action: 'como_mudar' },
              { text: '📊 Simular se vale a pena', action: 'simular' },
              { text: '🤔 Que despesas posso deduzir?', action: 'despesas' }
            ]
          );
        });
        break;

      case 'projetos':
        addMessage('🎯 Quero ver projetos');
        simulateTyping(() => {
          addMessage(
            '🎯 **Projetos Recomendados por TINA:**\n\n**📚 EDUCAÇÃO:**\n• Biblioteca Digital Inclusiva - R$ 8.500\n• Laboratório STEAM Móvel - R$ 12.000\n• Formação de Professores - R$ 6.800\n• Bolsas de Estudo - R$ 3.200\n\n**🏥 SAÚDE:**\n• UTI Neonatal Digital - R$ 18.000\n• Telemedicina Rural - R$ 9.200\n• Reabilitação Neurológica - R$ 15.500\n• Clínica Móvel - R$ 7.800\n\n**⚖️ JUSTIÇA:**\n• Mediação Digital Comunitária - R$ 7.800\n• Educação Jurídica Popular - R$ 8.900\n• Defensoria Pública - R$ 12.500\n\n**💰 ADMINISTRAÇÃO:**\n• Educação Financeira Jovem - R$ 6.500\n• Transparência Fiscal Cidadã - R$ 14.800\n• Inovação no Serviço Público - R$ 11.000\n\n**🎭 CULTURA:**\n• Teatro Comunitário - R$ 5.500\n• Orquestra Jovem - R$ 8.800\n• Patrimônio Histórico - R$ 16.000',
            'bot',
            [
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '📋 Como escolher projeto', action: 'como_escolher' },
              { text: '💬 "Como avaliar qualidade?"', action: 'avaliar_qualidade' }
            ]
          );
        });
        break;

      case 'explicar':
        addMessage('📚 Como funciona a destinação?');
        simulateTyping(() => {
          addMessage(
            '📚 **Como Funciona a Destinação de IR:**\n\n**🔹 O que é?**\nVocê pode destinar até 6% do seu IR devido para projetos sociais aprovados pelo governo.\n\n**🔹 Custa algo extra?**\n**NÃO!** É o mesmo valor que você pagaria de IR, só escolhe o destino.\n\n**🔹 Quem pode?**\nApenas quem faz **declaração COMPLETA** e tem IR devido.\n\n**🔹 Como funciona?**\n1. Escolhe projetos pré-aprovados pelo governo\n2. Destina durante o ano ou na declaração\n3. Valor é 100% deduzido do IR\n4. Acompanha o impacto gerado\n\n**🔹 Áreas disponíveis:**\n• Cultura (Lei Rouanet)\n• Criança e Adolescente (ECA)\n• Idoso (Lei do Idoso)\n• Esporte (Lei do Esporte)\n\n**🎯 Resultado:** Mesmo imposto + Propósito social definido!',
            'bot',
            [
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '🎯 Ver projetos disponíveis', action: 'projetos' },
              { text: '🛡️ É seguro juridicamente?', action: 'seguranca' }
            ]
          );
        });
        break;

      case 'seguranca':
        addMessage('🛡️ É seguro juridicamente?');
        simulateTyping(() => {
          addMessage(
            '🛡️ **100% Seguro e Legal!**\n\n**✅ Base Legal Sólida:**\n• Lei Rouanet (8.313/91) - Cultura\n• ECA (8.069/90) - Criança e Adolescente\n• Lei do Idoso (10.741/03)\n• Lei do Esporte (11.438/06)\n• IN RFB 2.017/21 - Procedimentos atualizados\n\n**🔐 Garantias IncentivaBR:**\n• Registro INPI BR512025000647-0\n• 99.7% de conformidade fiscal\n• Zero autuações em 5 anos\n• Certificação digital em todos os recibos\n• Compliance ativo 24/7\n\n**📊 Controle Governamental:**\n• CGU (Controladoria Geral da União)\n• TCU (Tribunal de Contas da União)\n• Ministério Público Federal\n• Receita Federal\n• Ministérios setoriais\n\n**📈 Track Record:**\n• 2.847+ servidores atendidos\n• R$ 8.2M+ destinados com segurança\n• Processos 100% auditados\n• Transparência total\n\n**🎯 Garantia TINA:** Zero risco fiscal + Máxima tranquilidade!',
            'bot',
            [
              { text: '🧮 Calcular com segurança', action: 'calcular' },
              { text: '📋 Ver certificações', action: 'certificacoes' },
              { text: '💬 "Como é o controle?"', action: 'controle_governo' }
            ]
          );
        });
        break;

      default:
        addMessage(
          '🤔 **Entendi!** Como posso te ajudar especificamente?\n\n**💡 Tenho uma base de conhecimento completa sobre:**\n• Cálculos e simulações\n• Perguntas frequentes\n• Curiosidades históricas\n• Mitos e verdades\n• Situações específicas\n\n**✨ Digite sua pergunta ou escolha uma opção:**',
          'bot',
          [
            { text: '🧮 Calcular potencial', action: 'calcular' },
            { text: '🎯 Ver projetos', action: 'projetos' },
            { text: '❓ Perguntas frequentes', action: 'perguntas_frequentes' },
            { text: '🌍 Curiosidades', action: 'curiosidades' }
          ]
        );
        break;
    }
  };import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, Bot, Calculator, Heart, Send, Sparkles, Shield, Target, Brain } from 'lucide-react';

const AssistenteTINA = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState({});
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);

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
      },
      "e se mudar de estado": {
        keywords: ["mudar estado", "mudança", "outro estado", "transferir"],
        answer: "📍 **Mudança de estado não afeta a destinação!**\n\n**✅ REGRAS FEDERAIS:**\n• IR é federal, não estadual\n• Destinação vale para todo o Brasil\n• Pode destinar para projetos de qualquer estado\n\n**🏠 CENÁRIOS COMUNS:**\n\n**Durante o ano:**\n• Mudou em março? Sem problema\n• Destinação continua válida\n• Atualiza apenas endereço na Receita\n\n**Na declaração:**\n• Informa novo endereço\n• Destinação permanece ativa\n• Projetos continuam recebendo\n\n**🎯 OPORTUNIDADE:**\n• Pode apoiar projetos do estado de origem\n• Ou focar no novo estado\n• Ou diversificar nacionalmente\n\n**💡 DICA TINA:** Destinação é nacional!"
      },
      "servidor aposentado pode": {
        keywords: ["aposentado", "pensionista", "inativo", "aposentadoria"],
        answer: "✅ **Sim! Servidor aposentado pode destinar normalmente!**\n\n**👨‍🦳 SERVIDORES APOSENTADOS:**\n• Mesmo direito de destinação\n• Até 6% do IR devido\n• Processo idêntico aos ativos\n\n**💰 CENÁRIO TÍPICO:**\n• Aposentadoria: R$ 8.000/mês\n• IR anual: R$ 15.000\n• Destinação possível: R$ 900/ano\n\n**📋 PENSIONISTAS:**\n• Também podem destinar\n• Seguem mesmas regras\n• Declaração em nome do pensionista\n\n**🎯 VANTAGENS ESPECIAIS:**\n• Mais tempo para pesquisar projetos\n• Pode acompanhar impacto de perto\n• Experiência profissional ajuda na escolha\n\n**💡 DICA TINA:**\n• Aposentadoria não é fim da contribuição social\n• É nova forma de impacto!\n• Sua experiência tem valor!"
      },
      "dependente pode destinar": {
        keywords: ["dependente", "filho", "cônjuge", "esposa", "marido"],
        answer: "👨‍👩‍👧‍👦 **Dependente só pode destinar se tiver IR próprio!**\n\n**📋 REGRAS IMPORTANTES:**\n\n**✅ DEPENDENTE COM IR PRÓPRIO:**\n• Faz declaração separada\n• Tem IR devido próprio\n• Pode destinar normalmente\n\n**❌ DEPENDENTE SEM IR:**\n• Não tem IR devido\n• Não pode destinar\n• Titular pode destinar por toda família\n\n**💰 ESTRATÉGIA FAMILIAR:**\n• Titular destina o máximo (6%)\n• Cônjuge com renda própria: destina também\n• Filhos maiores trabalhando: podem destinar\n\n**🎯 EXEMPLO PRÁTICO:**\n• Servidor: R$ 1.200 destinação\n• Cônjuge professora: R$ 400 destinação\n• Filho estagiário: R$ 50 destinação\n• **Total família:** R$ 1.650 de impacto!\n\n**💡 DICA TINA:** Família unida multiplica impacto!"
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
      },
      "como governo controla": {
        keywords: ["controle", "fiscalização", "auditoria", "transparência"],
        answer: "🔍 **Como o Governo Controla a Destinação:**\n\n**📋 APROVAÇÃO PRÉVIA:**\n• Todos os projetos são pré-aprovados\n• Análise técnica rigorosa\n• Documentação completa exigida\n• Capacidade de execução avaliada\n\n**💰 CONTROLE FINANCEIRO:**\n• Recursos em conta específica\n• Movimentação monitorada\n• Prestação de contas obrigatória\n• Auditoria permanente\n\n**📊 SISTEMAS DE CONTROLE:**\n• SALIC (Sistema de Apoio à Cultura)\n• SIPIA (Sistema de Informações da Criança)\n• SIFUNID (Sistema do Fundo do Idoso)\n• SIESP (Sistema de Esporte)\n\n**🔎 FISCALIZAÇÃO:**\n• CGU (Controladoria Geral da União)\n• TCU (Tribunal de Contas da União)\n• Ministério Público\n• Receita Federal\n\n**⚖️ PENALIDADES:**\n• Devolução em dobro\n• Multa de até 200%\n• Inabilitação permanente\n• Processo criminal\n\n**🛡️ TRANSPARÊNCIA:**\n• Portal da Transparência\n• Dados públicos online\n• Relatórios anuais\n• Acompanhamento cidadão\n\n**💡 TINA GARANTE:** Sistema blindado!"
      }
    },

    // Situações Específicas
    situacoes: {
      "mei pode destinar": {
        keywords: ["mei", "microempreendedor", "individual", "pequeno"],
        answer: "👨‍💼 **MEI pode destinar? Depende!**\n\n**✅ MEI COM IR DEVIDO:**\n• Faturamento alto (próximo ao limite)\n• Outras rendas além do MEI\n• Faz declaração completa\n• Tem imposto a pagar\n\n**❌ MEI SEM IR:**\n• Só receita do MEI\n• Dentro do limite anual\n• Isento de IR\n• Não pode destinar\n\n**💰 EXEMPLO PRÁTICO:**\n• MEI faturou R$ 81.000 (limite)\n• + Aluguel: R$ 24.000/ano\n• + Dividendos: R$ 15.000/ano\n• **Total:** R$ 120.000/ano\n• **Resultado:** Tem IR devido, pode destinar!\n\n**📊 CÁLCULO RÁPIDO:**\n• Renda total > R$ 28.559,70/ano\n• Provavelmente tem IR devido\n• Pode destinar normalmente\n\n**💡 DICA TINA:** MEI próspero pode destinar!"
      },
      "funcionario publico e privado": {
        keywords: ["público", "privado", "clt", "funcionário"],
        answer: "👥 **Todos podem destinar! Público e Privado!**\n\n**✅ SERVIDOR PÚBLICO:**\n• Federal, estadual, municipal\n• Ativos e aposentados\n• Comissionados e efetivos\n• Mesmas regras para todos\n\n**✅ FUNCIONÁRIO PRIVADO:**\n• CLT, autônomos, profissionais liberais\n• Empresários, sócios\n• Freelancers com IR devido\n• Aposentados do INSS\n\n**📊 ÚNICA DIFERENÇA:**\n• Desconto na fonte (automático)\n• Público: Via folha de pagamento\n• Privado: Via declaração ou carnê\n\n**💡 VANTAGEM SERVIDOR:**\n• Desconto direto na folha\n• Mais prático e seguro\n• Acompanhamento automático\n• Maior controle fiscal\n\n**🎯 ESTRATÉGIA COMUM:**\n• Ambos podem destinar 6%\n• Mesmos projetos disponíveis\n• Mesmo impacto social\n• Mesma segurança jurídica\n\n**💪 UNIÃO PELO BEM:** Público + Privado = Impacto!"
      },
      "pessoa fisica no exterior": {
        keywords: ["exterior", "fora do brasil", "expatriado", "imigrante"],
        answer: "🌍 **Brasileiro no Exterior pode destinar!**\n\n**✅ RESIDENTE FISCAL NO BRASIL:**\n• Ainda declara IR no Brasil\n• Pode destinar normalmente\n• Até 6% do IR devido\n• Processo online de qualquer lugar\n\n**❌ NÃO RESIDENTE FISCAL:**\n• Não declara IR no Brasil\n• Não tem IR devido no Brasil\n• Não pode destinar\n• Pode fazer doações diretas\n\n**📋 COMO SABER:**\n• Saiu definitivamente do Brasil?\n• Comunicou saída à Receita?\n• Tem renda/bens no Brasil?\n• Passa mais de 183 dias/ano no Brasil?\n\n**💰 EXEMPLO PRÁTICO:**\n• Brasileiro em Portugal\n• Mantém apartamento no Brasil\n• Aluga por R$ 36.000/ano\n• **Resultado:** Tem IR devido, pode destinar!\n\n**🎯 OPORTUNIDADE:**\n• Manter vínculo com Brasil\n• Apoiar projetos da terra natal\n• Impacto social à distância\n\n**💡 DICA TINA:** Coração brasileiro não tem fronteiras!"
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
    
    // Buscar em todas as categorias
    const allCategories = [
      ...Object.entries(knowledgeBase.faq),
      ...Object.entries(knowledgeBase.curiosidades),
      ...Object.entries(knowledgeBase.situacoes),
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
      content: '👋 **Olá! Eu sou a TINA**, sua Assistente Inteligente do IncentivaBR!\n\n💫 **TINA vem de "desTINA"** - porque minha missão é te ajudar a destinar seu IR de forma inteligente!\n\n🎯 **REGRA IMPORTANTE:** Somente quem faz **DECLARAÇÃO COMPLETA** pode destinar IR!\n\n✨ Como posso te ajudar hoje?',
      timestamp: new Date(),
      quickActions: [
        { text: '🧮 Calcular meu potencial', action: 'calcular' },
        { text: '🎯 Ver projetos', action: 'projetos' },
        { text: '📚 Como funciona', action: 'explicar' },
        { text: '🛡️ É seguro?', action: 'seguranca' }
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  const addMessage = (content, type = 'user', quickActions = null) => {
    const message = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date(),
      quickActions
    };
    setMessages(prev => [...prev, message]);
  };

  const simulateTyping = (callback, delay = 1500) => {
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

  const handleQuickAction = (action) => {
    setShowQuickActions(false);
    
    switch(action) {
      case 'calcular':
        addMessage('🧮 Quero calcular meu potencial');
        simulateTyping(() => {
          addMessage(
            '📊 **Vou calcular seu potencial!**\n\n**⚠️ IMPORTANTE:** Somente declaração COMPLETA pode destinar IR!\n\n**Você faz declaração COMPLETA?**',
            'bot',
            [
              { text: '✅ Sim, faço COMPLETA', action: 'completa_sim' },
              { text: '❌ Faço SIMPLIFICADA', action: 'simplificada' },
              { text: '🤔 Não sei', action: 'nao_sei' }
            ]
          );
        });
        break;
        
      case 'completa_sim':
        addMessage('✅ Sim, faço declaração COMPLETA');
        simulateTyping(() => {
          addMessage(
            '🎉 **Perfeito! Você pode destinar IR!**\n\n**Qual sua faixa de renda anual?**',
            'bot',
            [
              { text: 'Até R$ 50.000', action: 'renda_50k' },
              { text: 'R$ 50k - R$ 100k', action: 'renda_100k' },
              { text: 'R$ 100k - R$ 200k', action: 'renda_200k' },
              { text: 'Acima de R$ 200k', action: 'renda_200k_plus' }
            ]
          );
        });
        break;

      case 'renda_50k':
        addMessage('💰 Até R$ 50.000/ano');
        simulateTyping(() => {
          addMessage(
            '🎯 **Seu Potencial Calculado:**\n\n**💰 Renda:** R$ 40.000\n**📊 IR Devido:** R$ 2.100\n**🎯 Destinação (6%):** R$ 126\n\n**🚀 Com R$ 126 você pode:**\n• Material escolar para 12 crianças\n• 5 consultas médicas gratuitas\n• Livros para uma biblioteca comunitária\n\n**✅ Todo valor é 100% deduzido do seu IR!**',
            'bot',
            [
              { text: '🎯 Ver projetos recomendados', action: 'projetos' },
              { text: '📋 Como fazer destinação', action: 'como_fazer' },
              { text: '🧮 Calcular outra faixa', action: 'calcular' }
            ]
          );
        });
        break;

      case 'renda_100k':
        addMessage('💰 R$ 50k - R$ 100k/ano');
        simulateTyping(() => {
          addMessage(
            '🎯 **Seu Potencial Calculado:**\n\n**💰 Renda:** R$ 75.000\n**📊 IR Devido:** R$ 7.800\n**🎯 Destinação (6%):** R$ 468\n\n**🚀 Com R$ 468 você pode:**\n• Material escolar para 46 crianças\n• 18 consultas médicas especializadas\n• Equipar uma pequena biblioteca\n\n**✅ Todo valor é 100% deduzido do seu IR!**',
            'bot',
            [
              { text: '🎯 Ver projetos recomendados', action: 'projetos' },
              { text: '📋 Como fazer destinação', action: 'como_fazer' },
              { text: '🧮 Calcular outra faixa', action: 'calcular' }
            ]
          );
        });
        break;

      case 'renda_200k':
        addMessage('💰 R$ 100k - R$ 200k/ano');
        simulateTyping(() => {
          addMessage(
            '🎯 **Seu Potencial Calculado:**\n\n**💰 Renda:** R$ 150.000\n**📊 IR Devido:** R$ 24.000\n**🎯 Destinação (6%):** R$ 1.440\n\n**🚀 Com R$ 1.440 você pode:**\n• Material escolar para 144 crianças\n• 57 consultas médicas especializadas\n• Equipar uma biblioteca completa\n• Apoiar 24 jovens em cursos profissionalizantes\n\n**✅ Todo valor é 100% deduzido do seu IR!**',
            'bot',
            [
              { text: '🎯 Ver projetos recomendados', action: 'projetos' },
              { text: '📋 Como fazer destinação', action: 'como_fazer' },
              { text: '🧮 Calcular outra faixa', action: 'calcular' }
            ]
          );
        });
        break;

      case 'renda_200k_plus':
        addMessage('💰 Acima de R$ 200k/ano');
        simulateTyping(() => {
          addMessage(
            '🎯 **Seu Potencial Calculado:**\n\n**💰 Renda:** R$ 300.000\n**📊 IR Devido:** R$ 63.000\n**🎯 Destinação (6%):** R$ 3.780\n\n**🚀 Com R$ 3.780 você pode:**\n• Material escolar para 378 crianças\n• 150 consultas médicas especializadas\n• Equipar 3 bibliotecas completas\n• Apoiar 63 jovens em cursos profissionalizantes\n• Financiar um laboratório de informática\n\n**✅ Todo valor é 100% deduzido do seu IR!\n🏆 Você tem potencial para ser um grande transformador social!**',
            'bot',
            [
              { text: '🎯 Ver projetos recomendados', action: 'projetos' },
              { text: '📋 Como fazer destinação', action: 'como_fazer' },
              { text: '🧮 Calcular outra faixa', action: 'calcular' }
            ]
          );
        });
        break;

      case 'simplificada':
        addMessage('❌ Faço declaração SIMPLIFICADA');
        simulateTyping(() => {
          addMessage(
            '😔 **Infelizmente, declaração SIMPLIFICADA não pode destinar IR.**\n\n**📋 Por que não pode?**\n• Usa desconto padrão de 20%\n• Não gera imposto devido suficiente\n\n**💡 Mas posso te ajudar a mudar!**\n\n**🔄 Você pode mudar para COMPLETA se:**\n• Suas despesas dedutíveis > 20% da renda\n• Tem gastos médicos, educação, previdência\n• Vale a pena para poder destinar IR',
            'bot',
            [
              { text: '💡 Como mudar para completa?', action: 'como_mudar' },
              { text: '📊 Simular se vale a pena', action: 'simular' },
              { text: '🤔 Que despesas posso deduzir?', action: 'despesas' }
            ]
          );
        });
        break;

      case 'projetos':
        addMessage('🎯 Quero ver projetos');
        simulateTyping(() => {
          addMessage(
            '🎯 **Projetos Recomendados para Servidores:**\n\n**📚 EDUCAÇÃO:**\n• Biblioteca Digital Inclusiva - R$ 8.500\n• Laboratório STEAM Móvel - R$ 12.000\n• Formação de Professores - R$ 6.800\n\n**🏥 SAÚDE:**\n• UTI Neonatal Digital - R$ 18.000\n• Telemedicina Rural - R$ 9.200\n• Reabilitação Neurológica - R$ 15.500\n\n**⚖️ JUSTIÇA:**\n• Mediação Digital Comunitária - R$ 7.800\n• Educação Jurídica Popular - R$ 8.900\n\n**💰 ADMINISTRAÇÃO:**\n• Educação Financeira Jovem - R$ 6.500\n• Transparência Fiscal Cidadã - R$ 14.800',
            'bot',
            [
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '📋 Como escolher projeto', action: 'como_escolher' },
              { text: '📞 Falar com especialista', action: 'especialista' }
            ]
          );
        });
        break;

      case 'explicar':
        addMessage('📚 Como funciona a destinação?');
        simulateTyping(() => {
          addMessage(
            '📚 **Como Funciona a Destinação de IR:**\n\n**🔹 O que é?**\nVocê pode destinar até 6% do seu IR devido para projetos sociais aprovados pelo governo.\n\n**🔹 Custa algo extra?**\n**NÃO!** É o mesmo valor que você pagaria de IR, só escolhe o destino.\n\n**🔹 Quem pode?**\nApenas quem faz **declaração COMPLETA**.\n\n**🔹 Como funciona?**\n1. Escolhe projetos aprovados\n2. Destina durante o ano ou na declaração\n3. Valor é 100% deduzido do IR\n4. Acompanha o impacto gerado\n\n**🎯 Resultado:** Mesmo imposto + Propósito social!',
            'bot',
            [
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '🎯 Ver projetos disponíveis', action: 'projetos' },
              { text: '🛡️ É seguro juridicamente?', action: 'seguranca' }
            ]
          );
        });
        break;

      case 'seguranca':
        addMessage('🛡️ É seguro juridicamente?');
        simulateTyping(() => {
          addMessage(
            '🛡️ **100% Seguro e Legal!**\n\n**✅ Base Legal Sólida:**\n• Lei Rouanet (8.313/91) - Cultura\n• ECA (8.069/90) - Criança e Adolescente\n• Lei do Idoso (10.741/03)\n• Lei do Esporte (11.438/06)\n\n**🔐 Garantias IncentivaBR:**\n• Registro INPI BR512025000647-0\n• 99.7% de conformidade fiscal\n• Zero autuações em 5 anos\n• Certificação digital\n• Compliance ativo 24/7\n\n**📊 Track Record:**\n• 2.847+ servidores atendidos\n• R$ 8.2M+ destinados com segurança\n• Processos 100% auditados\n\n**🎯 Garantia TINA:** Zero risco fiscal!',
            'bot',
            [
              { text: '🧮 Calcular com segurança', action: 'calcular' },
              { text: '📋 Ver certificações', action: 'certificacoes' },
              { text: '📞 Falar com jurídico', action: 'juridico' }
            ]
          );
        });
        break;

      default:
        addMessage(
          '🤔 **Entendi!** Como posso te ajudar especificamente?',
          'bot',
          [
            { text: '🧮 Calcular potencial', action: 'calcular' },
            { text: '🎯 Ver projetos', action: 'projetos' },
            { text: '📚 Como funciona', action: 'explicar' }
          ]
        );
        break;
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const userMessage = inputValue;
      addMessage(userMessage);
      setInputValue('');
      
      // Resposta simples baseada em palavras-chave
      const input = userMessage.toLowerCase();
      simulateTyping(() => {
        if (input.includes('calcul') || input.includes('quanto')) {
          handleQuickAction('calcular');
        } else if (input.includes('projeto')) {
          handleQuickAction('projetos');
        } else if (input.includes('como') || input.includes('funciona')) {
          handleQuickAction('explicar');
        } else if (input.includes('segur') || input.includes('legal')) {
          handleQuickAction('seguranca');
        } else {
          addMessage(
            '💭 **Entendi sua pergunta!** Para te dar a melhor resposta, que tal escolher uma das opções abaixo?',
            'bot',
            [
              { text: '🧮 Calcular potencial', action: 'calcular' },
              { text: '🎯 Ver projetos', action: 'projetos' },
              { text: '📚 Como funciona', action: 'explicar' },
              { text: '🛡️ É seguro?', action: 'seguranca' }
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
            : 'bg-white shadow-xl border border-gray-100'
        }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content.split('**').map((part, index) => 
              index % 2 === 1 ? (
                <strong key={index} className={message.type === 'user' ? 'text-blue-100' : 'text-gray-800'}>
                  {part}
                </strong>
              ) : (
                <span key={index} className={message.type === 'user' ? 'text-white' : 'text-gray-700'}>
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
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
        {/* Header */}
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
        </div>

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => handleQuickAction('calcular')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
            >
              <Calculator className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-sm font-semibold mb-2">Calcular Potencial</div>
              <div className="text-xs opacity-90">Descubra quanto você pode destinar</div>
            </button>
            
            <button
              onClick={() => handleQuickAction('projetos')}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
            >
              <Heart className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-sm font-semibold mb-2">Ver Projetos</div>
              <div className="text-xs opacity-90">Encontre projetos da sua área</div>
            </button>
            
            <button
              onClick={() => handleQuickAction('explicar')}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
            >
              <MessageCircle className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-sm font-semibold mb-2">Como Funciona</div>
              <div className="text-xs opacity-90">Entenda o processo completo</div>
            </button>
            
            <button
              onClick={() => handleQuickAction('seguranca')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
            >
              <Shield className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-sm font-semibold mb-2">Segurança Jurídica</div>
              <div className="text-xs opacity-90">Garantias e conformidade</div>
            </button>
          </div>
        )}

        {/* Chat Interface */}
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
              <div className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">Online</span>
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
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                placeholder="Converse com TINA sobre destinação de IR..."
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
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">99.7%</div>
            <div className="text-gray-600 text-sm font-medium">Conformidade Fiscal</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">2.847</div>
            <div className="text-gray-600 text-sm font-medium">Servidores Atendidos</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">R$ 8.2M</div>
            <div className="text-gray-600 text-sm font-medium">Destinados com Segurança</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">IA</div>
            <div className="text-gray-600 text-sm font-medium">Powered by TINA</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistenteTINA;
