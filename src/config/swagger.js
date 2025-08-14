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
  // Respostas de Sucesso
  RespostaSucesso: {
    description: '✅ Requisição processada com sucesso',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/RespostaSucesso'
        }
      }
    }
  },
  RespostaCriacao: {
    description: '✅ Recurso criado com sucesso',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/RespostaSucesso'
        }
      }
    }
  },
  RespostaLista: {
    description: '✅ Lista de recursos retornada com sucesso',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/RespostaLista'
        }
      }
    }
  },
  RespostaExclusao: {
    description: '✅ Recurso removido com sucesso',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Recurso removido com sucesso' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },

  // Respostas de Erro - 4xx
  ErroValidacao: {
    description: '❌ Dados de entrada inválidos ou malformados',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Erro'
        },
        examples: {
          dadosInvalidos: {
            summary: 'Dados de validação inválidos',
            value: {
              codigo: 'ERRO_VALIDACAO',
              mensagem: 'Dados de entrada inválidos',
              detalhes: {
                statusCode: 400,
                statusName: 'Bad Request',
                contexto: 'validacao',
                descricao: 'Requisição inválida ou malformada',
                uso: 'Dados de entrada inválidos, validações falharam, parâmetros incorretos',
                erros: [
                  { campo: 'nome', mensagem: 'Nome deve ter entre 3 e 80 caracteres', valor: 'Jo' },
                  { campo: 'telefoneE164', mensagem: 'Telefone deve estar no formato E.164', valor: '11999999999' }
                ]
              }
            }
          }
        }
      }
    }
  },
  ErroNaoAutorizado: {
    description: '❌ Não autorizado - autenticação necessária',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Erro'
        },
        examples: {
          tokenInvalido: {
            summary: 'Token de acesso inválido',
            value: {
              codigo: 'NAO_AUTORIZADO',
              mensagem: 'Token de acesso inválido ou ausente',
              detalhes: {
                statusCode: 401,
                statusName: 'Unauthorized',
                contexto: 'autenticacao',
                descricao: 'Não autorizado - autenticação necessária',
                uso: 'Token de acesso inválido ou ausente',
                sugestao: 'Verifique se o token está correto e não expirou'
              }
            }
          }
        }
      }
    }
  },
  ErroAcessoNegado: {
    description: '❌ Acesso negado - sem permissão para o recurso',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Erro'
        },
        examples: {
          semPermissao: {
            summary: 'Usuário sem permissão',
            value: {
              codigo: 'ACESSO_NEGADO',
              mensagem: 'Sem permissão para acessar este recurso',
              detalhes: {
                statusCode: 403,
                statusName: 'Forbidden',
                contexto: 'autorizacao',
                descricao: 'Acesso negado - sem permissão para o recurso',
                uso: 'Usuário autenticado mas sem permissão para a operação',
                sugestao: 'Entre em contato com o administrador para solicitar permissões'
              }
            }
          }
        }
      }
    }
  },
  ErroNaoEncontrado: {
    description: '❌ Recurso não encontrado',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Erro'
        },
        examples: {
          recursoInexistente: {
            summary: 'Recurso não encontrado',
            value: {
              codigo: 'NAO_ENCONTRADO',
              mensagem: 'Passageiro não encontrado',
              detalhes: {
                statusCode: 404,
                statusName: 'Not Found',
                contexto: 'passageiro',
                descricao: 'Recurso não encontrado',
                uso: 'ID inválido, endpoint inexistente, recurso removido',
                tipo: 'passageiro',
                id: '123e4567-e89b-12d3-a456-426614174000',
                sugestao: 'Verifique se o ID está correto e se o recurso ainda existe'
              }
            }
          }
        }
      }
    }
  },
  ErroMetodoNaoPermitido: {
    description: '❌ Método HTTP não permitido para este endpoint',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Erro'
        },
        examples: {
          metodoInvalido: {
            summary: 'Método HTTP incorreto',
            value: {
              codigo: 'METODO_NAO_PERMITIDO',
              mensagem: 'Método POST não é permitido para este endpoint',
              detalhes: {
                statusCode: 405,
                statusName: 'Method Not Allowed',
                contexto: 'http',
                descricao: 'Método HTTP não permitido para este endpoint',
                uso: 'Tentativa de usar POST em endpoint que só aceita GET',
                sugestao: 'Verifique a documentação para ver os métodos permitidos'
              }
            }
          }
        }
      }
    }
  },
  ErroConflito: {
    description: '❌ Conflito com o estado atual do recurso',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Erro'
        },
        examples: {
          telefoneDuplicado: {
            summary: 'Telefone já em uso',
            value: {
              codigo: 'REGRA_NEGOCIO',
              mensagem: 'Telefone já está em uso por outro passageiro',
              detalhes: {
                statusCode: 409,
                statusName: 'Conflict',
                contexto: 'passageiro',
                descricao: 'Conflito com o estado atual do recurso',
                uso: 'Telefone duplicado, regras de negócio violadas, estado inválido',
                tipo: 'REGRA_NEGOCIO',
                telefone: '+5511999999999',
                sugestao: 'Verifique as regras de negócio antes de executar a operação'
              }
            }
          }
        }
      }
    }
  },
  ErroEstadoInvalido: {
    description: '❌ Entidade não processável - validação semântica falhou',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Erro'
        },
        examples: {
          estadoIncorreto: {
            summary: 'Estado inválido para operação',
            value: {
              codigo: 'ESTADO_INVALIDO',
              mensagem: 'Corrida não pode ser cancelada no estado atual',
              detalhes: {
                statusCode: 422,
                statusName: 'Unprocessable Entity',
                contexto: 'corrida',
                descricao: 'Entidade não processável - validação semântica falhou',
                uso: 'Dados válidos sintaticamente mas inválidos semanticamente',
                tipo: 'ESTADO_INVALIDO',
                statusAtual: 'CONCLUIDA',
                sugestao: 'Verifique se o recurso está no estado correto para esta operação'
              }
            }
          }
        }
      }
    }
  },
  ErroLimiteRequisicoes: {
    description: '❌ Muitas requisições - limite de taxa excedido',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Erro'
        },
        examples: {
          rateLimitExcedido: {
            summary: 'Rate limit excedido',
            value: {
              codigo: 'LIMITE_REQUISICOES',
              mensagem: 'Muitas requisições. Tente novamente em 1 minuto.',
              detalhes: {
                statusCode: 429,
                statusName: 'Too Many Requests',
                contexto: 'rate-limit',
                descricao: 'Muitas requisições - limite de taxa excedido',
                uso: 'Rate limiting ativo, muitas requisições em pouco tempo',
                tipo: 'LIMITE_REQUISICOES',
                sugestao: 'Aguarde 1 minuto antes de fazer novas requisições',
                limite: 100,
                janela: '1 minuto'
              }
            }
          }
        }
      }
    }
  },

  // Respostas de Erro - 5xx
  ErroInterno: {
    description: '❌ Erro interno do servidor',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Erro'
        },
        examples: {
          erroSistema: {
            summary: 'Erro interno do sistema',
            value: {
              codigo: 'ERRO_INTERNO',
              mensagem: 'Erro interno do servidor',
              detalhes: {
                statusCode: 500,
                statusName: 'Internal Server Error',
                contexto: 'sistema',
                descricao: 'Erro interno do servidor',
                uso: 'Erro não esperado, exceção não tratada, problema de sistema',
                tipo: 'ERRO_INTERNO',
                sugestao: 'Tente novamente mais tarde ou entre em contato com o suporte',
                timestamp: '2024-01-15T10:30:00.000Z',
                requestId: 'abc123def'
              }
            }
          }
        }
      }
    }
  },

  // Resposta de erro padrão (para compatibilidade)
  ErroPadrao: {
    description: '❌ Resposta de erro padrão',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Erro'
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
  { name: 'Utilitários', description: 'Endpoints utilitários da API' }
]; 