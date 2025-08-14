import express from 'express';
import { validarPaginacao } from '../middleware/validacao.js';
import { PassageiroService } from '../models/Passageiro.js';
import { MotoristaService } from '../models/Motorista.js';
import { PedidoCorridaService } from '../models/PedidoCorrida.js';
import { CorridaService } from '../models/Corrida.js';

import { criarRespostaSucesso, criarRespostaLista, aplicarPaginacao } from '../utils/respostas.js';

const router = express.Router();

/**
 * @swagger
 * /estatisticas:
 *   get:
 *     summary: Estatísticas gerais do sistema
 *     description: Retorna estatísticas consolidadas de todos os módulos
 *     tags: [Utilitários]
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: object
 *                   properties:
 *                     passageiros:
 *                       type: object
 *                       properties:
 *                         total: { type: 'integer', example: 150 }
 *                         ativos: { type: 'integer', example: 142 }
 *                     motoristas:
 *                       type: object
 *                       properties:
 *                         total: { type: 'integer', example: 85 }
 *                         disponiveis: { type: 'integer', example: 23 }
 *                         porCategoria:
 *                           type: 'object'
 *                           properties:
 *                             ECONOMY: { type: 'integer', example: 45 }
 *                             COMFORT: { type: 'integer', example: 40 }
 *                     pedidos:
 *                       type: object
 *                       properties:
 *                         total: { type: 'integer', example: 1250 }
 *                         porStatus:
 *                           type: 'object'
 *                           properties:
 *                             PROCURANDO: { type: 'integer', example: 15 }
 *                             MOTORISTA_ATRIBUIDO: { type: 'integer', example: 8 }
 *                             CANCELADO: { type: 'integer', example: 45 }
 *                             EXPIRADO: { type: 'integer', example: 12 }
 *                     corridas:
 *                       type: 'object'
 *                       properties:
 *                         total: { type: 'integer', example: 1170 }
 *                         porStatus:
 *                           type: 'object'
 *                           properties:
 *                             MOTORISTA_A_CAMINHO: { type: 'integer', example: 5 }
 *                             EM_ANDAMENTO: { type: 'integer', example: 12 }
 *                             CONCLUIDA: { type: 'integer', example: 1100 }
 *                             CANCELADA_PELO_PASSAGEIRO: { type: 'integer', example: 28 }
 *                             CANCELADA_PELO_MOTORISTA: { type: 'integer', example: 25 }

 *                       type: 'object'
 *                       properties:
 *                         total: { type: 'integer', example: 890 }
 *                         mediaGeral: { type: 'number', format: 'float', example: 4.2 }
 *                         porNota:
 *                           type: 'object'
 *                           properties:
 *                             '1': { type: 'integer', example: 15 }
 *                             '2': { type: 'integer', example: 25 }
 *                             '3': { type: 'integer', example: 45 }
 *                             '4': { type: 'integer', example: 280 }
 *                             '5': { type: 'integer', example: 525 }
 *                 sucesso: { type: 'boolean', example: true }
 *                 timestamp: { type: 'string', format: 'date-time' }
 */
