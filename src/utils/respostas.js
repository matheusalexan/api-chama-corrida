/**
 * Utilitários para respostas padronizadas da API
 */

/**
 * Cria uma resposta de sucesso padronizada
 * @param {any} dados - Dados da resposta
 * @param {number} statusCode - Código de status HTTP (padrão: 200)
 * @returns {Object} Resposta padronizada
 */
export const criarRespostaSucesso = (dados, statusCode = 200) => {
  return {
    dados,
    sucesso: true,
    timestamp: new Date().toISOString()
  };
};

/**
 * Cria uma resposta de sucesso para criação de recursos
 * @param {any} dados - Dados do recurso criado
 * @returns {Object} Resposta de criação
 */
export const criarRespostaCriacao = (dados) => {
  return criarRespostaSucesso(dados, 201);
};

/**
 * Cria uma resposta de lista com paginação
 * @param {Array} dados - Lista de dados
 * @param {Object} paginacao - Informações de paginação
 * @param {number} total - Total de registros
 * @returns {Object} Resposta com paginação
 */
export const criarRespostaLista = (dados, paginacao, total) => {
  const { pagina, limite } = paginacao;
  
  return {
    dados,
    meta: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
      temProxima: pagina * limite < total,
      temAnterior: pagina > 1
    },
    sucesso: true,
    timestamp: new Date().toISOString()
  };
};

/**
 * Aplica paginação a uma lista de dados
 * @param {Array} dados - Lista completa de dados
 * @param {Object} paginacao - Objeto com pagina, limite e offset
 * @returns {Array} Dados paginados
 */
export const aplicarPaginacao = (dados, paginacao) => {
  const { offset, limite } = paginacao;
  return dados.slice(offset, offset + limite);
};

/**
 * Cria uma resposta de erro padronizada
 * @param {string} codigo - Código do erro
 * @param {string} mensagem - Mensagem do erro
 * @param {Object} detalhes - Detalhes adicionais
 * @returns {Object} Resposta de erro
 */
export const criarRespostaErro = (codigo, mensagem, detalhes = {}) => {
  return {
    codigo,
    mensagem,
    detalhes,
    sucesso: false,
    timestamp: new Date().toISOString()
  };
};

/**
 * Cria uma resposta de validação
 * @param {Array} erros - Lista de erros de validação
 * @returns {Object} Resposta de validação
 */
export const criarRespostaValidacao = (erros) => {
  return criarRespostaErro('ERRO_VALIDACAO', 'Dados de entrada inválidos', {
    erros: erros.map(erro => ({
      campo: erro.campo || 'geral',
      mensagem: erro.mensagem,
      valor: erro.valor
    }))
  });
};

/**
 * Cria uma resposta de recurso não encontrado
 * @param {string} tipo - Tipo do recurso
 * @param {string} id - ID do recurso
 * @returns {Object} Resposta de não encontrado
 */
export const criarRespostaNaoEncontrado = (tipo, id) => {
  return criarRespostaErro('NAO_ENCONTRADO', `${tipo} não encontrado`, {
    tipo,
    id
  });
};

/**
 * Cria uma resposta de regra de negócio violada
 * @param {string} mensagem - Mensagem da regra de negócio
 * @param {Object} detalhes - Detalhes da violação
 * @returns {Object} Resposta de regra de negócio
 */
export const criarRespostaRegraNegocio = (mensagem, detalhes = {}) => {
  return criarRespostaErro('REGRA_NEGOCIO', mensagem, detalhes);
};

/**
 * Cria uma resposta de estado inválido
 * @param {string} mensagem - Mensagem do estado inválido
 * @param {Object} detalhes - Detalhes do estado
 * @returns {Object} Resposta de estado inválido
 */
export const criarRespostaEstadoInvalido = (mensagem, detalhes = {}) => {
  return criarRespostaErro('ESTADO_INVALIDO', mensagem, detalhes);
};

/**
 * Cria uma resposta de limite de requisições excedido
 * @param {string} mensagem - Mensagem do limite excedido
 * @returns {Object} Resposta de limite excedido
 */
export const criarRespostaLimiteRequisicoes = (mensagem) => {
  return criarRespostaErro('LIMITE_REQUISICOES', mensagem);
};

/**
 * Cria uma resposta de erro interno
 * @param {string} mensagem - Mensagem do erro interno
 * @returns {Object} Resposta de erro interno
 */
export const criarRespostaErroInterno = (mensagem = 'Erro interno do servidor') => {
  return criarRespostaErro('ERRO_INTERNO', mensagem);
}; 