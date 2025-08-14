/**
 * @swagger
 * components:
 *   schemas:
 *     Corrida:
 *       type: object
 *       required:
 *         - pedidoId
 *         - motoristaId
 *         - passageiroId
 *         - precoEstimado
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da corrida (UUID v4)
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         pedidoId:
 *           type: string
 *           format: uuid
 *           description: ID do pedido de corrida associado
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         motoristaId:
 *           type: string
 *           format: uuid
 *           description: ID do motorista responsável pela corrida
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         passageiroId:
 *           type: string
 *           format: uuid
 *           description: ID do passageiro que solicitou a corrida
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         status:
 *           type: string
 *           enum: [MOTORISTA_A_CAMINHO, EM_ANDAMENTO, CONCLUIDA, CANCELADA_PELO_PASSAGEIRO, CANCELADA_PELO_MOTORISTA]
 *           description: Status atual da corrida
 *           default: "MOTORISTA_A_CAMINHO"
 *           example: "MOTORISTA_A_CAMINHO"
 *         precoEstimado:
 *           type: number
 *           format: float
 *           description: Preço estimado da corrida herdado do pedido
 *           example: 15.50
 *         precoFinal:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Preço final da corrida (pode ser nulo se não finalizada)
 *           example: 15.50
 *         criadoEm:
 *           type: string
 *           format: date-time
 *           description: Data e hora de criação da corrida
 *           example: "2024-01-15T10:30:00.000Z"
 *         atualizadoEm:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização da corrida
 *           example: "2024-01-15T10:30:00.000Z"
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         pedidoId: "123e4567-e89b-12d3-a456-426614174000"
 *         motoristaId: "123e4567-e89b-12d3-a456-426614174000"
 *         passageiroId: "123e4567-e89b-12d3-a456-426614174000"
 *         status: "MOTORISTA_A_CAMINHO"
 *         precoEstimado: 15.50
 *         precoFinal: null
 *         criadoEm: "2024-01-15T10:30:00.000Z"
 *         atualizadoEm: "2024-01-15T10:30:00.000Z"
 */

import { v4 as uuidv4 } from 'uuid';

export class Corrida {
  constructor(pedidoId, motoristaId, passageiroId, precoEstimado) {
    this.id = uuidv4();
    this.pedidoId = pedidoId;
    this.motoristaId = motoristaId;
    this.passageiroId = passageiroId;
    this.status = 'MOTORISTA_A_CAMINHO';
    this.precoEstimado = precoEstimado;
    this.precoFinal = null;
    this.criadoEm = new Date().toISOString();
    this.atualizadoEm = new Date().toISOString();
  }

  static validar(pedidoId, motoristaId, passageiroId, precoEstimado) {
    const erros = [];

    // Validação dos IDs
    if (!pedidoId || typeof pedidoId !== 'string') {
      erros.push('ID do pedido é obrigatório e deve ser uma string');
    }

    if (!motoristaId || typeof motoristaId !== 'string') {
      erros.push('ID do motorista é obrigatório e deve ser uma string');
    }

    if (!passageiroId || typeof passageiroId !== 'string') {
      erros.push('ID do passageiro é obrigatório e deve ser uma string');
    }

    // Validação do preço estimado
    if (typeof precoEstimado !== 'number' || precoEstimado <= 0) {
      erros.push('Preço estimado deve ser um número positivo');
    }

    return erros;
  }

  atualizarStatus(novoStatus) {
    const transicoesValidas = {
      'MOTORISTA_A_CAMINHO': ['EM_ANDAMENTO'],
      'EM_ANDAMENTO': ['CONCLUIDA'],
      'CONCLUIDA': [], // Estado final
      'CANCELADA_PELO_PASSAGEIRO': [], // Estado final
      'CANCELADA_PELO_MOTORISTA': [] // Estado final
    };

    if (!transicoesValidas[this.status].includes(novoStatus)) {
      throw new Error(`Transição de status inválida: ${this.status} → ${novoStatus}`);
    }

    this.status = novoStatus;
    this.atualizadoEm = new Date().toISOString();
    return true;
  }

  cancelarPeloPassageiro() {
    if (this.status === 'CONCLUIDA') {
      throw new Error('Não é possível cancelar uma corrida já concluída');
    }

    this.status = 'CANCELADA_PELO_PASSAGEIRO';
    this.precoFinal = 7.00; // Multa conforme RN-10
    this.atualizadoEm = new Date().toISOString();
    return true;
  }

  cancelarPeloMotorista() {
    if (this.status === 'CONCLUIDA') {
      throw new Error('Não é possível cancelar uma corrida já concluída');
    }

    this.status = 'CANCELADA_PELO_MOTORISTA';
    this.precoFinal = 0; // Preço zero conforme RN-11
    this.atualizadoEm = new Date().toISOString();
    return true;
  }

  concluir() {
    if (this.status !== 'EM_ANDAMENTO') {
      throw new Error('Só é possível concluir uma corrida em andamento');
    }

    this.status = 'CONCLUIDA';
    this.precoFinal = this.precoEstimado; // Preço padrão conforme RN-12
    this.atualizadoEm = new Date().toISOString();
    return true;
  }

  isCancelavel() {
    return this.status !== 'CONCLUIDA';
  }

  isFinalizada() {
    return ['CONCLUIDA', 'CANCELADA_PELO_PASSAGEIRO', 'CANCELADA_PELO_MOTORISTA'].includes(this.status);
  }
}

// Armazenamento em memória
export const corridas = new Map();

// Métodos de acesso aos dados
export const CorridaService = {
  criar(pedidoId, motoristaId, passageiroId, precoEstimado) {
    const erros = Corrida.validar(pedidoId, motoristaId, passageiroId, precoEstimado);
    if (erros.length > 0) {
      throw new Error(`Validação falhou: ${erros.join(', ')}`);
    }

    const corrida = new Corrida(pedidoId, motoristaId, passageiroId, precoEstimado);
    corridas.set(corrida.id, corrida);
    return corrida;
  },

  buscarPorId(id) {
    return corridas.get(id) || null;
  },

  buscarPorPedido(pedidoId) {
    return Array.from(corridas.values()).find(c => c.pedidoId === pedidoId) || null;
  },

  buscarPorMotorista(motoristaId) {
    return Array.from(corridas.values()).filter(c => c.motoristaId === motoristaId);
  },

  buscarPorPassageiro(passageiroId) {
    return Array.from(corridas.values()).filter(c => c.passageiroId === passageiroId);
  },

  buscarPorStatus(status) {
    return Array.from(corridas.values()).filter(c => c.status === status);
  },

  listarTodas() {
    return Array.from(corridas.values());
  },

  atualizarStatus(id, novoStatus) {
    const corrida = corridas.get(id);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }

    return corrida.atualizarStatus(novoStatus);
  },

  cancelarPeloPassageiro(id) {
    const corrida = corridas.get(id);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }

    return corrida.cancelarPeloPassageiro();
  },

  cancelarPeloMotorista(id) {
    const corrida = corridas.get(id);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }

    return corrida.cancelarPeloMotorista();
  },

  concluir(id) {
    const corrida = corridas.get(id);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }

    return corrida.concluir();
  },

  deletar(id) {
    return corridas.delete(id);
  }
}; 