router.get('/estatisticas', async (req, res) => {
  try {
    // Coletar estatísticas de passageiros
    const passageiros = PassageiroService.listarTodos();
    const totalPassageiros = passageiros.length;

    // Coletar estatísticas de motoristas
    const motoristas = MotoristaService.listarTodos();
    const totalMotoristas = motoristas.length;
    const motoristasDisponiveis = motoristas.filter(m => m.disponivel).length;
    const motoristasPorCategoria = {
      ECONOMY: motoristas.filter(m => m.categoria === 'ECONOMY').length,
      COMFORT: motoristas.filter(m => m.categoria === 'COMFORT').length
    };

    // Coletar estatísticas de pedidos
    const pedidos = PedidoCorridaService.listarTodos();
    const totalPedidos = pedidos.length;
    const pedidosPorStatus = {
      PROCURANDO: pedidos.filter(p => p.status === 'PROCURANDO').length,
      MOTORISTA_ATRIBUIDO: pedidos.filter(p => p.status === 'MOTORISTA_ATRIBUIDO').length,
      CANCELADO: pedidos.filter(p => p.status === 'CANCELADO').length,
      EXPIRADO: pedidos.filter(p => p.status === 'EXPIRADO').length
    };

    // Coletar estatísticas de corridas
    const corridas = CorridaService.listarTodas();
    const totalCorridas = corridas.length;
    const corridasPorStatus = {
      MOTORISTA_A_CAMINHO: corridas.filter(c => c.status === 'MOTORISTA_A_CAMINHO').length,
      EM_ANDAMENTO: corridas.filter(c => c.status === 'EM_ANDAMENTO').length,
      CONCLUIDA: corridas.filter(c => c.status === 'CONCLUIDA').length,
      CANCELADA_PELO_PASSAGEIRO: corridas.filter(c => c.status === 'CANCELADA_PELO_PASSAGEIRO').length,
      CANCELADA_PELO_MOTORISTA: corridas.filter(c => c.status === 'CANCELADA_PELO_MOTORISTA').length
    };



    const estatisticas = {
      passageiros: {
        total: totalPassageiros,
        ativos: totalPassageiros // Todos os passageiros são considerados ativos
      },
      motoristas: {
        total: totalMotoristas,
        disponiveis: motoristasDisponiveis,
        porCategoria: motoristasPorCategoria
      },
      pedidos: {
        total: totalPedidos,
        porStatus: pedidosPorStatus
      },
      corridas: {
        total: totalCorridas,
        porStatus: corridasPorStatus
      },

    };

    res.json(criarRespostaSucesso(estatisticas));
  } catch (error) {
    console.error('Erro ao gerar estatísticas:', error);
    res.status(500).json({
      codigo: 'ERRO_INTERNO',
      mensagem: 'Erro ao gerar estatísticas do sistema',
      detalhes: {}
    });
  }
});

/**
 * @swagger
 * /limpar-dados:
 *   post:
 *     summary: Limpar dados expirados e cancelados
 *     description: Remove pedidos expirados e limpa dados antigos do sistema
 *     tags: [Utilitários]
 *     responses:
 *       200:
 *         description: Limpeza realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: object
 *                   properties:
 *                     pedidosExpiradosRemovidos: { type: 'integer', example: 12 }
 *                     pedidosCanceladosRemovidos: { type: 'integer', example: 45 }
 *                     corridasAntigasRemovidas: { type: 'integer', example: 8 }
 *                     totalRegistrosRemovidos: { type: 'integer', example: 65 }
 *                 sucesso: { type: 'boolean', example: true }
 *                 timestamp: { type: 'string', format: 'date-time' }
 *       500:
 *         $ref: '#/components/responses/ErroPadrao'
 */
router.post('/limpar-dados', async (req, res) => {
  try {
    // Limpar pedidos expirados
    const pedidosExpiradosRemovidos = PedidoCorridaService.limparExpirados();
    
    // Contar pedidos cancelados para remoção (opcional - manter histórico)
    const pedidosCancelados = PedidoCorridaService.listarTodos()
      .filter(p => p.status === 'CANCELADO').length;
    
    // Contar corridas antigas (mais de 30 dias) para remoção (opcional)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    
    const corridasAntigas = CorridaService.listarTodas()
      .filter(c => new Date(c.criadoEm) < trintaDiasAtras).length;
    
    const totalRegistrosRemovidos = pedidosExpiradosRemovidos;

    const resultado = {
      pedidosExpiradosRemovidos,
      pedidosCanceladosRemovidos: 0, // Não removemos automaticamente
      corridasAntigasRemovidas: 0, // Não removemos automaticamente
      totalRegistrosRemovidos
    };

    res.json(criarRespostaSucesso(resultado));
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    res.status(500).json({
      codigo: 'ERRO_INTERNO',
      mensagem: 'Erro ao limpar dados do sistema',
      detalhes: {}
    });
  }
});

/**
 * @swagger
 * /status-sistema:
 *   get:
 *     summary: Status do sistema
 *     description: Retorna informações sobre o status atual do sistema
 *     tags: [Utilitários]
 *     responses:
 *       200:
 *         description: Status retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: object
 *                   properties:
 *                     status: { type: 'string', example: 'OPERACIONAL' }
 *                     uptime: { type: 'number', example: 3600 }
 *                     versao: { type: 'string', example: '1.0.0' }
 *                     ambiente: { type: 'string', example: 'development' }
 *                     timestamp: { type: 'string', format: 'date-time' }
 *                     memoria: { type: 'object' }
 *                     conexoes: { type: 'object' }
 *                 sucesso: { type: 'boolean', example: true }
 *                 timestamp: { type: 'string', format: 'date-time' }
 */
