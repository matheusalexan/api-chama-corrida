import { v4 as uuidv4 } from 'uuid';

export class Passageiro {
  constructor(nome, telefone) {
    this.id = uuidv4();
    this.nome = nome;
    this.telefone = telefone;
    this.criadoEm = new Date().toISOString();
  }

  static validar(nome, telefone) {
    const erros = [];
    
    if (!nome || nome.trim().length < 2) {
      erros.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!telefone || !/^\+55\d{10,11}$/.test(telefone)) {
      erros.push('Telefone deve estar no formato +55DDDNUMERO');
    }
    
    return erros;
  }
}

// Armazenamento em memória
const passageiros = new Map();

export class PassageiroService {
  static criar(nome, telefone) {
    const erros = Passageiro.validar(nome, telefone);
    if (erros.length > 0) {
      throw new Error(erros.join(', '));
    }

    // Verificar telefone único
    for (const passageiro of passageiros.values()) {
      if (passageiro.telefone === telefone) {
        throw new Error('Telefone já cadastrado');
      }
    }

    const passageiro = new Passageiro(nome, telefone);
    passageiros.set(passageiro.id, passageiro);
    return passageiro;
  }

  static buscarPorId(id) {
    return passageiros.get(id);
  }

  static buscarPorTelefone(telefone) {
    for (const passageiro of passageiros.values()) {
      if (passageiro.telefone === telefone) {
        return passageiro;
      }
    }
    return null;
  }

  static listarTodos() {
    return Array.from(passageiros.values());
  }

  static temCorridaAtiva(passageiroId) {
    // Será implementado quando criarmos o modelo Corrida
    return false;
  }
}
