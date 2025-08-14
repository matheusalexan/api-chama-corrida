/**
 * @swagger
 * components:
 *   schemas:
 *     Motorista:
 *       type: object
 *       required:
 *         - nome
 *         - telefoneE164
 *         - categoria
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do motorista (UUID v4)
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         nome:
 *           type: string
 *           minLength: 3
 *           maxLength: 80
 *           description: Nome completo do motorista
 *           example: "Carlos Oliveira"
 *         telefoneE164:
 *           type: string
 *           pattern: '^\+[0-9]{10,15}$'
 *           description: Número de telefone no formato E.164 (ex: +5511999999999)
 *           example: "+5511888888888"
 *         categoria:
 *           type: string
 *           enum: [ECONOMY, COMFORT]
 *           description: Categoria do motorista
 *           example: "ECONOMY"
 *         disponivel:
 *           type: boolean
 *           description: Indica se o motorista está disponível para corridas
 *           default: true
 *           example: true
 *         criadoEm:
 *           type: string
 *           format: date-time
 *           description: Data e hora de criação do registro
 *           example: "2024-01-15T10:30:00.000Z"
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         nome: "Carlos Oliveira"
 *         telefoneE164: "+5511888888888"
 *         categoria: "ECONOMY"
 *         disponivel: true
 *         criadoEm: "2024-01-15T10:30:00.000Z"
 */

import { v4 as uuidv4 } from 'uuid';

export class Motorista {
  constructor(nome, telefoneE164, categoria) {
    this.id = uuidv4();
    this.nome = nome;
    this.telefoneE164 = telefoneE164;
    this.categoria = categoria;
    this.disponivel = true;
    this.criadoEm = new Date().toISOString();
  }

  static validar(nome, telefoneE164, categoria) {
    const erros = [];

    // Validação do nome
    if (!nome || typeof nome !== 'string') {
      erros.push('Nome é obrigatório e deve ser uma string');
    } else if (nome.length < 3 || nome.length > 80) {
      erros.push('Nome deve ter entre 3 e 80 caracteres');
    }

    // Validação do telefone
    if (!telefoneE164 || typeof telefoneE164 !== 'string') {
      erros.push('Telefone é obrigatório e deve ser uma string');
    } else if (!/^\+[0-9]{10,15}$/.test(telefoneE164)) {
      erros.push('Telefone deve estar no formato E.164 (ex: +5511999999999)');
    }

    // Validação da categoria
    if (!categoria || !['ECONOMY', 'COMFORT'].includes(categoria)) {
      erros.push('Categoria deve ser ECONOMY ou COMFORT');
    }

    return erros;
  }

  static validarTelefoneUnico(telefoneE164, motoristasExistentes) {
    return !motoristasExistentes.some(m => m.telefoneE164 === telefoneE164);
  }

  alterarDisponibilidade(disponivel) {
    if (typeof disponivel !== 'boolean') {
      throw new Error('Disponibilidade deve ser um valor booleano');
    }
    this.disponivel = disponivel;
    return this;
  }
}

// Armazenamento em memória
export const motoristas = new Map();

// Métodos de acesso aos dados
export const MotoristaService = {
  criar(nome, telefoneE164, categoria) {
    const erros = Motorista.validar(nome, telefoneE164, categoria);
    if (erros.length > 0) {
      throw new Error(`Validação falhou: ${erros.join(', ')}`);
    }

    if (!Motorista.validarTelefoneUnico(telefoneE164, Array.from(motoristas.values()))) {
      throw new Error('Telefone já está em uso por outro motorista');
    }

    const motorista = new Motorista(nome, telefoneE164, categoria);
    motoristas.set(motorista.id, motorista);
    return motorista;
  },

  buscarPorId(id) {
    return motoristas.get(id) || null;
  },

  buscarPorTelefone(telefoneE164) {
    return Array.from(motoristas.values()).find(m => m.telefoneE164 === telefoneE164) || null;
  },

  buscarDisponiveis(categoria = null) {
    let motoristasDisponiveis = Array.from(motoristas.values()).filter(m => m.disponivel);
    
    if (categoria) {
      motoristasDisponiveis = motoristasDisponiveis.filter(m => m.categoria === categoria);
    }
    
    return motoristasDisponiveis;
  },

  listarTodos() {
    return Array.from(motoristas.values());
  },

  alterarDisponibilidade(id, disponivel) {
    const motorista = motoristas.get(id);
    if (!motorista) {
      throw new Error('Motorista não encontrado');
    }
    
    return motorista.alterarDisponibilidade(disponivel);
  },

  deletar(id) {
    return motoristas.delete(id);
  }
}; 