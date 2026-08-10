/**
 * Que poder tem a chave de e-mail que este servidor está usando.
 *
 * "E-mail funcionando" não é a mesma pergunta que "a chave certa está no ar".
 * O `/diagnostico` sabia dizer que havia uma chave configurada, e só — não
 * distinguia a chave nova da antiga, nem uma já revogada. Então quem acabou de
 * girar a chave não tinha como confirmar que girou, a não ser mandando um
 * e-mail de verdade e esperando.
 *
 * Quem responde isso com autoridade é o próprio Resend. Basta pedir algo que
 * uma chave de envio NÃO pode fazer — listar domínios — e ler a recusa.
 *
 * Duas chaves com o mesmo "ok" no diagnóstico são coisas muito diferentes:
 * uma `full_access` lê os logs de envio (destinatário e conteúdo de tudo que
 * já saiu — dado pessoal, LGPD art. 48) e cria outras chaves, que sobrevivem
 * à revogação da original. Uma `sending_access` presa a um domínio só manda
 * e-mail por aquele domínio.
 */

/**
 * Traduz a resposta do Resend. Função pura, para poder ser testada sem rede.
 *
 * Atenção aos códigos, que são o contrário do que a intuição sugere:
 * chave inválida devolve **403**, chave restrita devolve **401**. Por isso a
 * decisão olha o campo `name` do corpo, não o status.
 */
export function classificaEscopoResend(status, corpo) {
  const nome = corpo?.name;

  if (status === 200) {
    return {
      escopo: 'ampla',
      ok: false,
      recado: 'Esta chave consegue listar domínios, então é full_access: lê os ' +
              'logs de envio e cria outras chaves. Troque por uma sending_access ' +
              'presa ao domínio.'
    };
  }
  if (nome === 'restricted_api_key') {
    return { escopo: 'somente_envio', ok: true, recado: 'Chave restrita a envio, como deve ser.' };
  }
  if (nome === 'invalid_api_key') {
    return {
      escopo: 'invalida',
      ok: false,
      recado: 'O Resend recusa esta chave — foi revogada ou está errada. ' +
              'Nenhum e-mail vai sair.'
    };
  }
  return { escopo: 'indeterminado', ok: false, recado: `Resposta inesperada do Resend (HTTP ${status}).` };
}

/**
 * Pergunta ao Resend. Só deve ser chamada no caminho autenticado do
 * diagnóstico — é uma chamada de rede, e a resposta diz respeito à segurança
 * da conta.
 */
export async function escopoDaChaveResend(buscar = fetch) {
  const chave = process.env.RESEND_API_KEY || process.env.SMTP_PASS;
  if (!chave) return { escopo: 'ausente', ok: false, recado: 'Nenhuma chave configurada.' };

  try {
    const r = await buscar('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${chave}` },
      signal: AbortSignal.timeout(5000)
    });
    const corpo = await r.json().catch(() => ({}));
    return classificaEscopoResend(r.status, corpo);
  } catch (e) {
    // Sem resposta não se conclui nada. Dizer "ok" aqui seria pior do que
    // calar: daria por verificado o que não foi.
    return { escopo: 'indeterminado', ok: false, recado: `Não deu para perguntar ao Resend: ${e.message}` };
  }
}

export default { classificaEscopoResend, escopoDaChaveResend };
