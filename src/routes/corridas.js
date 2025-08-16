import express from 'express';
import { CorridaController } from '../controllers/CorridaController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Coordenadas:
 *       type: object
 *       required:
 *         - lat
 *         - lng
 *       properties:
 *         lat:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *           description: Latitude
 *           example: -23.5505
 *         lng:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *           description: Longitude
 *           example: -46.6333
 *     Corrida:
 *       type: object
 *       required:
 *         - passageiroId
 *         - origem
 *         - destino
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da corrida
 *         passageiroId:
 *           type: string
 *           format: uuid
 *           description: ID do passageiro
 *         origem:
 *           $ref: '#/components/schemas/Coordenadas'
 *         destino:
 *           $ref: '#/components/schemas/Coordenadas'
 *         status:
 *           type: string
 *           enum: [aguardando_motorista, aceita, iniciada, finalizada, cancelada_pelo_passageiro, cancelada_pelo_motorista]
 *           description: Status atual da corrida
 *         motoristaId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID do motorista (quando aceita)
 *         precoEstimado:
 *           type: number
 *           description: Preço estimado da corrida
 *         precoFinal:
 *           type: number
 *           nullable: true
 *           description: Preço final da corrida
 *         inicioEm:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Data de início
 *         fimEm:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Data de fim
 *         criadoEm:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         atualizadoEm:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *     CorridaInput:
 *       type: object
 *       required:
 *         - passageiroId
 *         - origem
 *         - destino
 *       properties:
 *         passageiroId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         origem:
 *           $ref: '#/components/schemas/Coordenadas'
 *         destino:
 *           $ref: '#/components/schemas/Coordenadas'
 */

/**
 * @swagger
 * /api/v1/corridas:
 *   post:
 *     summary: Criar nova corrida
 *     tags: [Corridas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CorridaInput'
 *     responses:
 *       201:
 *         description: Corrida criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida criada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Corrida'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Passageiro ID, origem e destino são obrigatórios"
 *                 code:
 *                   type: string
 *                   example: "CAMPOS_OBRIGATORIOS"
 *       409:
 *         description: Passageiro já possui corrida em andamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Passageiro já possui corrida em andamento"
 *                 code:
 *                   type: string
 *                   example: "CORRIDA_EM_ANDAMENTO"
 */
router.post('/', CorridaController.criar);

/**
 * @swagger
 * /api/v1/corridas:
 *   get:
 *     summary: Listar todas as corridas
 *     tags: [Corridas]
 *     responses:
 *       200:
 *         description: Lista de corridas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lista de corridas"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Corrida'
 *                 total:
 *                   type: integer
 *                   example: 10
 */
router.get('/', CorridaController.listarTodas);

/**
 * @swagger
 * /api/v1/corridas/{id}:
 *   get:
 *     summary: Buscar corrida por ID
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da corrida
 *     responses:
 *       200:
 *         description: Corrida encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida encontrada"
 *                 data:
 *                   $ref: '#/components/schemas/Corrida'
 *       404:
 *         description: Corrida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida não encontrada"
 *                 code:
 *                   type: string
 *                   example: "NAO_ENCONTRADO"
 */
router.get('/:id', CorridaController.buscarPorId);

/**
 * @swagger
 * /api/v1/corridas/{id}/aceitar:
 *   post:
 *     summary: Motorista aceita corrida
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da corrida
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
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Corrida aceita com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida aceita com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Corrida'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Motorista ID é obrigatório"
 *                 code:
 *                   type: string
 *                   example: "CAMPOS_OBRIGATORIOS"
 *       404:
 *         description: Corrida ou motorista não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Motorista não encontrado"
 *                 code:
 *                   type: string
 *                   example: "NAO_ENCONTRADO"
 *       409:
 *         description: Motorista não está disponível
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Motorista não está disponível"
 *                 code:
 *                   type: string
 *                   example: "MOTORISTA_INDISPONIVEL"
 *       422:
 *         description: Estado inválido da corrida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida não está aguardando motorista"
 *                 code:
 *                   type: string
 *                   example: "ESTADO_INVALIDO"
 */
router.post('/:id/aceitar', CorridaController.aceitar);

