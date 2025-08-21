import request from 'supertest';
import app from '../../src/app.js';

export async function criarPassageiroTeste(overrides = {}) {
  const dadosPadrao = {
    nome: process.env.TEST_PASSAGEIRO_NOME || 'João Silva',
    telefone: process.env.TEST_PASSAGEIRO_TELEFONE || '+5511999999999'
  };

  const dados = { ...dadosPadrao, ...overrides };
  
  const response = await request(app)
    .post('/usuarios/passageiros')
    .send(dados);
  
  return response;
}

export async function criarMotoristaTeste(overrides = {}) {
  const dadosPadrao = {
    nome: process.env.TEST_MOTORISTA_NOME || 'Pedro Santos',
    telefone: process.env.TEST_MOTORISTA_TELEFONE || '+5511888888888',
    placa: process.env.TEST_MOTORISTA_PLACA || 'ABC1234'
  };

  const dados = { ...dadosPadrao, ...overrides };
  
  const response = await request(app)
    .post('/usuarios/motoristas')
    .send(dados);
  
  return response;
}

export async function criarCorridaTeste(passageiroId, overrides = {}) {
  const dadosPadrao = {
    passageiroId,
    origem: {
      lat: parseFloat(process.env.TEST_ORIGEM_LAT) || -23.5505,
      lng: parseFloat(process.env.TEST_ORIGEM_LNG) || -46.6333
    },
    destino: {
      lat: parseFloat(process.env.TEST_DESTINO_LAT) || -23.5605,
      lng: parseFloat(process.env.TEST_DESTINO_LNG) || -46.6433
    }
  };

  const dados = { ...dadosPadrao, ...overrides };
  
  const response = await request(app)
    .post('/corridas')
    .send(dados);
  
  return response;
}

export async function aceitarCorrida(corridaId, motoristaId) {
  const response = await request(app)
    .post(`/corridas/${corridaId}/aceitar`)
    .send({ motoristaId });
  
  return response;
}

export async function iniciarCorrida(corridaId) {
  const response = await request(app)
    .post(`/corridas/${corridaId}/iniciar`);
  
  return response;
}

export async function finalizarCorrida(corridaId, overrides = {}) {
  const dadosPadrao = {
    distanciaKm: parseFloat(process.env.TEST_DISTANCIA_KM) || 5.2,
    duracaoMin: parseInt(process.env.TEST_DURACAO_MIN) || 15
  };

  const dados = { ...dadosPadrao, ...overrides };
  
  const response = await request(app)
    .post(`/corridas/${corridaId}/finalizar`)
    .send(dados);
  
  return response;
}

export async function cancelarCorrida(corridaId, porQuem) {
  const response = await request(app)
    .post(`/corridas/${corridaId}/cancelar`)
    .send({ porQuem });
  
  return response;
}

export function gerarTelefoneUnico() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `+5511${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
}

export function gerarPlacaUnica() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = '0123456789';
  
  let placa = '';
  for (let i = 0; i < 3; i++) {
    placa += letras[Math.floor(Math.random() * letras.length)];
  }
  for (let i = 0; i < 4; i++) {
    placa += numeros[Math.floor(Math.random() * numeros.length)];
  }
  
  return placa;
}

export function validarRespostaSucesso(response, expectedStatus = 200, expectedMessage = null) {
  expect(response.status).to.equal(expectedStatus);
  expect(response.body).to.have.property('data');
  
  if (expectedMessage) {
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal(expectedMessage);
  }
}

export function validarRespostaErro(response, expectedStatus = 400, expectedCode = null) {
  expect(response.status).to.equal(expectedStatus);
  expect(response.body).to.have.property('message');
  expect(response.body).to.have.property('code');
  
  if (expectedCode) {
    expect(response.body.code).to.equal(expectedCode);
  }
}
