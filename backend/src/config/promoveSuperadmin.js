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

    // SUPERADMIN_SENHA define a senha, exista a conta ou não.
    //
    // Antes ela só valia na criação. O efeito prático era o pior possível: o
    // dono definia a variável, a conta já existia, nada acontecia — e ele
    // ficava tentando entrar com uma senha que o banco nunca recebeu, sem nada
    // na tela explicando. A variável prometia mais do que fazia.
    //
    // Isto é uma redefinição de senha por variável de ambiente, e é assim que
    // deve ser lida: quem controla o Railway já pode tudo. Depois de entrar,
    // apague a variável — senão todo deploy volta a impor este valor, e a
    // senha deixa de poder ser trocada pela tela.
    let senhaAplicada = false;
    if (!criouAgora && process.env.SUPERADMIN_SENHA) {
      await cliente.query('UPDATE users SET senha_hash = $2 WHERE id = $1',
        [userId, await bcrypt.hash(process.env.SUPERADMIN_SENHA, 10)]);
      senhaAplicada = true;
      console.log('👑 Senha do superadmin redefinida por SUPERADMIN_SENHA');
    }

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
      senha_aplicada_agora: senhaAplicada,
      recado: (criouAgora || senhaAplicada)
        ? 'Entre com este e-mail e a senha de SUPERADMIN_SENHA. ' +
          'Depois de entrar, apague essa variável no Railway — enquanto ela existir, ' +
          'todo deploy volta a impor esse valor e a senha não pode ser trocada pela tela.'
        : 'Conta existente promovida. Entre com este e-mail e a senha que você já usava. ' +
          'Se não lembra, defina SUPERADMIN_SENHA no Railway e faça um deploy.'
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
