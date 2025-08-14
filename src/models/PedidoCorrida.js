/**
 * @swagger
 * components:
 *   schemas:
 *     PedidoCorrida:
 *       type: object
 *       required:
 *         - passageiroId
 *         - origemLat
 *         - origemLng
 *         - destinoLat
 *         - destinoLng
 *         - categoria
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do pedido (UUID v4)
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         passageiroId:
 *           type: string
 *           format: uuid
 *           description: ID do passageiro que solicitou a corrida
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         origemLat:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *           description: Latitude do ponto de origem
 *           example: -23.5505
 *         origemLng:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *           description: Longitude do ponto de origem
 *           example: -46.6333
 *         destinoLat:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *           description: Latitude do ponto de destino
 *           example: -23.5605
 *         destinoLng:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *           description: Longitude do ponto de destino
 *           example: -46.6433
 *         categoria:
 *           type: string
 *           enum: [ECONOMY, COMFORT]
 *           description: Categoria da corrida solicitada
 *           example: "ECONOMY"
 *         status:
 *           type: string
 *           enum: [PROCURANDO, MOTORISTA_ATRIBUIDO, CANCELADO, EXPIRADO]
 *           description: Status atual do pedido
 *           default: "PROCURANDO"
 *           example: "PROCURANDO"
 *         precoEstimado:
 *           type: number
 *           format: float
 *           description: Preço estimado da corrida calculado automaticamente
 *           example: 15.50
 *         criadoEm:
 *           type: string
 *           format: date-time
 *           description: Data e hora de criação do pedido
 *           example: "2024-01-15T10:30:00.000Z"
 *         expiraEm:
 *           type: string
 *           format: date-time
 *           description: Data e hora de expiração do pedido (90 segundos após criação)
 *           example: "2024-01-15T10:31:30.000Z"
 *         expiraEmSegundos:
 *           type: number
 *           description: Tempo de expiração em segundos
 *           default: 90
 *           example: 90
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         passageiroId: "123e4567-e89b-12d3-a456-426614174000"
 *         origemLat: -23.5505
 *         origemLng: -46.6333
 *         destinoLat: -23.5605
 *         destinoLng: -46.6433
 *         categoria: "ECONOMY"
 *         status: "PROCURANDO"
 *         precoEstimado: 15.50
 *         criadoEm: "2024-01-15T10:30:00.000Z"
 *         expiraEm: "2024-01-15T10:31:30.000Z"
 *         expiraEmSegundos: 90
 */

import { v4 as uuidv4 } from 'uuid';
import { calcularPrecoEstimado, validarCoordenadas, validarOrigemDestinoDiferentes } from '../utils/calculos.js';

export class PedidoCorrida {
  constructor(passageiroId, origemLat, origemLng, destinoLat, destinoLng, categoria) {
    this.id = uuidv4();
    this.passageiroId = passageiroId;
    this.origemLat = origemLat;
    this.origemLng = origemLng;
    this.destinoLat = destinoLat;
    this.destinoLng = destinoLng;
    this.categoria = categoria;
    this.status = 'PROCURANDO';
    this.criadoEm = new Date().toISOString();
    
    // Cálculo do preço estimado conforme RN-06
    this.precoEstimado = calcularPrecoEstimado(origemLat, origemLng, destinoLat, destinoLng, categoria);
    
    // Expiração em 90 segundos conforme RN-05 e RN-07
    this.expiraEmSegundos = 90;
    this.expiraEm = new Date(Date.now() + (this.expiraEmSegundos * 1000)).toISOString();
    
    // Timer de expiração automática
    this.timerExpiracao = setTimeout(() => {
      this.expirar();
    }, this.expiraEmSegundos * 1000);
  }

  static validar(passageiroId, origemLat, origemLng, destinoLat, destinoLng, categoria) {
    const erros = [];

    // Validação do passageiroId
    if (!passageiroId || typeof passageiroId !== 'string') {
      erros.push('ID do passageiro é obrigatório e deve ser uma string');
    }

    // Validação das coordenadas
    if (!validarCoordenadas(origemLat, origemLng)) {
      erros.push('Coordenadas de origem inválidas');
    }
    
    if (!validarCoordenadas(destinoLat, destinoLng)) {
      erros.push('Coordenadas de destino inválidas');
    }

    // Validação de origem diferente do destino
    if (!validarOrigemDestinoDiferentes(origemLat, origemLng, destinoLat, destinoLng)) {
      erros.push('Origem e destino não podem ser iguais');
    }

    // Validação da categoria
    if (!categoria || !['ECONOMY', 'COMFORT'].includes(categoria)) {
      erros.push('Categoria deve ser ECONOMY ou COMFORT');
    }

    return erros;
  }

  expirar() {
    if (this.status === 'PROCURANDO') {
      this.status = 'EXPIRADO';
      if (this.timerExpiracao) {
        clearTimeout(this.timerExpiracao);
        this.timerExpiracao = null;
      }
    }
  }

  cancelar() {
    if (this.status === 'PROCURANDO') {
      this.status = 'CANCELADO';
      if (this.timerExpiracao) {
        clearTimeout(this.timerExpiracao);
        this.timerExpiracao = null;
      }
      return true;
    }
    return false;
  }

  atribuirMotorista() {
    if (this.status === 'PROCURANDO') {
      this.status = 'MOTORISTA_ATRIBUIDO';
      if (this.timerExpiracao) {
        clearTimeout(this.timerExpiracao);
        this.timerExpiracao = null;
      }
      return true;
    }
    return false;
  }

  isExpirado() {
    return new Date() > new Date(this.expiraEm);
  }

  isCancelavel() {
    return this.status === 'PROCURANDO';
  }
}

// Armazenamento em memória
export const pedidosCorrida = new Map();

// Métodos de acesso aos dados
export const PedidoCorridaService = {
  criar(passageiroId, origemLat, origemLng, destinoLat, destinoLng, categoria) {
    const erros = PedidoCorrida.validar(passageiroId, origemLat, origemLng, destinoLat, destinoLng, categoria);
    if (erros.length > 0) {
      throw new Error(`Validação falhou: ${erros.join(', ')}`);
    }

    const pedido = new PedidoCorrida(passageiroId, origemLat, origemLng, destinoLat, destinoLng, categoria);
    pedidosCorrida.set(pedido.id, pedido);
    return pedido;
  },

  buscarPorId(id) {
    return pedidosCorrida.get(id) || null;
  },

  buscarPorPassageiro(passageiroId) {
    return Array.from(pedidosCorrida.values()).filter(p => p.passageiroId === passageiroId);
  },

  buscarPorStatus(status) {
    return Array.from(pedidosCorrida.values()).filter(p => p.status === status);
  },

  listarTodos() {
    return Array.from(pedidosCorrida.values());
  },

  cancelar(id) {
    const pedido = pedidosCorrida.get(id);
    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }
    
    if (!pedido.isCancelavel()) {
      throw new Error('Pedido não pode ser cancelado');
    }
    
    return pedido.cancelar();
  },

  atribuirMotorista(id) {
    const pedido = pedidosCorrida.get(id);
    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }
    
    return pedido.atribuirMotorista();
  },

  limparExpirados() {
    const agora = new Date();
    for (const [id, pedido] of pedidosCorrida.entries()) {
      if (pedido.isExpirado() && pedido.status === 'PROCURANDO') {
        pedido.expirar();
      }
    }
  },

  deletar(id) {
    const pedido = pedidosCorrida.get(id);
    if (pedido && pedido.timerExpiracao) {
      clearTimeout(pedido.timerExpiracao);
    }
    return pedidosCorrida.delete(id);
  }
}; 