router.get('/status-sistema', async (req, res) => {
  try {
    const memoria = process.memoryUsage();
    const uptime = process.uptime();
    
    const status = {
      status: 'OPERACIONAL',
      uptime: Math.floor(uptime),
      versao: '1.0.0',
      ambiente: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      memoria: {
        rss: Math.round(memoria.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoria.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoria.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoria.external / 1024 / 1024) // MB
      },
      conexoes: {
        ativas: 0, // Em um sistema real, seria o número de conexões ativas
        maximo: 100
      }
    };

    res.json(criarRespostaSucesso(status));
  } catch (error) {
    console.error('Erro ao obter status do sistema:', error);
    res.status(500).json({
      codigo: 'ERRO_INTERNO',
      mensagem: 'Erro ao obter status do sistema',
      detalhes: {}
    });
  }
});

/**
 * @swagger
 * /buscar:
 *   get:
 *     summary: Busca global no sistema
 *     description: Realiza busca em todos os módulos por termo específico
 *     tags: [Utilitários]
 *     parameters:
 *       - in: query
 *         name: termo
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo para busca
 *         example: "João"
 *       - in: query
 *         name: modulo
 *         required: false
 *         schema:
 *           type: string
 *           enum: [passageiros, motoristas, pedidos, corridas, todos]
 *         description: Módulo específico para busca
 *         example: "passageiros"
 *       - in: query
 *         name: pagina
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *         example: 1
 *       - in: query
 *         name: limite
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Limite de resultados por página
 *         example: 20
 *     responses:
 *       200:
 *         description: Busca realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaLista'
 *       400:
 *         $ref: '#/components/responses/ErroPadrao'
 */
router.get('/buscar', validarPaginacao, async (req, res) => {
  try {
    const { termo, modulo = 'todos', pagina = 1, limite = 20 } = req.query;
    
    if (!termo || termo.trim().length < 2) {
      return res.status(400).json({
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Termo de busca deve ter pelo menos 2 caracteres',
        detalhes: { termo }
      });
    }

    const termoBusca = termo.trim().toLowerCase();
    let resultados = [];

    // Buscar em passageiros
    if (modulo === 'todos' || modulo === 'passageiros') {
      const passageiros = PassageiroService.listarTodos()
        .filter(p => p.nome.toLowerCase().includes(termoBusca) || 
                     p.telefoneE164.includes(termoBusca))
        .map(p => ({ ...p, tipo: 'passageiro' }));
      resultados.push(...passageiros);
    }

    // Buscar em motoristas
    if (modulo === 'todos' || modulo === 'motoristas') {
      const motoristas = MotoristaService.listarTodos()
        .filter(m => m.nome.toLowerCase().includes(termoBusca) || 
                     m.telefoneE164.includes(termoBusca))
        .map(m => ({ ...m, tipo: 'motorista' }));
      resultados.push(...motoristas);
    }

    // Buscar em pedidos (por coordenadas aproximadas)
    if (modulo === 'todos' || modulo === 'pedidos') {
      const pedidos = PedidoCorridaService.listarTodos()
        .filter(p => {
          const passageiro = PassageiroService.buscarPorId(p.passageiroId);
          return passageiro && (
            passageiro.nome.toLowerCase().includes(termoBusca) ||
            passageiro.telefoneE164.includes(termoBusca)
          );
        })
        .map(p => ({ ...p, tipo: 'pedido' }));
      resultados.push(...pedidos);
    }

    // Buscar em corridas
    if (modulo === 'todos' || modulo === 'corridas') {
      const corridas = CorridaService.listarTodas()
        .filter(c => {
          const passageiro = PassageiroService.buscarPorId(c.passageiroId);
          const motorista = MotoristaService.buscarPorId(c.motoristaId);
          return (passageiro && passageiro.nome.toLowerCase().includes(termoBusca)) ||
                 (motorista && motorista.nome.toLowerCase().includes(termoBusca));
        })
        .map(c => ({ ...c, tipo: 'corrida' }));
      resultados.push(...corridas);
    }



    // Aplicar paginação
    const { dados, meta } = aplicarPaginacao(resultados, pagina, limite);

    res.json(criarRespostaLista(dados, meta));
  } catch (error) {
    console.error('Erro na busca global:', error);
    res.status(500).json({
      codigo: 'ERRO_INTERNO',
      mensagem: 'Erro ao realizar busca global',
      detalhes: {}
    });
  }
});

export default router; 