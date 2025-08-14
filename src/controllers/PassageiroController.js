import { PassageiroService } from '../models/Passageiro.js';
import { asyncErrorHandler } from '../middleware/errorHandler.js';
import { criarRespostaSucesso, criarRespostaCriacao, criarRespostaLista, aplicarPaginacao, criarRespostaNaoEncontrado, criarRespostaValidacao, criarRespostaRegraNegocio } from '../utils/respostas.js';

/**
 * Controller para operações relacionadas aos passageiros
 */
export class PassageiroController {
  /**
   * Cria um novo passageiro
   * @route POST /api/v1/passageiros
   */
  static criar = asyncErrorHandler(async (req, res) => {
    const { nome, telefoneE164 } = req.body;

    // Validações
    if (!nome || typeof nome !== 'string' || nome.length < 3 || nome.length > 80) {
      return res.status(400).json(criarRespostaValidacao([
        { campo: 'nome', mensagem: 'Nome deve ter entre 3 e 80 caracteres', valor: nome }
      ], 'passageiro'));
    }

    if (!telefoneE164 || !/^\+[0-9]{10,15}$/.test(telefoneE164)) {
      return res.status(400).json(criarRespostaValidacao([
        { campo: 'telefoneE164', mensagem: 'Telefone deve estar no formato E.164 (ex: +5511999999999)', valor: telefoneE164 }
      ], 'passageiro'));
    }

    // Verifica se o telefone já está em uso
    const telefoneExistente = PassageiroService.buscarPorTelefone(telefoneE164);
    if (telefoneExistente) {
      return res.status(409).json(criarRespostaRegraNegocio(
        'Telefone já está em uso por outro passageiro',
        { telefone: telefoneE164 },
        'passageiro'
      ));
    }

    const passageiro = PassageiroService.criar(nome, telefoneE164);
    return res.status(201).json(criarRespostaCriacao(passageiro, 'passageiro'));
  });

  /**
   * Busca um passageiro por ID
   * @route GET /api/v1/passageiros/:id
   */
  static buscarPorId = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const passageiro = PassageiroService.buscarPorId(id);
    
    if (!passageiro) {
      return res.status(404).json(criarRespostaNaoEncontrado('passageiro', id, 'passageiro'));
    }

    res.json(criarRespostaSucesso(passageiro, 'passageiro'));
  });

  /**
   * Lista todos os passageiros com paginação
   * @route GET /api/v1/passageiros
   */
  static listarTodos = asyncErrorHandler(async (req, res) => {
    const { pagina, limite } = req.query;
    
    const todosPassageiros = PassageiroService.listarTodos();
    const total = todosPassageiros.length;
    
    // Aplica paginação
    const { dados, meta } = aplicarPaginacao(todosPassageiros, parseInt(pagina), parseInt(limite));
    
    res.json(criarRespostaLista(dados, meta, total, 'passageiro'));
  });

  /**
   * Busca passageiro por telefone
   * @route GET /api/v1/passageiros/telefone/:telefone
   */
  static buscarPorTelefone = asyncErrorHandler(async (req, res) => {
    const { telefone } = req.params;

    const passageiro = PassageiroService.buscarPorTelefone(telefone);
    
    if (!passageiro) {
      return res.status(404).json(criarRespostaNaoEncontrado('passageiro', telefone, 'passageiro'));
    }

    res.json(criarRespostaSucesso(passageiro, 'passageiro'));
  });

  /**
   * Atualiza um passageiro existente
   * @route PUT /api/v1/passageiros/:id
   */
  static atualizar = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, telefoneE164 } = req.body;

    const passageiro = PassageiroService.buscarPorId(id);
    
    if (!passageiro) {
      return res.status(404).json(criarRespostaNaoEncontrado('passageiro', id, 'passageiro'));
    }

    // Validações
    if (nome !== undefined) {
      if (typeof nome !== 'string' || nome.length < 3 || nome.length > 80) {
        return res.status(400).json(criarRespostaValidacao([
          { campo: 'nome', mensagem: 'Nome deve ter entre 3 e 80 caracteres', valor: nome }
        ], 'passageiro'));
      }
      passageiro.nome = nome;
    }

    if (telefoneE164 !== undefined) {
      if (!/^\+[0-9]{10,15}$/.test(telefoneE164)) {
        return res.status(400).json(criarRespostaValidacao([
          { campo: 'telefoneE164', mensagem: 'Telefone deve estar no formato E.164 (ex: +5511999999999)', valor: telefoneE164 }
        ], 'passageiro'));
      }

      // Verifica se o telefone já está em uso por outro passageiro
      const outroPassageiro = PassageiroService.buscarPorTelefone(telefoneE164);
      if (outroPassageiro && outroPassageiro.id !== id) {
        return res.status(409).json(criarRespostaRegraNegocio(
          'Telefone já está em uso por outro passageiro',
          { telefone: telefoneE164 },
          'passageiro'
        ));
      }

      passageiro.telefoneE164 = telefoneE164;
    }

    // Atualiza o passageiro
    const passageiroAtualizado = PassageiroService.atualizar(id, passageiro);
    
    res.json(criarRespostaSucesso(passageiroAtualizado, 'passageiro'));
  });

  /**
   * Remove um passageiro
   * @route DELETE /api/v1/passageiros/:id
   */
  static remover = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const passageiro = PassageiroService.buscarPorId(id);
    
    if (!passageiro) {
      return res.status(404).json(criarRespostaNaoEncontrado('passageiro', id, 'passageiro'));
    }

    PassageiroService.deletar(id);
    
    res.status(204).json({
      sucesso: true,
      mensagem: 'Passageiro removido com sucesso',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Busca passageiros por nome
   * @route GET /api/v1/passageiros/buscar/:nome
   */
  static buscarPorNome = asyncErrorHandler(async (req, res) => {
    const { nome } = req.params;
    const { pagina, limite } = req.query;

    if (!nome || nome.length < 2) {
      return res.status(400).json(criarRespostaValidacao([
        { campo: 'nome', mensagem: 'Nome deve ter pelo menos 2 caracteres', valor: nome }
      ], 'passageiro'));
    }

    const passageiros = PassageiroService.buscarPorNome(nome);
    const total = passageiros.length;
    
    // Aplica paginação
    const { dados, meta } = aplicarPaginacao(passageiros, parseInt(pagina), parseInt(limite));
    
    res.json(criarRespostaLista(dados, meta, total, 'passageiro'));
  });
} 