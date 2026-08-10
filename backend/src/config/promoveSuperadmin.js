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

/**
 * O que aconteceu na última promoção, para o diagnóstico.
 *
 * Sem isto, um login que não funciona é indistinguível de senha errada, conta
 * inexistente, variável não lida e promoção que falhou — quatro causas com
 * quatro consertos diferentes, e nenhuma pista fora dos logs do Railway, que
 * ninguém abre no meio de uma reunião.
 */
let ultimoResultado = { situacao: 'nao_executado' };
export function estadoDoSuperadmin() {
  return {
    ...ultimoResultado,
    variavel_definida: Boolean((process.env.SUPERADMIN_EMAIL || '').trim()),
    senha_definida: Boolean(process.env.SUPERADMIN_SENHA)
  };
}

export async function promoveSuperadmin(conexao = pool) {
  const email = (process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase();
  if (!email) { ultimoResultado = { situacao: 'sem_variavel' }; return; }

  const cliente = await conexao.connect();
  try {
    let criouAgora = false;
    let { rows } = await cliente.query('SELECT id, is_superadmin FROM users WHERE LOWER(email) = $1', [email]);

    if (!rows.length) {
      const senha = process.env.SUPERADMIN_SENHA;
      if (!senha) {
        // A causa mais provável de "não reconhece a senha": não há conta.
        ultimoResultado = {
          situacao: 'sem_conta_e_sem_senha', email,
          recado: 'Não existe conta com este e-mail, e SUPERADMIN_SENHA não foi definida. ' +
                  'Defina a senha no Railway, ou cadastre-se pelo site com este mesmo e-mail.'
        };
        console.log(`👑 ${email} não tem conta ainda. Cadastre-se pelo site, ou defina SUPERADMIN_SENHA.`);
        return;
      }
      ({ rows } = await cliente.query(`
        INSERT INTO users (cpf, nome, email, senha_hash, email_verified, is_superadmin)
        VALUES ($1,$2,$3,$4,true,true) RETURNING id, is_superadmin`,
        [`admin${Date.now()}`.slice(0, 11), 'Administrador IncentivaBR', email,
         await bcrypt.hash(senha, 10)]));
      criouAgora = true;
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

    ultimoResultado = {
      situacao: 'ok', email,
      conta_criada_agora: criouAgora,
      ja_era_superadmin: jaEra,
      recado: criouAgora
        ? 'Conta criada. Entre com este e-mail e a senha de SUPERADMIN_SENHA.'
        : 'Conta existente promovida. Entre com este e-mail e a senha que você já usava.'
    };
    if (!jaEra) console.log(`👑 ${email} agora é superadmin`);
  } catch (erro) {
    // Como o semeador: conveniência de arranque não pode derrubar o servidor.
    ultimoResultado = { situacao: 'erro', email, recado: erro.message };
    console.error('⚠️  Promoção de superadmin:', erro.message);
  } finally {
    cliente.release();
  }
}

export default promoveSuperadmin;
