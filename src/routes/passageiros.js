import express from 'express';
import { PassageiroController } from '../controllers/PassageiroController.js';
import { validarUUID, validarPaginacao } from '../middleware/validacao.js';

const router = express.Router();

/**
 * @swagger
 * /passageiros:
 *   post:
 *     summary: Criar um novo passageiro
 *     description: Cria um novo passageiro no sistema com nome e telefone único
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
 *         description: ✅ Passageiro criado com sucesso! O sistema registrou um novo passageiro com o nome e telefone fornecidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaCriacao'
 *       400:
 *         description: ❌ Dados inválidos! Verifique se o nome tem entre 3-80 caracteres e o telefone está no formato +5511999999999
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
 *       409:
 *         description: ❌ Conflito! Este telefone já está sendo usado por outro passageiro. Use um telefone diferente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroConflito'
 * 
 *   get:
 *     summary: Listar todos os passageiros
 *     description: Retorna uma lista paginada de todos os passageiros cadastrados no sistema
 *     tags: [Passageiros]
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página (começa em 1)
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Quantidade de passageiros por página (máximo 100)
 *     responses:
 *       200:
 *         description: ✅ Lista de passageiros retornada com sucesso! A resposta inclui os dados paginados e metadados de navegação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaLista'
 *       400:
 *         description: ❌ Parâmetros de paginação inválidos! Verifique se a página é ≥ 1 e o limite está entre 1-100.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
 * 
 * /passageiros/{id}:
 *   get:
 *     summary: Buscar passageiro por ID
 *     description: Retorna os dados completos de um passageiro específico usando seu ID único
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do passageiro (formato UUID)
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: ✅ Passageiro encontrado com sucesso! Retorna todos os dados do passageiro solicitado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       400:
 *         description: ❌ ID inválido! O ID fornecido não está no formato UUID correto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
 *       404:
 *         description: ❌ Passageiro não encontrado! Não existe passageiro com este ID no sistema.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroNaoEncontrado'
 * 
 *   put:
 *     summary: Atualizar dados do passageiro
 *     description: Atualiza os dados de um passageiro existente (nome e/ou telefone)
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do passageiro a ser atualizado
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
 *                 description: Novo nome do passageiro (opcional)
 *                 example: "João Silva Santos Atualizado"
 *               telefoneE164:
 *                 type: string
 *                 pattern: '^\+[0-9]{10,15}$'
 *                 description: Novo telefone do passageiro (opcional)
 *                 example: "+5511999999999"
 *     responses:
 *       200:
 *         description: ✅ Passageiro atualizado com sucesso! Os dados foram modificados conforme solicitado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       400:
 *         description: ❌ Dados inválidos! Verifique se o nome tem entre 3-80 caracteres e o telefone está no formato correto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
 *       404:
 *         description: ❌ Passageiro não encontrado! Não existe passageiro com este ID para atualizar.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroNaoEncontrado'
 *       409:
 *         description: ❌ Conflito! O novo telefone já está sendo usado por outro passageiro.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroConflito'
 * 
 *   delete:
 *     summary: Remover passageiro do sistema
 *     description: Remove permanentemente um passageiro e todos os seus dados do sistema
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do passageiro a ser removido
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       204:
 *         description: ✅ Passageiro removido com sucesso! O passageiro foi excluído permanentemente do sistema.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaExclusao'
 *       400:
 *         description: ❌ ID inválido! O ID fornecido não está no formato UUID correto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
 *       404:
 *         description: ❌ Passageiro não encontrado! Não existe passageiro com este ID para remover.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroNaoEncontrado'
 * 
 * /passageiros/telefone/{telefone}:
 *   get:
 *     summary: Buscar passageiro por telefone
 *     description: Busca um passageiro específico usando seu número de telefone
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
 *         description: ✅ Passageiro encontrado com sucesso! Retorna os dados do passageiro com este telefone.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       400:
 *         description: ❌ Telefone inválido! O telefone deve estar no formato +5511999999999.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
 *       404:
 *         description: ❌ Passageiro não encontrado! Não existe passageiro com este telefone no sistema.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroNaoEncontrado'
 * 
 * /passageiros/buscar/{nome}:
 *   get:
 *     summary: Buscar passageiros por nome
 *     description: Busca passageiros cujo nome contenha o termo especificado (busca parcial)
 *     tags: [Passageiros]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Termo para busca no nome (mínimo 2 caracteres)
 *         example: "João"
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página (começa em 1)
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Quantidade de resultados por página (máximo 100)
 *     responses:
 *       200:
 *         description: ✅ Busca realizada com sucesso! Retorna passageiros cujo nome contém o termo buscado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaLista'
 *       400:
 *         description: ❌ Termo de busca inválido! O termo deve ter pelo menos 2 caracteres.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
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