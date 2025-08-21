import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

describe('deve criar um passageiro quando informo nome e telefone válidos; recusar se faltar algo', () => {
  it('deve retornar 201 com dados do passageiro quando nome e telefone são fornecidos', async () => {
    const passageiroData = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };

    const response = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiroData);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.have.property('id');
    expect(response.body.data.nome).to.equal(passageiroData.nome);
    expect(response.body.data.telefone).to.equal(passageiroData.telefone);
  });

  it('deve retornar 400 com mensagem de erro quando nome está faltando', async () => {
    const passageiroData = {
      telefone: '+5511999999999'
    };

    const response = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiroData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('deve retornar 400 com mensagem de erro quando telefone está faltando', async () => {
    const passageiroData = {
      nome: 'João Silva'
    };

    const response = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiroData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('motorista nasce disponível e precisa de nome, telefone e placa', () => {
  it('deve retornar 201 com status "disponível" quando todos os campos são fornecidos', async () => {
    const motoristaData = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888',
      placa: 'ABC1234'
    };

    const response = await request(app)
      .post('/usuarios/motoristas')
      .send(motoristaData);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.have.property('id');
    expect(response.body.data.status).to.equal('disponível');
  });

  it('deve retornar 400 quando nome está faltando', async () => {
    const motoristaData = {
      telefone: '+5511888888888',
      placa: 'ABC1234'
    };

    const response = await request(app)
      .post('/usuarios/motoristas')
      .send(motoristaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('deve retornar 400 quando telefone está faltando', async () => {
    const motoristaData = {
      nome: 'Pedro Santos',
      placa: 'ABC1234'
    };

    const response = await request(app)
      .post('/usuarios/motoristas')
      .send(motoristaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('deve retornar 400 quando placa está faltando', async () => {
    const motoristaData = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888'
    };

    const response = await request(app)
      .post('/usuarios/motoristas')
      .send(motoristaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Não posso cadastrar dois usuários com o mesmo telefone', () => {
  it('deve retornar 409 quando tenta cadastrar passageiro com telefone já existente', async () => {
    const telefone = '+5511999999999';
    const passageiro1 = {
      nome: 'João Silva',
      telefone: telefone
    };
    const passageiro2 = {
      nome: 'Maria Santos',
      telefone: telefone
    };

    await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro1);

    const response = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro2);

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('deve retornar 409 quando tenta cadastrar motorista com telefone já existente', async () => {
    const telefone = '+5511888888888';
    const passageiro = {
      nome: 'João Silva',
      telefone: telefone
    };
    const motorista = {
      nome: 'Pedro Santos',
      telefone: telefone,
      placa: 'ABC1234'
    };

    await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);

    const response = await request(app)
      .post('/usuarios/motoristas')
      .send(motorista);

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Mensagens de erro amigáveis quando faltam campos obrigatórios', () => {
  it('deve retornar 400 com mensagem amigável quando passageiro não tem telefone', async () => {
    const passageiroData = {
      nome: 'João Silva'
    };

    const response = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiroData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
    expect(response.body.message).to.be.a('string');
    expect(response.body.message.length).to.be.greaterThan(0);
  });

  it('Deve retornar 400 com mensagem amigável quando motorista não tem placa', async () => {
    const motoristaData = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888'
    };

    const response = await request(app)
      .post('/usuarios/motoristas')
      .send(motoristaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
    expect(response.body.message).to.be.a('string');
    expect(response.body.message.length).to.be.greaterThan(0);
  });
});
