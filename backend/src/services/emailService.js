import { Resend } from 'resend';
import nodemailer from 'nodemailer';

let resendClient = null;
let transporter = null;
let emailServiceStatus = {
  initialized: false,
  mode: null,
  host: null,
  user: null,
  error: null
};

export async function initEmailService() {
  try {
    // Produção: Resend API (HTTP — não bloqueado pelo Railway)
    if (process.env.RESEND_API_KEY || process.env.SMTP_PASS) {
      const apiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS;
      resendClient = new Resend(apiKey);

      emailServiceStatus = {
        initialized: true,
        mode: 'production',
        host: 'api.resend.com',
        user: 'resend-api',
        error: null
      };

      console.log('📧 Serviço de email inicializado (PRODUÇÃO via Resend API)');
    } else {
      // Desenvolvimento: Ethereal (emails fake)
      const testAccount = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });

      emailServiceStatus = {
        initialized: true,
        mode: 'test',
        host: 'smtp.ethereal.email',
        user: testAccount.user,
        port: 587,
        secure: false,
        etherealUrl: 'https://ethereal.email',
        error: null
      };

      console.log('📧 Serviço de email inicializado (TESTE - Ethereal)');
      console.log('📧 Usuário Ethereal:', testAccount.user);
    }

    return resendClient || transporter;
  } catch (error) {
    emailServiceStatus = { initialized: false, mode: null, host: null, user: null, error: error.message };
    throw error;
  }
}

export function getEmailStatus() {
  return emailServiceStatus;
}

const getAppUrl = () => {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const domain = process.env.BRAND_DOMAIN;
  if (domain) return `https://${domain.replace(/^https?:\/\//, '')}`;
  return 'http://localhost:3000';
};

const getFromAddress = () => {
  if (process.env.SMTP_FROM) return process.env.SMTP_FROM;
  const brand = process.env.BRAND_NAME || 'DestineAI';
  const domain = process.env.BRAND_DOMAIN || 'destineai.com.br';
  return `"${brand}" <contato@${domain}>`;
};

