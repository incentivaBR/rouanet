/**
 * Por que a TINA parou de responder.
 *
 * O `catch` da rota dizia sempre a mesma coisa: "Erro ao processar sua
 * mensagem. Tente novamente." Para dois dos quatro motivos possíveis esse
 * conselho e falso — com a chave revogada ou o credito no fim, tentar de novo
 * nao funciona nunca, e o destinador fica insistindo com uma tela que nao vai
 * mudar. Do lado de ca ninguem fica sabendo, porque o log tambem diz so "Erro".
 *
 * A distincao nao esta no codigo HTTP sozinho: **credito esgotado e falta de
 * permissao voltam os dois 403**, e so o campo `type` do corpo separa um do
 * outro. Por isso a decisao olha status E type.
 *
 * Referencia: platform.claude.com/docs/en/api/errors
 */

/**
 * Funcao pura, para poder ser testada sem rede nem chave.
 *
 * @param {number|undefined} status  codigo HTTP (undefined = nem chegou a conectar)
 * @param {string|undefined} tipo    campo `error.type` do corpo da resposta
 */
export function classificaErroIA(status, tipo) {
  // Sem status nao houve resposta: rede, DNS, timeout. E transitorio.
  if (!status) {
    return {
      causa: 'rede',
      passageiro: true,
      operador: 'Nao foi possivel alcancar a API da Anthropic (rede ou timeout).',
      usuario: 'Não consegui responder agora. Tente de novo em alguns instantes.'
    };
  }

  if (status === 401 || tipo === 'authentication_error') {
    return {
      causa: 'chave_invalida',
      passageiro: false,
      operador: 'A ANTHROPIC_API_KEY foi recusada — revogada, trocada ou errada. ' +
                'Nenhuma resposta vai sair ate ela ser corrigida no Railway.',
      usuario: 'A assistente está indisponível no momento. A equipe já foi avisada — ' +
               'não adianta tentar de novo agora.'
    };
  }

  if (tipo === 'billing_error') {
    // 403 tambem, mas por dinheiro e nao por permissao.
    return {
      causa: 'sem_credito',
      passageiro: false,
      operador: 'Credito da organizacao esgotado no console da Anthropic. ' +
                'Adicione fundos ou ligue a recarga automatica.',
      usuario: 'A assistente está indisponível no momento. A equipe já foi avisada — ' +
               'não adianta tentar de novo agora.'
    };
  }

  if (status === 403) {
    return {
      causa: 'sem_permissao',
      passageiro: false,
      operador: 'A chave nao tem permissao para este modelo ou recurso.',
      usuario: 'A assistente está indisponível no momento. A equipe já foi avisada — ' +
               'não adianta tentar de novo agora.'
    };
  }

  if (status === 429) {
    // O unico caso em que "tente novamente" e um conselho verdadeiro.
    return {
      causa: 'limite_de_uso',
      passageiro: true,
      operador: 'Limite de requisicoes atingido.',
      usuario: 'Estou recebendo muitas perguntas ao mesmo tempo. Tente de novo em um minuto.'
    };
  }

  if (status >= 500) {
    return {
      causa: 'servico_instavel',
      passageiro: true,
      operador: `A API da Anthropic respondeu ${status}.`,
      usuario: 'Não consegui responder agora. Tente de novo em alguns instantes.'
    };
  }

  return {
    causa: 'requisicao_invalida',
    passageiro: false,
    operador: `Requisicao recusada (HTTP ${status}, tipo ${tipo || 'desconhecido'}) — ` +
              'provavelmente um erro nosso na montagem da chamada.',
    usuario: 'Não consegui responder a essa pergunta. Tente reformular.'
  };
}

/**
 * Le o erro do SDK. O formato varia por versao, entao a leitura e defensiva:
 * o que importa e nunca perder a distincao entre "tente de novo" e "nao adianta".
 */
export function leErroDoSdk(erro) {
  const status = erro?.status ?? erro?.statusCode ?? erro?.response?.status;
  const tipo = erro?.error?.error?.type ?? erro?.error?.type ?? erro?.type;
  return classificaErroIA(status, tipo);
}

export default { classificaErroIA, leErroDoSdk };