/**
 * @swagger
 * /api/v1/corridas/{id}/iniciar:
 *   post:
 *     summary: Iniciar corrida
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da corrida
 *     responses:
 *       200:
 *         description: Corrida iniciada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida iniciada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Corrida'
 *       404:
 *         description: Corrida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida não encontrada"
 *                 code:
 *                   type: string
 *                   example: "NAO_ENCONTRADO"
 *       422:
 *         description: Estado inválido da corrida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida deve estar aceita para ser iniciada"
 *                 code:
 *                   type: string
 *                   example: "ESTADO_INVALIDO"
 */
router.post('/:id/iniciar', CorridaController.iniciar);

/**
 * @swagger
 * /api/v1/corridas/{id}/finalizar:
 *   post:
 *     summary: Finalizar corrida
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da corrida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - distanciaKm
 *               - duracaoMin
 *             properties:
 *               distanciaKm:
 *                 type: number
 *                 minimum: 0
 *                 description: Distância percorrida em km
 *                 example: 5.2
 *               duracaoMin:
 *                 type: number
 *                 minimum: 0
 *                 description: Duração da viagem em minutos
 *                 example: 15
 *     responses:
 *       200:
 *         description: Corrida finalizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida finalizada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Corrida'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Distância e duração são obrigatórias"
 *                 code:
 *                   type: string
 *                   example: "CAMPOS_OBRIGATORIOS"
 *       404:
 *         description: Corrida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida não encontrada"
 *                 code:
 *                   type: string
 *                   example: "NAO_ENCONTRADO"
 *       422:
 *         description: Estado inválido da corrida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida deve estar iniciada para ser finalizada"
 *                 code:
 *                   type: string
 *                   example: "ESTADO_INVALIDO"
 */
router.post('/:id/finalizar', CorridaController.finalizar);

/**
 * @swagger
 * /api/v1/corridas/{id}/cancelar:
 *   post:
 *     summary: Cancelar corrida
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da corrida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - porQuem
 *             properties:
 *               porQuem:
 *                 type: string
 *                 enum: [passageiro, motorista]
 *                 example: "passageiro"
 *     responses:
 *       200:
 *         description: Corrida cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida cancelada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Corrida'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Por quem é obrigatório (passageiro ou motorista)"
 *                 code:
 *                   type: string
 *                   example: "CAMPOS_OBRIGATORIOS"
 *       404:
 *         description: Corrida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corrida não encontrada"
 *                 code:
 *                   type: string
 *                   example: "NAO_ENCONTRADO"
 *       409:
 *         description: Não é possível cancelar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Não é possível cancelar corrida já iniciada"
 *                 code:
 *                   type: string
 *                   example: "NAO_PODE_CANCELAR"
 */
router.post('/:id/cancelar', CorridaController.cancelar);

/**
 * @swagger
 * /api/v1/corridas/passageiro/{passageiroId}:
 *   get:
 *     summary: Buscar corridas por passageiro
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: passageiroId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do passageiro
 *     responses:
 *       200:
 *         description: Corridas do passageiro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corridas do passageiro"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Corrida'
 *                 total:
 *                   type: integer
 *                   example: 3
 */
router.get('/passageiro/:passageiroId', CorridaController.buscarPorPassageiro);

/**
 * @swagger
 * /api/v1/corridas/motorista/{motoristaId}:
 *   get:
 *     summary: Buscar corridas por motorista
 *     tags: [Corridas]
 *     parameters:
 *       - in: path
 *         name: motoristaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do motorista
 *     responses:
 *       200:
 *         description: Corridas do motorista
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corridas do motorista"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Corrida'
 *                 total:
 *                   type: integer
 *                   example: 2
 */
router.get('/motorista/:motoristaId', CorridaController.buscarPorMotorista);

/**
 * @swagger
 * /api/v1/corridas/aguardando-motorista:
 *   get:
 *     summary: Listar corridas aguardando motorista
 *     tags: [Corridas]
 *     responses:
 *       200:
 *         description: Corridas aguardando motorista
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Corridas aguardando motorista"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Corrida'
 *                 total:
 *                   type: integer
 *                   example: 4
 */
router.get('/aguardando-motorista', CorridaController.buscarAguardandoMotorista);

export default router;
