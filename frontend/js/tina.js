// TINA - Assistente Virtual DestineAI (powered by Claude AI)

const TINA = (function() {
  'use strict';

  let isOpen = false;
  let container = null;
  let conversationHistory = [];

  // Configurações
  const config = {
    whatsappNumber: '5561999682929',
    whatsappMessage: 'Olá! Tenho dúvidas sobre destinação de IR via Lei Rouanet.',
    botName: 'TINA',
    botAvatar: '<img src="assets/tina-avatar.svg" alt="TINA" style="width:100%;height:100%;border-radius:50%;object-fit:cover">',
    userAvatar: '👤'
  };

  // Respostas da TINA organizadas por categoria
  const respostas = {
    // SEGURANÇA E CREDIBILIDADE
    seguranca: {
      keywords: ['golpe', 'fake', 'falso', 'confiável', 'seguro', 'verdade', 'real'],
      response: '🛡️ <strong>É 100% SEGURO!</strong> O IncentivaBR trabalha com os fundos oficiais. Você pode verificar: 1) Dados bancários idênticos aos sites oficiais dos conselhos, 2) Recibo conforme Art. 6º da lei, 3) Protocolo único rastreável. Clique em "Ver site oficial" para conferir!'
    },
    verificacao: {
      keywords: ['verificar', 'conferir', 'checar', 'dados bancários', 'conta oficial'],
      response: '🔍 <strong>COMO VERIFICAR:</strong> Ao lado dos dados bancários, clique em "Ver no site oficial do conselho". Os dados são IDÊNTICOS! Transparência total para sua segurança.'
    },
    medo: {
      keywords: ['medo', 'receio', 'insegurança', 'desconfiança', 'dúvida'],
      response: '🤗 <strong>É normal ter receio!</strong> 95% dos servidores não conhecem essa possibilidade. Comece com um valor pequeno (R$ 50-100) para ganhar confiança. Milhares já fazem isso há anos!'
    },
    perder: {
      keywords: ['perder dinheiro', 'prejuízo', 'não receber', 'risco'],
      response: '💰 <strong>IMPOSSÍVEL PERDER!</strong> O valor destinado volta 100% na sua restituição ou reduz o imposto a pagar. É como direcionar um dinheiro que já é seu para uma causa social!'
    },

    // COMO FUNCIONA
    processo: {
      keywords: ['como funciona', 'processo', 'passos', 'etapas', 'começar'],
      response: '📋 <strong>4 PASSOS SIMPLES:</strong><br>1️⃣ Calcule seu IR (temos calculadora)<br>2️⃣ Escolha o fundo/projeto<br>3️⃣ Faça o depósito na conta oficial<br>4️⃣ Envie o comprovante e pronto!<br><br>Veja a página "Como Funciona" para mais detalhes!'
    },
    calculadora: {
      keywords: ['calcular', 'calculadora', 'quanto posso', 'limite', 'valor'],
      response: '🧮 <strong>USE NOSSA CALCULADORA:</strong><br>• <strong>Rápida:</strong> Se já sabe seu salário (10 segundos)<br>• <strong>Completa:</strong> Para cálculo detalhado com deduções<br><br>Para a <strong>Lei Rouanet Art. 18</strong>, o limite é de <strong>6% do IR devido</strong> — e retorna 100% para você na declaração. Custo real: R$ 0.'
    },
    ir: {
      keywords: ['ir devido', 'imposto devido', 'encontrar ir', 'onde acho'],
      response: '📋 <strong>ONDE ENCONTRAR O IR DEVIDO:</strong><br>1) No programa IRPF da Receita Federal<br>2) No "Resumo da Declaração"<br>3) Campo "Imposto Devido"<br><br>Se não souber, use nossa calculadora que estima para você!'
    },

    // FUNDOS E PROJETOS
    fundos: {
      keywords: ['fundo', 'fnc', 'rouanet', 'cultural', 'cultura', 'diferença'],
      response: '🏛️ <strong>FUNDO DESTINATÁRIO:</strong><br>• <strong>FNC</strong> — Fundo Nacional de Cultura<br>• Base legal: <strong>Lei Rouanet Art. 18</strong> (Lei 8.313/91)<br>• Limite: <strong>6% do IR devido</strong><br>• Retorno: <strong>100%</strong> na declaração (Art. 18 = dedução integral)<br><br>O dinheiro vai direto para projetos culturais aprovados pelo MinC!'
    },
    projetos: {
      keywords: ['projeto', 'escolher projeto', 'qual projeto', 'pronac'],
      response: '🎯 <strong>PROJETO NESTE PILOTO:</strong><br><strong>Orquestra das Periferias do DF</strong> (PRONAC 261847)<br><br>Projeto aprovado pelo Ministério da Cultura via Lei Rouanet. O valor destinado vai 100% para viabilizar atividades culturais na periferia do DF.<br><br>⚠️ Este piloto usa modo simulação — nenhum valor real é transferido.'
    },

    // PRAZOS E DATAS
    prazos: {
      keywords: ['prazo', 'quando', 'demora', '60 dias', 'tempo'],
      response: '⏰ <strong>PRAZOS — Destinação IR 2026:</strong><br><br>• <strong>Transferência para o FNC:</strong> até <strong>31/12/2026</strong> — é o prazo mais importante!<br>• <strong>Comunicado de Mecenato:</strong> até 15 dias após a transferência (recibo fiscal emitido pela Assoc. Cultural Orquestra das Periferias do DF)<br>• <strong>Declaração IRPF 2026:</strong> até <strong>30/04/2027</strong> — informe na ficha "Doações Efetuadas", Código 41<br>• <strong>Guarda de documentos:</strong> 5 anos (até 2031)<br><br>💡 Não deixe para o fim do ano — faça agora e garanta seu prazo!'
    },
    declaracao: {
      keywords: ['declaração', 'receita federal', 'declarar', 'próximo ano'],
      response: '📋 <strong>NA DECLARAÇÃO DO IR (passo a passo):</strong><br><br>1️⃣ Abra o programa IRPF da Receita Federal<br>2️⃣ Vá em <strong>"Doações Efetuadas"</strong><br>3️⃣ Clique em <strong>"Novo"</strong><br>4️⃣ Selecione <strong>Código 41 — Promoção Cultural, Artística etc.</strong><br>5️⃣ Informe o CNPJ do FNC e o valor depositado<br>6️⃣ Anexe o <strong>Comunicado de Mecenato</strong> como comprovante<br><br>⚠️ O valor <strong>NÃO</strong> aparece automaticamente — você precisa lançar manualmente. Guarde o comprovante!'
    },
    codigo41: {
      keywords: ['código 41', 'codigo 41', 'ficha doações', 'lançar declaração', 'como declarar', 'donações efetuadas'],
      response: '🧾 <strong>CÓDIGO 41 — PASSO A PASSO:</strong><br><br>No programa IRPF (Receita Federal):<br>1️⃣ Ficha <strong>"Doações Efetuadas"</strong><br>2️⃣ Tipo: <strong>Código 41</strong> — Promoção Cultural, Artística, Ambiental, Desportiva e Científica<br>3️⃣ CNPJ do beneficiado: CNPJ do <strong>FNC</strong> ou da entidade cultural<br>4️⃣ Valor: exatamente o valor depositado<br>5️⃣ Descrição: nome do projeto (ex: Orquestra das Periferias do DF)<br><br>✅ O programa calcula a dedução automaticamente após o lançamento.'
    },

    // DÚVIDAS ESPECÍFICAS
    parcelado: {
      keywords: ['parcelado', 'parcela', 'dividido'],
      response: '💳 <strong>IR PARCELADO:</strong> Use sempre o valor TOTAL do IR devido (todas as parcelas somadas). Ex: 10x de R$ 350 = R$ 3.500 total para calcular os 6%.'
    },
    dividir: {
      keywords: ['dividir', 'dois fundos', 'metade'],
      response: '🔄 <strong>DIVIDIR ENTRE PROJETOS:</strong> Sim! Você pode fazer destinações para diferentes projetos aprovados pela Lei Rouanet, respeitando o limite total de <strong>6% do IR devido</strong>.'
    },
    erro: {
      keywords: ['errar', 'corrigir', 'erro', 'errei'],
      response: '✏️ <strong>ERROU ALGO?</strong> Entre em contato em até 48h pelo email contato@incentivabr.com.br ou WhatsApp. Ajudamos a resolver!'
    },
    comprovante: {
      keywords: ['comprovante', 'upload', 'enviar', 'anexar'],
      response: '📎 <strong>COMPROVANTE:</strong> Aceita PDF, JPG ou PNG (até 5MB). Deve mostrar data, valor e destinatário. Print do app do banco funciona perfeitamente!'
    },

    // LEGISLAÇÃO
    legal: {
      keywords: ['legal', 'lei', 'legislação', 'permitido'],
      response: '⚖️ <strong>100% LEGAL!</strong> Base legal: <strong>Lei 8.313/1991 (Lei Rouanet)</strong>, Art. 18 — dedução integral (100%) de até 6% do IR devido. Mecanismo regulamentado pelo Ministério da Cultura e Receita Federal há mais de 30 anos.'
    },

    // INICIANTES
    iniciante: {
      keywords: ['primeiro', 'nunca fiz', 'iniciante', 'primeira vez'],
      response: '🌟 <strong>PRIMEIRA VEZ?</strong> Tranquilo! Use nossa calculadora, comece com um valor pequeno (R$ 100), escolha um projeto que te emociona. O processo é simples e você sempre pode contar com a TINA!'
    },

    // CONTADOR
    contador: {
      keywords: ['contador', 'contabilidade', 'declaração completa'],
      response: '📊 <strong>SOBRE SEU CONTADOR:</strong> Informe-o da destinação. É uma dedução legal que reduz seu IR. Muitos contadores já conhecem o processo. Enviaremos comprovante oficial para você apresentar.'
    },

    // RESTITUIÇÃO
    restituicao: {
      keywords: ['restituição', 'receber de volta', 'devolver'],
      response: '💵 <strong>RESTITUIÇÃO:</strong> O valor destinado volta 100%! Se você tem restituição, ela aumenta. Se tem IR a pagar, ele diminui. Você não perde nada - apenas direciona seu imposto para o bem social.'
    },

    // NOVAS RESPOSTAS - DÚVIDAS DO SERVIDOR PÚBLICO

    // Depois de calcular
    depoisCalcular: {
      keywords: ['depois de calcular', 'calculei e agora', 'próximo passo', 'o que fazer depois'],
      response: '📝 <strong>DEPOIS DE CALCULAR:</strong><br>1️⃣ Confirme o valor (até 6% do IR devido)<br>2️⃣ Faça depósito/PIX na conta oficial do <strong>FNC</strong><br>3️⃣ Obtenha o <strong>Comunicado de Mecenato</strong> com a entidade<br>4️⃣ Na declaração: ficha "Doações Efetuadas", <strong>Código 41</strong><br>5️⃣ O IR deduzido retorna 100% na restituição<br><br>⚠️ No piloto: modo simulação — nenhum depósito real é feito.'
    },

    // Onde depositar
    deposito: {
      keywords: ['depositar', 'pagar', 'transferir', 'pix', 'banco', 'conta'],
      response: '🏦 <strong>ONDE DEPOSITAR (produção):</strong><br>Direto na conta oficial do <strong>FNC — Fundo Nacional de Cultura</strong>.<br><br>Os dados bancários são fornecidos pela entidade cultural vinculada ao projeto (Comunicado de Mecenato).<br><br>⚠️ <strong>Piloto:</strong> modo simulação — nenhum depósito real é necessário. Use os dados fictícios exibidos na tela.'
    },

    // DARF
    darf: {
      keywords: ['darf', 'documento', 'guia', 'boleto'],
      response: '📄 <strong>DARF — importante:</strong> Para a <strong>Lei Rouanet Art. 18</strong>, a destinação <strong>NÃO</strong> é feita via DARF na declaração. O depósito deve ser feito diretamente na conta do FNC <strong>até 31/12</strong> do ano-calendário. Depois, você lança na declaração com o Código 41.'
    },

    // Imposto a pagar
    impostoAPagar: {
      keywords: ['imposto a pagar', 'pagar imposto', 'não tenho restituição', 'devo imposto'],
      response: '💰 <strong>IMPOSTO A PAGAR:</strong> Se você tem imposto a pagar, a destinação REDUZ esse valor!<br><br>Exemplo: IR a pagar R$ 5.000, destina R$ 300 → paga só R$ 4.700 de IR + R$ 300 para o fundo. Total: igual! Mas R$ 300 foi para causa social.'
    },

    // Recibo para quê
    reciboParaQue: {
      keywords: ['recibo serve', 'para que serve', 'usar recibo', 'preciso do recibo'],
      response: '📋 <strong>O RECIBO SERVE PARA:</strong><br>1️⃣ Comprovar a destinação na declaração do IR<br>2️⃣ Garantir a dedução do valor<br>3️⃣ Ter respaldo legal (Art. 6º)<br><br>Guarde-o! Seu contador vai precisar para lançar na declaração.'
    },

    // Simplificada x Completa
    simplificada: {
      keywords: ['simplificada', 'mudar para completa', 'tipo de declaração', 'qual declaração'],
      response: '📊 <strong>DECLARAÇÃO:</strong><br>• <strong>Simplificada:</strong> NÃO permite destinação via Lei Rouanet<br>• <strong>Completa:</strong> Permite destinação de até <strong>6% do IR devido</strong><br><br>Você pode mudar de simplificada para completa! O próprio programa IRPF mostra qual é mais vantajosa para você.'
    },

    // Ano base
    anoBase: {
      keywords: ['ano base', '2025', '2026', 'qual ano', 'ano calendário'],
      response: '📅 <strong>ANO-BASE:</strong><br>• Destinações feitas em <strong>2025</strong> → entram na declaração de <strong>2026</strong><br>• Destinações feitas em <strong>2026</strong> → entram na declaração de <strong>2027</strong><br><br>Faça a destinação no ano que você quer que ela seja deduzida!'
    },

    // Servidor público
    servidorPublico: {
      keywords: ['servidor', 'público', 'federal', 'estadual', 'municipal', 'gdf'],
      response: '👔 <strong>SERVIDORES PÚBLICOS:</strong> O DestineAI foi feito especialmente para vocês! Federal, estadual ou municipal — se você faz declaração completa (modelo real), pode destinar até <strong>6% do seu IR devido</strong> para projetos culturais via Lei Rouanet. Custo real: <strong>R$ 0</strong>.'
    },

    // Impacto real
    impacto: {
      keywords: ['impacto', 'resultado', 'para onde vai', 'como ajuda', 'benefício'],
      response: '❤️ <strong>IMPACTO REAL:</strong><br>Seu dinheiro vai direto para:<br>• Abrigos de idosos<br>• Creches e escolas<br>• Projetos de inclusão<br>• Programas sociais aprovados<br><br>Os conselhos fiscalizam e publicam relatórios. Transparência total!'
    },

    // FAQ
    faq: {
      keywords: ['dúvidas', 'perguntas frequentes', 'faq', 'outras perguntas'],
      response: '❓ <strong>MAIS DÚVIDAS?</strong><br>Acesse nossa página de <a href="faq.html" style="color:#0D1B3E;font-weight:bold;">Perguntas Frequentes</a> com respostas detalhadas sobre todo o processo!'
    }
  };

  // Busca resposta baseada na pergunta
  function getResposta(pergunta) {
    const perguntaLower = pergunta.toLowerCase();

    for (const categoria of Object.values(respostas)) {
      for (const keyword of categoria.keywords) {
        if (perguntaLower.includes(keyword)) {
          return categoria.response;
        }
      }
    }

    // Resposta padrão
    return '🤖 Sou a <strong>TINA</strong>, sua assistente de destinação de IR via <strong>Lei Rouanet</strong>! Posso ajudar com:<br><br>• Como funciona a destinação (Art. 18)<br>• Calculadora — quanto você pode destinar<br>• Prazos e processos<br>• Como declarar — Código 41<br>• Segurança e base legal<br><br>Faça sua pergunta ou clique nos botões de ação rápida!';
  }

  // Inicializa o widget
  function init() {
    if (container) return;

    // Criar container principal
    container = document.createElement('div');
    container.className = 'tina-container';
    container.innerHTML = getWidgetHTML();
    document.body.appendChild(container);

    // Adicionar estilos
    if (!document.getElementById('tina-styles')) {
      const styles = document.createElement('style');
      styles.id = 'tina-styles';
      styles.textContent = getStyles();
      document.head.appendChild(styles);
    }

    // Event listeners
    setupEventListeners();

    // Mostrar mensagem de boas-vindas após 3 segundos
    setTimeout(() => {
      if (!isOpen) {
        showWelcomeBubble();
      }
    }, 3000);
  }

  // HTML do widget
  function getWidgetHTML() {
    return `
      <!-- Bolha de boas-vindas -->
      <div class="tina-welcome-bubble" id="tinaWelcome">
        <span>Oi! Sou a Tina 👋<br><small style="color:#6B7280">Tem dúvidas sobre a simulação?</small></span>
        <button class="tina-welcome-close" onclick="TINA.hideWelcome()">&times;</button>
      </div>

      <!-- Botões flutuantes -->
      <div class="tina-buttons">
        <div style="position:relative;display:inline-flex">
          <button class="tina-fab tina-chat-btn" onclick="TINA.toggle()" title="Falar com TINA" id="tinaChatBtn">
            <img src="assets/tina-avatar.svg" alt="TINA" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
          </button>
          <span id="tinaBadge" style="position:absolute;top:2px;right:2px;width:14px;height:14px;background:#FF4444;border-radius:50%;border:2px solid white;animation:tinaPulse 1.8s infinite"></span>
        </div>
      </div>

      <!-- Chat da TINA -->
      <div class="tina-chat" id="tinaChat">
        <div class="tina-header">
          <div class="tina-header-info">
            <div class="tina-avatar"><img src="assets/tina-avatar.svg" alt="TINA" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>
            <div>
              <div class="tina-name">TINA</div>
              <div class="tina-status">Assistente DestineAI</div>
            </div>
          </div>
          <button class="tina-close" onclick="TINA.close()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="tina-messages" id="tinaMessages">
          <div class="tina-message tina-bot">
            <div class="tina-msg-avatar"><img src="assets/tina-avatar.svg" alt="TINA" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>
            <div class="tina-msg-content">
              Olá, sou a <strong>TINA</strong>! Como posso ajudar?
            </div>
          </div>
        </div>

        <div class="tina-quick-actions">
          <button onclick="TINA.ask('Como funciona a destinação?')">Como funciona?</button>
          <button onclick="TINA.ask('Quanto posso destinar?')">Quanto posso?</button>
          <button onclick="TINA.ask('É seguro?')">É seguro?</button>
          <button onclick="TINA.ask('Quais os prazos?')">Prazos</button>
        </div>

        <div class="tina-input-area">
          <input type="text" id="tinaInput" placeholder="Digite sua pergunta..."
                 onkeypress="if(event.key==='Enter')TINA.send()">
          <button class="tina-send-btn" onclick="TINA.send()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
  }

  // Estilos CSS
  function getStyles() {
    return `
      .tina-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99998;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      /* Botões flutuantes */
      .tina-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: flex-end;
      }

      .tina-fab {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        transition: all 0.3s ease;
      }

      .tina-fab:hover {
        transform: scale(1.1);
      }

      .tina-chat-btn {
        width: 72px;
        height: 72px;
        background: transparent;
        padding: 0;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0,0,0,0.35);
        border: 3px solid #FFD700;
      }

      .tina-whatsapp {
        background: #25D366;
        width: 48px;
        height: 48px;
        font-size: 22px;
      }

      /* Bolha de boas-vindas */
      .tina-welcome-bubble {
        position: absolute;
        bottom: 70px;
        right: 0;
        background: white;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: none;
        align-items: center;
        gap: 12px;
        animation: tinaBounce 0.5s ease;
        white-space: nowrap;
      }

      .tina-welcome-bubble.show {
        display: flex;
      }

      .tina-welcome-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #999;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }

      @keyframes tinaBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }

      @keyframes tinaPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.4); opacity: 0.7; }
      }

      /* Chat principal */
      .tina-chat {
        position: absolute;
        bottom: 130px;
        right: 0;
        width: 380px;
        height: 520px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.25);
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: tinaSlideIn 0.3s ease;
      }

      .tina-chat.open {
        display: flex;
      }

      @keyframes tinaSlideIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Header */
      .tina-header {
        background: linear-gradient(135deg, #0D1B3E 0%, #132247 100%);
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .tina-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .tina-avatar {
        width: 40px;
        height: 40px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .tina-name {
        font-weight: 700;
        font-size: 16px;
      }

      .tina-status {
        font-size: 12px;
        opacity: 0.9;
      }

      .tina-close {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .tina-close:hover {
        background: rgba(255,255,255,0.3);
      }

      /* Mensagens */
      .tina-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .tina-message {
        display: flex;
        gap: 10px;
        max-width: 90%;
      }

      .tina-message.tina-bot {
        align-self: flex-start;
      }

      .tina-message.tina-user {
        align-self: flex-end;
        flex-direction: row-reverse;
      }

      .tina-msg-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #0D1B3E;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }

      .tina-user .tina-msg-avatar {
        background: #0D1B3E;
      }

      .tina-msg-content {
        background: #f5f7fa;
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.5;
        color: #333;
      }

      .tina-user .tina-msg-content {
        background: #0D1B3E;
        color: white;
      }

      .tina-msg-content strong {
        color: inherit;
      }

      /* Ações rápidas */
      .tina-quick-actions {
        padding: 8px 16px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        border-top: 1px solid #eee;
      }

      .tina-quick-actions button {
        background: #f0f2f5;
        border: none;
        padding: 8px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        color: #0D1B3E;
        cursor: pointer;
        transition: all 0.2s;
      }

      .tina-quick-actions button:hover {
        background: #FFD700;
        color: #0D1B3E;
      }

      /* Input */
      .tina-input-area {
        padding: 12px 16px;
        display: flex;
        gap: 10px;
        border-top: 1px solid #eee;
      }

      #tinaInput {
        flex: 1;
        border: 2px solid #eee;
        border-radius: 24px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      #tinaInput:focus {
        border-color: #0D1B3E;
      }

      .tina-send-btn {
        background: #FFD700;
        border: none;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        color: #0D1B3E;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .tina-send-btn:hover {
        background: #FFC000;
      }

      /* Typing indicator */
      .tina-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
      }

      .tina-typing span {
        width: 8px;
        height: 8px;
        background: #ccc;
        border-radius: 50%;
        animation: tinaTyping 1.4s infinite;
      }

      .tina-typing span:nth-child(2) { animation-delay: 0.2s; }
      .tina-typing span:nth-child(3) { animation-delay: 0.4s; }

      @keyframes tinaTyping {
        0%, 100% { opacity: 0.3; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1); }
      }

      /* Mobile */
      @media (max-width: 480px) {
        .tina-container {
          bottom: 16px;
          right: 16px;
        }

        .tina-chat {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          border-radius: 0;
          z-index: 100000;
        }

        .tina-fab {
          width: 52px;
          height: 52px;
          font-size: 22px;
        }

        .tina-whatsapp {
          width: 44px;
          height: 44px;
          font-size: 20px;
        }

        .tina-welcome-bubble {
          right: 60px;
          bottom: 10px;
        }

        .tina-quick-actions button {
          font-size: 11px;
          padding: 6px 12px;
        }
      }
    `;
  }

  // Setup event listeners
  function setupEventListeners() {
    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (isOpen && !container.contains(e.target)) {
        close();
      }
    });

    // ESC para fechar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    });
  }

  // Mostrar bolha de boas-vindas
  function showWelcomeBubble() {
    const bubble = document.getElementById('tinaWelcome');
    if (bubble) {
      bubble.classList.add('show');
      setTimeout(() => {
        bubble.classList.remove('show');
      }, 5000);
    }
  }

  // Esconder bolha de boas-vindas
  function hideWelcome() {
    const bubble = document.getElementById('tinaWelcome');
    if (bubble) {
      bubble.classList.remove('show');
    }
  }

  // Toggle chat
  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  // Abrir chat
  function open() {
    const chat = document.getElementById('tinaChat');
    if (chat) {
      chat.classList.add('open');
      isOpen = true;
      hideWelcome();
      const badge = document.getElementById('tinaBadge');
      if (badge) badge.style.display = 'none';
      document.getElementById('tinaInput')?.focus();
    }
  }

  // Fechar chat
  function close() {
    const chat = document.getElementById('tinaChat');
    if (chat) {
      chat.classList.remove('open');
      isOpen = false;
    }
  }

  // Adicionar mensagem
  function addMessage(content, isUser = false) {
    const messages = document.getElementById('tinaMessages');
    if (!messages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `tina-message ${isUser ? 'tina-user' : 'tina-bot'}`;
    msgDiv.innerHTML = `
      <div class="tina-msg-avatar">${isUser ? config.userAvatar : config.botAvatar}</div>
      <div class="tina-msg-content">${content}</div>
    `;

    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  // Mostrar indicador de digitação
  function showTyping() {
    const messages = document.getElementById('tinaMessages');
    if (!messages) return;

    const typing = document.createElement('div');
    typing.className = 'tina-message tina-bot';
    typing.id = 'tinaTyping';
    typing.innerHTML = `
      <div class="tina-msg-avatar">${config.botAvatar}</div>
      <div class="tina-msg-content tina-typing">
        <span></span><span></span><span></span>
      </div>
    `;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  // Esconder indicador de digitação
  function hideTyping() {
    const typing = document.getElementById('tinaTyping');
    if (typing) {
      typing.remove();
    }
  }

  // Enviar pergunta (tenta Claude API, usa regras como fallback)
  async function send() {
    const input = document.getElementById('tinaInput');
    if (!input) return;

    const pergunta = input.value.trim();
    if (!pergunta) return;

    addMessage(pergunta, true);
    input.value = '';
    showTyping();

    try {
      const response = await fetch('/api/chat/tina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: pergunta,
          history: conversationHistory.slice(-12)
        })
      });

      hideTyping();

      if (response.ok) {
        const data = await response.json();
        const resposta = data.reply || getResposta(pergunta);
        conversationHistory.push({ role: 'user', content: pergunta });
        conversationHistory.push({ role: 'assistant', content: resposta });
        // Mantém histórico enxuto
        if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);
        addMessage(resposta.replace(/\n/g, '<br>'));
      } else {
        addMessage(getResposta(pergunta));
      }
    } catch (_) {
      hideTyping();
      addMessage(getResposta(pergunta));
    }
  }

  // Pergunta rápida
  function ask(pergunta) {
    const input = document.getElementById('tinaInput');
    if (input) {
      input.value = pergunta;
    }
    send();
  }

  // Abrir WhatsApp
  function openWhatsApp() {
    const message = encodeURIComponent(config.whatsappMessage);
    window.open(`https://wa.me/${config.whatsappNumber}?text=${message}`, '_blank');
  }

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API pública
  return {
    open,
    close,
    toggle,
    send,
    ask,
    openWhatsApp,
    hideWelcome,
    showWelcomeBubble,
    init: () => {} // auto-inicializado; exposto por compatibilidade com chamadas nas páginas
  };
})();

// Expor globalmente
window.TINA = TINA;
