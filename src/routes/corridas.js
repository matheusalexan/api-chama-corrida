import express from 'express';
import { CorridaController } from '../controllers/CorridaController.js';
import { validarUUID, validarPaginacao, validarStatusCorrida } from '../middleware/validacao.js';

const router = express.Router();

/**
 * @swagger
 * /corridas:
 *   get:
 *     summary: Listar todas as corridas
 *     description: Retorna uma lista paginada de todas as corridas
 *     tags: [Corridas]
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Lista de corridas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Corrida'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagina:
 *                       type: integer
 *                       example: 1
 *                     limite:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 75
 *                     totalPaginas:
 *                       type: integer
 *                       example: 4
 *                     temProxima:
 *                       type: boolean
 *                       example: true
 *                     temAnterior:
 *                       type: boolean
 *                       example: false
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 * 
 * /corridas/{id}:
 *   get:
 *     summary: Buscar corrida por ID
 *     description: Retorna os dados de uma corrida específica
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da corrida
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Corrida encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Corrida'
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 *   delete:
 *     summary: Remover corrida
 *     description: Remove uma corrida do sistema
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da corrida
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Corrida removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: object
 *                   properties:
 *                     mensagem:
 *                       type: string
 *                       example: "Corrida removida com sucesso"
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /corridas/{id}/status:
 *   post:
 *     summary: Atualizar status da corrida
 *     description: Atualiza o status de uma corrida (máquina de estados)
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da corrida
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [MOTORISTA_A_CAMINHO, EM_ANDAMENTO, CONCLUIDA]
 *                 description: Novo status da corrida
 *                 example: "EM_ANDAMENTO"
 *     responses:
 *       200:
 *         description: Status da corrida atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: object
 *                   properties:
 *                     mensagem:
 *                       type: string
 *                       example: "Status da corrida atualizado com sucesso"
 *                     corrida:
 *                       $ref: '#/components/schemas/Corrida'
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ErroPadrao'
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 *       422:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /corridas/{id}/cancelar:
 *   post:
 *     summary: Cancelar corrida pelo passageiro
 *     description: Permite que o passageiro cancele uma corrida (aplica multa de R$ 7,00)
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da corrida
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Corrida cancelada pelo passageiro com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: object
 *                   properties:
 *                     mensagem:
 *                       type: string
 *                       example: "Corrida cancelada pelo passageiro com sucesso"
 *                     corrida:
 *                       $ref: '#/components/schemas/Corrida'
 *                     multa:
 *                       type: string
 *                       example: "R$ 7,00 aplicada conforme regra de negócio"
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 *       422:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /corridas/{id}/cancelar-motorista:
 *   post:
 *     summary: Cancelar corrida pelo motorista
 *     description: Permite que o motorista cancele uma corrida (preço final = R$ 0,00)
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da corrida
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Corrida cancelada pelo motorista com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: object
 *                   properties:
 *                     mensagem:
 *                       type: string
 *                       example: "Corrida cancelada pelo motorista com sucesso"
 *                     corrida:
 *                       $ref: '#/components/schemas/Corrida'
 *                     precoFinal:
 *                       type: string
 *                       example: "R$ 0,00 (sem cobrança)"
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 *       422:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /corridas/{id}/concluir:
 *   post:
 *     summary: Concluir corrida
 *     description: Marca uma corrida como concluída (apenas se estiver em andamento)
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da corrida
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Corrida concluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: object
 *                   properties:
 *                     mensagem:
 *                       type: string
 *                       example: "Corrida concluída com sucesso"
 *                     corrida:
 *                       $ref: '#/components/schemas/Corrida'
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 *       422:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /corridas/motorista/{motoristaId}:
 *   get:
 *     summary: Buscar corridas por motorista
 *     description: Retorna todas as corridas de um motorista específico
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: motoristaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do motorista
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Corridas do motorista retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Corrida'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagina:
 *                       type: integer
 *                       example: 1
 *                     limite:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 8
 *                     totalPaginas:
 *                       type: integer
 *                       example: 1
 *                     temProxima:
 *                       type: boolean
 *                       example: false
 *                     temAnterior:
 *                       type: boolean
 *                       example: false
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /corridas/passageiro/{passageiroId}:
 *   get:
 *     summary: Buscar corridas por passageiro
 *     description: Retorna todas as corridas de um passageiro específico
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: passageiroId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do passageiro
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Corridas do passageiro retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Corrida'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagina:
 *                       type: integer
 *                       example: 1
 *                     limite:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 12
 *                     totalPaginas:
 *                       type: integer
 *                       example: 1
 *                     temProxima:
 *                       type: boolean
 *                       example: false
 *                     temAnterior:
 *                       type: boolean
 *                       example: false
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 * 
 * /corridas/status/{status}:
 *   get:
 *     summary: Buscar corridas por status
 *     description: Retorna todas as corridas com um status específico
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [MOTORISTA_A_CAMINHO, EM_ANDAMENTO, CONCLUIDA, CANCELADA_PELO_PASSAGEIRO, CANCELADA_PELO_MOTORISTA]
 *         description: Status das corridas
 *         example: "EM_ANDAMENTO"
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Corridas por status retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Corrida'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagina:
 *                       type: integer
 *                       example: 1
 *                     limite:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     totalPaginas:
 *                       type: integer
 *                       example: 2
 *                     temProxima:
 *                       type: boolean
 *                       example: true
 *                     temAnterior:
 *                       type: boolean
 *                       example: false
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /corridas/pedido/{pedidoId}:
 *   get:
 *     summary: Buscar corrida por pedido
 *     description: Retorna a corrida associada a um pedido específico
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do pedido de corrida
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Corrida encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Corrida'
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 */

// Aplicar middleware de paginação para rotas que listam dados
router.use(validarPaginacao);

// Rotas principais
router.get('/', CorridaController.listarTodas);

// Rotas com ID
router.get('/:id', validarUUID('id'), CorridaController.buscarPorId);
router.delete('/:id', validarUUID('id'), CorridaController.remover);

// Rotas de ação
router.post('/:id/status', validarUUID('id'), validarStatusCorrida, CorridaController.atualizarStatus);
router.post('/:id/cancelar', validarUUID('id'), CorridaController.cancelarPeloPassageiro);
router.post('/:id/cancelar-motorista', validarUUID('id'), CorridaController.cancelarPeloMotorista);
router.post('/:id/concluir', validarUUID('id'), CorridaController.concluir);

// Rotas de busca
router.get('/motorista/:motoristaId', validarUUID('motoristaId'), CorridaController.buscarPorMotorista);
router.get('/passageiro/:passageiroId', validarUUID('passageiroId'), CorridaController.buscarPorPassageiro);
router.get('/status/:status', CorridaController.buscarPorStatus);
router.get('/pedido/:pedidoId', validarUUID('pedidoId'), CorridaController.buscarPorPedido);

export default router; 