import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting: 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    codigo: 'LIMITE_REQUISICOES',
    mensagem: 'Limite de requisições excedido. Tente novamente em 1 minuto.',
    detalhes: {}
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1', limiter);

// Swagger configuration
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
      { name: 'Avaliações', description: 'Sistema de avaliações de corridas' },
      { name: 'Utilitários', description: 'Endpoints utilitários da API' }
    ]
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// Routes
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API de Transporte - Documentação'
}));

app.get('/docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Health check
app.get('/saude', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API routes (will be added in next features)
app.use('/api/v1', (req, res) => {
  res.status(404).json({
    codigo: 'NAO_ENCONTRADO',
    mensagem: 'Endpoint não encontrado',
    detalhes: { path: req.path }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    codigo: 'ERRO_INTERNO',
    mensagem: 'Erro interno do servidor',
    detalhes: {}
  });
});

app.listen(PORT, () => {
  console.log(`🚗 API de Transporte rodando na porta ${PORT}`);
  console.log(`📚 Documentação disponível em: http://localhost:${PORT}/docs`);
  console.log(`🏥 Saúde da API: http://localhost:${PORT}/saude`);
});

export default app; 