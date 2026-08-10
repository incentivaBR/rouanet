/**
 * Deixa a Casa Azul demonstrável em produção.
 *
 * O sistema estava pronto e não tinha como ser mostrado. Em produção existia
 * uma única organização — a própria IncentivaBR — então uma reunião de venda
 * exibiria o produto genérico, não *o sistema deles*, com o nome, a marca e o
 * projeto da Casa Azul na tela. Pior: a fila de conferência, que é justamente
 * a tela que interessa ao proponente, exige `org_admin`, e nenhum ponto do
 * sistema criava esse papel — o cadastro público insere sempre `member`.
 *
 * Os dados do projeto não são inventados: vieram da API do SALIC do Ministério
 * da Cultura. PRONAC 2511274, "Casa Azul Celebra: Ritmos que Transformam",
 * proponente ASSISTENCIA SOCIAL CASA AZUL, autorizada a captação total.
 *
 * TRAVA: só roda com SIMULATION_MODE=true. As destinações de exemplo são
 * ficção, e ficção não pode entrar numa fila onde alguém confirma dinheiro de
 * verdade. Quando a chave virar, este arquivo para de agir sozinho.
 *
 * É idempotente: roda em todo boot e não duplica nada.
 */
import bcrypt from 'bcryptjs';
import pool from '../../config/database.js';

const SLUG = 'casa-azul';
const PRONAC = '2511274';

// O azul-marinho da marca da Casa Azul. O laranja segue o da IncentivaBR: a
// marca deles é monocromática, e a cor de destaque precisa contrastar com o
// azul — usar o mesmo azul nos dois papéis apaga botões contra o fundo.
const CORES = { primaria: '#26386B', secundaria: '#EE985C' };
const LOGO = '/assets/casa-azul-felipe-augusto.png';

// Duas identidades, e confundi-las custa caro: a MARCA é o que aparece na tela
// do destinador; a RAZÃO SOCIAL é o que precisa constar no Recibo de Mecenato
// e é como o projeto está registrado no SALIC. Recibo com nome de fantasia não
// serve para a Receita.
const MARCA = 'Casa Azul Felipe Augusto';
const RAZAO_SOCIAL = 'ASSISTENCIA SOCIAL CASA AZUL';

async function organizacao(cliente) {
  const achou = await cliente.query('SELECT id FROM organizations WHERE slug = $1', [SLUG]);
  if (achou.rows.length) return achou.rows[0].id;

  const { rows } = await cliente.query(`
    INSERT INTO organizations (name, slug, cnpj, plan_type, fund_type, fund_name,
                               max_percentage, contact_email, primary_color, secondary_color,
                               logo_url, contracted_at, is_active)
    VALUES ($1,$2,NULL,'basic','rouanet','Lei Rouanet — Lei 8.313/1991',
            6, NULL, $3, $4, $5, NOW(), true)
    RETURNING id`,
    [MARCA, SLUG, CORES.primaria, CORES.secundaria, LOGO]);
  console.log('🌱 Organização Casa Azul criada');
  return rows[0].id;
}

async function projeto(cliente, orgId) {
  const achou = await cliente.query(
    'SELECT id FROM org_projects WHERE organization_id = $1 AND pronac = $2', [orgId, PRONAC]);
  if (achou.rows.length) return;

  // Dados conferidos contra o SALIC. A conta de captação fica em branco de
  // propósito: só a Casa Azul pode informá-la, e depósito na conta errada não
  // gera recibo — o servidor perde a dedução e a culpa é nossa.
  await cliente.query(`
    INSERT INTO org_projects (organization_id, pronac, titulo, area, segmento, descricao, uf,
                              proponente_nome, is_active, is_featured)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,true)`,
    [orgId, PRONAC, 'Casa Azul Celebra: Ritmos que Transformam',
     'Artes Cênicas', 'Música',
     'Projeto aprovado pelo Ministério da Cultura, autorizada a captação total dos recursos.',
     'DF', RAZAO_SOCIAL]);
  console.log(`🌱 Projeto ${PRONAC} vinculado à Casa Azul`);
}

