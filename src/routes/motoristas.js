import express from 'express';
import { MotoristaController } from '../controllers/MotoristaController.js';
import { validarUUID, validarPaginacao, validarCategoria, validarDisponibilidade } from '../middleware/validacao.js';

const router = express.Router();

/**
 * @swagger
 * /motoristas:
 *   post:
 *     summary: Criar um novo motorista
 *     description: Cria um novo motorista no sistema com nome, telefone único e categoria de veículo
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
 *                 description: Categoria do veículo do motorista
 *                 example: "ECONOMY"
 *     responses:
 *       201:
 *         description: ✅ Motorista criado com sucesso! O sistema registrou um novo motorista com os dados fornecidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaCriacao'
 *       400:
 *         description: ❌ Dados inválidos! Verifique se o nome tem entre 3-80 caracteres, telefone está no formato correto e categoria é ECONOMY ou COMFORT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
 *       409:
 *         description: ❌ Conflito! Este telefone já está sendo usado por outro motorista. Use um telefone diferente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroConflito'
 * 
 *   get:
 *     summary: Listar todos os motoristas
 *     description: Retorna uma lista paginada de todos os motoristas cadastrados no sistema
 *     tags: [Motoristas]
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
 *         description: Quantidade de motoristas por página (máximo 100)
 *     responses:
 *       200:
 *         description: ✅ Lista de motoristas retornada com sucesso! A resposta inclui os dados paginados e metadados de navegação.
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
 * /motoristas/{id}:
 *   get:
 *     summary: Buscar motorista por ID
 *     description: Retorna os dados completos de um motorista específico usando seu ID único
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do motorista (formato UUID)
 *         example: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: ✅ Motorista encontrado com sucesso! Retorna todos os dados do motorista solicitado.
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
 *         description: ❌ Motorista não encontrado! Não existe motorista com este ID no sistema.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroNaoEncontrado'
 * 
 *   put:
 *     summary: Atualizar dados do motorista
 *     description: Atualiza os dados de um motorista existente (nome, telefone e/ou categoria)
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do motorista a ser atualizado
 *         example: "123e4567-e89b-12d3-a456-426614174001"
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
 *                 description: Novo nome do motorista (opcional)
 *                 example: "Carlos Oliveira Atualizado"
 *               telefoneE164:
 *                 type: string
 *                 pattern: '^\+[0-9]{10,15}$'
 *                 description: Novo telefone do motorista (opcional)
 *                 example: "+5511888888888"
 *               categoria:
 *                 type: string
 *                 enum: [ECONOMY, COMFORT]
 *                 description: Nova categoria do veículo (opcional)
 *                 example: "COMFORT"
 *     responses:
 *       200:
 *         description: ✅ Motorista atualizado com sucesso! Os dados foram modificados conforme solicitado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       400:
 *         description: ❌ Dados inválidos! Verifique se o nome tem entre 3-80 caracteres, telefone está no formato correto e categoria é ECONOMY ou COMFORT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
 *       404:
 *         description: ❌ Motorista não encontrado! Não existe motorista com este ID para atualizar.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroNaoEncontrado'
 *       409:
 *         description: ❌ Conflito! O novo telefone já está sendo usado por outro motorista.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroConflito'
 * 
 *   delete:
 *     summary: Remover motorista do sistema
 *     description: Remove permanentemente um motorista e todos os seus dados do sistema
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do motorista a ser removido
 *         example: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       204:
 *         description: ✅ Motorista removido com sucesso! O motorista foi excluído permanentemente do sistema.
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
 *         description: ❌ Motorista não encontrado! Não existe motorista com este ID para remover.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroNaoEncontrado'
 * 
 * /motoristas/{id}/disponibilidade:
 *   patch:
 *     summary: Alterar disponibilidade do motorista
 *     description: Altera se o motorista está disponível ou não para receber corridas
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do motorista
 *         example: "123e4567-e89b-12d3-a456-426614174001"
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
 *                 description: Se o motorista está disponível para corridas
 *                 example: true
 *     responses:
 *       200:
 *         description: ✅ Disponibilidade alterada com sucesso! O motorista agora está marcado como disponível/indisponível conforme solicitado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       400:
 *         description: ❌ Dados inválidos! O campo disponivel deve ser true ou false.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
 *       404:
 *         description: ❌ Motorista não encontrado! Não existe motorista com este ID para alterar disponibilidade.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroNaoEncontrado'
 * 
 * /motoristas/telefone/{telefone}:
 *   get:
 *     summary: Buscar motorista por telefone
 *     description: Busca um motorista específico usando seu número de telefone
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
 *         description: ✅ Motorista encontrado com sucesso! Retorna os dados do motorista com este telefone.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       400:
 *         description: ❌ Telefone inválido! O telefone deve estar no formato +5511888888888.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
 *       404:
 *         description: ❌ Motorista não encontrado! Não existe motorista com este telefone no sistema.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroNaoEncontrado'
 * 
 * /motoristas/disponiveis:
 *   get:
 *     summary: Listar motoristas disponíveis
 *     description: Retorna apenas os motoristas que estão disponíveis para receber corridas
 *     tags: [Motoristas]
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
 *         description: Quantidade de motoristas por página (máximo 100)
 *     responses:
 *       200:
 *         description: ✅ Lista de motoristas disponíveis retornada com sucesso! Apenas motoristas que podem receber corridas.
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
 * /motoristas/categoria/{categoria}:
 *   get:
 *     summary: Filtrar motoristas por categoria
 *     description: Retorna motoristas de uma categoria específica (ECONOMY ou COMFORT)
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ECONOMY, COMFORT]
 *         description: Categoria de veículo para filtrar
 *         example: "ECONOMY"
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
 *         description: Quantidade de motoristas por página (máximo 100)
 *     responses:
 *       200:
 *         description: ✅ Motoristas da categoria solicitada retornados com sucesso! Filtrados por ECONOMY ou COMFORT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaLista'
 *       400:
 *         description: ❌ Categoria inválida! Use apenas ECONOMY ou COMFORT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErroValidacao'
 * 
 * /motoristas/buscar/{nome}:
 *   get:
 *     summary: Buscar motoristas por nome
 *     description: Busca motoristas cujo nome contenha o termo especificado (busca parcial)
 *     tags: [Motoristas]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Termo para busca no nome (mínimo 2 caracteres)
 *         example: "Carlos"
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
 *         description: ✅ Busca realizada com sucesso! Retorna motoristas cujo nome contém o termo buscado.
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
router.post('/', MotoristaController.criar);
router.get('/', MotoristaController.listarTodos);

// Rotas com ID
router.get('/:id', validarUUID('id'), MotoristaController.buscarPorId);
router.put('/:id', validarUUID('id'), MotoristaController.atualizar);
router.delete('/:id', validarUUID('id'), MotoristaController.remover);

// Rotas especiais
router.patch('/:id/disponibilidade', validarUUID('id'), validarDisponibilidade, MotoristaController.alterarDisponibilidade);
router.get('/telefone/:telefone', MotoristaController.buscarPorTelefone);
router.get('/disponiveis', MotoristaController.listarDisponiveis);
router.get('/categoria/:categoria', validarCategoria, MotoristaController.listarPorCategoria);
router.get('/buscar/:nome', MotoristaController.buscarPorNome);

export default router; 