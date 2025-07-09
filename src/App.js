import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, Bot, Calculator, Heart, Send, Sparkles, Shield, Target, Brain, CheckCircle, BookOpen, HelpCircle } from 'lucide-react';

const AssistenteTINA = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState({});
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [chatMode, setChatMode] = useState('welcome');
  const messagesEndRef = useRef(null);

  // BASE DE CONHECIMENTO EXPANDIDA
  const serverKnowledge = {
    "desconto na fonte": {
      keywords: ["desconto na fonte", "imposto retido", "salario", "contracheque", "fonte"],
      answer: "✅ **Sim! Desconto na fonte não impede destinação!**\n\n**📋 COMO FUNCIONA:**\n• Imposto retido na fonte ≠ Imposto devido\n• O que importa é o IR devido na declaração anual\n• Destinação é baseada no cálculo final da declaração\n\n**💰 EXEMPLO PRÁTICO:**\n• Servidor tem R$ 12.000 retidos no ano\n• Na declaração: IR devido = R$ 8.000\n• Destinação possível: R$ 560 (7% de R$ 8.000)\n• Diferença vira restituição\n\n**🎯 PROCESSO:**\n1. Faça sua declaração normalmente\n2. Veja o \"Imposto Devido\" final\n3. Calcule 7% desse valor\n4. Faça a destinação\n\n**💡 DICA TINA:** Servidores frequentemente têm restituição + destinação!"
    },
    "dividir entre fundos": {
      keywords: ["dividir", "varios fundos", "multiplos projetos", "sublimites", "várias causas"],
      answer: "🎯 **Sim! Pode dividir entre várias causas!**\n\n**📊 DISTRIBUIÇÃO DOS 7%:**\n• **Criança/Adolescente:** Até 3%\n• **Idoso:** Até 3%\n• **Cultura:** Até 1%\n• **Esporte:** Até 1%\n• **Total máximo:** 7%\n\n**💰 EXEMPLO PRÁTICO (IR devido R$ 10.000):**\n• Criança: R$ 200 (2%)\n• Idoso: R$ 150 (1.5%)\n• Cultura: R$ 100 (1%)\n• Esporte: R$ 100 (1%)\n• **Total:** R$ 550 em 4 causas diferentes!\n\n**🎯 ESTRATÉGIA INTELIGENTE:**\n• Diversifique seu impacto\n• Escolha causas que te motivam\n• Respeite os sublimites\n• Acompanhe múltiplos projetos\n\n**💡 DICA TINA:** Diversificação = maior impacto social!"
    },
    "malha fina": {
      keywords: ["malha fina", "risco", "auditoria", "fiscalizacao", "problema"],
      answer: "🛡️ **Zero risco com Compliance Fiscal Ativo!**\n\n**✅ COMO EVITAR PROBLEMAS:**\n• Respeite o limite de 7%\n• Use nosso sistema de validação automática\n• Escolha apenas projetos pré-aprovados\n• Mantenha documentação digitalizada\n\n**📋 COMPLIANCE ATIVO INCLUI:**\n• Validação automática em tempo real\n• Certificado digital de conformidade\n• Responsabilidade distribuída\n• Protocolo na Receita Federal\n\n**💡 DICA TINA:** Compliance Ativo = tranquilidade total blindada!"
    }
  };

  const knowledgeBase = {
    faq: {
      "posso destinar se já doei": {
        keywords: ["doei", "doação", "igreja", "ong", "já doei"],
        answer: "💰 **Sim, você pode destinar mesmo tendo feito doações!**\n\n**📋 REGRA IMPORTANTE:**\n• Doações regulares (igreja, ONGs) são **DIFERENTES** da destinação de IR\n• Destinação é **através do governo** (7% do IR devido)\n• Doações são **voluntárias** e têm outros limites\n\n**💡 NA PRÁTICA:**\n• Você pode doar para igreja E destinar IR para projetos aprovados\n• São processos separados e complementares\n• Ambos são 100% dedutíveis (em limites diferentes)\n\n**🎯 RESULTADO:** Maximize seu impacto social com segurança total!"
      }
    },
    mitos: {
      "destinacao e sonegacao": {
        keywords: ["sonegação", "ilegal", "crime", "problema"],
        answer: "⚖️ **MITO: Destinação é sonegação!**\n\n**❌ MITO COMUM:**\n• \"Destinação é forma de sonegar\"\n• \"Governo perde dinheiro\"\n• \"É benefício para rico\"\n\n**✅ VERDADE:**\n• **100% LEGAL** - Leis federais específicas\n• **MESMO VALOR** de imposto pago\n• **GOVERNO APROVA** todos os projetos\n• **CONTROLE RIGOROSO** de recursos\n\n**💡 TINA ESCLARECE:** É direito garantido por lei, não sonegação!"
      }
    }
  };

  const searchKnowledge = (userInput) => {
    const input = userInput.toLowerCase();
    
    for (const [key, data] of Object.entries(serverKnowledge)) {
      if (data.keywords.some(keyword => input.includes(keyword))) {
        return {
          found: true,
          answer: data.answer,
          category: 'servidor_' + key
        };
      }
    }

    const allCategories = [
      ...Object.entries(knowledgeBase.faq),
      ...Object.entries(knowledgeBase.mitos)
    ];

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
      content: '👋 **Olá! Eu sou a TINA**, sua Assistente Inteligente do IncentivaBR!\n\n💫 **TINA vem de "desTINA"** - porque minha missão é te ajudar a destinar seu IR de forma inteligente e segura!\n\n🎯 **REGRA IMPORTANTE:** Somente quem faz **DECLARAÇÃO COMPLETA** pode destinar IR!\n\n✨ **Para calcular seu potencial:**\n• Encontre o "Imposto Devido" na sua declaração\n• Digite apenas o número no chat\n• Exemplo: para R$ 7.500,00 digite: 7500\n\n🚀 **Ou escolha uma opção abaixo:**',
      timestamp: new Date(),
      quickActions: [
        { text: '🧮 Calcular meu potencial', action: 'calcular' },
        { text: '🎯 Ver projetos verificados', action: 'projetos' },
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
    return examples.slice(0, 4);
  };

  const validateIRValue = (valor) => {
    if (valor < 50) return { valid: false, message: 'Valor muito baixo. Verifique se digitou corretamente.' };
    if (valor > 2000000) return { valid: false, message: 'Valor muito alto. Confirme o "Imposto Devido" na sua declaração.' };
    if (valor < 239) return { valid: false, message: 'Com este valor, você não pode destinar IR. Mínimo: R$ 239,00' };
    return { valid: true };
  };

  const handleQuickAction = (action) => {
    setShowQuickActions(false);
    
    switch(action) {
      case 'perguntas_frequentes':
        addMessage('❓ Perguntas frequentes');
        simulateTyping(() => {
          addMessage(
            '❓ **Perguntas Mais Frequentes sobre Destinação:**\n\n**💰 FINANCEIRAS:**\n• "Posso destinar se já doei para igreja?"\n• "O que acontece se eu não destinar?"\n• "MEI pode destinar?"\n\n**👥 PESSOAS:**\n• "Servidor aposentado pode destinar?"\n• "Dependente pode destinar?"\n\n**🛡️ COMPLIANCE:**\n• "Desconto na fonte impede destinação?"\n• "Consignação conta para o limite?"\n• "Como evitar malha fina?"\n\n💬 **Digite qualquer uma dessas perguntas que eu respondo detalhadamente!**',
            'bot',
            [
              { text: '💰 Perguntas financeiras', action: 'perguntas_financeiras' },
              { text: '🛡️ Compliance e segurança', action: 'compliance_duvidas' },
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
            '📊 **Vou calcular seu potencial com segurança total!**\n\n**⚠️ IMPORTANTE:** Somente declaração COMPLETA pode destinar IR!\n\n**🎯 ONDE ENCONTRAR O VALOR:**\n\n**💻 NO PROGRAMA IRPF 2024:**\n1. Abra o programa IRPF 2024\n2. Abra sua declaração\n3. Clique em "Resumo da Declaração"\n4. Encontre "IMPOSTO DEVIDO"\n\n**📱 NO APP MeuIR:**\n1. Abra "Meu Imposto de Renda"\n2. Acesse "Minhas Declarações"\n3. Toque em "Resumo"\n4. Encontre "IMPOSTO DEVIDO"\n\n**💬 Digite apenas o número:**\n• Para R$ 7.500,00 → digite: 7500\n• Para R$ 12.350,00 → digite: 12350\n\n**🔢 Encontrou o valor? Digite abaixo:**',
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
          const destinacao = Math.round(exemploValor * 0.07);
          const exemplos = calculateImpactExamples(destinacao);
          
          addMessage(
            `📊 **EXEMPLO DE CÁLCULO SEGURO:**\n\n` +
            `**💰 Imposto Devido:** ${formatCurrency(exemploValor)} (exemplo)\n` +
            `**🎯 Destinação (7%):** ${formatCurrency(destinacao)}\n` +
            `**✅ Tipo:** Declaração COMPLETA\n` +
            `**🛡️ Compliance:** Validação automática ativa\n\n` +
            `**🚀 COM ${formatCurrency(destinacao)} VOCÊ PODERIA:**\n${exemplos.join('\n')}\n\n` +
            `**⚡ AGORA CALCULE O SEU COM SEGURANÇA TOTAL:**`,
            'bot',
            [
              { text: '🧮 Calcular meu valor real', action: 'calcular' },
              { text: '🛡️ Saber sobre segurança', action: 'seguranca' }
            ]
          );
        });
        break;

      case 'aguardar_valor':
        addMessage('✅ Vou digitar o valor no chat');
        simulateTyping(() => {
          addMessage(
            '💬 **Digite o valor do Imposto Devido:**\n\n**📝 INSTRUÇÕES:**\n• Digite apenas números\n• Sem R$, pontos ou vírgulas\n• Exemplo: para R$ 7.500,00 digite: 7500\n\n**🤖 SISTEMA AUTOMÁTICO COM COMPLIANCE:**\n• Quando você digitar um número\n• Calcularei automaticamente seus 7%\n• Validarei a conformidade fiscal\n• Mostrarei exemplos de impacto\n• Recomendarei projetos verificados\n\n**⌨️ Digite seu valor agora:**',
            'bot'
          );
        });
        break;
        
      case 'projetos':
        setChatMode('exploring');
        addMessage('🎯 Quero ver projetos verificados');
        simulateTyping(() => {
          addMessage(
            '🎯 **Catálogo de Projetos Verificados IncentivaBR:**\n\n**📚 EDUCAÇÃO & CULTURA:**\n• Casa de Acolhimento Novo Amanhã - R$ 850\n• Escola Digital Comunitária - R$ 2.100\n• Biblioteca Móvel das Periferias - R$ 1.200\n• Teatro Educativo Social - R$ 1.800\n\n**🏥 SAÚDE & BEM-ESTAR:**\n• UTI Neonatal Digital - R$ 4.200\n• Telemedicina Rural - R$ 1.200\n• Programa Saúde Mental - R$ 2.500\n• Clínica Móvel Comunitária - R$ 3.800\n\n**⚽ ESPORTE & JUVENTUDE:**\n• Esporte para Todos - Centro Esportivo - R$ 900\n• Formação de Atletas - R$ 1.500\n• Escolinha de Futebol Social - R$ 800\n\n**🛡️ Todos os projetos passam por nossa validação de Compliance Fiscal Ativo**\n\n**🧮 Para ver projetos específicos para seu orçamento, calcule primeiro seu potencial!**',
            'bot',
            [
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '📋 Como escolher projeto', action: 'como_escolher' },
              { text: '🛡️ Verificação de projetos', action: 'verificacao_projetos' }
            ]
          );
        });
        break;

      case 'explicar':
        setChatMode('expert');
        addMessage('📚 Como funciona a destinação?');
        simulateTyping(() => {
          addMessage(
            '📚 **Destinação de IR - Sistema IncentivaBR:**\n\n**🔹 O que é?**\nVocê pode destinar até **7%** do seu IR devido para projetos sociais aprovados pelo governo federal.\n\n**🔹 Custa algo extra?**\n**ZERO CUSTO!** É o mesmo valor que você pagaria de IR, só escolhe o destino com segurança total.\n\n**🔹 Quem pode destinar?**\n• Declaração **COMPLETA** (não simplificada)\n• Ter **Imposto Devido** > R$ 239,00\n• Pessoa física residente no Brasil\n\n**🔹 Processo com Compliance Ativo:**\n1. Calcula 7% do Imposto Devido\n2. Escolhe projetos verificados na nossa plataforma\n3. Sistema valida automaticamente a conformidade\n4. Faz a destinação com certificado digital\n5. Valor é 100% deduzido do IR\n6. Acompanha o impacto em tempo real\n\n**🛡️ DIFERENCIAL INCENTIVABR:**\n• Compliance Fiscal Ativo (único no mundo)\n• Validação automática em tempo real\n• Responsabilidade distribuída\n• Certificado digital de conformidade\n\n**🎯 Resultado:** Mesmo imposto + Impacto social + Segurança total!',
            'bot',
            [
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '🛡️ Compliance Fiscal Ativo', action: 'compliance_ativo' }
            ]
          );
        });
        break;

      case 'compliance_ativo':
        addMessage('🛡️ O que é Compliance Fiscal Ativo?');
        simulateTyping(() => {
          addMessage(
            '🛡️ **Compliance Fiscal Ativo - Inovação IncentivaBR:**\n\n**🔐 REGISTRO INPI:** BR512025000647-0\n**🌟 ÚNICO NO MUNDO:** Tecnologia proprietária exclusiva\n\n**📋 O QUE FAZ:**\n• **Validação automática** em tempo real\n• **Múltiplas fontes** oficiais verificadas\n• **Certificado digital** de conformidade\n• **Responsabilidade distribuída** entre sistema e usuário\n• **Protocolo automático** na Receita Federal\n\n**🚀 RESULTADO:**\n• **99.7%** de conformidade fiscal\n• **Zero** autuações em 5+ anos\n• **2.847+** servidores protegidos\n• **R$ 8.2M+** destinados com segurança\n\n**💡 TINA GARANTE:** Sua destinação é blindada por tecnologia única!',
            'bot',
            [
              { text: '🧮 Calcular com proteção', action: 'calcular' },
              { text: '🎯 Ver projetos seguros', action: 'projetos' }
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
      
      const numeroMatch = inputValue.match(/\d+/g);
      if (numeroMatch && numeroMatch.length > 0) {
        const numeroDigitado = numeroMatch.join('').replace(/[^\d]/g, '');
        
        if (numeroDigitado && numeroDigitado.length >= 3) {
          const valorIR = parseInt(numeroDigitado);
          const validation = validateIRValue(valorIR);
          
          if (!validation.valid) {
            simulateTyping(() => {
              addMessage(
                `⚠️ **${validation.message}**\n\n**📋 VALORES VÁLIDOS:**\n• Mínimo: R$ 239,00 (para destinar R$ 17,00)\n• Máximo comum: R$ 100.000,00\n• Digite apenas números\n\n**💡 EXEMPLOS CORRETOS:**\n• Para R$ 1.500,00 → digite: 1500\n• Para R$ 8.750,00 → digite: 8750\n\n**🔍 Verifique o "Imposto Devido" na sua declaração e tente novamente:**`,
                'bot',
                [
                  { text: '🔍 Como encontrar o valor', action: 'calcular' },
                  { text: '🧮 Tentar outro valor', action: 'calcular' }
                ]
              );
            });
            return;
          }
          
          const destinacao = Math.round(valorIR * 0.07);
          const exemplosImpacto = calculateImpactExamples(destinacao);
          
          setUserData({
            ...userData,
            impostoDevido: valorIR,
            potencialDestinacao: destinacao,
            calculatedAt: new Date()
          });
          
          simulateTyping(() => {
            addMessage(
              `🎯 **ANÁLISE TINA - Seu Potencial com Compliance Ativo:**\n\n` +
              `**💰 Imposto Devido:** ${formatCurrency(valorIR)}\n` +
              `**🎯 Potencial de Destinação (7%):** ${formatCurrency(destinacao)}\n` +
              `**✅ Status:** Apto para destinação segura\n` +
              `**📊 Categoria:** ${destinacao < 1000 ? 'Iniciante' : destinacao < 3000 ? 'Intermediário' : 'Avançado'}\n` +
              `**🛡️ Compliance:** Validação automática ativa\n\n` +
              `**🌟 COM ${formatCurrency(destinacao)} VOCÊ PODE GERAR:**\n${exemplosImpacto.join('\n')}\n\n` +
              `**💡 IMPORTANTE:**\n• Valor 100% deduzido do seu IR\n• Zero custo adicional\n• Impacto social real e mensurável\n• Compliance Fiscal Ativo incluso\n• Certificado digital de conformidade`,
              'bot',
              [
                { text: `🎯 Projetos para ${formatCurrency(destinacao)}`, action: 'projetos_personalizados' },
                { text: '🛡️ Validar com Compliance', action: 'compliance_validacao' },
                { text: '📋 Como destinar', action: 'como_destinar' }
              ],
              true
            );
          }, 2000);
          
          return;
        }
      }
      
      const knowledgeResult = searchKnowledge(userMessage);
      if (knowledgeResult.found) {
        simulateTyping(() => {
          addMessage(
            knowledgeResult.answer,
            'bot',
            [
              { text: '🧮 Calcular potencial', action: 'calcular' },
              { text: '❓ Outras perguntas', action: 'perguntas_frequentes' },
              { text: '🎯 Ver projetos', action: 'projetos' }
            ]
          );
        });
        return;
      }
      
      const input = userMessage.toLowerCase();
      simulateTyping(() => {
        if (input.includes('calcul') || input.includes('quanto') || input.includes('valor')) {
          handleQuickAction('calcular');
        } else if (input.includes('projeto') || input.includes('destina')) {
          handleQuickAction('projetos');
        } else if (input.includes('como') || input.includes('funciona')) {
          handleQuickAction('explicar');
        } else if (input.includes('compliance') || input.includes('segur')) {
          handleQuickAction('compliance_ativo');
        } else if (input.includes('pergunta') || input.includes('dúvida')) {
          handleQuickAction('perguntas_frequentes');
        } else {
          addMessage(
            '💭 **Entendi sua mensagem!** Para te ajudar de forma mais precisa:\n\n**🔢 PARA CALCULAR:** Digite o valor do Imposto Devido (apenas números)\n**❓ PARA PERGUNTAR:** Use palavras-chave como "projetos", "como funciona", "compliance"\n**🎯 PARA NAVEGAR:** Use os botões de ação rápida\n\n**🎓 EXEMPLOS DE PERGUNTAS:**\n• "Posso destinar se já doei para igreja?"\n• "Servidor aposentado pode destinar?"\n• "Como funciona o Compliance Fiscal Ativo?"',
            'bot',
            [
              { text: '🧮 Calcular potencial', action: 'calcular' },
              { text: '❓ Perguntas frequentes', action: 'perguntas_frequentes' },
              { text: '🛡️ Compliance Ativo', action: 'compliance_ativo' }
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
            ? 'bg-blue-600 ml-3' 
            : 'bg-gradient-to-br from-blue-700 to-blue-900 mr-3 shadow-lg'
        }`}>
          {message.type === 'user' ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>
        <div className={`rounded-2xl px-5 py-4 ${
          message.type === 'user' 
            ? 'bg-blue-600 text-white shadow-lg' 
            : message.isImportant
            ? 'bg-gradient-to-r from-green-50 to-blue-50 shadow-xl border-2 border-green-500'
            : 'bg-white shadow-xl border border-gray-200'
        }`}>
          {message.isImportant && (
            <div className="flex items-center mb-3 text-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-xs font-semibold uppercase tracking-wide">✅ Validação Compliance Ativo</span>
            </div>
          )}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content.split('**').map((part, index) => 
              index % 2 === 1 ? (
                <strong key={index} className={
                  message.type === 'user' 
                    ? 'text-blue-100' 
                    : message.isImportant 
                    ? 'text-blue-800' 
                    : 'text-blue-900'
                }>
                  {part}
                </strong>
              ) : (
                <span key={index} className={
                  message.type === 'user' 
                    ? 'text-white' 
                    : message.isImportant 
                    ? 'text-blue-700' 
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
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' 
                      : 'bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950'
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
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f4f8 100%)'
    }}>
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px' }}>
        {/* Header Enhanced com cores IncentivaBR */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-white rounded-3xl px-8 py-6 shadow-2xl mb-6" style={{
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mr-6 shadow-lg relative" style={{
              background: 'linear-gradient(135deg, #0c326f 0%, #1e618d 100%)'
            }}>
              <Sparkles className="w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{
                backgroundColor: '#EE985C'
              }}>
                <Brain className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-extrabold mb-2" style={{ color: '#0c326f' }}>
                TINA - Assistente Inteligente
              </h1>
              <p className="text-lg" style={{ color: '#1e618d' }}>
                Especialista em destinação de IR com Compliance Fiscal Ativo
              </p>
              {userData.impostoDevido && (
                <div className="mt-3 px-4 py-2 rounded-full text-sm font-bold" style={{
                  backgroundColor: 'rgba(46, 139, 87, 0.1)',
                  border: '2px solid #2e8b57',
                  color: '#2e8b57'
                }}>
                  ✅ Potencial calculado: {formatCurrency(userData.potencialDestinacao)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center space-x-6 mb-6 flex-wrap gap-4">
            <div className="flex items-center px-6 py-3 rounded-full text-sm font-bold shadow-lg" style={{
              backgroundColor: 'rgba(46, 139, 87, 0.1)',
              border: '2px solid #2e8b57',
              color: '#2e8b57'
            }}>
              <Shield className="w-5 h-5 mr-2" />
              Compliance Fiscal Ativo
            </div>
            <div className="flex items-center px-6 py-3 rounded-full text-sm font-bold shadow-lg" style={{
              backgroundColor: 'rgba(12, 50, 111, 0.1)',
              border: '2px solid #0c326f',
              color: '#0c326f'
            }}>
              <Target className="w-5 h-5 mr-2" />
              Foco em Servidores
            </div>
            <div className="flex items-center px-6 py-3 rounded-full text-sm font-bold shadow-lg" style={{
              backgroundColor: 'rgba(238, 152, 92, 0.1)',
              border: '2px solid #EE985C',
              color: '#0c326f'
            }}>
              <Brain className="w-5 h-5 mr-2" />
              IA Proprietária
            </div>
          </div>

          {/* Mode Indicator */}
          {chatMode !== 'welcome' && (
            <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg mb-4">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                chatMode === 'calculating' ? 'bg-blue-600' :
                chatMode === 'exploring' ? 'bg-green-600' :
                'bg-orange-500'
              }`}></div>
              <span className="text-sm font-bold" style={{ color: '#0c326f' }}>
                Modo: {
                  chatMode === 'calculating' ? 'Calculando com Compliance' :
                  chatMode === 'exploring' ? 'Explorando Projetos Verificados' :
                  'Modo Especialista'
                }
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions Enhanced com cores IncentivaBR */}
        {showQuickActions && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => handleQuickAction('calcular')}
              className="text-white p-8 rounded-3xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
              style={{
                background: 'linear-gradient(135deg, #0c326f 0%, #1e4a94 100%)'
              }}
            >
              <Calculator className="w-10 h-10 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-lg font-bold mb-2">Calcular Potencial</div>
              <div className="text-sm opacity-90">Com Compliance Fiscal Ativo</div>
            </button>
            
            <button
              onClick={() => handleQuickAction('projetos')}
              className="text-white p-8 rounded-3xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
              style={{
                background: 'linear-gradient(135deg, #1e618d 0%, #277553 100%)'
              }}
            >
              <Heart className="w-10 h-10 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-lg font-bold mb-2">Projetos Verificados</div>
              <div className="text-sm opacity-90">Catálogo com validação</div>
            </button>
            
            <button
              onClick={() => handleQuickAction('explicar')}
              className="text-white p-8 rounded-3xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
              style={{
                background: 'linear-gradient(135deg, #277553 0%, #2e8b57 100%)'
              }}
            >
              <BookOpen className="w-10 h-10 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-lg font-bold mb-2">Como Funciona</div>
              <div className="text-sm opacity-90">Sistema completo</div>
            </button>
            
            <button
              onClick={() => handleQuickAction('perguntas_frequentes')}
              className="text-white p-8 rounded-3xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
              style={{
                background: 'linear-gradient(135deg, #EE985C 0%, #d4822a 100%)'
              }}
            >
              <HelpCircle className="w-10 h-10 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-lg font-bold mb-2">Perguntas Frequentes</div>
              <div className="text-sm opacity-90">Dúvidas esclarecidas</div>
            </button>
          </div>
        )}

        {/* Chat Interface Enhanced com cores IncentivaBR */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 text-white" style={{
            background: 'linear-gradient(135deg, #0c326f 0%, #1e618d 100%)'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="w-8 h-8 mr-4" />
                <div>
                  <h2 className="text-2xl font-bold">Chat com TINA</h2>
                  <p className="text-lg opacity-90">Assistente com Compliance Fiscal Ativo</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {userData.impostoDevido && (
                  <div className="bg-white bg-opacity-20 rounded-full px-4 py-2 text-sm font-bold">
                    Potencial: {formatCurrency(userData.potencialDestinacao)}
                  </div>
                )}
                <div className="flex items-center bg-white bg-opacity-20 rounded-full px-6 py-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-lg font-bold">Online</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[500px] overflow-y-auto p-8" style={{
            background: 'linear-gradient(to bottom, #f5f7fa, #ffffff)'
          }}>
            {messages.map(renderMessage)}
            
            {isTyping && (
              <div className="flex justify-start mb-6">
                <div className="flex">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-lg" style={{
                    background: 'linear-gradient(135deg, #0c326f 0%, #1e618d 100%)'
                  }}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl px-6 py-4 shadow-xl border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#0c326f' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#1e618d', animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#277553', animationDelay: '0.2s' }}></div>
                      <span className="text-sm font-medium" style={{ color: '#757575' }}>TINA está analisando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-8 border-t bg-white">
            <div className="flex space-x-4">
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
                className="flex-1 border-2 rounded-full px-8 py-4 text-lg focus:outline-none transition-all duration-200"
                style={{
                  borderColor: '#e0e0e0'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0c326f';
                  e.target.style.boxShadow = '0 0 0 4px rgba(12, 50, 111, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="text-white rounded-full p-4 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
                style={{
                  background: !inputValue.trim() ? '#757575' : 'linear-gradient(135deg, #0c326f 0%, #1e618d 100%)'
                }}
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            
            {/* Quick Suggestions com cores IncentivaBR */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => setInputValue('7500')}
                className="text-sm px-4 py-2 rounded-full transition-all duration-200 border-2"
                style={{
                  backgroundColor: '#f5f7fa',
                  borderColor: '#e0e0e0',
                  color: '#0c326f'
                }}
              >
                Exemplo: 7500
              </button>
              <button
                onClick={() => setInputValue('Como funciona o Compliance Fiscal Ativo?')}
                className="text-sm px-4 py-2 rounded-full transition-all duration-200 border-2"
                style={{
                  backgroundColor: '#f5f7fa',
                  borderColor: '#e0e0e0',
                  color: '#0c326f'
                }}
              >
                Compliance Ativo?
              </button>
              <button
                onClick={() => setInputValue('Posso destinar se já doei para igreja?')}
                className="text-sm px-4 py-2 rounded-full transition-all duration-200 border-2"
                style={{
                  backgroundColor: '#f5f7fa',
                  borderColor: '#e0e0e0',
                  color: '#0c326f'
                }}
              >
                Já doei para igreja
              </button>
              <button
                onClick={() => setInputValue('Servidor aposentado pode destinar?')}
                className="text-sm px-4 py-2 rounded-full transition-all duration-200 border-2"
                style={{
                  backgroundColor: '#f5f7fa',
                  borderColor: '#e0e0e0',
                  color: '#0c326f'
                }}
              >
                Sou aposentado
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats com cores IncentivaBR */}
        <div className="grid md:grid-cols-4 gap-6 mt-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-4xl font-extrabold mb-3" style={{ color: '#2e8b57' }}>99.7%</div>
            <div className="font-bold mb-2" style={{ color: '#757575' }}>Conformidade Fiscal</div>
            <CheckCircle className="w-6 h-6 mx-auto mt-3" style={{ color: '#2e8b57' }} />
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-4xl font-extrabold mb-3" style={{ color: '#0c326f' }}>2.847</div>
            <div className="font-bold mb-2" style={{ color: '#757575' }}>Servidores Atendidos</div>
            <Shield className="w-6 h-6 mx-auto mt-3" style={{ color: '#0c326f' }} />
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-4xl font-extrabold mb-3" style={{ color: '#1e618d' }}>R$ 8.2M</div>
            <div className="font-bold mb-2" style={{ color: '#757575' }}>Destinados com Segurança</div>
            <Target className="w-6 h-6 mx-auto mt-3" style={{ color: '#1e618d' }} />
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-4xl font-extrabold mb-3" style={{ color: '#EE985C' }}>IA</div>
            <div className="font-bold mb-2" style={{ color: '#757575' }}>Powered by TINA</div>
            <Brain className="w-6 h-6 mx-auto mt-3" style={{ color: '#EE985C' }} />
          </div>
        </div>

        {/* Footer Info com cores IncentivaBR */}
        <div className="text-center mt-12 text-lg" style={{ color: '#757575' }}>
          <p className="font-bold">TINA - Tecnologia Inteligente com Compliance Fiscal Ativo | IncentivaBR © 2024</p>
          <p className="mt-2">Atendimento especializado para servidores públicos com segurança total</p>
          <div className="mt-4 px-6 py-3 rounded-full inline-block font-bold" style={{
            backgroundColor: 'rgba(46, 139, 87, 0.1)',
            border: '2px solid #2e8b57',
            color: '#2e8b57'
          }}>
            🛡️ Registro INPI: BR512025000647-0 - Tecnologia Proprietária
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistenteTINA;
