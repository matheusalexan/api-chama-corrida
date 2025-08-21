import { v4 as uuidv4 } from 'uuid';

export class Corrida {
  constructor(passageiroId, origem, destino) {
    this.id = uuidv4();
    this.passageiroId = passageiroId;
    this.origem = origem;
    this.destino = destino;
    this.status = 'aguardando_motorista';
    this.motoristaId = null;
    this.precoBase = 5.00;
    this.precoPorKm = 2.00;
    this.precoPorMin = 0.50;
    this.precoEstimado = this.calcularPrecoEstimado();
    this.valorFinal = null;
    this.inicioEm = null;
    this.fimEm = null;
    this.criadoEm = new Date().toISOString();
    this.atualizadoEm = new Date().toISOString();
  }

  calcularPrecoEstimado() {
    // Cálculo simples baseado em distância estimada
    const distanciaKm = this.calcularDistanciaEstimada();
    const tempoEstimadoMin = distanciaKm * 2; // 2 min por km
    
    return this.precoBase + (distanciaKm * this.precoPorKm) + (tempoEstimadoMin * this.precoPorMin);
  }

  calcularDistanciaEstimada() {
    // Cálculo simples baseado em coordenadas (aproximado)
    const latDiff = Math.abs(this.origem.lat - this.destino.lat);
    const lngDiff = Math.abs(this.origem.lng - this.destino.lng);
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // 111 km por grau
  }

  aceitar(motoristaId) {
    if (this.status !== 'aguardando_motorista') {
      throw new Error('Corrida não está aguardando motorista');
    }
    
    this.status = 'aceita';
    this.motoristaId = motoristaId;
    this.atualizadoEm = new Date().toISOString();
  }

  iniciar() {
    if (this.status !== 'aceita') {
      throw new Error('Corrida deve estar aceita para ser iniciada');
    }
    
    this.status = 'em_andamento';
    this.inicioEm = new Date().toISOString();
    this.atualizadoEm = new Date().toISOString();
  }

  finalizar(km, min) {
    if (this.status !== 'em_andamento') {
      throw new Error('Corrida deve estar em andamento para ser finalizada');
    }
    
    this.status = 'finalizada';
    this.fimEm = new Date().toISOString();
    this.valorFinal = this.precoBase + (km * this.precoPorKm) + (min * this.precoPorMin);
    this.atualizadoEm = new Date().toISOString();
  }

  cancelar() {
    if (this.status === 'em_andamento' || this.status === 'finalizada') {
      throw new Error('Não é possível cancelar corrida já iniciada');
    }
    
    this.status = 'cancelada';
    this.atualizadoEm = new Date().toISOString();
  }

  podeSerCancelada() {
    return ['aguardando_motorista', 'aceita'].includes(this.status);
  }

  podeSerIniciada() {
    return this.status === 'aceita';
  }

  podeSerFinalizada() {
    return this.status === 'em_andamento';
  }
}

// Armazenamento em memória
const corridas = new Map();

export class CorridaService {
  static criar(passageiroId, origem, destino) {
    // Verificar se passageiro já tem corrida ativa
    const corridasAtivas = Array.from(corridas.values()).filter(
      c => c.passageiroId === passageiroId && 
           ['aguardando_motorista', 'aceita', 'em_andamento'].includes(c.status)
    );
    
    if (corridasAtivas.length > 0) {
      throw new Error('Passageiro já possui corrida em andamento');
    }

    const corrida = new Corrida(passageiroId, origem, destino);
    corridas.set(corrida.id, corrida);
    return corrida;
  }

  static buscarPorId(id) {
    return corridas.get(id);
  }

  static aceitarCorrida(id, motoristaId) {
    const corrida = corridas.get(id);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }
    
    // Verificar se a corrida já foi aceita
    if (corrida.status === 'aceita') {
      throw new Error('Corrida já foi aceita por outro motorista');
    }
    
    corrida.aceitar(motoristaId);
    return corrida;
  }

  static iniciarCorrida(id) {
    const corrida = corridas.get(id);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }
    
    corrida.iniciar();
    return corrida;
  }

  static finalizarCorrida(id, km, min) {
    const corrida = corridas.get(id);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }
    
    corrida.finalizar(km, min);
    return corrida;
  }

  static cancelarCorrida(id) {
    const corrida = corridas.get(id);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }
    
    corrida.cancelar();
    return corrida;
  }

  static buscarPorPassageiro(passageiroId) {
    return Array.from(corridas.values())
      .filter(c => c.passageiroId === passageiroId)
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
  }

  static buscarPorMotorista(motoristaId) {
    return Array.from(corridas.values())
      .filter(c => c.motoristaId === motoristaId)
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
  }

  static buscarAguardandoMotorista() {
    return Array.from(corridas.values())
      .filter(c => c.status === 'aguardando_motorista');
  }

  static listarTodas() {
    return Array.from(corridas.values());
  }
}
