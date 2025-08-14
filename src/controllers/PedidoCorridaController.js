import { PedidoCorridaService } from '../models/PedidoCorrida.js';
import { PassageiroService } from '../models/Passageiro.js';
import { MotoristaService } from '../models/Motorista.js';
import { CorridaService } from '../models/Corrida.js';
import { asyncErrorHandler } from '../middleware/errorHandler.js';
import { criarRespostaSucesso, criarRespostaCriacao, criarRespostaLista, aplicarPaginacao } from '../utils/respostas.js';

/**
 * Controller para operações relacionadas aos pedidos de corrida
 */
export class PedidoCorridaController {
  /**
   * Cria um novo pedido de corrida
   * @route POST /api/v1/pedidos-corrida
   */
  static criar = asyncErrorHandler(async (req, res) => {
    const { passageiroId, origemLat, origemLng, destinoLat, destinoLng, categoria } = req.body;

    // Verifica se o passageiro existe
    const passageiro = PassageiroService.buscarPorId(passageiroId);
    if (!passageiro) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Passageiro não encontrado',
        detalhes: { passageiroId }
      });
    }

    const pedido = PedidoCorridaService.criar(passageiroId, origemLat, origemLng, destinoLat, destinoLng, categoria);
    
    res.status(201).json(criarRespostaCriacao(pedido));
  });

  /**
   * Busca um pedido de corrida por ID
   * @route GET /api/v1/pedidos-corrida/:id
   */
  static buscarPorId = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const pedido = PedidoCorridaService.buscarPorId(id);
    
    if (!pedido) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Pedido de corrida não encontrado',
        detalhes: { id }
      });
    }

    res.json(criarRespostaSucesso(pedido));
  });

  /**
   * Lista todos os pedidos de corrida com paginação
   * @route GET /api/v1/pedidos-corrida
   */
  static listarTodos = asyncErrorHandler(async (req, res) => {
    const { paginacao } = req;
    
    const todosPedidos = PedidoCorridaService.listarTodos();
    const total = todosPedidos.length;
    
    // Aplica paginação
    const pedidosPaginados = aplicarPaginacao(todosPedidos, paginacao);
    
    res.json(criarRespostaLista(pedidosPaginados, paginacao, total));
  });

  /**
   * Busca pedidos por passageiro
   * @route GET /api/v1/pedidos-corrida/passageiro/:passageiroId
   */
  static buscarPorPassageiro = asyncErrorHandler(async (req, res) => {
    const { passageiroId } = req.params;
    const { paginacao } = req;

    // Verifica se o passageiro existe
    const passageiro = PassageiroService.buscarPorId(passageiroId);
    if (!passageiro) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Passageiro não encontrado',
        detalhes: { passageiroId }
      });
    }

    const pedidos = PedidoCorridaService.buscarPorPassageiro(passageiroId);
    const total = pedidos.length;
    
    // Aplica paginação
    const pedidosPaginados = aplicarPaginacao(pedidos, paginacao);
    
    res.json(criarRespostaLista(pedidosPaginados, paginacao, total));
  });

  /**
   * Busca pedidos por status
   * @route GET /api/v1/pedidos-corrida/status/:status
   */
  static buscarPorStatus = asyncErrorHandler(async (req, res) => {
    const { status } = req.params;
    const { paginacao } = req;

    const statusValidos = ['PROCURANDO', 'MOTORISTA_ATRIBUIDO', 'CANCELADO', 'EXPIRADO'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Status inválido',
        detalhes: { status, statusValidos }
      });
    }

    const pedidos = PedidoCorridaService.buscarPorStatus(status);
    const total = pedidos.length;
    
    // Aplica paginação
    const pedidosPaginados = aplicarPaginacao(pedidos, paginacao);
    
    res.json(criarRespostaLista(pedidosPaginados, paginacao, total));
  });

  /**
   * Cancela um pedido de corrida
   * @route POST /api/v1/pedidos-corrida/:id/cancelar
   */
  static cancelar = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const pedido = PedidoCorridaService.buscarPorId(id);
    
    if (!pedido) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Pedido de corrida não encontrado',
        detalhes: { id }
      });
    }

    if (!pedido.isCancelavel()) {
      return res.status(422).json({
        codigo: 'ESTADO_INVALIDO',
        mensagem: 'Pedido não pode ser cancelado neste estado',
        detalhes: { status: pedido.status }
      });
    }

    const cancelado = PedidoCorridaService.cancelar(id);
    
    if (cancelado) {
      res.json(criarRespostaSucesso({
        mensagem: 'Pedido cancelado com sucesso',
        id,
        status: pedido.status
      }));
    } else {
      res.status(500).json({
        codigo: 'ERRO_INTERNO',
        mensagem: 'Erro ao cancelar pedido',
        detalhes: { id }
      });
    }
  });

  /**
   * Aceita um pedido de corrida (motorista)
   * @route POST /api/v1/pedidos-corrida/:id/aceitar
   */
  static aceitar = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const { motoristaId } = req.body;

    if (!motoristaId) {
      return res.status(400).json({
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'ID do motorista é obrigatório',
        detalhes: {}
      });
    }

    // Verifica se o pedido existe
    const pedido = PedidoCorridaService.buscarPorId(id);
    if (!pedido) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Pedido de corrida não encontrado',
        detalhes: { id }
      });
    }

    // Verifica se o motorista existe
    const motorista = MotoristaService.buscarPorId(motoristaId);
    if (!motorista) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Motorista não encontrado',
        detalhes: { motoristaId }
      });
    }

    // Verifica se o motorista está disponível
    if (!motorista.disponivel) {
      return res.status(422).json({
        codigo: 'ESTADO_INVALIDO',
        mensagem: 'Motorista não está disponível',
        detalhes: { motoristaId, disponivel: motorista.disponivel }
      });
    }

    // Verifica se o pedido ainda está disponível para aceite
    if (pedido.status !== 'PROCURANDO') {
      return res.status(422).json({
        codigo: 'ESTADO_INVALIDO',
        mensagem: 'Pedido não está mais disponível para aceite',
        detalhes: { status: pedido.status }
      });
    }

    // Atribui o motorista ao pedido
    const atribuido = PedidoCorridaService.atribuirMotorista(id);
    
    if (!atribuido) {
      return res.status(422).json({
        codigo: 'ESTADO_INVALIDO',
        mensagem: 'Não foi possível atribuir motorista ao pedido',
        detalhes: { status: pedido.status }
      });
    }

    // Cria a corrida
    const corrida = CorridaService.criar(
      id, 
      motoristaId, 
      pedido.passageiroId, 
      pedido.precoEstimado
    );

    // Marca o motorista como indisponível
    MotoristaService.alterarDisponibilidade(motoristaId, false);

    res.json(criarRespostaSucesso({
      mensagem: 'Pedido aceito com sucesso',
      pedido: {
        id: pedido.id,
        status: pedido.status
      },
      corrida: {
        id: corrida.id,
        status: corrida.status
      }
    }));
  });

  /**
   * Remove um pedido de corrida
   * @route DELETE /api/v1/pedidos-corrida/:id
   */
  static remover = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const pedido = PedidoCorridaService.buscarPorId(id);
    
    if (!pedido) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Pedido de corrida não encontrado',
        detalhes: { id }
      });
    }

    const removido = PedidoCorridaService.deletar(id);
    
    if (removido) {
      res.json(criarRespostaSucesso({
        mensagem: 'Pedido removido com sucesso',
        id
      }));
    } else {
      res.status(500).json({
        codigo: 'ERRO_INTERNO',
        mensagem: 'Erro ao remover pedido',
        detalhes: { id }
      });
    }
  });

  /**
   * Busca pedidos por categoria
   * @route GET /api/v1/pedidos-corrida/categoria/:categoria
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

    const todosPedidos = PedidoCorridaService.listarTodos();
    const pedidosFiltrados = todosPedidos.filter(p => p.categoria === categoria);

    const total = pedidosFiltrados.length;
    const pedidosPaginados = aplicarPaginacao(pedidosFiltrados, paginacao);

    res.json(criarRespostaLista(pedidosPaginados, paginacao, total));
  });

  /**
   * Limpa pedidos expirados
   * @route POST /api/v1/pedidos-corrida/limpar-expirados
   */
  static limparExpirados = asyncErrorHandler(async (req, res) => {
    const todosPedidos = PedidoCorridaService.listarTodos();
    const pedidosExpirados = todosPedidos.filter(p => p.isExpirado() && p.status === 'PROCURANDO');
    
    // Limpa os expirados
    PedidoCorridaService.limparExpirados();
    
    res.json(criarRespostaSucesso({
      mensagem: 'Pedidos expirados limpos com sucesso',
      quantidade: pedidosExpirados.length
    }));
  });
} 