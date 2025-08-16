import { v4 as uuidv4 } from 'uuid';

export class Motorista {
  constructor(nome, telefone, placa) {
    this.id = uuidv4();
    this.nome = nome;
    this.telefone = telefone;
    this.placa = placa;
    this.status = 'disponível';
    this.criadoEm = new Date().toISOString();
  }

  static validar(nome, telefone, placa) {
    const erros = [];
    
    if (!nome || nome.trim().length < 2) {
      erros.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!telefone || !/^\+55\d{10,11}$/.test(telefone)) {
      erros.push('Telefone deve estar no formato +55DDDNUMERO');
    }
    
    if (!placa || placa.trim().length < 5) {
      erros.push('Placa deve ter pelo menos 5 caracteres');
    }
    
    return erros;
  }

  alterarStatus(novoStatus) {
    const statusValidos = ['disponível', 'ocupado'];
    if (!statusValidos.includes(novoStatus)) {
      throw new Error('Status inválido');
    }
    this.status = novoStatus;
  }
}

// Armazenamento em memória
const motoristas = new Map();

export class MotoristaService {
  static criar(nome, telefone, placa) {
    const erros = Motorista.validar(nome, telefone, placa);
    if (erros.length > 0) {
      throw new Error(erros.join(', '));
    }

    // Verificar telefone único
    for (const motorista of motoristas.values()) {
      if (motorista.telefone === telefone) {
        throw new Error('Telefone já cadastrado');
      }
    }

    const motorista = new Motorista(nome, telefone, placa);
    motoristas.set(motorista.id, motorista);
    return motorista;
  }

  static buscarPorId(id) {
    return motoristas.get(id);
  }

  static buscarPorTelefone(telefone) {
    for (const motorista of motoristas.values()) {
      if (motorista.telefone === telefone) {
        return motorista;
      }
    }
    return null;
  }

  static buscarDisponiveis() {
    return Array.from(motoristas.values()).filter(m => m.status === 'disponível');
  }

  static listarTodos() {
    return Array.from(motoristas.values());
  }

  static alterarStatus(id, novoStatus) {
    const motorista = motoristas.get(id);
    if (!motorista) {
      throw new Error('Motorista não encontrado');
    }
    motorista.alterarStatus(novoStatus);
    return motorista;
  }
}
