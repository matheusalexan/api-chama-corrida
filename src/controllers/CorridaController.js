import { CorridaService } from '../models/Corrida.js';
import { PedidoCorridaService } from '../models/PedidoCorrida.js';
import { MotoristaService } from '../models/Motorista.js';
import { asyncErrorHandler } from '../middleware/errorHandler.js';
import { criarRespostaSucesso, criarRespostaLista, aplicarPaginacao } from '../utils/respostas.js';

/**
 * Controller para operações relacionadas às corridas
 */
export class CorridaController {
  /**
   * Busca uma corrida por ID
   * @route GET /api/v1/corridas/:id
   */
  static buscarPorId = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const corrida = CorridaService.buscarPorId(id);
    
    if (!corrida) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Corrida não encontrada',
        detalhes: { id }
      });
    }

    res.json(criarRespostaSucesso(corrida));
  });

  /**
   * Lista todas as corridas com paginação
   * @route GET /api/v1/corridas
   */
  static listarTodas = asyncErrorHandler(async (req, res) => {
    const { paginacao } = req;
    
    const todasCorridas = CorridaService.listarTodas();
    const total = todasCorridas.length;
    
    // Aplica paginação
    const corridasPaginadas = aplicarPaginacao(todasCorridas, paginacao);
    
    res.json(criarRespostaLista(corridasPaginadas, paginacao, total));
  });

  /**
   * Busca corridas por motorista
   * @route GET /api/v1/corridas/motorista/:motoristaId
   */
  static buscarPorMotorista = asyncErrorHandler(async (req, res) => {
    const { motoristaId } = req.params;
    const { paginacao } = req;

    // Verifica se o motorista existe
    const motorista = MotoristaService.buscarPorId(motoristaId);
    if (!motorista) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Motorista não encontrado',
        detalhes: { motoristaId }
      });
    }

    const corridas = CorridaService.buscarPorMotorista(motoristaId);
    const total = corridas.length;
    
    // Aplica paginação
    const corridasPaginadas = aplicarPaginacao(corridas, paginacao);
    
    res.json(criarRespostaLista(corridasPaginadas, paginacao, total));
  });

  /**
   * Busca corridas por passageiro
   * @route GET /api/v1/corridas/passageiro/:passageiroId
   */
  static buscarPorPassageiro = asyncErrorHandler(async (req, res) => {
    const { passageiroId } = req.params;
    const { paginacao } = req;

    const corridas = CorridaService.buscarPorPassageiro(passageiroId);
    const total = corridas.length;
    
    // Aplica paginação
    const corridasPaginadas = aplicarPaginacao(corridas, paginacao);
    
    res.json(criarRespostaLista(corridasPaginadas, paginacao, total));
  });

  /**
   * Busca corridas por status
   * @route GET /api/v1/corridas/status/:status
   */
  static buscarPorStatus = asyncErrorHandler(async (req, res) => {
    const { status } = req.params;
    const { paginacao } = req;

    const statusValidos = [
      'MOTORISTA_A_CAMINHO',
      'EM_ANDAMENTO',
      'CONCLUIDA',
      'CANCELADA_PELO_PASSAGEIRO',
      'CANCELADA_PELO_MOTORISTA'
    ];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Status inválido',
        detalhes: { status, statusValidos }
      });
    }

    const corridas = CorridaService.buscarPorStatus(status);
    const total = corridas.length;
    
    // Aplica paginação
    const corridasPaginadas = aplicarPaginacao(corridas, paginacao);
    
    res.json(criarRespostaLista(corridasPaginadas, paginacao, total));
  });

  /**
   * Atualiza o status de uma corrida
   * @route POST /api/v1/corridas/:id/status
   */
  static atualizarStatus = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Status é obrigatório',
        detalhes: {}
      });
    }

    const statusValidos = [
      'MOTORISTA_A_CAMINHO',
      'EM_ANDAMENTO',
      'CONCLUIDA'
    ];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Status inválido para atualização',
        detalhes: { status, statusValidos }
      });
    }

    const corrida = CorridaService.buscarPorId(id);
    
    if (!corrida) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Corrida não encontrada',
        detalhes: { id }
      });
    }

    try {
      const atualizada = CorridaService.atualizarStatus(id, status);
      
      if (atualizada) {
        // Busca a corrida atualizada
        const corridaAtualizada = CorridaService.buscarPorId(id);
        
        res.json(criarRespostaSucesso({
          mensagem: 'Status da corrida atualizado com sucesso',
          corrida: corridaAtualizada
        }));
      } else {
        res.status(500).json({
          codigo: 'ERRO_INTERNO',
          mensagem: 'Erro ao atualizar status da corrida',
          detalhes: { id }
        });
      }
    } catch (erro) {
      res.status(422).json({
        codigo: 'ESTADO_INVALIDO',
        mensagem: erro.message,
        detalhes: { 
          id, 
          statusAtual: corrida.status,
          novoStatus: status 
        }
      });
    }
  });

  /**
   * Cancela uma corrida pelo passageiro
   * @route POST /api/v1/corridas/:id/cancelar
   */
  static cancelarPeloPassageiro = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const corrida = CorridaService.buscarPorId(id);
    
    if (!corrida) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Corrida não encontrada',
        detalhes: { id }
      });
    }

    if (!corrida.isCancelavel()) {
      return res.status(422).json({
        codigo: 'ESTADO_INVALIDO',
        mensagem: 'Corrida não pode ser cancelada neste estado',
        detalhes: { status: corrida.status }
      });
    }

    try {
      const cancelada = CorridaService.cancelarPeloPassageiro(id);
      
      if (cancelada) {
        // Busca a corrida atualizada
        const corridaAtualizada = CorridaService.buscarPorId(id);
        
        // Marca o motorista como disponível novamente
        MotoristaService.alterarDisponibilidade(corrida.motoristaId, true);
        
        res.json(criarRespostaSucesso({
          mensagem: 'Corrida cancelada pelo passageiro com sucesso',
          corrida: corridaAtualizada,
          multa: 'R$ 7,00 aplicada conforme regra de negócio'
        }));
      } else {
        res.status(500).json({
          codigo: 'ERRO_INTERNO',
          mensagem: 'Erro ao cancelar corrida',
          detalhes: { id }
        });
      }
    } catch (erro) {
      res.status(422).json({
        codigo: 'ESTADO_INVALIDO',
        mensagem: erro.message,
        detalhes: { 
          id, 
          status: corrida.status 
        }
      });
    }
  });

  /**
   * Cancela uma corrida pelo motorista
   * @route POST /api/v1/corridas/:id/cancelar-motorista
   */
  static cancelarPeloMotorista = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const corrida = CorridaService.buscarPorId(id);
    
    if (!corrida) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Corrida não encontrada',
        detalhes: { id }
      });
    }

    if (!corrida.isCancelavel()) {
      return res.status(422).json({
        codigo: 'ESTADO_INVALIDO',
        mensagem: 'Corrida não pode ser cancelada neste estado',
        detalhes: { status: corrida.status }
      });
    }

    try {
      const cancelada = CorridaService.cancelarPeloMotorista(id);
      
      if (cancelada) {
        // Busca a corrida atualizada
        const corridaAtualizada = CorridaService.buscarPorId(id);
        
        // Marca o motorista como disponível novamente
        MotoristaService.alterarDisponibilidade(corrida.motoristaId, true);
        
        res.json(criarRespostaSucesso({
          mensagem: 'Corrida cancelada pelo motorista com sucesso',
          corrida: corridaAtualizada,
          precoFinal: 'R$ 0,00 (sem cobrança)'
        }));
      } else {
        res.status(500).json({
          codigo: 'ERRO_INTERNO',
          mensagem: 'Erro ao cancelar corrida',
          detalhes: { id }
        });
      }
    } catch (erro) {
      res.status(422).json({
        codigo: 'ESTADO_INVALIDO',
        mensagem: erro.message,
        detalhes: { 
          id, 
          status: corrida.status 
        }
      });
    }
  });

  /**
   * Conclui uma corrida
   * @route POST /api/v1/corridas/:id/concluir
   */
  static concluir = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const corrida = CorridaService.buscarPorId(id);
    
    if (!corrida) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Corrida não encontrada',
        detalhes: { id }
      });
    }

    try {
      const concluida = CorridaService.concluir(id);
      
      if (concluida) {
        // Busca a corrida atualizada
        const corridaAtualizada = CorridaService.buscarPorId(id);
        
        // Marca o motorista como disponível novamente
        MotoristaService.alterarDisponibilidade(corrida.motoristaId, true);
        
        res.json(criarRespostaSucesso({
          mensagem: 'Corrida concluída com sucesso',
          corrida: corridaAtualizada
        }));
      } else {
        res.status(500).json({
          codigo: 'ERRO_INTERNO',
          mensagem: 'Erro ao concluir corrida',
          detalhes: { id }
        });
      }
    } catch (erro) {
      res.status(422).json({
        codigo: 'ESTADO_INVALIDO',
        mensagem: erro.message,
        detalhes: { 
          id, 
          status: corrida.status 
        }
      });
    }
  });

  /**
   * Remove uma corrida
   * @route DELETE /api/v1/corridas/:id
   */
  static remover = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const corrida = CorridaService.buscarPorId(id);
    
    if (!corrida) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Corrida não encontrada',
        detalhes: { id }
      });
    }

    const removida = CorridaService.deletar(id);
    
    if (removida) {
      res.json(criarRespostaSucesso({
        mensagem: 'Corrida removida com sucesso',
        id
      }));
    } else {
      res.status(500).json({
        codigo: 'ERRO_INTERNO',
        mensagem: 'Erro ao remover corrida',
        detalhes: { id }
      });
    }
  });

  /**
   * Busca corridas por pedido
   * @route GET /api/v1/corridas/pedido/:pedidoId
   */
  static buscarPorPedido = asyncErrorHandler(async (req, res) => {
    const { pedidoId } = req.params;

    // Verifica se o pedido existe
    const pedido = PedidoCorridaService.buscarPorId(pedidoId);
    if (!pedido) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Pedido de corrida não encontrado',
        detalhes: { pedidoId }
      });
    }

    const corrida = CorridaService.buscarPorPedido(pedidoId);
    
    if (!corrida) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Corrida não encontrada para este pedido',
        detalhes: { pedidoId }
      });
    }

    res.json(criarRespostaSucesso(corrida));
  });
} 