import express from 'express';
import { AvaliacaoController } from '../controllers/AvaliacaoController.js';
import { validarUUID, validarPaginacao, validarNotaAvaliacao, validarAutorAvaliacao } from '../middleware/validacao.js';

const router = express.Router();

/**
 * @swagger
 * /corridas/{corridaId}/avaliar:
 *   post:
 *     summary: Avaliar uma corrida
 *     description: Permite que passageiros e motoristas avaliem uma corrida finalizada
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: corridaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da corrida a ser avaliada
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - autor
 *               - nota
 *             properties:
 *               autor:
 *                 type: string
 *                 enum: [PASSAGEIRO, MOTORISTA]
 *                 description: Quem está fazendo a avaliação
 *                 example: "PASSAGEIRO"
 *               nota:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Nota de 1 a 5 estrelas
 *                 example: 5
 *               comentario:
 *                 type: string
 *                 maxLength: 280
 *                 description: Comentário opcional sobre a corrida
 *                 example: "Excelente serviço, motorista muito atencioso!"
 *     responses:
 *       201:
 *         description: Avaliação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Avaliacao'
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
 *       422:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /avaliacoes:
 *   get:
 *     summary: Listar todas as avaliações
 *     description: Retorna uma lista paginada de todas as avaliações
 *     tags: [Avaliações]
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
 *         description: Lista de avaliações retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Avaliacao'
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
 *                       example: 150
 *                     totalPaginas:
 *                       type: integer
 *                       example: 8
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
 * /avaliacoes/{id}:
 *   get:
 *     summary: Buscar avaliação por ID
 *     description: Retorna os dados de uma avaliação específica
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da avaliação
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Avaliação encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Avaliacao'
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
 *     summary: Atualizar avaliação
 *     description: Atualiza os dados de uma avaliação existente
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da avaliação
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nota:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Nova nota de 1 a 5 estrelas
 *                 example: 4
 *               comentario:
 *                 type: string
 *                 maxLength: 280
 *                 description: Novo comentário sobre a corrida
 *                 example: "Serviço muito bom, recomendo!"
 *     responses:
 *       200:
 *         description: Avaliação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Avaliacao'
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
 *   delete:
 *     summary: Remover avaliação
 *     description: Remove uma avaliação do sistema
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da avaliação
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Avaliação removida com sucesso
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
 *                       example: "Avaliação removida com sucesso"
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
 * /avaliacoes/corrida/{corridaId}:
 *   get:
 *     summary: Buscar avaliações por corrida
 *     description: Retorna todas as avaliações de uma corrida específica
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: corridaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da corrida
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
 *         description: Avaliações da corrida retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Avaliacao'
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
 *                       example: 2
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
 * /avaliacoes/autor/{autor}:
 *   get:
 *     summary: Buscar avaliações por autor
 *     description: Retorna todas as avaliações de um autor específico
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: autor
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PASSAGEIRO, MOTORISTA]
 *         description: Tipo de autor
 *         example: "PASSAGEIRO"
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
 *         description: Avaliações do autor retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Avaliacao'
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
 *       400:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /avaliacoes/nota/{nota}:
 *   get:
 *     summary: Buscar avaliações por nota
 *     description: Retorna todas as avaliações com uma nota específica
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: nota
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Nota das avaliações
 *         example: 5
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
 *         description: Avaliações por nota retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Avaliacao'
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
 *                       example: 45
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
 *       400:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /avaliacoes/corrida/{corridaId}/media:
 *   get:
 *     summary: Calcular média de avaliações de uma corrida
 *     description: Retorna a média das avaliações de uma corrida específica
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: corridaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da corrida
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Média calculada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: object
 *                   properties:
 *                     corridaId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     media:
 *                       type: number
 *                       format: float
 *                       example: 4.5
 *                     corrida:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "123e4567-e89b-12d3-a456-426614174000"
 *                         status:
 *                           type: string
 *                           example: "CONCLUIDA"
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /avaliacoes/buscar:
 *   get:
 *     summary: Buscar avaliações com filtros
 *     description: Busca avaliações aplicando múltiplos filtros
 *     tags: [Avaliações]
 *     parameters:
 *       - in: query
 *         name: corridaId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID da corrida
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: autor
 *         schema:
 *           type: string
 *           enum: [PASSAGEIRO, MOTORISTA]
 *         description: Filtrar por tipo de autor
 *         example: "PASSAGEIRO"
 *       - in: query
 *         name: nota
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filtrar por nota específica
 *         example: 5
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
 *         description: Busca com filtros realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Avaliacao'
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
 *                     filtrosAplicados:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["corridaId: 123e4567-e89b-12d3-a456-426614174000", "autor: PASSAGEIRO"]
 *                     totalFiltrado:
 *                       type: integer
 *                       example: 15
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
 * /avaliacoes/estatisticas:
 *   get:
 *     summary: Estatísticas das avaliações
 *     description: Retorna estatísticas gerais sobre todas as avaliações
 *     tags: [Avaliações]
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
 *                     totalAvaliacoes:
 *                       type: integer
 *                       example: 150
 *                     mediaGeral:
 *                       type: number
 *                       format: float
 *                       example: 4.2
 *                     distribuicaoNotas:
 *                       type: object
 *                       properties:
 *                         "1":
 *                           type: integer
 *                           example: 5
 *                         "2":
 *                           type: integer
 *                           example: 8
 *                         "3":
 *                           type: integer
 *                           example: 15
 *                         "4":
 *                           type: integer
 *                           example: 45
 *                         "5":
 *                           type: integer
 *                           example: 77
 *                     totalPorAutor:
 *                       type: object
 *                       properties:
 *                         PASSAGEIRO:
 *                           type: integer
 *                           example: 100
 *                         MOTORISTA:
 *                           type: integer
 *                           example: 50
 *                     totalComComentario:
 *                       type: integer
 *                       example: 120
 *                     totalSemComentario:
 *                       type: integer
 *                       example: 30
 *                     percentualComentarios:
 *                       type: integer
 *                       example: 80
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
router.get('/', AvaliacaoController.listarTodas);

// Rotas com ID
router.get('/:id', validarUUID('id'), AvaliacaoController.buscarPorId);
router.put('/:id', validarUUID('id'), validarNotaAvaliacao, AvaliacaoController.atualizar);
router.delete('/:id', validarUUID('id'), AvaliacaoController.remover);

// Rotas de busca
router.get('/corrida/:corridaId', validarUUID('corridaId'), AvaliacaoController.buscarPorCorrida);
router.get('/autor/:autor', validarAutorAvaliacao, AvaliacaoController.buscarPorAutor);
router.get('/nota/:nota', validarNotaAvaliacao, AvaliacaoController.buscarPorNota);
router.get('/corrida/:corridaId/media', validarUUID('corridaId'), AvaliacaoController.calcularMediaCorrida);

// Rotas especiais
router.get('/buscar', AvaliacaoController.buscarComFiltros);
router.get('/estatisticas', AvaliacaoController.estatisticas);

export default router; 