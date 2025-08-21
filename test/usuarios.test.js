import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { gerarDadosUnicos, limparDadosTeste } from './setup/testSetup.js';

describe('deve criar um passageiro quando informo nome e telefone válidos; recusar se faltar algo', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar 201 com dados do passageiro quando nome e telefone são fornecidos', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiroData = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };

    const response = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiroData);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.have.property('id');
    expect(response.body.data.nome).to.equal(passageiroData.nome);
    expect(response.body.data.telefone).to.equal(passageiroData.telefone);
  });

  it('deve retornar 400 com mensagem de erro quando nome está faltando', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiroData = {
      telefone: dadosUnicos.telefone
    };

    const response = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiroData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('deve retornar 400 com mensagem de erro quando telefone está faltando', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiroData = {
      nome: dadosUnicos.nome
    };

    const response = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiroData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('motorista nasce disponível e precisa de nome, telefone e placa', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar 201 com status "disponível" quando todos os campos são fornecidos', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const motoristaData = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone,
      placa: dadosUnicos.placa
    };

    const response = await request(app)
      .post('/api/v1/motoristas')
      .send(motoristaData);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.have.property('id');
    expect(response.body.data.status).to.equal('disponível');
  });

  it('deve retornar 400 quando nome está faltando', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const motoristaData = {
      telefone: dadosUnicos.telefone,
      placa: dadosUnicos.placa
    };

    const response = await request(app)
      .post('/api/v1/motoristas')
      .send(motoristaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('deve retornar 400 quando telefone está faltando', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const motoristaData = {
      nome: dadosUnicos.nome,
      placa: dadosUnicos.placa
    };

    const response = await request(app)
      .post('/api/v1/motoristas')
      .send(motoristaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('deve retornar 400 quando placa está faltando', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const motoristaData = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };

    const response = await request(app)
      .post('/api/v1/motoristas')
      .send(motoristaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Não posso cadastrar dois usuários com o mesmo telefone', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar 409 quando tenta cadastrar passageiro com telefone já existente', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiroData = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };

    // Primeiro passageiro
    await request(app)
      .post('/api/v1/passageiros')
      .send(passageiroData);

    // Segundo passageiro com mesmo telefone
    const segundoPassageiroData = {
      nome: 'Maria Silva',
      telefone: dadosUnicos.telefone
    };

    const response = await request(app)
      .post('/api/v1/passageiros')
      .send(segundoPassageiroData);

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('deve retornar 409 quando tenta cadastrar motorista com telefone já existente', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const motoristaData = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone,
      placa: dadosUnicos.placa
    };

    // Primeiro motorista
    await request(app)
      .post('/api/v1/motoristas')
      .send(motoristaData);

    // Segundo motorista com mesmo telefone
    const segundoMotoristaData = {
      nome: 'Carlos Silva',
      telefone: dadosUnicos.telefone,
      placa: 'XYZ5678'
    };

    const response = await request(app)
      .post('/api/v1/motoristas')
      .send(segundoMotoristaData);

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Mensagens de erro amigáveis quando faltam campos obrigatórios', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar 400 com mensagem amigável quando passageiro não tem telefone', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiroData = {
      nome: dadosUnicos.nome
    };

    const response = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiroData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
    expect(response.body.message).to.include('telefone');
  });

  it('Deve retornar 400 com mensagem amigável quando motorista não tem placa', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const motoristaData = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };

    const response = await request(app)
      .post('/api/v1/motoristas')
      .send(motoristaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
    expect(response.body.message).to.include('placa');
  });
});
