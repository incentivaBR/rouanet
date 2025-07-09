import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, Bot, Calculator, Heart, Send, Sparkles, Shield, Target, Brain } from 'lucide-react';

const AssistenteTINA = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState({});
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);

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

  const calculateImpactExamples = (valor) => {
    const examples = [];
    if (valor >= 100) examples.push(`• **${Math.floor(valor/10)} crianças** com material escolar completo`);
    if (valor >= 250) examples.push(`• **${Math.floor(valor/25)} consultas médicas** gratuitas`);
    if (valor >= 500) examples.push(`• **1 biblioteca escolar** equipada`);
    if (valor >= 1000) examples.push(`• **${Math.floor(valor/100)} jovens** em cursos profissionalizantes`);
    if (valor >= 2000) examples.push(`• **1 laboratório de informática** para escola`);
    return examples.slice(0, 4);
  };

  const handleQuickAction = (action) => {
    setShowQuickActions(false);
    
    switch(action) {
      case 'calcular':
        addMessage('🧮 Quero calcular meu potencial');
        simulateTyping(() => {
          addMessage(
            '📊 **Vou calcular seu potencial!**\n\n**⚠️ IMPORTANTE:** Somente declaração COMPLETA pode destinar IR!\n\n**🎯 COMO ENCONTRAR O VALOR:**\n\n**💻 NO PROGRAMA IRPF:**\n1. Abra o programa IRPF 2024\n2. Abra sua declaração\n3. Clique em "Resumo da Declaração"\n4. Encontre "IMPOSTO DEVIDO"\n\n**📱 NO APP:**\n1. Abra "Meu Imposto de Renda"\n2. Acesse "Minhas Declarações"\n3. Toque em "Resumo"\n4. Encontre "IMPOSTO DEVIDO"\n\n**💬 Digite apenas o número no chat:**\n• Para R$ 7.500,00 → digite: 7500\n• Para R$ 12.350,00 → digite: 12350\n\n**🔢 Encontrou o valor? Digite abaixo:**',
            'bot',
            [
              { text: '✅ Vou digitar o valor', action: 'aguardar_valor' },
              { text: '❓ Não encontro', action: 'ajuda_encontrar' },
              { text: '🧮 Calculadora virtual', action: 'calculadora' }
            ]
          );
        });
        break;
        
      case 'projetos':
        addMessage('🎯 Quero ver projetos');
        simulateTyping(() => {
          addMessage(
            '🎯 **Projetos Recomendados para Servidores:**\n\n**📚 EDUCAÇÃO:**\n• Biblioteca Digital Inclusiva - R$ 8.500\n• Laboratório STEAM Móvel - R$ 12.000\n• Formação de Professores - R$ 6.800\n\n**🏥 SAÚDE:**\n• UTI Neonatal Digital - R$ 18.000\n• Telemedicina Rural - R$ 9.200\n• Reabilitação Neurológica - R$ 15.500\n\n**⚖️ JUSTIÇA:**\n• Mediação Digital Comunitária - R$ 7.800\n• Educação Jurídica Popular - R$ 8.900\n\n**💰 ADMINISTRAÇÃO:**\n• Educação Financeira Jovem - R$ 6.500\n• Transparência Fiscal Cidadã - R$ 14.800\n\n**🧮 Para ver projetos específicos para seu valor, calcule primeiro seu potencial!**',
            'bot',
            [
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '📋 Como escolher projeto', action: 'como_escolher' },
              { text: '💬 Fazer pergunta', action: 'perguntar' }
            ]
          );
        });
        break;

      case 'explicar':
        addMessage('📚 Como funciona a destinação?');
        simulateTyping(() => {
          addMessage(
            '📚 **Como Funciona a Destinação de IR:**\n\n**🔹 O que é?**\nVocê pode destinar até 6% do seu IR devido para projetos sociais aprovados pelo governo.\n\n**🔹 Custa algo extra?**\n**NÃO!** É o mesmo valor que você pagaria de IR, só escolhe o destino.\n\n**🔹 Quem pode?**\nApenas quem faz **declaração COMPLETA** e tem IR devido.\n\n**🔹 Como funciona?**\n1. Encontra o "Imposto Devido" na sua declaração\n2. Calcula 6% desse valor\n3. Escolhe projetos aprovados\n4. Valor é 100% deduzido do IR\n\n**🔹 Áreas disponíveis:**\n• Cultura (Lei Rouanet)\n• Criança e Adolescente (ECA)\n• Idoso (Lei do Idoso)\n• Esporte (Lei do Esporte)\n\n**🎯 Resultado:** Mesmo imposto + Propósito social!',
            'bot',
            [
              { text: '🧮 Calcular meu potencial', action: 'calcular' },
              { text: '🎯 Ver projetos', action: 'projetos' },
              { text: '🛡️ É seguro?', action: 'seguranca' }
            ]
          );
        });
        break;

      case 'seguranca':
        addMessage('🛡️ É seguro juridicamente?');
        simulateTyping(() => {
          addMessage(
            '🛡️ **100% Seguro e Legal!**\n\n**✅ Base Legal:**\n• Lei Rouanet (8.313/91)\n• ECA (8.069/90)\n• Lei do Idoso (10.741/03)\n• Lei do Esporte (11.438/06)\n\n**🔐 Garantias IncentivaBR:**\n• Registro INPI BR512025000647-0\n• 99.7% de conformidade fiscal\n• Zero autuações em 5 anos\n• Certificação digital\n\n**📊 Track Record:**\n• 2.847+ servidores atendidos\n• R$ 8.2M+ destinados com segurança\n• Processos 100% auditados\n\n**🎯 Garantia TINA:** Zero risco fiscal!',
            'bot',
            [
              { text: '🧮 Calcular com segurança', action: 'calcular' },
              { text: '📋 Ver certificações', action: 'certificacoes' },
              { text: '💬 Fazer pergunta', action: 'perguntar' }
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
      
      // DETECÇÃO DE VALOR DO IR DEVIDO
      const numeroDigitado = inputValue.replace(/[^\d]/g, '');
      if (numeroDigitado && numeroDigitado.length >= 3) {
        const valorIR = parseInt(numeroDigitado);
        
        // Validação
        if (valorIR < 100 || valorIR > 1000000) {
          simulateTyping(() => {
            addMessage(
              '⚠️ **Valor parece incorreto!**\n\nO Imposto Devido normalmente fica entre R$ 100 e R$ 1.000.000.\n\n**📋 Exemplos:**\n• Para R$ 7.500,00 → digite: 7500\n• Para R$ 12.350,00 → digite: 12350\n\n**🔍 Verifique se encontrou o valor correto na sua declaração.**',
              'bot',
              [
                { text: '🔍 Ajuda para encontrar', action: 'calcular' },
                { text: '🔢 Tentar outro valor', action: 'calcular' }
              ]
            );
          });
          return;
        }
        
        // Cálculo automático
        const destinacao = Math.round(valorIR * 0.06);
        const exemplos = calculateImpactExamples(destinacao);
        const impactoText = exemplos.join('\n');
        
        simulateTyping(() => {
          addMessage(
            `🎯 **CÁLCULO TINA - Seu Potencial Real:**\n\n` +
            `**💰 Imposto Devido:** ${formatCurrency(valorIR)}\n` +
            `**🎯 Destinação (6%):** ${formatCurrency(destinacao)}\n` +
            `**✅ Declaração:** COMPLETA\n\n` +
            `**🚀 COM ${formatCurrency(destinacao)} VOCÊ PODE:**\n${impactoText}\n\n` +
            `**💡 IMPORTANTE:** Valor 100% deduzido do seu IR!\n\n` +
            `**⚡ PRÓXIMOS PASSOS:**\n` +
            `• Escolher projetos alinhados\n` +
            `• Fazer destinação segura\n` +
            `• Acompanhar impacto`,
            'bot',
            [
              { text: `🎯 Projetos para ${formatCurrency(destinacao)}`, action: 'projetos' },
              { text: '📋 Como destinar', action: 'como_destinar' },
              { text: '🔄 Outro valor', action: 'calcular' }
            ]
          );
        });
        return;
      }
      
      // Respostas baseadas em palavras-chave
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
            '💭 **Entendi!** Para te ajudar melhor:\n\n**🔢 CALCULAR:** Digite o valor do seu Imposto Devido\n**❓ PERGUNTAR:** Use frases completas\n**🎯 NAVEGAR:** Use os botões abaixo',
            'bot',
            [
              { text: '🧮 Calcular potencial', action: 'calcular' },
              { text: '🎯 Ver projetos', action: 'projetos' },
              { text: '📚 Como funciona', action: 'explicar' }
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
              <MessageCircle className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-sm font-semibold mb-2">Como Funciona</div>
              <div className="text-xs opacity-90">Entenda o processo</div>
            </button>
            
            <button
              onClick={() => handleQuickAction('seguranca')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
            >
              <Shield className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-sm font-semibold mb-2">Segurança</div>
              <div className="text-xs opacity-90">Garantias legais</div>
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
                placeholder="Digite o valor do Imposto Devido ou faça uma pergunta..."
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
