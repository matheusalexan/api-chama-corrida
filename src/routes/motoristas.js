import express from 'express';
import { MotoristaController } from '../controllers/MotoristaController.js';
import { validarUUID, validarPaginacao } from '../middleware/validacao.js';

const router = express.Router();

/**
 * @swagger
 * /motoristas:
 *   post:
 *     summary: Criar um novo motorista
 *     description: Cria um novo motorista no sistema
 *     tags: [Motoristas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - telefoneE164
 *               - categoria
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 80
 *                 description: Nome completo do motorista
 *                 example: "Carlos Oliveira"
 *               telefoneE164:
 *                 type: string
 *                 pattern: '^\+[0-9]{10,15}$'
 *                 description: Número de telefone no formato E.164
 *                 example: "+5511888888888"
 *               categoria:
 *                 type: string
 *                 enum: [ECONOMY, COMFORT]
 *                 description: Categoria do motorista
 *                 example: "ECONOMY"
 *     responses:
 *       201:
 *         description: Motorista criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Motorista'
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ErroPadrao'
 *       409:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 *   get:
 *     summary: Listar todos os motoristas
 *     description: Retorna uma lista paginada de todos os motoristas
 *     tags: [Motoristas]
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
 *         description: Lista de motoristas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Motorista'
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
 *                       example: 50
 *                     totalPaginas:
 *                       type: integer
 *                       example: 3
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
 * /motoristas/{id}:
 *   get:
 *     summary: Buscar motorista por ID
 *     description: Retorna os dados de um motorista específico
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do motorista
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Motorista encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Motorista'
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 *   put:
 *     summary: Atualizar motorista
 *     description: Atualiza os dados de um motorista existente
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do motorista
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 80
 *                 description: Novo nome do motorista
 *                 example: "Carlos Oliveira"
 *               telefoneE164:
 *                 type: string
 *                 pattern: '^\+[0-9]{10,15}$'
 *                 description: Novo número de telefone
 *                 example: "+5511888888888"
 *               categoria:
 *                 type: string
 *                 enum: [ECONOMY, COMFORT]
 *                 description: Nova categoria
 *                 example: "COMFORT"
 *     responses:
 *       200:
 *         description: Motorista atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Motorista'
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
 *       409:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 *   delete:
 *     summary: Remover motorista
 *     description: Remove um motorista do sistema
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do motorista
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Motorista removido com sucesso
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
 *                       example: "Motorista removido com sucesso"
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
 * /motoristas/{id}/disponibilidade:
 *   patch:
 *     summary: Alterar disponibilidade do motorista
 *     description: Altera o status de disponibilidade de um motorista
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do motorista
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - disponivel
 *             properties:
 *               disponivel:
 *                 type: boolean
 *                 description: Novo status de disponibilidade
 *                 example: false
 *     responses:
 *       200:
 *         description: Disponibilidade alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Motorista'
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
 * /motoristas/telefone/{telefone}:
 *   get:
 *     summary: Buscar motorista por telefone
 *     description: Retorna um motorista baseado no número de telefone
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: telefone
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\+[0-9]{10,15}$'
 *         description: Número de telefone no formato E.164
 *         example: "+5511888888888"
 *     responses:
 *       200:
 *         description: Motorista encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Motorista'
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /motoristas/disponiveis:
 *   get:
 *     summary: Buscar motoristas disponíveis
 *     description: Retorna uma lista de motoristas disponíveis para corridas
 *     tags: [Motoristas]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [ECONOMY, COMFORT]
 *         description: Filtrar por categoria específica
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
 *         description: Lista de motoristas disponíveis retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Motorista'
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
 * 
 * /motoristas/categoria/{categoria}:
 *   get:
 *     summary: Buscar motoristas por categoria
 *     description: Retorna uma lista de motoristas de uma categoria específica
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ECONOMY, COMFORT]
 *         description: Categoria dos motoristas
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
 *         description: Lista de motoristas por categoria retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Motorista'
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
 *                       example: 30
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
 * /motoristas/buscar/{nome}:
 *   get:
 *     summary: Buscar motoristas por nome
 *     description: Busca motoristas cujo nome contenha o termo fornecido
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Nome ou parte do nome para busca
 *         example: "Carlos"
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
 *         description: Busca realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Motorista'
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
 *                       example: 3
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
 */

// Aplicar middleware de paginação para rotas que listam dados
router.use(validarPaginacao);

// Rotas principais
router.post('/', MotoristaController.criar);
router.get('/', MotoristaController.listarTodos);

// Rotas com ID
router.get('/:id', validarUUID('id'), MotoristaController.buscarPorId);
router.put('/:id', validarUUID('id'), MotoristaController.atualizar);
router.delete('/:id', validarUUID('id'), MotoristaController.remover);

// Rota de disponibilidade
router.patch('/:id/disponibilidade', validarUUID('id'), MotoristaController.alterarDisponibilidade);

// Rotas especiais
router.get('/telefone/:telefone', MotoristaController.buscarPorTelefone);
router.get('/disponiveis', MotoristaController.buscarDisponiveis);
router.get('/categoria/:categoria', MotoristaController.buscarPorCategoria);
router.get('/buscar/:nome', MotoristaController.buscarPorNome);

export default router; 