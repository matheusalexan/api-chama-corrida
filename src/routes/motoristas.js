import express from 'express';
import { MotoristaController } from '../controllers/MotoristaController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Motorista:
 *       type: object
 *       required:
 *         - nome
 *         - telefone
 *         - placa
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do motorista
 *         nome:
 *           type: string
 *           minLength: 2
 *           description: Nome completo do motorista
 *         telefone:
 *           type: string
 *           pattern: '^\+55\d{10,11}$'
 *           description: Telefone no formato E.164 brasileiro
 *         placa:
 *           type: string
 *           minLength: 5
 *           description: Placa do veículo
 *         status:
 *           type: string
 *           enum: [disponível, ocupado]
 *           description: Status atual do motorista
 *         criadoEm:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *     MotoristaInput:
 *       type: object
 *       required:
 *         - nome
 *         - telefone
 *         - placa
 *       properties:
 *         nome:
 *           type: string
 *           minLength: 2
 *           example: "Pedro Santos"
 *         telefone:
 *           type: string
 *           pattern: '^\+55\d{10,11}$'
 *           example: "+5511888888888"
 *         placa:
 *           type: string
 *           minLength: 5
 *           example: "ABC1234"
 */

/**
 * @swagger
 * /api/v1/motoristas:
 *   post:
 *     summary: Criar novo motorista
 *     tags: [Motoristas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MotoristaInput'
 *     responses:
 *       201:
 *         description: Motorista criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Motorista criado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Motorista'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nome, telefone e placa são obrigatórios"
 *                 code:
 *                   type: string
 *                   example: "CAMPOS_OBRIGATORIOS"
 *       409:
 *         description: Telefone já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Telefone já cadastrado"
 *                 code:
 *                   type: string
 *                   example: "TELEFONE_DUPLICADO"
 */
router.post('/', MotoristaController.criar);

/**
 * @swagger
 * /api/v1/motoristas:
 *   get:
 *     summary: Listar todos os motoristas
 *     tags: [Motoristas]
 *     responses:
 *       200:
 *         description: Lista de motoristas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lista de motoristas"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Motorista'
 *                 total:
 *                   type: integer
 *                   example: 3
 */
router.get('/', MotoristaController.listarTodos);

/**
 * @swagger
 * /api/v1/motoristas/{id}:
 *   get:
 *     summary: Buscar motorista por ID
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do motorista
 *     responses:
 *       200:
 *         description: Motorista encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Motorista encontrado"
 *                 data:
 *                   $ref: '#/components/schemas/Motorista'
 *       404:
 *         description: Motorista não encontrado
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
 */
router.get('/:id', MotoristaController.buscarPorId);

/**
 * @swagger
 * /api/v1/motoristas/{id}/status:
 *   patch:
 *     summary: Alterar status do motorista
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do motorista
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
 *                 enum: [disponível, ocupado]
 *                 example: "ocupado"
 *     responses:
 *       200:
 *         description: Status alterado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Status alterado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Motorista'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Status é obrigatório"
 *                 code:
 *                   type: string
 *                   example: "CAMPOS_OBRIGATORIOS"
 *       404:
 *         description: Motorista não encontrado
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
 */
router.patch('/:id/status', MotoristaController.alterarStatus);

/**
 * @swagger
 * /api/v1/motoristas/telefone/{telefone}:
 *   get:
 *     summary: Buscar motorista por telefone
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: telefone
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\+55\d{10,11}$'
 *         description: Telefone do motorista
 *     responses:
 *       200:
 *         description: Motorista encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Motorista encontrado"
 *                 data:
 *                   $ref: '#/components/schemas/Motorista'
 *       404:
 *         description: Motorista não encontrado
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
 */
router.get('/telefone/:telefone', MotoristaController.buscarPorTelefone);

/**
 * @swagger
 * /api/v1/motoristas/disponiveis:
 *   get:
 *     summary: Listar motoristas disponíveis
 *     tags: [Motoristas]
 *     responses:
 *       200:
 *         description: Lista de motoristas disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Motoristas disponíveis"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Motorista'
 *                 total:
 *                   type: integer
 *                   example: 2
 */
router.get('/disponiveis', MotoristaController.buscarDisponiveis);

export default router;
