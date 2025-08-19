import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import passageirosRoutes from './routes/passageiros.js';
import motoristasRoutes from './routes/motoristas.js';
import corridasRoutes from './routes/corridas.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Transporte Sob Demanda',
      version: '1.0.0',
      description: 'API simples para sistema de corridas com armazenamento em memória. Dados são perdidos ao reiniciar o servidor.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
    ],
    tags: [
      {
        name: 'Passageiros',
        description: 'Operações relacionadas aos passageiros',
      },
      {
        name: 'Motoristas',
        description: 'Operações relacionadas aos motoristas',
      },
      {
        name: 'Corridas',
        description: 'Operações relacionadas às corridas',
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de erro',
            },
            code: {
              type: 'string',
              description: 'Código do erro',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Dados inválidos',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Conflict: {
          description: 'Conflito de dados',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        UnprocessableEntity: {
          description: 'Estado inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Rotas - usando os endpoints corretos conforme solicitado
app.use('/usuarios/passageiros', passageirosRoutes);
app.use('/usuarios/motoristas', motoristasRoutes);
app.use('/corridas', corridasRoutes);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Transporte Sob Demanda',
    version: '1.0.0',
    endpoints: {
      docs: '/docs',
      health: '/health',
      passageiros: '/usuarios/passageiros',
      motoristas: '/usuarios/motoristas',
      corridas: '/corridas',
    },
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    message: 'Erro interno do servidor',
    code: 'ERRO_INTERNO',
  });
});

// 404 para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada',
    code: 'ROTA_NAO_ENCONTRADA',
  });
});

export default app;
