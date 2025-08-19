import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

describe('CT-01 — deve criar um passageiro quando informo nome e telefone válidos; recusar se faltar algo', () => {
  beforeEach(() => {
    // Como não há db exportado, os dados são independentes entre testes
    // O comportamento esperado é que cada execução parte de base vazia
  });

  it('deve retornar 201 com dados do passageiro quando nome e telefone são fornecidos', async () => {
    // arrange
    const passageiroData = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };

    // act
    const response = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiroData);

    // assert
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.have.property('id');
    expect(response.body.data.nome).to.equal(passageiroData.nome);
    expect(response.body.data.telefone).to.equal(passageiroData.telefone);
  });

  it('deve retornar 400 com mensagem de erro quando nome está faltando', async () => {
    // arrange
    const passageiroData = {
      telefone: '+5511999999999'
    };

    // act
    const response = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiroData);

    // assert
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('deve retornar 400 com mensagem de erro quando telefone está faltando', async () => {
    // arrange
    const passageiroData = {
      nome: 'João Silva'
    };

    // act
    const response = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiroData);

    // assert
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('deve retornar 400 com mensagem de erro quando ambos os campos estão faltando', async () => {
    // arrange
    const passageiroData = {};

    // act
    const response = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiroData);

    // assert
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});
