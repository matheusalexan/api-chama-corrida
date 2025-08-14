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
 *         description: Passageiro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Passageiro'
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ErroPadrao'
 *         examples:
 *           erroValidacao:
 *             value:
 *               codigo: "ERRO_VALIDACAO"
 *               mensagem: "Validação falhou: Nome deve ter entre 3 e 80 caracteres"
 *               detalhes: {}
 *       409:
 *         $ref: '#/components/responses/ErroPadrao'
 *         examples:
 *           telefoneDuplicado:
 *             value:
 *               codigo: "REGRA_NEGOCIO"
 *               mensagem: "Telefone já está em uso por outro passageiro"
 *               detalhes: { "telefone": "+5511999999999" }
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
 *         description: Lista de passageiros retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Passageiro'
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
 *       400:
 *         $ref: '#/components/responses/ErroPadrao'
 *         examples:
 *           paginacaoInvalida:
 *             value:
 *               codigo: "ERRO_VALIDACAO"
 *               mensagem: "Parâmetro limite deve ser um número entre 1 e 100"
 *               detalhes: {}
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
 *         description: Passageiro encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Passageiro'
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ErroPadrao'
 *         examples:
 *           uuidInvalido:
 *             value:
 *               codigo: "ERRO_VALIDACAO"
 *               mensagem: "Parâmetro id deve ser um UUID válido"
 *               detalhes: {}
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 *         examples:
 *           naoEncontrado:
 *             value:
 *               codigo: "NAO_ENCONTRADO"
 *               mensagem: "Passageiro não encontrado"
 *               detalhes: { "id": "123e4567-e89b-12d3-a456-426614174000" }
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
 *                 description: Novo nome do passageiro
 *                 example: "João Silva Santos"
 *               telefoneE164:
 *                 type: string
 *                 pattern: '^\+[0-9]{10,15}$'
 *                 description: Novo número de telefone
 *                 example: "+5511999999999"
 *     responses:
 *       200:
 *         description: Passageiro atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Passageiro'
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
 *       200:
 *         description: Passageiro removido com sucesso
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
 *                       example: "Passageiro removido com sucesso"
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
 * /passageiros/telefone/{telefone}:
 *   get:
 *     summary: Buscar passageiro por telefone
 *     description: Retorna um passageiro baseado no número de telefone
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
 *         description: Passageiro encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   $ref: '#/components/schemas/Passageiro'
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/ErroPadrao'
 * 
 * /passageiros/buscar/{nome}:
 *   get:
 *     summary: Buscar passageiros por nome
 *     description: Busca passageiros cujo nome contenha o termo fornecido
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Nome ou parte do nome para busca
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
 *         description: Busca realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Passageiro'
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
 *       400:
 *         $ref: '#/components/responses/ErroPadrao'
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