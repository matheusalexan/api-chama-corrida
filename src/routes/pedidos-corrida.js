import express from 'express';
import { PedidoCorridaController } from '../controllers/PedidoCorridaController.js';
import { validarUUID, validarPaginacao, validarCoordenadas, validarCategoria } from '../middleware/validacao.js';

const router = express.Router();

/**
 * @swagger
 * /pedidos-corrida:
 *   post:
 *     summary: Criar um novo pedido de corrida
 *     description: Cria um novo pedido de corrida no sistema
 *     tags: [Pedidos de Corrida]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passageiroId
 *               - origemLat
 *               - origemLng
 *               - destinoLat
 *               - destinoLng
 *               - categoria
 *             properties:
 *               passageiroId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do passageiro que solicitou a corrida
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               origemLat:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 description: Latitude do ponto de origem
 *                 example: -23.5505
 *               origemLng:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 description: Longitude do ponto de origem
 *                 example: -46.6333
 *               destinoLat:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 description: Latitude do ponto de destino
 *                 example: -23.5605
 *               destinoLng:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 description: Longitude do ponto de destino
 *                 example: -46.6433
 *               categoria:
 *                 type: string
 *                 enum: [ECONOMY, COMFORT]
 *                 description: Categoria da corrida solicitada
 *                 example: "ECONOMY"
 *     responses:
 *       201:
 *         description: Pedido de corrida criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/PedidoCorrida'
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
 * 
 *   get:
 *     summary: Listar todos os pedidos de corrida
 *     description: Retorna uma lista paginada de todos os pedidos de corrida
 *     tags: [Pedidos de Corrida]
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
 *         description: Lista de pedidos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PedidoCorrida'
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
 *                       example: 100
 *                     totalPaginas:
 *                       type: integer
 *                       example: 5
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
 * /pedidos-corrida/{id}:
 *   get:
 *     summary: Buscar pedido de corrida por ID
 *     description: Retorna os dados de um pedido de corrida específico
 *     tags: [Pedidos de Corrida]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do pedido
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Pedido encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/PedidoCorrida'
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
 *     summary: Remover pedido de corrida
 *     description: Remove um pedido de corrida do sistema
 *     tags: [Pedidos de Corrida]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do pedido
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Pedido removido com sucesso
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
 *                       example: "Pedido removido com sucesso"
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
 * /pedidos-corrida/{id}/cancelar:
 *   post:
 *     summary: Cancelar pedido de corrida
 *     description: Cancela um pedido de corrida (apenas se estiver em estado PROCURANDO)
 *     tags: [Pedidos de Corrida]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do pedido
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Pedido cancelado com sucesso
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
 *                       example: "Pedido cancelado com sucesso"
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     status:
 *                       type: string
 *                       example: "CANCELADO"
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
 * /pedidos-corrida/{id}/aceitar:
 *   post:
 *     summary: Aceitar pedido de corrida
 *     description: Permite que um motorista aceite um pedido de corrida
 *     tags: [Pedidos de Corrida]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do pedido
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motoristaId
 *             properties:
 *               motoristaId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do motorista que está aceitando o pedido
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Pedido aceito com sucesso
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
 *                       example: "Pedido aceito com sucesso"
 *                     pedido:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "123e4567-e89b-12d3-a456-426614174000"
 *                         status:
 *                           type: string
 *                           example: "MOTORISTA_ATRIBUIDO"
 *                     corrida:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "123e4567-e89b-12d3-a456-426614174000"
 *                         status:
 *                           type: string
 *                           example: "MOTORISTA_A_CAMINHO"
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
 * /pedidos-corrida/passageiro/{passageiroId}:
 *   get:
 *     summary: Buscar pedidos por passageiro
 *     description: Retorna todos os pedidos de corrida de um passageiro específico
 *     tags: [Pedidos de Corrida]
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
 *         description: Pedidos do passageiro retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PedidoCorrida'
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
 *                       example: 5
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
 * /pedidos-corrida/status/{status}:
 *   get:
 *     summary: Buscar pedidos por status
 *     description: Retorna todos os pedidos de corrida com um status específico
 *     tags: [Pedidos de Corrida]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PROCURANDO, MOTORISTA_ATRIBUIDO, CANCELADO, EXPIRADO]
 *         description: Status dos pedidos
 *         example: "PROCURANDO"
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
 *         description: Pedidos por status retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PedidoCorrida'
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
 *                       example: 15
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
 *       400:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /pedidos-corrida/categoria/{categoria}:
 *   get:
 *     summary: Buscar pedidos por categoria
 *     description: Retorna todos os pedidos de corrida de uma categoria específica
 *     tags: [Pedidos de Corrida]
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ECONOMY, COMFORT]
 *         description: Categoria dos pedidos
 *         example: "ECONOMY"
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
 *         description: Pedidos por categoria retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PedidoCorrida'
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
 * /pedidos-corrida/limpar-expirados:
 *   post:
 *     summary: Limpar pedidos expirados
 *     description: Limpa automaticamente todos os pedidos que expiraram
 *     tags: [Pedidos de Corrida]
 *     responses:
 *       200:
 *         description: Pedidos expirados limpos com sucesso
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
 *                       example: "Pedidos expirados limpos com sucesso"
 *                     quantidade:
 *                       type: integer
 *                       example: 5
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

// Aplicar middleware de paginação para rotas que listam dados
router.use(validarPaginacao);

// Rotas principais
router.post('/', validarCoordenadas, validarCategoria, PedidoCorridaController.criar);
router.get('/', PedidoCorridaController.listarTodos);

// Rotas com ID
router.get('/:id', validarUUID('id'), PedidoCorridaController.buscarPorId);
router.delete('/:id', validarUUID('id'), PedidoCorridaController.remover);

// Rotas de ação
router.post('/:id/cancelar', validarUUID('id'), PedidoCorridaController.cancelar);
router.post('/:id/aceitar', validarUUID('id'), PedidoCorridaController.aceitar);

// Rotas de busca
router.get('/passageiro/:passageiroId', validarUUID('passageiroId'), PedidoCorridaController.buscarPorPassageiro);
router.get('/status/:status', PedidoCorridaController.buscarPorStatus);
router.get('/categoria/:categoria', validarCategoria, PedidoCorridaController.buscarPorCategoria);

// Rotas utilitárias
router.post('/limpar-expirados', PedidoCorridaController.limparExpirados);

export default router; 