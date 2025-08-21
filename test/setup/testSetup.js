import { expect } from 'chai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'test/config/test.env') });

export const testConfig = {
  timeout: parseInt(process.env.TIMEOUT) || 5000,
  baseUrl: process.env.BASE_URL || 'http://localhost:3001',
  apiVersion: process.env.API_VERSION || 'v1'
};

// Limpeza global de dados entre suites de teste
let globalTestData = {
  passageiros: [],
  motoristas: [],
  corridas: []
};

// Função para limpar completamente o estado da aplicação
export async function limparEstadoCompleto() {
  // Resetar dados globais
  globalTestData = { passageiros: [], motoristas: [], corridas: [] };
  
  // Aguardar um pouco para garantir que não há operações pendentes
  await new Promise(resolve => setTimeout(resolve, 100));
}

export function setupTestHooks() {
  beforeEach(function() {
    this.timeout(testConfig.timeout);
  });

  afterEach(function() {
    const status = this.currentTest?.state || 'unknown';
    const duration = this.currentTest?.duration || 0;
    
    if (status === 'passed') {
      console.log(`PASS: ${this.currentTest?.title} - ${duration}ms`);
    } else if (status === 'failed') {
      console.log(`FAIL: ${this.currentTest?.title} - ${duration}ms`);
    }
  });

  before(function() {
    console.log('Starting test suite...');
    console.log(`Config: ${JSON.stringify(testConfig, null, 2)}`);
    // Limpar dados globais no início de cada suite
    globalTestData = { passageiros: [], motoristas: [], corridas: [] };
  });

  after(function() {
    console.log('Test suite completed');
    // Limpar dados globais no final de cada suite
    globalTestData = { passageiros: [], motoristas: [], corridas: [] };
  });
}

export function setupCorridaTestHooks() {
  let passageiroId;
  let motoristaId;
  let corridaId;

  beforeEach(async function() {
    // Limpar IDs anteriores
    passageiroId = null;
    motoristaId = null;
    corridaId = null;
    this.timeout(10000);
  });

  afterEach(function() {
    // Limpar IDs após cada teste
    passageiroId = null;
    motoristaId = null;
    corridaId = null;
  });

  return {
    getPassageiroId: () => passageiroId,
    setPassageiroId: (id) => { 
      passageiroId = id; 
      if (id) globalTestData.passageiros.push(id);
    },
    getMotoristaId: () => motoristaId,
    setMotoristaId: (id) => { 
      motoristaId = id; 
      if (id) globalTestData.motoristas.push(id);
    },
    getCorridaId: () => corridaId,
    setCorridaId: (id) => { 
      corridaId = id; 
      if (id) globalTestData.corridas.push(id);
    }
  };
}

export function setupUsuarioTestHooks() {
  let usuariosCriados = [];

  beforeEach(async function() {
    // Limpar lista de usuários criados
    usuariosCriados = [];
    this.timeout(8000);
    // Limpar estado completo antes de cada teste
    await limparEstadoCompleto();
  });

  afterEach(function() {
    // Limpar lista após cada teste
    usuariosCriados = [];
  });

  return {
    adicionarUsuario: (usuario) => {
      usuariosCriados.push(usuario);
      if (usuario.id) {
        if (usuario.placa) {
          globalTestData.motoristas.push(usuario.id);
        } else {
          globalTestData.passageiros.push(usuario.id);
        }
      }
    },
    getUsuariosCriados: () => usuariosCriados,
    limparUsuarios: () => { usuariosCriados = []; }
  };
}

export function setupPerformanceTestHooks() {
  let metricas = [];

  beforeEach(async function() {
    metricas = [];
    this.timeout(15000);
    // Limpar dados globais para testes de performance
    await limparEstadoCompleto();
  });

  afterEach(function() {
    if (metricas.length > 0) {
      const tempoMedio = metricas.reduce((acc, val) => acc + val, 0) / metricas.length;
      const tempoMax = Math.max(...metricas);
      const tempoMin = Math.min(...metricas);
      
      console.log(`Performance Metrics:`);
      console.log(`  Average: ${tempoMedio.toFixed(2)}ms`);
      console.log(`  Max: ${tempoMax}ms`);
      console.log(`  Min: ${tempoMax}ms`);
    }
    // Limpar dados após teste de performance
    globalTestData = { passageiros: [], motoristas: [], corridas: [] };
  });

  return {
    adicionarMetrica: (tempo) => metricas.push(tempo),
    getMetricas: () => metricas,
    calcularMedia: () => metricas.reduce((acc, val) => acc + val, 0) / metricas.length
  };
}

// Função para limpar dados entre testes
export function limparDadosTeste() {
  globalTestData = { passageiros: [], motoristas: [], corridas: [] };
}

// Função para gerar dados únicos para testes
export function gerarDadosUnicos() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  
  return {
    nome: `Teste ${timestamp}`,
    telefone: `+5511${timestamp.toString().slice(-8)}`,
    placa: `ABC${timestamp.toString().slice(-3)}`
  };
}

export function setupCustomAssertions() {
  expect.Assertion.prototype.successResponse = function(expectedStatus = 200) {
    this.assert(
      this._obj.status === expectedStatus,
      `expected response status to be ${expectedStatus} but got ${this._obj.status}`,
      `expected response status to not be ${expectedStatus}`,
      expectedStatus,
      this._obj.status
    );
    
    this.assert(
      this._obj.body && this._obj.body.data,
      'expected response to have data property',
      'expected response to not have data property'
    );
    
    return this;
  };

  expect.Assertion.prototype.errorResponse = function(expectedStatus = 400, expectedCode = null) {
    this.assert(
      this._obj.status === expectedStatus,
      `expected response status to be ${expectedStatus} but got ${this._obj.status}`,
      `expected response status to not be ${expectedStatus}`,
      expectedStatus,
      this._obj.status
    );
    
    this.assert(
      this._obj.body && this._obj.body.message && this._obj.body.code,
      'expected response to have message and code properties',
      'expected response to not have message and code properties'
    );
    
    if (expectedCode) {
      this.assert(
        this._obj.body.code === expectedCode,
        `expected error code to be ${expectedCode} but got ${this._obj.body.code}`,
        `expected error code to not be ${expectedCode}`,
        expectedCode,
        this._obj.body.code
      );
    }
    
    return this;
  };

  expect.Assertion.prototype.validUser = function() {
    this.assert(
      this._obj.id && this._obj.nome && this._obj.telefone,
      'expected user to have id, nome and telefone properties',
      'expected user to not have id, nome and telefone properties'
    );
    
    return this;
  };

  expect.Assertion.prototype.validCorrida = function() {
    this.assert(
      this._obj.id && this._obj.passageiroId && this._obj.origem && this._obj.destino,
      'expected corrida to have id, passageiroId, origem and destino properties',
      'expected corrida to not have id, passageiroId, origem and destino properties'
    );
    
    return this;
  };
}

export const testUtils = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  generateUniqueId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  isValidUUID: (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  },
  
  isValidPhone: (str) => {
    const phoneRegex = /^\+55\d{10,11}$/;
    return phoneRegex.test(str);
  }
};
