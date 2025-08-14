/**
 * Configuração centralizada do Swagger/OpenAPI
 */

export const swaggerSchemas = {
  Passageiro: {
    type: 'object',
    required: ['nome', 'telefoneE164'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'ID único do passageiro',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      nome: {
        type: 'string',
        minLength: 3,
        maxLength: 80,
        description: 'Nome completo do passageiro',
        example: 'João Silva Santos'
      },
      telefoneE164: {
        type: 'string',
        pattern: '^\\+\\d{10,15}$',
        description: 'Telefone no formato E.164 (+5511999999999)',
        example: '+5511999999999'
      },
      criadoEm: {
        type: 'string',
        format: 'date-time',
        description: 'Data e hora de criação',
        example: '2024-01-15T10:30:00.000Z'
      }
    }
  },
  Motorista: {
    type: 'object',
    required: ['nome', 'telefoneE164', 'categoria'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'ID único do motorista',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      nome: {
        type: 'string',
        minLength: 3,
        maxLength: 80,
        description: 'Nome completo do motorista',
        example: 'Carlos Oliveira'
      },
      telefoneE164: {
        type: 'string',
        pattern: '^\\+\\d{10,15}$',
        description: 'Telefone no formato E.164 (+5511999999999)',
        example: '+5511999999999'
      },
      categoria: {
        type: 'string',
        enum: ['ECONOMY', 'COMFORT'],
        description: 'Categoria do veículo',
        example: 'ECONOMY'
      },
      disponivel: {
        type: 'boolean',
        description: 'Se o motorista está disponível para corridas',
        example: true
      },
      criadoEm: {
        type: 'string',
        format: 'date-time',
        description: 'Data e hora de criação',
        example: '2024-01-15T10:30:00.000Z'
      }
    }
  },
  PedidoCorrida: {
    type: 'object',
    required: ['passageiroId', 'origemLat', 'origemLng', 'destinoLat', 'destinoLng', 'categoria'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'ID único do pedido',
        example: '123e4567-e89b-12d3-a456-426614174002'
      },
      passageiroId: {
        type: 'string',
        format: 'uuid',
        description: 'ID do passageiro que solicitou a corrida',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      origemLat: {
        type: 'number',
        minimum: -90,
        maximum: 90,
        description: 'Latitude do ponto de origem',
        example: -23.5505
      },
      origemLng: {
        type: 'number',
        minimum: -180,
        maximum: 180,
        description: 'Longitude do ponto de origem',
        example: -46.6333
      },
      destinoLat: {
        type: 'number',
        minimum: -90,
        maximum: 90,
        description: 'Latitude do ponto de destino',
        example: -23.5629
      },
      destinoLng: {
        type: 'number',
        minimum: -180,
        maximum: 180,
        description: 'Longitude do ponto de destino',
        example: -46.6544
      },
      categoria: {
        type: 'string',
        enum: ['ECONOMY', 'COMFORT'],
        description: 'Categoria de veículo solicitada',
        example: 'ECONOMY'
      },
      status: {
        type: 'string',
        enum: ['PROCURANDO', 'MOTORISTA_ATRIBUIDO', 'CANCELADO', 'EXPIRADO'],
        description: 'Status atual do pedido',
        example: 'PROCURANDO'
      },
      precoEstimado: {
        type: 'number',
        minimum: 0,
        description: 'Preço estimado da corrida em reais',
        example: 25.50
      },
      criadoEm: {
        type: 'string',
        format: 'date-time',
        description: 'Data e hora de criação',
        example: '2024-01-15T10:30:00.000Z'
      },
      expiraEm: {
        type: 'string',
        format: 'date-time',
        description: 'Data e hora de expiração',
        example: '2024-01-15T10:45:00.000Z'
      }
    }
  },
  Corrida: {
    type: 'object',
    required: ['pedidoId', 'motoristaId', 'passageiroId'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'ID único da corrida',
        example: '123e4567-e89b-12d3-a456-426614174003'
      },
      pedidoId: {
        type: 'string',
        format: 'uuid',
        description: 'ID do pedido de corrida',
        example: '123e4567-e89b-12d3-a456-426614174002'
      },
      motoristaId: {
        type: 'string',
        format: 'uuid',
        description: 'ID do motorista',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      passageiroId: {
        type: 'string',
        format: 'uuid',
        description: 'ID do passageiro',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      status: {
        type: 'string',
        enum: ['MOTORISTA_A_CAMINHO', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA_PELO_PASSAGEIRO', 'CANCELADA_PELO_MOTORISTA'],
        description: 'Status atual da corrida',
        example: 'MOTORISTA_A_CAMINHO'
      },
      precoEstimado: {
        type: 'number',
        minimum: 0,
        description: 'Preço estimado da corrida em reais',
        example: 25.50
      },
      precoFinal: {
        type: 'number',
        minimum: 0,
        nullable: true,
        description: 'Preço final da corrida em reais (null até ser finalizada)',
        example: 28.00
      },
      criadoEm: {
        type: 'string',
        format: 'date-time',
        description: 'Data e hora de criação',
        example: '2024-01-15T10:30:00.000Z'
      },
      atualizadoEm: {
        type: 'string',
        format: 'date-time',
        description: 'Data e hora da última atualização',
        example: '2024-01-15T11:00:00.000Z'
      }
    }
  },
  Avaliacao: {
    type: 'object',
    required: ['corridaId', 'autor', 'nota'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'ID único da avaliação',
        example: '123e4567-e89b-12d3-a456-426614174004'
      },
      corridaId: {
        type: 'string',
        format: 'uuid',
        description: 'ID da corrida avaliada',
        example: '123e4567-e89b-12d3-a456-426614174003'
      },
      autor: {
        type: 'string',
        enum: ['PASSAGEIRO', 'MOTORISTA'],
        description: 'Quem fez a avaliação',
        example: 'PASSAGEIRO'
      },
      nota: {
        type: 'integer',
        minimum: 1,
        maximum: 5,
        description: 'Nota de 1 a 5 estrelas',
        example: 5
      },
      comentario: {
        type: 'string',
        maxLength: 280,
        description: 'Comentário opcional sobre a corrida',
        example: 'Excelente serviço, motorista muito atencioso!'
      },
      criadoEm: {
        type: 'string',
        format: 'date-time',
        description: 'Data e hora de criação',
        example: '2024-01-15T11:30:00.000Z'
      }
    }
  },
  Erro: {
    type: 'object',
    required: ['codigo', 'mensagem'],
    properties: {
      codigo: {
        type: 'string',
        description: 'Código do erro',
        example: 'ERRO_VALIDACAO'
      },
      mensagem: {
        type: 'string',
        description: 'Mensagem descritiva do erro',
        example: 'Dados inválidos fornecidos'
      },
      detalhes: {
        type: 'object',
        description: 'Detalhes adicionais do erro',
        example: { campo: 'telefoneE164', valor: '123' }
      }
    }
  },
  RespostaSucesso: {
    type: 'object',
    properties: {
      dados: {
        description: 'Dados da resposta',
        oneOf: [
          { $ref: '#/components/schemas/Passageiro' },
          { $ref: '#/components/schemas/Motorista' },
          { $ref: '#/components/schemas/PedidoCorrida' },
          { $ref: '#/components/schemas/Corrida' },
          { $ref: '#/components/schemas/Avaliacao' }
        ]
      },
      sucesso: {
        type: 'boolean',
        example: true
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00.000Z'
      }
    }
  },
  RespostaLista: {
    type: 'object',
    properties: {
      dados: {
        type: 'array',
        items: {
          oneOf: [
            { $ref: '#/components/schemas/Passageiro' },
            { $ref: '#/components/schemas/Motorista' },
            { $ref: '#/components/schemas/PedidoCorrida' },
            { $ref: '#/components/schemas/Corrida' },
            { $ref: '#/components/schemas/Avaliacao' }
          ]
        }
      },
      meta: {
        type: 'object',
        properties: {
          pagina: {
            type: 'integer',
            minimum: 1,
            example: 1
          },
          limite: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            example: 20
          },
          total: {
            type: 'integer',
            minimum: 0,
            example: 150
          }
        }
      },
      sucesso: {
        type: 'boolean',
        example: true
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00.000Z'
      }
    }
  }
};

export const swaggerResponses = {
  ErroPadrao: {
    description: 'Resposta de erro padrão',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Erro'
        }
      }
    }
  },
  RespostaSucesso: {
    description: 'Resposta de sucesso',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/RespostaSucesso'
        }
      }
    }
  },
  RespostaLista: {
    description: 'Resposta com lista paginada',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/RespostaLista'
        }
      }
    }
  }
};

export const swaggerTags = [
  { name: 'Passageiros', description: 'Operações relacionadas aos passageiros' },
  { name: 'Motoristas', description: 'Operações relacionadas aos motoristas' },
  { name: 'Pedidos de Corrida', description: 'Gerenciamento de pedidos de corrida' },
  { name: 'Corridas', description: 'Gerenciamento de corridas em andamento' },
  { name: 'Avaliações', description: 'Sistema de avaliações de corridas' },
  { name: 'Utilitários', description: 'Endpoints utilitários da API' }
]; 