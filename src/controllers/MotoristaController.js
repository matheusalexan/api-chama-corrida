import { MotoristaService } from '../models/Motorista.js';
import { asyncErrorHandler } from '../middleware/errorHandler.js';
import { criarRespostaSucesso, criarRespostaCriacao, criarRespostaLista, aplicarPaginacao } from '../utils/respostas.js';

/**
 * Controller para operações relacionadas aos motoristas
 */
export class MotoristaController {
  /**
   * Cria um novo motorista
   * @route POST /api/v1/motoristas
   */
  static criar = asyncErrorHandler(async (req, res) => {
    const { nome, telefoneE164, categoria } = req.body;

    const motorista = MotoristaService.criar(nome, telefoneE164, categoria);
    
    res.status(201).json(criarRespostaCriacao(motorista));
  });

  /**
   * Busca um motorista por ID
   * @route GET /api/v1/motoristas/:id
   */
  static buscarPorId = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const motorista = MotoristaService.buscarPorId(id);
    
    if (!motorista) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Motorista não encontrado',
        detalhes: { id }
      });
    }

    res.json(criarRespostaSucesso(motorista));
  });

  /**
   * Lista todos os motoristas com paginação
   * @route GET /api/v1/motoristas
   */
  static listarTodos = asyncErrorHandler(async (req, res) => {
    const { paginacao } = req;
    
    const todosMotoristas = MotoristaService.listarTodos();
    const total = todosMotoristas.length;
    
    // Aplica paginação
    const motoristasPaginados = aplicarPaginacao(todosMotoristas, paginacao);
    
    res.json(criarRespostaLista(motoristasPaginados, paginacao, total));
  });

  /**
   * Busca motorista por telefone
   * @route GET /api/v1/motoristas/telefone/:telefone
   */
  static buscarPorTelefone = asyncErrorHandler(async (req, res) => {
    const { telefone } = req.params;

    const motorista = MotoristaService.buscarPorTelefone(telefone);
    
    if (!motorista) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Motorista não encontrado',
        detalhes: { telefone }
      });
    }

    res.json(criarRespostaSucesso(motorista));
  });

  /**
   * Busca motoristas disponíveis
   * @route GET /api/v1/motoristas/disponiveis
   */
  static buscarDisponiveis = asyncErrorHandler(async (req, res) => {
    const { categoria } = req.query;
    const { paginacao } = req;

    const motoristasDisponiveis = MotoristaService.buscarDisponiveis(categoria);
    const total = motoristasDisponiveis.length;
    
    // Aplica paginação
    const motoristasPaginados = aplicarPaginacao(motoristasDisponiveis, paginacao);
    
    res.json(criarRespostaLista(motoristasPaginados, paginacao, total));
  });

  /**
   * Atualiza um motorista existente
   * @route PUT /api/v1/motoristas/:id
   */
  static atualizar = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, telefoneE164, categoria } = req.body;

    const motorista = MotoristaService.buscarPorId(id);
    
    if (!motorista) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Motorista não encontrado',
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
      motorista.nome = nome;
    }

    if (telefoneE164 !== undefined) {
      if (!/^\+[0-9]{10,15}$/.test(telefoneE164)) {
        return res.status(400).json({
          codigo: 'ERRO_VALIDACAO',
          mensagem: 'Telefone deve estar no formato E.164 (ex: +5511999999999)',
          detalhes: { telefoneE164 }
        });
      }

      // Verifica se o telefone já está em uso por outro motorista
      const outroMotorista = MotoristaService.buscarPorTelefone(telefoneE164);
      if (outroMotorista && outroMotorista.id !== id) {
        return res.status(409).json({
          codigo: 'REGRA_NEGOCIO',
          mensagem: 'Telefone já está em uso por outro motorista',
          detalhes: { telefoneE164 }
        });
      }

      motorista.telefoneE164 = telefoneE164;
    }

    if (categoria !== undefined) {
      if (!['ECONOMY', 'COMFORT'].includes(categoria)) {
        return res.status(400).json({
          codigo: 'ERRO_VALIDACAO',
          mensagem: 'Categoria deve ser ECONOMY ou COMFORT',
          detalhes: { categoria }
        });
      }
      motorista.categoria = categoria;
    }

    // Atualiza timestamp
    motorista.atualizadoEm = new Date().toISOString();

    res.json(criarRespostaSucesso(motorista));
  });

  /**
   * Altera a disponibilidade de um motorista
   * @route PATCH /api/v1/motoristas/:id/disponibilidade
   */
  static alterarDisponibilidade = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const { disponivel } = req.body;

    if (typeof disponivel !== 'boolean') {
      return res.status(400).json({
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Disponibilidade deve ser um valor booleano',
        detalhes: { disponivel }
      });
    }

    const motorista = MotoristaService.alterarDisponibilidade(id, disponivel);
    
    if (!motorista) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Motorista não encontrado',
        detalhes: { id }
      });
    }

    res.json(criarRespostaSucesso(motorista));
  });

  /**
   * Remove um motorista
   * @route DELETE /api/v1/motoristas/:id
   */
  static remover = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const motorista = MotoristaService.buscarPorId(id);
    
    if (!motorista) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Motorista não encontrado',
        detalhes: { id }
      });
    }

    const removido = MotoristaService.deletar(id);
    
    if (removido) {
      res.json(criarRespostaSucesso({
        mensagem: 'Motorista removido com sucesso',
        id
      }));
    } else {
      res.status(500).json({
        codigo: 'ERRO_INTERNO',
        mensagem: 'Erro ao remover motorista',
        detalhes: { id }
      });
    }
  });

  /**
   * Busca motoristas por categoria
   * @route GET /api/v1/motoristas/categoria/:categoria
   */
  static buscarPorCategoria = asyncErrorHandler(async (req, res) => {
    const { categoria } = req.params;
    const { paginacao } = req;

    if (!['ECONOMY', 'COMFORT'].includes(categoria)) {
      return res.status(400).json({
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Categoria deve ser ECONOMY ou COMFORT',
        detalhes: { categoria }
      });
    }

    const todosMotoristas = MotoristaService.listarTodos();
    const motoristasFiltrados = todosMotoristas.filter(m => m.categoria === categoria);

    const total = motoristasFiltrados.length;
    const motoristasPaginados = aplicarPaginacao(motoristasFiltrados, paginacao);

    res.json(criarRespostaLista(motoristasPaginados, paginacao, total));
  });

  /**
   * Busca motoristas por nome (busca parcial)
   * @route GET /api/v1/motoristas/buscar/:nome
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

    const todosMotoristas = MotoristaService.listarTodos();
    const motoristasFiltrados = todosMotoristas.filter(m => 
      m.nome.toLowerCase().includes(nome.toLowerCase())
    );

    const total = motoristasFiltrados.length;
    const motoristasPaginados = aplicarPaginacao(motoristasFiltrados, paginacao);

    res.json(criarRespostaLista(motoristasPaginados, paginacao, total));
  });
} 