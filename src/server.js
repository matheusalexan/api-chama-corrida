import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Importar rotas
import passageirosRoutes from './routes/passageiros.js';
import motoristasRoutes from './routes/motoristas.js';
import pedidosCorridaRoutes from './routes/pedidos-corrida.js';
import corridasRoutes from './routes/corridas.js';
import utilitariosRoutes from './routes/utilitarios.js';

// Importar middleware de tratamento de erros
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting: 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    codigo: 'LIMITE_REQUISICOES',
    mensagem: 'Muitas requisições. Tente novamente em 1 minuto.',
    detalhes: { limite: 100, janela: '1 minuto' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Transporte Sob Demanda – v1',
      version: '1.0.0',
      description: 'API para sistema de chamada de corridas com armazenamento em memória. ⚠️ ATENÇÃO: Todos os dados são armazenados em memória e são perdidos ao reiniciar a aplicação.',
      contact: {
        name: 'Suporte',
        email: 'suporte@transporte.com'
      }
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Servidor de Produção'
      }
    ],
              tags: [
            { name: 'Passageiros', description: 'Operações relacionadas aos passageiros' },
            { name: 'Motoristas', description: 'Operações relacionadas aos motoristas' },
            { name: 'Pedidos de Corrida', description: 'Gerenciamento de pedidos de corrida' },
            { name: 'Corridas', description: 'Gerenciamento de corridas em andamento' },
            { name: 'Utilitários', description: 'Endpoints utilitários da API' }
          ],
    components: {
      schemas: {
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
        }
      },
      responses: {
        ErroPadrao: {
          description: 'Resposta de erro padrão',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Erro'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API de Transporte - Documentação'
}));

// Swagger JSON
app.get('/docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Health check
app.get('/saude', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    versao: '1.0.0',
    ambiente: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/v1/passageiros', passageirosRoutes);
app.use('/api/v1/motoristas', motoristasRoutes);
app.use('/api/v1/pedidos-corrida', pedidosCorridaRoutes);
app.use('/api/v1/corridas', corridasRoutes);
app.use('/api/v1/utilitarios', utilitariosRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    codigo: 'NAO_ENCONTRADO',
    mensagem: 'Endpoint não encontrado',
    detalhes: {
      metodo: req.method,
      url: req.originalUrl,
      baseUrl: req.baseUrl
    }
  });
});

// Error handling middleware (deve ser o último)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚗 API de Transporte rodando na porta ${PORT}`);
  console.log(`📚 Documentação disponível em: http://localhost:${PORT}/docs`);
  console.log(`🔧 JSON do Swagger em: http://localhost:${PORT}/docs-json`);
  console.log(`💚 Health check em: http://localhost:${PORT}/saude`);
  console.log(`⚠️  ATENÇÃO: Dados armazenados em memória - serão perdidos ao reiniciar!`);
});

export default app; 