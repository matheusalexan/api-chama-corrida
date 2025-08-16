import express from 'express';
import { PassageiroController } from '../controllers/PassageiroController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Passageiro:
 *       type: object
 *       required:
 *         - nome
 *         - telefone
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do passageiro
 *         nome:
 *           type: string
 *           minLength: 2
 *           description: Nome completo do passageiro
 *         telefone:
 *           type: string
 *           pattern: '^\+55\d{10,11}$'
 *           description: Telefone no formato E.164 brasileiro
 *         criadoEm:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *     PassageiroInput:
 *       type: object
 *       required:
 *         - nome
 *         - telefone
 *       properties:
 *         nome:
 *           type: string
 *           minLength: 2
 *           example: "João Silva"
 *         telefone:
 *           type: string
 *           pattern: '^\+55\d{10,11}$'
 *           example: "+5511999999999"
 */

/**
 * @swagger
 * /api/v1/passageiros:
 *   post:
 *     summary: Criar novo passageiro
 *     tags: [Passageiros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PassageiroInput'
 *     responses:
 *       201:
 *         description: Passageiro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Passageiro criado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Passageiro'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nome e telefone são obrigatórios"
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
router.post('/', PassageiroController.criar);

/**
 * @swagger
 * /api/v1/passageiros:
 *   get:
 *     summary: Listar todos os passageiros
 *     tags: [Passageiros]
 *     responses:
 *       200:
 *         description: Lista de passageiros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lista de passageiros"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Passageiro'
 *                 total:
 *                   type: integer
 *                   example: 5
 */
router.get('/', PassageiroController.listarTodos);

/**
 * @swagger
 * /api/v1/passageiros/{id}:
 *   get:
 *     summary: Buscar passageiro por ID
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do passageiro
 *     responses:
 *       200:
 *         description: Passageiro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Passageiro encontrado"
 *                 data:
 *                   $ref: '#/components/schemas/Passageiro'
 *       404:
 *         description: Passageiro não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Passageiro não encontrado"
 *                 code:
 *                   type: string
 *                   example: "NAO_ENCONTRADO"
 */
router.get('/:id', PassageiroController.buscarPorId);

/**
 * @swagger
 * /api/v1/passageiros/telefone/{telefone}:
 *   get:
 *     summary: Buscar passageiro por telefone
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: telefone
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\+55\d{10,11}$'
 *         description: Telefone do passageiro
 *     responses:
 *       200:
 *         description: Passageiro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Passageiro encontrado"
 *                 data:
 *                   $ref: '#/components/schemas/Passageiro'
 *       404:
 *         description: Passageiro não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Passageiro não encontrado"
 *                 code:
 *                   type: string
 *                   example: "NAO_ENCONTRADO"
 */
router.get('/telefone/:telefone', PassageiroController.buscarPorTelefone);

export default router;