async function gestor(cliente, orgId) {
  const email = (process.env.DEMO_GESTOR_EMAIL || '').trim().toLowerCase();
  if (!email) {
    console.log('🌱 DEMO_GESTOR_EMAIL não definido — fila de conferência seguirá sem gestor');
    return;
  }

  let { rows } = await cliente.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);

  if (!rows.length) {
    const senha = process.env.DEMO_GESTOR_SENHA;
    if (!senha) {
      console.log(`🌱 usuário ${email} não existe e DEMO_GESTOR_SENHA não foi definida`);
      return;
    }
    ({ rows } = await cliente.query(`
      INSERT INTO users (cpf, nome, email, senha_hash, email_verified, organization_id)
      VALUES ($1,$2,$3,$4,true,$5) RETURNING id`,
      [`demo${Date.now()}`.slice(0, 11), 'Gestor Casa Azul', email,
       await bcrypt.hash(senha, 10), orgId]));
    console.log(`🌱 Gestor ${email} criado`);
  }

  // ON CONFLICT: promove quem já era `member` — é o caso de quem se cadastrou
  // pela tela pública antes de virar gestor.
  await cliente.query(`
    INSERT INTO organization_users (organization_id, user_id, role, accepted_at, is_active)
    VALUES ($1,$2,'org_admin',NOW(),true)
    ON CONFLICT (organization_id, user_id)
    DO UPDATE SET role = 'org_admin', is_active = true`,
    [orgId, rows[0].id]);
  console.log(`🌱 ${email} é org_admin da Casa Azul`);
}

async function filaDeExemplo(cliente, orgId) {
  // Uma fila vazia não demonstra nada — e uma fila com dado plantado por cima
  // de destinação real seria muito pior. Só semeia se estiver realmente vazia.
  const { rows: existentes } = await cliente.query(
    'SELECT 1 FROM donations WHERE organization_id = $1 LIMIT 1', [orgId]);
  if (existentes.length) return;

  const { rows: pessoas } = await cliente.query(`
    INSERT INTO users (cpf, nome, email, senha_hash, email_verified, organization_id)
    VALUES ('00000000191','Maria Aparecida de Souza (exemplo)','exemplo1@demonstracao.invalido','!',true,$1),
           ('00000000272','João Batista Ferreira (exemplo)','exemplo2@demonstracao.invalido','!',true,$1),
           ('00000000353','Rita de Cássia Nunes (exemplo)','exemplo3@demonstracao.invalido','!',true,$1)
    ON CONFLICT DO NOTHING
    RETURNING id`, [orgId]);
  if (!pessoas.length) return;

  const valores = [3200, 12500.5, 800];
  for (let i = 0; i < pessoas.length; i++) {
    await cliente.query(`
      INSERT INTO donations (user_id, organization_id, donation_amount, ir_devido, fiscal_year,
                             pronac, projeto_titulo, status, receipt_url, receipt_filename)
      VALUES ($1,$2,$3,$4,2026,$5,$6,'awaiting_confirmation',
              '/uploads/receipts/exemplo.pdf',$7)`,
      [pessoas[i].id, orgId, valores[i], valores[i] / 0.06, PRONAC,
       'Casa Azul Celebra: Ritmos que Transformam', `comprovante-exemplo-${i + 1}.pdf`]);
  }
  console.log(`🌱 ${pessoas.length} destinações de exemplo na fila de conferência`);
}

export async function semeiaCasaAzul(conexao = pool) {
  if (process.env.SIMULATION_MODE !== 'true') return;

  const cliente = await conexao.connect();
  try {
    const orgId = await organizacao(cliente);
    await projeto(cliente, orgId);
    await gestor(cliente, orgId);
    await filaDeExemplo(cliente, orgId);
  } catch (erro) {
    // Falhar aqui não pode derrubar o servidor: isto é conveniência de
    // demonstração, não caminho crítico.
    console.error('⚠️  Semeadura da Casa Azul:', erro.message);
  } finally {
    cliente.release();
  }
}

export default semeiaCasaAzul;
