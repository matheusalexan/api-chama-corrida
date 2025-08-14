import { PassageiroService } from '../models/Passageiro.js';
import { asyncErrorHandler } from '../middleware/errorHandler.js';
import { criarRespostaSucesso, criarRespostaCriacao, criarRespostaLista, aplicarPaginacao } from '../utils/respostas.js';

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

    const passageiro = PassageiroService.criar(nome, telefoneE164);
    
    res.status(201).json(criarRespostaCriacao(passageiro));
  });

  /**
   * Busca um passageiro por ID
   * @route GET /api/v1/passageiros/:id
   */
  static buscarPorId = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const passageiro = PassageiroService.buscarPorId(id);
    
    if (!passageiro) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Passageiro não encontrado',
        detalhes: { id }
      });
    }

    res.json(criarRespostaSucesso(passageiro));
  });

  /**
   * Lista todos os passageiros com paginação
   * @route GET /api/v1/passageiros
   */
  static listarTodos = asyncErrorHandler(async (req, res) => {
    const { paginacao } = req;
    
    const todosPassageiros = PassageiroService.listarTodos();
    const total = todosPassageiros.length;
    
    // Aplica paginação
    const passageirosPaginados = aplicarPaginacao(todosPassageiros, paginacao);
    
    res.json(criarRespostaLista(passageirosPaginados, paginacao, total));
  });

  /**
   * Busca passageiro por telefone
   * @route GET /api/v1/passageiros/telefone/:telefone
   */
  static buscarPorTelefone = asyncErrorHandler(async (req, res) => {
    const { telefone } = req.params;

    const passageiro = PassageiroService.buscarPorTelefone(telefone);
    
    if (!passageiro) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Passageiro não encontrado',
        detalhes: { telefone }
      });
    }

    res.json(criarRespostaSucesso(passageiro));
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
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Passageiro não encontrado',
        detalhes: { id }
      });
    }

    // Validações
    if (nome !== undefined) {
      if (typeof nome !== 'string' || nome.length < 3 || nome.length > 80) {
        return res.status(400).json({
          codigo: 'ERRO_VALIDACAO',
          mensagem: 'Nome deve ter entre 3 e 80 caracteres',
          detalhes: { nome }
        });
      }
      passageiro.nome = nome;
    }

    if (telefoneE164 !== undefined) {
      if (!/^\+[0-9]{10,15}$/.test(telefoneE164)) {
        return res.status(400).json({
          codigo: 'ERRO_VALIDACAO',
          mensagem: 'Telefone deve estar no formato E.164 (ex: +5511999999999)',
          detalhes: { telefoneE164 }
        });
      }

      // Verifica se o telefone já está em uso por outro passageiro
      const outroPassageiro = PassageiroService.buscarPorTelefone(telefoneE164);
      if (outroPassageiro && outroPassageiro.id !== id) {
        return res.status(409).json({
          codigo: 'REGRA_NEGOCIO',
          mensagem: 'Telefone já está em uso por outro passageiro',
          detalhes: { telefoneE164 }
        });
      }

      passageiro.telefoneE164 = telefoneE164;
    }

    // Atualiza timestamp
    passageiro.atualizadoEm = new Date().toISOString();

    res.json(criarRespostaSucesso(passageiro));
  });

  /**
   * Remove um passageiro
   * @route DELETE /api/v1/passageiros/:id
   */
  static remover = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const passageiro = PassageiroService.buscarPorId(id);
    
    if (!passageiro) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Passageiro não encontrado',
        detalhes: { id }
      });
    }

    const removido = PassageiroService.deletar(id);
    
    if (removido) {
      res.json(criarRespostaSucesso({
        mensagem: 'Passageiro removido com sucesso',
        id
      }));
    } else {
      res.status(500).json({
        codigo: 'ERRO_INTERNO',
        mensagem: 'Erro ao remover passageiro',
        detalhes: { id }
      });
    }
  });

  /**
   * Busca passageiros por nome (busca parcial)
   * @route GET /api/v1/passageiros/buscar/:nome
   */
  static buscarPorNome = asyncErrorHandler(async (req, res) => {
    const { nome } = req.params;
    const { paginacao } = req;

    if (!nome || nome.length < 2) {
      return res.status(400).json({
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Nome deve ter pelo menos 2 caracteres para busca',
        detalhes: { nome }
      });
    }

    const todosPassageiros = PassageiroService.listarTodos();
    const passageirosFiltrados = todosPassageiros.filter(p => 
      p.nome.toLowerCase().includes(nome.toLowerCase())
    );

    const total = passageirosFiltrados.length;
    const passageirosPaginados = aplicarPaginacao(passageirosFiltrados, paginacao);

    res.json(criarRespostaLista(passageirosPaginados, paginacao, total));
  });
} 