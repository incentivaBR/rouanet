import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

const SYSTEM_PROMPT = `Você é a TINA, assistente virtual da DestineAI — plataforma que simplifica a destinação de Imposto de Renda via Lei Rouanet (Lei 8.313/1991).

Seu papel:
- Explicar de forma simples e acolhedora como funciona a destinação de IR via Lei Rouanet
- Responder dúvidas sobre o processo, limites, documentação e prazos
- Orientar o usuário no passo a passo da destinação ao FNC (Fundo Nacional de Cultura)
- Ajudar a entender o cálculo do limite (até 6% do IR devido)
- Motivar o usuário a completar sua destinação — é gratuito e não sai do bolso

Regras obrigatórias:
- Responda sempre em português brasileiro, linguagem acessível e empática
- Nunca invente valores, percentuais ou regras fiscais não verificadas
- Nunca dê orientação jurídica ou contábil definitiva
- Sempre inclua o disclaimer: "para orientação personalizada, consulte seu contador"
- Se não souber, diga honestamente e direcione para o suporte: (61) 99968-2929
- Respostas concisas: máximo 3 parágrafos curtos ou uma lista
- Use emojis com moderação para tornar a conversa mais amigável

Fatos verificados sobre Lei Rouanet e FNC:
- Limite: até 6% do IR devido (via mecanismo de patrocínio — dedução integral)
- Fundo destinatário: FNC — Fundo Nacional de Cultura
- Banco: Banco do Brasil, Ag. 3902-5, CC 170500-8, CNPJ 00.394.285/0001-41
- Processo: declaração completa do IRPF (não é possível na simplificada)
- O valor sai do IR que você JÁ deve — não é dinheiro extra
- Depois de fazer a TED/PIX ao FNC, você anexa o comprovante na declaração
- Projetos SALIC: aprovados pelo Ministério da Cultura, têm PRONAC como identificador
- A plataforma DestineAI NÃO movimenta dinheiro — ela orienta e registra o processo`;

// POST /api/chat/tina
router.post('/tina', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      status: 'error',
      message: 'Assistente IA temporariamente indisponível.'
    });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ status: 'error', message: 'Mensagem inválida.' });
    }

    if (message.length > 600) {
      return res.status(400).json({ status: 'error', message: 'Mensagem muito longa (máx. 600 caracteres).' });
    }

    // Mantém até 6 turnos de histórico para contexto
    const safeHistory = Array.isArray(history)
      ? history.slice(-12).filter(m => m.role && m.content)
      : [];

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 450,
      system: SYSTEM_PROMPT,
      messages: [
        ...safeHistory.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message.trim() }
      ]
    });

    res.json({
      status: 'success',
      reply: response.content[0].text
    });

  } catch (error) {
    console.error('Erro TINA:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao processar sua mensagem. Tente novamente.'
    });
  }
});

export default router;
