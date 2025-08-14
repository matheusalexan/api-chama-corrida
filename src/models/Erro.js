/**
 * @swagger
 * components:
 *   schemas:
 *     Erro:
 *       type: object
 *       required:
 *         - codigo
 *         - mensagem
 *       properties:
 *         codigo:
 *           type: string
 *           description: Código único do erro
 *           example: "ERRO_VALIDACAO"
 *         mensagem:
 *           type: string
 *           description: Mensagem descritiva do erro em português
 *           example: "Dados de entrada inválidos"
 *         detalhes:
 *           type: object
 *           description: Detalhes adicionais do erro (opcional)
 *           example: { "campo": "telefone", "valor": "123" }
 *       example:
 *         codigo: "ERRO_VALIDACAO"
 *         mensagem: "Dados de entrada inválidos"
 *         detalhes: { "campo": "telefone", "valor": "123" }
 *   
 *   responses:
 *     ErroPadrao:
 *       description: Resposta de erro padrão da API
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Erro'
 *           examples:
 *             erroValidacao:
 *               summary: Erro de validação
 *               value:
 *                 codigo: "ERRO_VALIDACAO"
 *                 mensagem: "Dados de entrada inválidos"
 *                 detalhes: { "campo": "telefone", "valor": "123" }
 *             naoEncontrado:
 *               summary: Recurso não encontrado
 *               value:
 *                 codigo: "NAO_ENCONTRADO"
 *                 mensagem: "Recurso solicitado não foi encontrado"
 *                 detalhes: { "recurso": "passageiro", "id": "123" }
 *             regraNegocio:
 *               summary: Violação de regra de negócio
 *               value:
 *                 codigo: "REGRA_NEGOCIO"
 *                 mensagem: "Telefone já está em uso por outro usuário"
 *                 detalhes: { "telefone": "+5511999999999" }
 *             estadoInvalido:
 *               summary: Estado inválido para a operação
 *               value:
 *                 codigo: "ESTADO_INVALIDO"
 *                 mensagem: "Pedido não pode ser cancelado neste estado"
 *                 detalhes: { "estadoAtual": "MOTORISTA_ATRIBUIDO" }
 *             limiteRequisicoes:
 *               summary: Limite de requisições excedido
 *               value:
 *                 codigo: "LIMITE_REQUISICOES"
 *                 mensagem: "Limite de requisições excedido. Tente novamente em 1 minuto."
 *                 detalhes: {}
 *             erroInterno:
 *               summary: Erro interno do servidor
 *               value:
 *                 codigo: "ERRO_INTERNO"
 *                 mensagem: "Erro interno do servidor"
 *                 detalhes: {}
 */

export class Erro {
  constructor(codigo, mensagem, detalhes = {}) {
    this.codigo = codigo;
    this.mensagem = mensagem;
    this.detalhes = detalhes;
  }

  static criarErroValidacao(mensagem, detalhes = {}) {
    return new Erro('ERRO_VALIDACAO', mensagem, detalhes);
  }

  static criarErroNaoEncontrado(mensagem, detalhes = {}) {
    return new Erro('NAO_ENCONTRADO', mensagem, detalhes);
  }

  static criarErroRegraNegocio(mensagem, detalhes = {}) {
    return new Erro('REGRA_NEGOCIO', mensagem, detalhes);
  }

  static criarErroEstadoInvalido(mensagem, detalhes = {}) {
    return new Erro('ESTADO_INVALIDO', mensagem, detalhes);
  }

  static criarErroLimiteRequisicoes(mensagem, detalhes = {}) {
    return new Erro('LIMITE_REQUISICOES', mensagem, detalhes);
  }

  static criarErroInterno(mensagem, detalhes = {}) {
    return new Erro('ERRO_INTERNO', mensagem, detalhes);
  }

  toJSON() {
    return {
      codigo: this.codigo,
      mensagem: this.mensagem,
      detalhes: this.detalhes
    };
  }
}

// Códigos de erro padrão conforme especificação
export const CodigosErro = {
  ERRO_VALIDACAO: 'ERRO_VALIDACAO',
  NAO_ENCONTRADO: 'NAO_ENCONTRADO',
  REGRA_NEGOCIO: 'REGRA_NEGOCIO',
  ESTADO_INVALIDO: 'ESTADO_INVALIDO',
  LIMITE_REQUISICOES: 'LIMITE_REQUISICOES',
  ERRO_INTERNO: 'ERRO_INTERNO'
};

// Mapeamento de códigos para códigos HTTP
export const CodigosHTTP = {
  [CodigosErro.ERRO_VALIDACAO]: 400,
  [CodigosErro.NAO_ENCONTRADO]: 404,
  [CodigosErro.REGRA_NEGOCIO]: 409,
  [CodigosErro.ESTADO_INVALIDO]: 422,
  [CodigosErro.LIMITE_REQUISICOES]: 429,
  [CodigosErro.ERRO_INTERNO]: 500
}; 