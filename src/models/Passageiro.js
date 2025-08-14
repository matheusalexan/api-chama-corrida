/**
 * @swagger
 * components:
 *   schemas:
 *     Passageiro:
 *       type: object
 *       required:
 *         - nome
 *         - telefoneE164
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do passageiro (UUID v4)
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         nome:
 *           type: string
 *           minLength: 3
 *           maxLength: 80
 *           description: Nome completo do passageiro
 *           example: "João Silva Santos"
 *         telefoneE164:
 *           type: string
 *           pattern: '^\+[0-9]{10,15}$'
 *           description: Número de telefone no formato E.164 (ex: +5511999999999)
 *           example: "+5511999999999"
 *         criadoEm:
 *           type: string
 *           format: date-time
 *           description: Data e hora de criação do registro
 *           example: "2024-01-15T10:30:00.000Z"
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         nome: "João Silva Santos"
 *         telefoneE164: "+5511999999999"
 *         criadoEm: "2024-01-15T10:30:00.000Z"
 */

import { v4 as uuidv4 } from 'uuid';

export class Passageiro {
  constructor(nome, telefoneE164) {
    this.id = uuidv4();
    this.nome = nome;
    this.telefoneE164 = telefoneE164;
    this.criadoEm = new Date().toISOString();
  }

  static validar(nome, telefoneE164) {
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

    return erros;
  }

  static validarTelefoneUnico(telefoneE164, passageirosExistentes) {
    return !passageirosExistentes.some(p => p.telefoneE164 === telefoneE164);
  }
}

// Armazenamento em memória
export const passageiros = new Map();

// Métodos de acesso aos dados
export const PassageiroService = {
  criar(nome, telefoneE164) {
    const erros = Passageiro.validar(nome, telefoneE164);
    if (erros.length > 0) {
      throw new Error(`Validação falhou: ${erros.join(', ')}`);
    }

    if (!Passageiro.validarTelefoneUnico(telefoneE164, Array.from(passageiros.values()))) {
      throw new Error('Telefone já está em uso por outro passageiro');
    }

    const passageiro = new Passageiro(nome, telefoneE164);
    passageiros.set(passageiro.id, passageiro);
    return passageiro;
  },

  buscarPorId(id) {
    return passageiros.get(id) || null;
  },

  buscarPorTelefone(telefoneE164) {
    return Array.from(passageiros.values()).find(p => p.telefoneE164 === telefoneE164) || null;
  },

  listarTodos() {
    return Array.from(passageiros.values());
  },

  deletar(id) {
    return passageiros.delete(id);
  }
}; 