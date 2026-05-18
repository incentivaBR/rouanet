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

    // PILOTO FGV — contexto da pesquisa
    piloto: {
      keywords: ['piloto', 'pesquisa', 'fgv', 'mba', 'o que é isso', 'o que é esse', 'simulação', 'simular', 'estudo'],
      response: '🎓 <strong>SOBRE ESTE PILOTO:</strong><br><br>Você está participando de uma <strong>simulação de destinação de IR</strong> desenvolvida para pesquisa no MBA em IA & Analytics da FGV.<br><br>O objetivo é medir se, depois de entender o processo, servidores públicos aumentam a <em>intenção</em> de destinar o IR.<br><br>Tudo aqui é simulação — <strong>nenhum valor é transferido</strong> e nada muda na sua declaração real.<br><br>A jornada tem 3 etapas:<br>1️⃣ Pré-teste (Google Forms)<br>2️⃣ Simulação guiada do IR (você está aqui)<br>3️⃣ Pós-teste (Google Forms)<br><br>Para a pesquisa ser válida, você precisa completar <strong>as 3 etapas</strong>!'
    },

    // PÓS-TESTE — como completar
    posteste: {
      keywords: ['pós-teste', 'pos-teste', 'formulário', 'finalizar', 'concluir', 'terminar', 'etapa 3', 'pesquisa finalizar'],
      response: '📋 <strong>COMO CONCLUIR A PESQUISA:</strong><br><br>Após gerar o comprovante de simulação (Etapa 2), você verá um banner amarelo com o botão:<br><br>📋 <strong>"Abrir o pós-teste agora"</strong><br><br>Clique nele — o formulário de pós-teste abre em uma nova aba e leva apenas ~3 minutos.<br><br>⚠️ Sem o pós-teste, sua participação <strong>não entra nos dados da pesquisa</strong>. Não feche a página antes de completá-lo!'
    },

    // SEGURANÇA E CREDIBILIDADE
    seguranca: {
      keywords: ['golpe', 'fake', 'falso', 'confiável', 'seguro', 'verdade'],
      response: '🛡️ <strong>É 100% SEGURO!</strong><br><br>Este é um ambiente de <strong>simulação</strong> — nenhuma informação financeira real é processada e nenhum valor é transferido.<br><br>Esta ferramenta é o <strong>Projeto Aplicado II do MBA em IA &amp; Analytics da FGV</strong> — pesquisa acadêmica sobre comportamento fiscal de servidores. Seus dados são anônimos (identificados apenas por um código de pesquisa) e usados exclusivamente para fins acadêmicos.'
    },
    verificacao: {
      keywords: ['verificar', 'conferir', 'checar', 'dados bancários', 'conta oficial'],
      response: '🔍 <strong>DADOS EXIBIDOS NA SIMULAÇÃO:</strong><br><br>Os dados bancários mostrados na etapa de pagamento são <strong>fictícios para fins de simulação</strong>. Em uma destinação real, você receberia esses dados via <em>Comunicado de Mecenato</em> emitido pela entidade cultural.<br><br>Neste piloto, nenhum depósito é necessário ou esperado.'
    },
    medo: {
      keywords: ['medo', 'receio', 'insegurança', 'desconfiança'],
      response: '🤗 <strong>Fique tranquilo!</strong><br><br>Você está em modo de simulação — não precisa tomar nenhuma decisão financeira agora. O objetivo é apenas <em>entender o processo</em> de destinação de IR.<br><br>95% dos servidores nunca usou esse direito porque ninguém explica o passo a passo. É exatamente isso que este piloto quer mudar!'
    },
    perder: {
      keywords: ['perder dinheiro', 'prejuízo', 'não receber', 'risco'],
      response: '💰 <strong>NA VIDA REAL: IMPOSSÍVEL PERDER!</strong><br><br>O valor destinado volta 100% na restituição ou reduz o imposto a pagar. É direcionar um dinheiro que <em>já seria pago</em> para uma causa social.<br><br>Neste piloto, você está apenas <strong>simulando</strong> — nenhum valor é movimentado.'
    },

    // COMO FUNCIONA
    processo: {
      keywords: ['como funciona', 'processo', 'passos', 'etapas', 'começar', 'fluxo'],
      response: '📋 <strong>COMO FUNCIONA ESTE PILOTO:</strong><br><br>1️⃣ <strong>Pré-teste</strong> (~2 min) — mede seu conhecimento inicial<br>2️⃣ <strong>Simulação guiada</strong> (~5 min) — você vê quanto poderia destinar e passa pelo fluxo completo<br>3️⃣ <strong>Pós-teste</strong> (~3 min) — mede o que mudou após a experiência<br><br>⚡ Na vida real, a destinação funciona assim:<br>• Calcula até 6% do IR devido<br>• Deposita na conta oficial do FNC<br>• Declara no IRPF com Código 41<br>• Retorna 100% — custo real: R$ 0'
    },
    calculadora: {
      keywords: ['calcular', 'calculadora', 'quanto posso', 'limite', 'valor'],
      response: '🧮 <strong>CALCULADORA DE IR:</strong><br><br>Informe seu <strong>IR Devido</strong> — o valor total de imposto da sua declaração.<br><br>O sistema calcula automaticamente o limite para destinação:<br>• Lei Rouanet (Art. 18): até <strong>6% do IR devido</strong><br>• Retorna 100% — custo real: <strong>R$ 0</strong><br><br>Se não souber seu IR Devido agora, use um valor estimado para a simulação. Você pode consultar o valor exato no programa IRPF da Receita Federal.'
    },
    ir: {
      keywords: ['ir devido', 'imposto devido', 'encontrar ir', 'onde acho', 'onde fica'],
      response: '📋 <strong>ONDE ENCONTRAR O IR DEVIDO:</strong><br><br>1) No programa IRPF da Receita Federal<br>2) Aba "Resumo da Declaração"<br>3) Campo <strong>"Imposto Devido"</strong><br><br>Para esta simulação, você pode usar um valor estimado. Servidores do GDF tipicamente têm IR Devido entre R$ 2.000 e R$ 15.000.'
    },

    // FUNDOS E PROJETOS
    fundos: {
      keywords: ['fundo', 'fnc', 'rouanet', 'cultural', 'cultura', 'diferença'],
      response: '🏛️ <strong>FUNDO DESTINATÁRIO:</strong><br>• <strong>FNC</strong> — Fundo Nacional de Cultura<br>• Base legal: <strong>Lei Rouanet Art. 18</strong> (Lei 8.313/91)<br>• Limite: <strong>6% do IR devido</strong><br>• Retorno: <strong>100%</strong> na declaração (Art. 18 = dedução integral)<br><br>Neste piloto, a destinação para o FNC é <strong>simulada</strong> — nenhum valor real é transferido.'
    },
    projetos: {
      keywords: ['projeto', 'escolher projeto', 'qual projeto', 'pronac', 'orquestra'],
      response: '🎯 <strong>PROJETO DESTE PILOTO:</strong><br><strong>Orquestra das Periferias do DF</strong> (PRONAC 261847)<br><br>Projeto aprovado pelo Ministério da Cultura via Lei Rouanet. Viabiliza atividades musicais e formação cultural nas periferias do Distrito Federal.<br><br>⚠️ Neste piloto, a destinação é <strong>simulada</strong> — nenhum valor real vai para o projeto agora. Em produção, o processo seria real.'
    },

    // PRAZOS E DATAS
    prazos: {
      keywords: ['prazo', 'quando', 'demora', '60 dias', 'tempo', 'vence'],
      response: '⏰ <strong>PRAZOS — Destinação IR Real:</strong><br><br>• <strong>Transferência para o FNC:</strong> até <strong>31/12/2026</strong><br>• <strong>Comunicado de Mecenato:</strong> até 15 dias após a transferência<br>• <strong>Declaração IRPF 2026:</strong> até <strong>30/04/2027</strong> — Código 41<br>• <strong>Guarda de documentos:</strong> 5 anos<br><br>ℹ️ Neste piloto você está apenas simulando — esses prazos valem para uma destinação real futura.'
    },
    declaracao: {
      keywords: ['declaração', 'receita federal', 'declarar', 'próximo ano', 'como declarar no ir'],
      response: '📋 <strong>NA DECLARAÇÃO REAL DO IR:</strong><br><br>1️⃣ Programa IRPF da Receita Federal<br>2️⃣ Ficha <strong>"Doações Efetuadas"</strong><br>3️⃣ <strong>Código 41</strong> — Promoção Cultural, Artística etc.<br>4️⃣ CNPJ do FNC + valor depositado<br>5️⃣ Anexar o <strong>Comunicado de Mecenato</strong><br><br>ℹ️ Nesta simulação, o comprovante gerado não tem validade fiscal — é apenas para você entender o processo.'
    },
    codigo41: {
      keywords: ['código 41', 'codigo 41', 'ficha doações', 'lançar declaração', 'donações efetuadas'],
      response: '🧾 <strong>CÓDIGO 41 — Lei Rouanet:</strong><br><br>No programa IRPF:<br>1️⃣ Ficha <strong>"Doações Efetuadas"</strong><br>2️⃣ Tipo: <strong>Código 41</strong> — Promoção Cultural, Artística, Ambiental, Desportiva e Científica<br>3️⃣ CNPJ do FNC + valor destinado<br>4️⃣ Descrição: nome do projeto<br><br>✅ O próprio programa IRPF calcula a dedução automaticamente.'
    },

    // DÚVIDAS ESPECÍFICAS
    parcelado: {
      keywords: ['parcelado', 'parcela', 'dividido'],
      response: '💳 <strong>IR PARCELADO:</strong> Use sempre o valor TOTAL do IR devido (soma de todas as parcelas). Ex: 10x de R$ 350 = R$ 3.500 — é esse valor que entra na calculadora para os 6%.'
    },
    dividir: {
      keywords: ['dividir', 'dois fundos', 'metade', 'mais de um'],
      response: '🔄 <strong>DIVIDIR ENTRE PROJETOS:</strong> Na vida real, sim! Você pode destinar para diferentes projetos Lei Rouanet, respeitando o limite total de <strong>6% do IR devido</strong>. Cada destinação gera um comprovante separado.'
    },
    erro: {
      keywords: ['errar', 'corrigir', 'erro', 'errei', 'voltou', 'desfazer'],
      response: '✏️ <strong>VOLTOU OU ERROU ALGO?</strong><br><br>No simulador, você pode usar o botão "Voltar" a qualquer momento para corrigir valores.<br><br>Se tiver dúvidas sobre a pesquisa ou a ferramenta, entre em contato: <strong>contato@incentivabr.com.br</strong>'
    },
    comprovante: {
      keywords: ['comprovante', 'recibo', 'baixar', 'pdf', 'download'],
      response: '📄 <strong>COMPROVANTE DA SIMULAÇÃO:</strong><br><br>Ao final do fluxo, você pode baixar um <strong>comprovante em PDF</strong> com os dados da sua simulação.<br><br>⚠️ Este comprovante <strong>não tem validade fiscal</strong> — é apenas um registro da sua participação na pesquisa. Em uma destinação real, o comprovante oficial seria o <em>Comunicado de Mecenato</em> emitido pela entidade cultural.'
    },

    // LEGISLAÇÃO
    legal: {
      keywords: ['legal', 'lei', 'legislação', 'permitido', 'base legal'],
      response: '⚖️ <strong>BASE LEGAL:</strong><br><br><strong>Lei 8.313/1991 — Lei Rouanet, Art. 18</strong><br>Dedução integral (100%) de até 6% do IR devido.<br><br>Mecanismo regulamentado pelo Ministério da Cultura e Receita Federal há mais de 30 anos — completamente legal e documentado.<br><br>Custo real para o contribuinte: <strong>R$ 0</strong>.'
    },

    // INICIANTES
    iniciante: {
      keywords: ['primeiro', 'nunca fiz', 'iniciante', 'primeira vez', 'não entendo'],
      response: '🌟 <strong>PRIMEIRA VEZ?</strong><br><br>Perfeito — é exatamente para isso que este piloto foi criado! A maioria dos servidores nunca ouviu falar dessa possibilidade.<br><br>Siga as etapas do simulador no seu ritmo. Se tiver dúvida em algum passo, me pergunte aqui.<br><br>Lembre de completar o pós-teste no final — é fundamental para a pesquisa!'
    },

    // CONTADOR
    contador: {
      keywords: ['contador', 'contabilidade', 'declaração completa'],
      response: '📊 <strong>SOBRE SEU CONTADOR:</strong><br><br>Em uma destinação real, informe seu contador. É uma dedução legal que pode reduzir seu IR — muitos já conhecem o processo.<br><br>O documento que você apresenta ao contador é o <strong>Comunicado de Mecenato</strong>, emitido pela entidade cultural após a transferência.<br><br>ℹ️ Neste piloto, o comprovante gerado é apenas para a simulação.'
    },

    // RESTITUIÇÃO
    restituicao: {
      keywords: ['restituição', 'receber de volta', 'devolver', 'retorno'],
      response: '💵 <strong>COMO FUNCIONA O RETORNO:</strong><br><br>O valor destinado volta 100% — não é doação, é redirecionamento!<br>• Se você tem <strong>restituição</strong>: ela aumenta pelo valor destinado<br>• Se você tem <strong>IR a pagar</strong>: ele diminui pelo valor destinado<br><br>Custo líquido real: <strong>R$ 0</strong>. O dinheiro que antes ia para o governo agora vai para cultura.'
    },

    // DEPOIS DE CALCULAR
    depoisCalcular: {
      keywords: ['depois de calcular', 'calculei e agora', 'próximo passo', 'o que fazer depois'],
      response: '📝 <strong>PRÓXIMO PASSO NA SIMULAÇÃO:</strong><br><br>Depois de calcular seu limite, você:<br>1️⃣ Escolhe o valor que quer destinar (slider)<br>2️⃣ Confirma seus dados<br>3️⃣ Vê como seriam os dados de pagamento reais<br>4️⃣ Gera o comprovante de simulação<br>5️⃣ <strong>Faz o pós-teste</strong> — não esqueça essa etapa!'
    },

    // DEPÓSITO / PAGAMENTO
    deposito: {
      keywords: ['depositar', 'pagar', 'transferir', 'pix', 'banco', 'conta', 'pagamento'],
      response: '🏦 <strong>ETAPA DE PAGAMENTO — SIMULAÇÃO:</strong><br><br>Na tela de pagamento você verá dados bancários reais do FNC — Fundo Nacional de Cultura. São os mesmos usados em destinações reais.<br><br>⚠️ <strong>Neste piloto, você NÃO precisa fazer nenhuma transferência.</strong> Clique em "Simular pagamento" para avançar sem mover nenhum valor.'
    },

    // DARF
    darf: {
      keywords: ['darf', 'documento', 'guia', 'boleto'],
      response: '📄 <strong>DARF — importante:</strong><br><br>Para a <strong>Lei Rouanet Art. 18</strong>, a destinação <strong>NÃO</strong> é feita via DARF. O depósito deve ser feito diretamente na conta do FNC antes do dia 31/12.<br><br>O lançamento na declaração é feito depois, com o Código 41, usando o Comunicado de Mecenato como comprovante.'
    },

    // IMPOSTO A PAGAR
    impostoAPagar: {
      keywords: ['imposto a pagar', 'pagar imposto', 'não tenho restituição', 'devo imposto'],
      response: '💰 <strong>SE VOCÊ TEM IR A PAGAR:</strong><br><br>A destinação <strong>reduz</strong> o valor a pagar!<br><br>Exemplo: IR a pagar R$ 5.000, destina R$ 300<br>→ Paga R$ 4.700 de IR + R$ 300 ao FNC<br>→ Total: igual — mas R$ 300 foi para cultura<br><br>Custo real: <strong>R$ 0</strong>.'
    },

    // RECIBO
    reciboParaQue: {
      keywords: ['recibo serve', 'para que serve', 'usar recibo', 'preciso do recibo'],
      response: '📋 <strong>O COMPROVANTE DA SIMULAÇÃO:</strong><br><br>Neste piloto, o PDF gerado serve como registro da sua participação na pesquisa. É um documento de simulação — sem validade fiscal.<br><br>Em uma destinação real, o comprovante válido é o <strong>Comunicado de Mecenato</strong>, que você usaria para lançar a dedução na sua declaração.'
    },

    // SIMPLIFICADA
    simplificada: {
      keywords: ['simplificada', 'mudar para completa', 'tipo de declaração', 'qual declaração'],
      response: '📊 <strong>TIPO DE DECLARAÇÃO:</strong><br>• <strong>Simplificada:</strong> NÃO permite destinação via Lei Rouanet<br>• <strong>Completa:</strong> Permite destinar até <strong>6% do IR devido</strong><br><br>Você pode mudar o tipo de declaração — o próprio programa IRPF mostra qual é mais vantajosa para você.'
    },

    // ANO BASE
    anoBase: {
      keywords: ['ano base', '2025', '2026', 'qual ano', 'ano calendário'],
      response: '📅 <strong>ANO-BASE:</strong><br>• Destinações feitas em <strong>2025</strong> → declaração de <strong>2026</strong><br>• Destinações feitas em <strong>2026</strong> → declaração de <strong>2027</strong><br><br>Neste piloto, a simulação usa o ano-calendário 2025.'
    },

    // SERVIDOR PÚBLICO
    servidorPublico: {
      keywords: ['servidor', 'público', 'federal', 'estadual', 'municipal', 'gdf'],
      response: '👔 <strong>SERVIDORES PÚBLICOS:</strong><br><br>O DestineAI foi desenvolvido especialmente para servidores! Federal, estadual ou municipal — se você faz <strong>declaração completa</strong>, pode destinar até <strong>6% do IR devido</strong> para projetos culturais via Lei Rouanet.<br><br>Custo real: <strong>R$ 0</strong>. Neste piloto, tudo é simulação — mas o processo real funciona exatamente assim.'
    },

    // IMPACTO
    impacto: {
      keywords: ['impacto', 'resultado', 'para onde vai', 'como ajuda', 'benefício', 'diferença'],
      response: '❤️ <strong>O IMPACTO REAL:</strong><br><br>A <strong>Orquestra das Periferias do DF</strong> viabiliza formação musical e apresentações culturais em comunidades sem acesso à cultura.<br><br>Na vida real, sua destinação vai 100% para o projeto — sem intermediários além do FNC. Neste piloto, você está apenas <em>visualizando</em> esse impacto.'
    },

    // FAQ
    faq: {
      keywords: ['dúvidas', 'perguntas frequentes', 'faq', 'outras perguntas', 'mais informações'],
      response: '❓ <strong>MAIS DÚVIDAS?</strong><br><br>Sobre a simulação e a pesquisa: pode perguntar aqui para a TINA!<br><br>Sobre a Lei Rouanet em geral: acesse <strong>incentivabr.com.br</strong> para o FAQ completo.'
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
    return '🤖 Sou a <strong>TINA</strong>, assistente da simulação DestineAI!<br><br>Posso ajudar com:<br>• O que é este piloto e como funciona<br>• Como calcular quanto você pode destinar<br>• O que é a Lei Rouanet (Art. 18)<br>• Como completar o pós-teste<br>• Dúvidas sobre a declaração de IR<br><br>Faça sua pergunta ou clique nos botões abaixo!';
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
        <span>Oi! Sou a Tina 👋<br><small style="color:#6B7280">Alguma dúvida sobre o piloto?</small></span>
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
              Olá! Sou a <strong>TINA</strong>, assistente deste piloto. Estou aqui para tirar dúvidas sobre a simulação, a Lei Rouanet ou como concluir a pesquisa. 😊
            </div>
          </div>
        </div>

        <div class="tina-quick-actions">
          <button onclick="TINA.ask('O que é esse piloto?')">O que é isso?</button>
          <button onclick="TINA.ask('Quanto posso destinar?')">Quanto posso?</button>
          <button onclick="TINA.ask('Como concluo o pós-teste?')">Pós-teste</button>
          <button onclick="TINA.ask('É seguro?')">É seguro?</button>
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
