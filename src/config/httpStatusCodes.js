/**
 * Configuração dos Status Codes HTTP com descrições claras e específicas
 */

export const httpStatusCodes = {
  // 2xx - Sucesso
  200: {
    code: 200,
    name: 'OK',
    description: 'Requisição processada com sucesso',
    usage: 'Resposta padrão para operações de leitura bem-sucedidas'
  },
  201: {
    code: 201,
    name: 'Created',
    description: 'Recurso criado com sucesso',
    usage: 'Resposta para operações de criação bem-sucedidas (POST)'
  },
  204: {
    code: 204,
    name: 'No Content',
    description: 'Operação realizada com sucesso, mas sem conteúdo para retornar',
    usage: 'Resposta para operações de exclusão bem-sucedidas (DELETE)'
  },

  // 4xx - Erro do Cliente
  400: {
    code: 400,
    name: 'Bad Request',
    description: 'Requisição inválida ou malformada',
    usage: 'Dados de entrada inválidos, validações falharam, parâmetros incorretos'
  },
  401: {
    code: 401,
    name: 'Unauthorized',
    description: 'Não autorizado - autenticação necessária',
    usage: 'Token de acesso inválido ou ausente'
  },
  403: {
    code: 403,
    name: 'Forbidden',
    description: 'Acesso negado - sem permissão para o recurso',
    usage: 'Usuário autenticado mas sem permissão para a operação'
  },
  404: {
    code: 404,
    name: 'Not Found',
    description: 'Recurso não encontrado',
    usage: 'ID inválido, endpoint inexistente, recurso removido'
  },
  405: {
    code: 405,
    name: 'Method Not Allowed',
    description: 'Método HTTP não permitido para este endpoint',
    usage: 'Tentativa de usar POST em endpoint que só aceita GET'
  },
  409: {
    code: 409,
    name: 'Conflict',
    description: 'Conflito com o estado atual do recurso',
    usage: 'Telefone duplicado, regras de negócio violadas, estado inválido'
  },
  422: {
    code: 422,
    name: 'Unprocessable Entity',
    description: 'Entidade não processável - validação semântica falhou',
    usage: 'Dados válidos sintaticamente mas inválidos semanticamente'
  },
  429: {
    code: 429,
    name: 'Too Many Requests',
    description: 'Muitas requisições - limite de taxa excedido',
    usage: 'Rate limiting ativo, muitas requisições em pouco tempo'
  },

  // 5xx - Erro do Servidor
  500: {
    code: 500,
    name: 'Internal Server Error',
    description: 'Erro interno do servidor',
    usage: 'Erro não esperado, exceção não tratada, problema de sistema'
  },
  501: {
    code: 501,
    name: 'Not Implemented',
    description: 'Funcionalidade não implementada',
    usage: 'Endpoint em desenvolvimento, funcionalidade futura'
  },
  502: {
    code: 502,
    name: 'Bad Gateway',
    description: 'Gateway inválido - erro de comunicação',
    usage: 'Problema de comunicação com serviço externo'
  },
  503: {
    code: 503,
    name: 'Service Unavailable',
    description: 'Serviço indisponível temporariamente',
    usage: 'Manutenção programada, sobrecarga do sistema'
  }
};

/**
 * Gera descrição detalhada para um status code específico
 * @param {number} statusCode - Código do status HTTP
 * @param {string} context - Contexto específico da operação
 * @returns {object} Descrição detalhada do status
 */
export function getStatusDescription(statusCode, context = '') {
  const status = httpStatusCodes[statusCode];
  if (!status) {
    return {
      code: statusCode,
      name: 'Unknown Status',
      description: 'Status code não reconhecido',
      usage: 'Status code não mapeado na API'
    };
  }

  // Contextos específicos para melhorar as descrições
  const contextDescriptions = {
    'passageiro': {
      201: 'Passageiro criado e registrado no sistema com sucesso',
      200: 'Dados do passageiro retornados com sucesso',
      404: 'Passageiro não encontrado com o ID fornecido',
      409: 'Telefone já está em uso por outro passageiro',
      400: 'Dados do passageiro inválidos ou incompletos'
    },
    'motorista': {
      201: 'Motorista criado e registrado no sistema com sucesso',
      200: 'Dados do motorista retornados com sucesso',
      404: 'Motorista não encontrado com o ID fornecido',
      409: 'Telefone já está em uso por outro motorista',
      400: 'Dados do motorista inválidos ou incompletos'
    },
    'pedido-corrida': {
      201: 'Pedido de corrida criado e está sendo processado',
      200: 'Dados do pedido retornados com sucesso',
      404: 'Pedido de corrida não encontrado',
      409: 'Pedido não pode ser processado (motorista indisponível, etc.)',
      422: 'Pedido não pode ser processado no estado atual'
    },
    'corrida': {
      201: 'Corrida iniciada com sucesso',
      200: 'Dados da corrida retornados com sucesso',
      404: 'Corrida não encontrada',
      409: 'Operação não permitida no estado atual da corrida',
      422: 'Corrida não pode ser modificada no estado atual'
    },
    'avaliacao': {
      201: 'Avaliação registrada com sucesso',
      200: 'Dados da avaliação retornados com sucesso',
      404: 'Avaliação não encontrada',
      409: 'Avaliação já existe para esta corrida/autor',
      422: 'Avaliação não pode ser feita (corrida não finalizada)'
    }
  };

  const contextDesc = contextDescriptions[context];
  if (contextDesc && contextDesc[statusCode]) {
    return {
      ...status,
      description: contextDesc[statusCode],
      context: context
    };
  }

  return status;
}

/**
 * Gera resposta de erro padronizada com descrição clara
 * @param {number} statusCode - Código do status HTTP
 * @param {string} context - Contexto da operação
 * @param {string} customMessage - Mensagem personalizada
 * @returns {object} Resposta de erro padronizada
 */
export function generateErrorResponse(statusCode, context = '', customMessage = '') {
  const status = getStatusDescription(statusCode, context);
  
  return {
    codigo: getErrorCode(statusCode),
    mensagem: customMessage || status.description,
    detalhes: {
      statusCode: status.code,
      statusName: status.name,
      contexto: context || 'geral',
      descricao: status.description,
      uso: status.usage
    }
  };
}

/**
 * Mapeia status codes para códigos de erro da API
 * @param {number} statusCode - Código do status HTTP
 * @returns {string} Código de erro da API
 */
function getErrorCode(statusCode) {
  const errorCodeMap = {
    400: 'ERRO_VALIDACAO',
    401: 'NAO_AUTORIZADO',
    403: 'ACESSO_NEGADO',
    404: 'NAO_ENCONTRADO',
    405: 'METODO_NAO_PERMITIDO',
    409: 'REGRA_NEGOCIO',
    422: 'ESTADO_INVALIDO',
    429: 'LIMITE_REQUISICOES',
    500: 'ERRO_INTERNO',
    501: 'NAO_IMPLEMENTADO',
    502: 'GATEWAY_INVALIDO',
    503: 'SERVICO_INDISPONIVEL'
  };

  return errorCodeMap[statusCode] || 'ERRO_DESCONHECIDO';
}

export default httpStatusCodes; 