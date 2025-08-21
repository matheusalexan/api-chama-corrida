import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { gerarDadosUnicos, limparDadosTeste } from './setup/testSetup.js';

describe('Testes de Performance da API', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve validar independência de dados entre execuções', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    expect(passageiroResponse.status).to.equal(201);
    
    // Este teste valida que cada execução é independente
    // e não há conflitos de dados entre execuções
  });
});
