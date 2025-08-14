/**
 * Utilitários para respostas padronizadas da API
 */
import { getStatusDescription, generateErrorResponse } from '../config/httpStatusCodes.js';

/**
 * Cria uma resposta de sucesso padronizada
 * @param {any} dados - Dados da resposta
 * @param {string} context - Contexto da operação para melhorar descrições
 * @returns {Object} Resposta padronizada
 */
export const criarRespostaSucesso = (dados, context = '') => {
  return {
    dados,
    sucesso: true,
    timestamp: new Date().toISOString(),
    meta: {
      statusCode: 200,
      statusName: 'OK',
      descricao: getStatusDescription(200, context).description,
      contexto: context || 'geral'
    }
  };
};

/**
 * Cria uma resposta de sucesso para criação de recursos
 * @param {any} dados - Dados do recurso criado
 * @param {string} context - Contexto da operação
 * @returns {Object} Resposta de criação
 */
export const criarRespostaCriacao = (dados, context = '') => {
  return {
    dados,
    sucesso: true,
    timestamp: new Date().toISOString(),
    meta: {
      statusCode: 201,
      statusName: 'Created',
      descricao: getStatusDescription(201, context).description,
      contexto: context || 'geral'
    }
  };
};

/**
 * Cria uma resposta de lista com paginação
 * @param {Array} dados - Lista de dados
 * @param {Object} paginacao - Informações de paginação
 * @param {number} total - Total de registros
 * @param {string} context - Contexto da operação
 * @returns {Object} Resposta com paginação
 */
export const criarRespostaLista = (dados, paginacao, total, context = '') => {
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
    timestamp: new Date().toISOString(),
    status: {
      statusCode: 200,
      statusName: 'OK',
      descricao: getStatusDescription(200, context).description,
      contexto: context || 'geral'
    }
  };
};

/**
 * Aplica paginação a uma lista de dados
 * @param {Array} dados - Lista completa de dados
 * @param {number} pagina - Número da página
 * @param {number} limite - Limite de itens por página
 * @returns {Object} Objeto com dados paginados e metadados
 */
export const aplicarPaginacao = (dados, pagina, limite) => {
  const offset = (pagina - 1) * limite;
  const dadosPaginados = dados.slice(offset, offset + limite);
  
  return {
    dados: dadosPaginados,
    meta: {
      pagina,
      limite,
      total: dados.length,
      totalPaginas: Math.ceil(dados.length / limite),
      temProxima: pagina * limite < dados.length,
      temAnterior: pagina > 1
    }
  };
};

/**
 * Cria uma resposta de erro padronizada com descrição clara
 * @param {number} statusCode - Código do status HTTP
 * @param {string} context - Contexto da operação
 * @param {string} customMessage - Mensagem personalizada
 * @param {Object} detalhes - Detalhes adicionais
 * @returns {Object} Resposta de erro padronizada
 */
export const criarRespostaErro = (statusCode, context = '', customMessage = '', detalhes = {}) => {
  const errorResponse = generateErrorResponse(statusCode, context, customMessage);
  
  return {
    ...errorResponse,
    detalhes: {
      ...errorResponse.detalhes,
      ...detalhes
    },
    sucesso: false,
    timestamp: new Date().toISOString()
  };
};

/**
 * Cria uma resposta de validação com descrição clara
 * @param {Array} erros - Lista de erros de validação
 * @param {string} context - Contexto da operação
 * @returns {Object} Resposta de validação
 */
export const criarRespostaValidacao = (erros, context = '') => {
  return criarRespostaErro(400, context, 'Dados de entrada inválidos', {
    erros: erros.map(erro => ({
      campo: erro.campo || 'geral',
      mensagem: erro.mensagem,
      valor: erro.valor
    }))
  });
};

/**
 * Cria uma resposta de recurso não encontrado com descrição clara
 * @param {string} tipo - Tipo do recurso
 * @param {string} id - ID do recurso
 * @param {string} context - Contexto da operação
 * @returns {Object} Resposta de não encontrado
 */
export const criarRespostaNaoEncontrado = (tipo, id, context = '') => {
  return criarRespostaErro(404, context, `${tipo} não encontrado`, {
    tipo,
    id,
    sugestao: 'Verifique se o ID está correto e se o recurso ainda existe'
  });
};

/**
 * Cria uma resposta de regra de negócio violada com descrição clara
 * @param {string} mensagem - Mensagem da regra de negócio
 * @param {Object} detalhes - Detalhes da violação
 * @param {string} context - Contexto da operação
 * @returns {Object} Resposta de regra de negócio
 */
export const criarRespostaRegraNegocio = (mensagem, detalhes = {}, context = '') => {
  return criarRespostaErro(409, context, mensagem, {
    ...detalhes,
    tipo: 'REGRA_NEGOCIO',
    sugestao: 'Verifique as regras de negócio antes de executar a operação'
  });
};

/**
 * Cria uma resposta de estado inválido com descrição clara
 * @param {string} mensagem - Mensagem do estado inválido
 * @param {Object} detalhes - Detalhes do estado
 * @param {string} context - Contexto da operação
 * @returns {Object} Resposta de estado inválido
 */
export const criarRespostaEstadoInvalido = (mensagem, detalhes = {}, context = '') => {
  return criarRespostaErro(422, context, mensagem, {
    ...detalhes,
    tipo: 'ESTADO_INVALIDO',
    sugestao: 'Verifique se o recurso está no estado correto para esta operação'
  });
};

/**
 * Cria uma resposta de limite de requisições excedido com descrição clara
 * @param {Object} detalhes - Detalhes do rate limiting
 * @returns {Object} Resposta de limite excedido
 */
export const criarRespostaLimiteRequisicoes = (detalhes = {}) => {
  return criarRespostaErro(429, 'rate-limit', 'Muitas requisições. Tente novamente em 1 minuto.', {
    ...detalhes,
    tipo: 'LIMITE_REQUISICOES',
    sugestao: 'Aguarde 1 minuto antes de fazer novas requisições',
    limite: detalhes.limite || 100,
    janela: detalhes.janela || '1 minuto'
  });
};

/**
 * Cria uma resposta de erro interno com descrição clara
 * @param {string} mensagem - Mensagem do erro interno
 * @param {Object} detalhes - Detalhes do erro
 * @returns {Object} Resposta de erro interno
 */
export const criarRespostaErroInterno = (mensagem = 'Erro interno do servidor', detalhes = {}) => {
  return criarRespostaErro(500, 'sistema', mensagem, {
    ...detalhes,
    tipo: 'ERRO_INTERNO',
    sugestao: 'Tente novamente mais tarde ou entre em contato com o suporte',
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(36).substr(2, 9)
  });
}; 