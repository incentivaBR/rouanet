/**
 * O primeiro superadmin — o problema do ovo e da galinha.
 *
 * A tela de clientes exige superadmin. Criar um superadmin exige... um
 * superadmin. Sem uma porta de entrada, o sistema fica trancado por fora e a
 * única saída é editar o banco à mão, que é justamente o que este projeto
 * inteiro tenta evitar.
 *
 * A porta é a variável `SUPERADMIN_EMAIL`, no Railway. Quem controla as
 * variáveis já é dono do servidor, do banco e das chaves — não há poder novo
 * sendo criado aqui, só um caminho que não passa por SQL manual.
 *
 * Diferente do semeador da Casa Azul, este roda também em produção: o
 * superadmin não é conveniência de demonstração, é quem cadastra clientes
 * depois que a chave virar.
 *
 * Duas marcas precisam existir, porque o sistema pergunta de dois jeitos:
 * `users.is_superadmin`, que vai para o token no login, e um vínculo
 * `superadmin` em `organization_users`, que é o que `podeGerirOrganizacao`
 * consulta. Gravar só uma deixa metade das telas fechadas, com um erro que não
 * explica nada.
 */
import bcrypt from 'bcryptjs';
import pool from '../../config/database.js';

export async function promoveSuperadmin(conexao = pool) {
  const email = (process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase();
  if (!email) return;

  const cliente = await conexao.connect();
  try {
    let { rows } = await cliente.query('SELECT id, is_superadmin FROM users WHERE LOWER(email) = $1', [email]);

    if (!rows.length) {
      const senha = process.env.SUPERADMIN_SENHA;
      if (!senha) {
        console.log(`👑 ${email} não tem conta ainda. Cadastre-se pelo site, ou defina SUPERADMIN_SENHA.`);
        return;
      }
      ({ rows } = await cliente.query(`
        INSERT INTO users (cpf, nome, email, senha_hash, email_verified, is_superadmin)
        VALUES ($1,$2,$3,$4,true,true) RETURNING id, is_superadmin`,
        [`admin${Date.now()}`.slice(0, 11), 'Administrador IncentivaBR', email,
         await bcrypt.hash(senha, 10)]));
      console.log(`👑 Conta de superadmin criada para ${email}`);
    }

    const userId = rows[0].id;
    const jaEra = rows[0].is_superadmin === true;

    await cliente.query('UPDATE users SET is_superadmin = true WHERE id = $1', [userId]);

    // O vínculo precisa de uma organização, e a `www` é a da própria
    // IncentivaBR. O papel `superadmin` não é escopado a ela — `permissoes.js`
    // aceita esse vínculo para qualquer organização.
    const { rows: casa } = await cliente.query(
      `SELECT id FROM organizations WHERE slug = 'www' LIMIT 1`);
    if (casa.length) {
      await cliente.query(`
        INSERT INTO organization_users (organization_id, user_id, role, accepted_at, is_active)
        VALUES ($1,$2,'superadmin',NOW(),true)
        ON CONFLICT (organization_id, user_id)
        DO UPDATE SET role = 'superadmin', is_active = true`,
        [casa[0].id, userId]);
    }

    if (!jaEra) console.log(`👑 ${email} agora é superadmin`);
  } catch (erro) {
    // Como o semeador: conveniência de arranque não pode derrubar o servidor.
    console.error('⚠️  Promoção de superadmin:', erro.message);
  } finally {
    cliente.release();
  }
}

export default promoveSuperadmin;
