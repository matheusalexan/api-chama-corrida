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
    this.precoFinal = null;
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
    
    this.status = 'iniciada';
    this.inicioEm = new Date().toISOString();
    this.atualizadoEm = new Date().toISOString();
  }

  finalizar(distanciaKm, duracaoMin) {
    if (this.status !== 'iniciada') {
      throw new Error('Corrida deve estar iniciada para ser finalizada');
    }
    
    this.status = 'finalizada';
    this.fimEm = new Date().toISOString();
    this.precoFinal = this.precoBase + (distanciaKm * this.precoPorKm) + (duracaoMin * this.precoPorMin);
    this.atualizadoEm = new Date().toISOString();
  }

  cancelarPorPassageiro() {
    if (this.status === 'iniciada' || this.status === 'finalizada') {
      throw new Error('Não é possível cancelar corrida já iniciada');
    }
    
    this.status = 'cancelada_pelo_passageiro';
    this.atualizadoEm = new Date().toISOString();
  }

  cancelarPorMotorista() {
    if (this.status === 'iniciada' || this.status === 'finalizada') {
      throw new Error('Não é possível cancelar corrida já iniciada');
    }
    
    this.status = 'cancelada_pelo_motorista';
    this.atualizadoEm = new Date().toISOString();
  }

  podeSerCancelada() {
    return ['aguardando_motorista', 'aceita'].includes(this.status);
  }

  podeSerIniciada() {
    return this.status === 'aceita';
  }

  podeSerFinalizada() {
    return this.status === 'iniciada';
  }
}

// Armazenamento em memória
const corridas = new Map();

export class CorridaService {
  static criar(passageiroId, origem, destino) {
    // Verificar se passageiro tem corrida ativa
    const corridaAtiva = this.buscarCorridaAtivaPorPassageiro(passageiroId);
    if (corridaAtiva) {
      throw new Error('Passageiro já possui corrida em andamento');
    }

    const corrida = new Corrida(passageiroId, origem, destino);
    corridas.set(corrida.id, corrida);
    return corrida;
  }

  static buscarPorId(id) {
    return corridas.get(id);
  }

  static buscarCorridaAtivaPorPassageiro(passageiroId) {
    for (const corrida of corridas.values()) {
      if (corrida.passageiroId === passageiroId && 
          ['aguardando_motorista', 'aceita', 'iniciada'].includes(corrida.status)) {
        return corrida;
      }
    }
    return null;
  }

  static buscarPorMotorista(motoristaId) {
    return Array.from(corridas.values()).filter(c => c.motoristaId === motoristaId);
  }

  static buscarPorPassageiro(passageiroId) {
    return Array.from(corridas.values()).filter(c => c.passageiroId === passageiroId);
  }

  static buscarAguardandoMotorista() {
    return Array.from(corridas.values()).filter(c => c.status === 'aguardando_motorista');
  }

  static listarTodas() {
    return Array.from(corridas.values());
  }

  static aceitarCorrida(corridaId, motoristaId) {
    const corrida = corridas.get(corridaId);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }

    corrida.aceitar(motoristaId);
    return corrida;
  }

  static iniciarCorrida(corridaId) {
    const corrida = corridas.get(corridaId);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }

    corrida.iniciar();
    return corrida;
  }

  static finalizarCorrida(corridaId, distanciaKm, duracaoMin) {
    const corrida = corridas.get(corridaId);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }

    corrida.finalizar(distanciaKm, duracaoMin);
    return corrida;
  }

  static cancelarCorrida(corridaId, porQuem) {
    const corrida = corridas.get(corridaId);
    if (!corrida) {
      throw new Error('Corrida não encontrada');
    }

    if (porQuem === 'passageiro') {
      corrida.cancelarPorPassageiro();
    } else if (porQuem === 'motorista') {
      corrida.cancelarPorMotorista();
    } else {
      throw new Error('Tipo de cancelamento inválido');
    }

    return corrida;
  }
}
