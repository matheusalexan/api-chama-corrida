/**
 * @swagger
 * components:
 *   schemas:
 *     Avaliacao:
 *       type: object
 *       required:
 *         - corridaId
 *         - autor
 *         - nota
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da avaliação (UUID v4)
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         corridaId:
 *           type: string
 *           format: uuid
 *           description: ID da corrida sendo avaliada
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         autor:
 *           type: string
 *           enum: [PASSAGEIRO, MOTORISTA]
 *           description: Quem está fazendo a avaliação
 *           example: "PASSAGEIRO"
 *         nota:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Nota de 1 a 5 estrelas
 *           example: 5
 *         comentario:
 *           type: string
 *           maxLength: 280
 *           description: Comentário opcional sobre a corrida
 *           example: "Excelente serviço, motorista muito atencioso!"
 *         criadoEm:
 *           type: string
 *           format: date-time
 *           description: Data e hora da avaliação
 *           example: "2024-01-15T10:30:00.000Z"
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         corridaId: "123e4567-e89b-12d3-a456-426614174000"
 *         autor: "PASSAGEIRO"
 *         nota: 5
 *         comentario: "Excelente serviço, motorista muito atencioso!"
 *         criadoEm: "2024-01-15T10:30:00.000Z"
 */

import { v4 as uuidv4 } from 'uuid';

export class Avaliacao {
  constructor(corridaId, autor, nota, comentario = null) {
    this.id = uuidv4();
    this.corridaId = corridaId;
    this.autor = autor;
    this.nota = nota;
    this.comentario = comentario;
    this.criadoEm = new Date().toISOString();
  }

  static validar(corridaId, autor, nota, comentario) {
    const erros = [];

    // Validação do corridaId
    if (!corridaId || typeof corridaId !== 'string') {
      erros.push('ID da corrida é obrigatório e deve ser uma string');
    }

    // Validação do autor
    if (!autor || !['PASSAGEIRO', 'MOTORISTA'].includes(autor)) {
      erros.push('Autor deve ser PASSAGEIRO ou MOTORISTA');
    }

    // Validação da nota
    if (typeof nota !== 'number' || nota < 1 || nota > 5 || !Number.isInteger(nota)) {
      erros.push('Nota deve ser um número inteiro entre 1 e 5');
    }

    // Validação do comentário (opcional)
    if (comentario !== null && comentario !== undefined) {
      if (typeof comentario !== 'string') {
        erros.push('Comentário deve ser uma string');
      } else if (comentario.length > 280) {
        erros.push('Comentário deve ter no máximo 280 caracteres');
      }
    }

    return erros;
  }

  static validarAvaliacaoUnica(corridaId, autor, avaliacoesExistentes) {
    // Verifica se já existe uma avaliação do mesmo autor para a mesma corrida
    return !avaliacoesExistentes.some(a => 
      a.corridaId === corridaId && a.autor === autor
    );
  }
}

// Armazenamento em memória
export const avaliacoes = new Map();

// Métodos de acesso aos dados
export const AvaliacaoService = {
  criar(corridaId, autor, nota, comentario = null) {
    const erros = Avaliacao.validar(corridaId, autor, nota, comentario);
    if (erros.length > 0) {
      throw new Error(`Validação falhou: ${erros.join(', ')}`);
    }

    // Verifica se já existe uma avaliação do mesmo autor para a mesma corrida
    if (!Avaliacao.validarAvaliacaoUnica(corridaId, autor, Array.from(avaliacoes.values()))) {
      throw new Error('Já existe uma avaliação deste autor para esta corrida');
    }

    const avaliacao = new Avaliacao(corridaId, autor, nota, comentario);
    avaliacoes.set(avaliacao.id, avaliacao);
    return avaliacao;
  },

  buscarPorId(id) {
    return avaliacoes.get(id) || null;
  },

  buscarPorCorrida(corridaId) {
    return Array.from(avaliacoes.values()).filter(a => a.corridaId === corridaId);
  },

  buscarPorAutor(autor) {
    return Array.from(avaliacoes.values()).filter(a => a.autor === autor);
  },

  buscarPorCorridaEAutor(corridaId, autor) {
    return Array.from(avaliacoes.values()).find(a => 
      a.corridaId === corridaId && a.autor === autor
    ) || null;
  },

  listarTodas() {
    return Array.from(avaliacoes.values());
  },

  calcularMediaPorCorrida(corridaId) {
    const avaliacoesCorrida = this.buscarPorCorrida(corridaId);
    if (avaliacoesCorrida.length === 0) {
      return 0;
    }

    const somaNotas = avaliacoesCorrida.reduce((soma, a) => soma + a.nota, 0);
    return Math.round((somaNotas / avaliacoesCorrida.length) * 10) / 10; // 1 casa decimal
  },

  deletar(id) {
    return avaliacoes.delete(id);
  }
}; 