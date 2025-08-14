import express from 'express';
import { PassageiroController } from '../controllers/PassageiroController.js';
import { validarUUID, validarPaginacao } from '../middleware/validacao.js';

const router = express.Router();

/**
 * @swagger
 * /passageiros:
 *   post:
 *     summary: Criar um novo passageiro
 *     description: Cria um novo passageiro no sistema
 *     tags: [Passageiros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - telefoneE164
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 80
 *                 description: Nome completo do passageiro
 *                 example: "João Silva Santos"
 *               telefoneE164:
 *                 type: string
 *                 pattern: '^\+[0-9]{10,15}$'
 *                 description: Número de telefone no formato E.164
 *                 example: "+5511999999999"
 *     responses:
 *       201:
 *         $ref: '#/components/responses/RespostaCriacao'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       409:
 *         $ref: '#/components/responses/ErroConflito'
 * 
 *   get:
 *     summary: Listar todos os passageiros
 *     description: Retorna uma lista paginada de todos os passageiros
 *     tags: [Passageiros]
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
 *         $ref: '#/components/responses/RespostaLista'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 * 
 * /passageiros/{id}:
 *   get:
 *     summary: Buscar passageiro por ID
 *     description: Retorna os dados de um passageiro específico
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do passageiro
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/RespostaSucesso'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       404:
 *         $ref: '#/components/responses/ErroNaoEncontrado'
 * 
 *   put:
 *     summary: Atualizar passageiro
 *     description: Atualiza os dados de um passageiro existente
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do passageiro
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
 *                 description: Nome completo do passageiro
 *                 example: "João Silva Santos Atualizado"
 *               telefoneE164:
 *                 type: string
 *                 pattern: '^\+[0-9]{10,15}$'
 *                 description: Número de telefone no formato E.164
 *                 example: "+5511999999999"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/RespostaSucesso'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       404:
 *         $ref: '#/components/responses/ErroNaoEncontrado'
 *       409:
 *         $ref: '#/components/responses/ErroConflito'
 * 
 *   delete:
 *     summary: Remover passageiro
 *     description: Remove um passageiro do sistema
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do passageiro
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       204:
 *         $ref: '#/components/responses/RespostaExclusao'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       404:
 *         $ref: '#/components/responses/ErroNaoEncontrado'
 * 
 * /passageiros/telefone/{telefone}:
 *   get:
 *     summary: Buscar passageiro por telefone
 *     description: Busca um passageiro pelo número de telefone
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: telefone
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\+[0-9]{10,15}$'
 *         description: Número de telefone no formato E.164
 *         example: "+5511999999999"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/RespostaSucesso'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       404:
 *         $ref: '#/components/responses/ErroNaoEncontrado'
 * 
 * /passageiros/buscar/{nome}:
 *   get:
 *     summary: Buscar passageiros por nome
 *     description: Busca passageiros cujo nome contenha o termo especificado
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Termo para busca no nome
 *         example: "João"
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
 *         $ref: '#/components/responses/RespostaLista'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 */

// Aplicar middleware de paginação para rotas que listam dados
router.use(validarPaginacao);

// Rotas principais
router.post('/', PassageiroController.criar);
router.get('/', PassageiroController.listarTodos);

// Rotas com ID
router.get('/:id', validarUUID('id'), PassageiroController.buscarPorId);
router.put('/:id', validarUUID('id'), PassageiroController.atualizar);
router.delete('/:id', validarUUID('id'), PassageiroController.remover);

// Rotas especiais
router.get('/telefone/:telefone', PassageiroController.buscarPorTelefone);
router.get('/buscar/:nome', PassageiroController.buscarPorNome);

export default router; 