function getEmailTemplate(content, org = null) {
  const orgName       = org?.name           || process.env.BRAND_NAME          || 'DestineAI';
  const primaryColor  = org?.primary_color  || process.env.BRAND_COLOR_PRIMARY || '#273F77';
  const appUrl        = getAppUrl();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${primaryColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: ${primaryColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .highlight { background: #EEF2FF; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${orgName}</h1>
          <p>Incentivos Fiscais Simplificados · Powered by IncentivaBR</p>
        </div>
        <div class="content">${content}</div>
        <div class="footer">
          <p>Este é um email automático do ${orgName}.</p>
          <p><a href="${appUrl}" style="color:#273F77">${appUrl.replace('https://', '')}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function doSend({ to, subject, html }) {
  if (resendClient) {
    const from = getFromAddress();
    const result = await resendClient.emails.send({ from, to, subject, html });
    if (result.error) throw new Error(result.error.message);
    console.log('📧 Email enviado:', result.data?.id);
    return;
  }
  if (transporter) {
    const info = await transporter.sendMail({ from: getFromAddress(), to, subject, html });
    if (emailServiceStatus.mode === 'test') {
      console.log('📧 Email de teste:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  }
}

export async function sendEmail({ to, subject, html }) {
  if (!resendClient && !transporter) return;
  try {
    await doSend({ to, subject, html });
  } catch (error) {
    console.error('Erro ao enviar email:', error.message);
  }
}

export async function sendWelcomeEmail(user, org = null) {
  if (!resendClient && !transporter) {
    console.warn('📧 Serviço de email não inicializado.');
    return null;
  }

  const content = `
    <h2>Bem-vindo(a), ${user.name}! 🎉</h2>
    <p>Sua conta foi criada com sucesso na plataforma IncentivaBR.</p>
    <ul>
      <li>✅ Calcular quanto do seu IR pode destinar</li>
      <li>✅ Conhecer projetos sociais que transformam vidas</li>
      <li>✅ Destinar seu imposto para causas que você acredita</li>
    </ul>
    <div class="highlight">
      <strong>💡 Sabia que?</strong><br>
      Destinar parte do seu IR não custa nada a mais! É um direito seu escolher para onde vai o seu imposto.
    </div>
    <a href="${getAppUrl()}/calculadora.html" class="button">Calcular meu potencial</a>
  `;

  const brandName = process.env.BRAND_NAME || 'DestineAI';
  try {
    await doSend({
      to: user.email,
      subject: `Bem-vindo ao ${brandName}!`,
      html: getEmailTemplate(content, org)
    });
    console.log('📧 Email de boas-vindas enviado para:', user.email);
  } catch (error) {
    console.error('❌ Erro email boas-vindas:', error.message);
  }
}

export async function sendDestinationRegisteredEmail(user, donation, project, org = null) {
  if (!resendClient && !transporter) return null;

  const valor = parseFloat(donation.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const content = `
    <h2>Destinação Registrada! 📝</h2>
    <p>Olá, ${user.name}!</p>
    <div class="highlight">
      <strong>Projeto:</strong> ${project.title}<br>
      <strong>Valor:</strong> ${valor}<br>
      <strong>Status:</strong> ⏳ Aguardando confirmação do depósito
    </div>
    <a href="${getAppUrl()}/dashboard.html" class="button">Ver minhas destinações</a>
  `;

  try {
    await doSend({
      to: user.email,
      subject: `Destinação registrada — ${project.title}`,
      html: getEmailTemplate(content, org)
    });
  } catch (error) {
    console.error('Erro ao enviar email de destinação:', error.message);
  }
}

export async function sendDestinationConfirmedEmail(user, donation, project, org = null) {
  if (!resendClient && !transporter) return null;

  const valor = parseFloat(donation.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const content = `
    <h2>Destinação Confirmada! ✅</h2>
    <p>Olá, ${user.name}!</p>
    <div class="highlight">
      <strong>Projeto:</strong> ${project.title}<br>
      <strong>Valor:</strong> ${valor}<br>
      <strong>Status:</strong> ✅ Confirmado
    </div>
    <p>Acesse seu dashboard para baixar os documentos.</p>
    <a href="${getAppUrl()}/dashboard.html" class="button">Baixar documentos</a>
    <p style="margin-top: 20px; color: #00A859; font-weight: bold;">
      🎉 Obrigado por transformar seu imposto em impacto social!
    </p>
  `;

  try {
    await doSend({
      to: user.email,
      subject: `✅ Destinação confirmada - ${project.title}`,
      html: getEmailTemplate(content, org)
    });
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error.message);
  }
}

export async function sendNewDonationToAdminEmail(adminEmail, user, donation, project, org = null) {
  if (!resendClient && !transporter) return null;

  const valor = parseFloat(donation.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const content = `
    <h2>Nova Destinação Pendente! 🔔</h2>
    <div class="highlight">
      <strong>Contribuinte:</strong> ${user.name}<br>
      <strong>Email:</strong> ${user.email}<br>
      <strong>Projeto:</strong> ${project.title}<br>
      <strong>Valor:</strong> ${valor}<br>
      <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}
    </div>
    <a href="${getAppUrl()}/admin.html" class="button">Acessar Painel Admin</a>
  `;

  try {
    await doSend({
      to: adminEmail,
      subject: `🔔 Nova destinação pendente - ${valor}`,
      html: getEmailTemplate(content, org)
    });
  } catch (error) {
    console.error('Erro ao enviar email para admin:', error.message);
  }
}

/**
 * Avisa o proponente que ha um Recibo de Mecenato a emitir.
 *
 * Quem emite o recibo e o proponente, no modelo oficial do MinC. Este e-mail
 * existe para que o destinador nao precise correr atras: ele transfere, e a
 * instituicao ja e avisada com todos os campos que o modelo exige.
 */
export async function sendMecenatoPendenteEmail(org, user, donation, project) {
  if (!resendClient && !transporter) return null;
  const destino = org?.contact_email;
  if (!destino) {
    console.warn('[mecenato] organização sem contact_email — proponente não notificado');
    return null;
  }

  const valor = parseFloat(donation.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const prazo = org?.mecenato_prazo_dias || 10;

  const content = `
    <h2>Recibo de Mecenato a emitir 📄</h2>
    <p>Uma destinação foi confirmada e aguarda o recibo.</p>
    <div class="highlight">
      <strong>Destinador:</strong> ${user.nome || user.name}<br>
      <strong>CPF:</strong> ${user.cpf || '—'}<br>
      <strong>Valor:</strong> ${valor}<br>
      <strong>Projeto:</strong> ${project?.title || donation.projeto_titulo || '—'}<br>
      <strong>PRONAC:</strong> ${donation.pronac || '—'}<br>
      <strong>Data:</strong> ${new Date(donation.confirmed_at || Date.now()).toLocaleDateString('pt-BR')}
    </div>
    <p>Estes são os campos exigidos pelo modelo do Ministério da Cultura. Emita o
    recibo em três vias — Ministério, instituição e destinador — e anexe a via do
    destinador na plataforma: ele baixa direto da conta dele.</p>
    <a href="${getAppUrl()}/dashboard.html" class="button">Anexar recibo</a>
    <p style="margin-top:18px;color:#666;font-size:13px">
      O destinador foi informado de que o recibo costuma sair em até ${prazo} dias úteis.
    </p>
  `;

  try {
    await doSend({
      to: destino,
      subject: `📄 Recibo de Mecenato a emitir — ${valor}`,
      html: getEmailTemplate(content, org)
    });
    return true;
  } catch (error) {
    console.error('Erro ao notificar proponente:', error.message);
    return null;
  }
}
