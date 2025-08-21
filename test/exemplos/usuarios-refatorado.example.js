import { expect } from 'chai';
import { 
  setupTestHooks, 
  setupUsuarioTestHooks, 
  setupCustomAssertions,
  testConfig 
} from '../setup/testSetup.js';
import { 
  criarPassageiroTeste, 
  criarMotoristaTeste, 
  validarRespostaSucesso, 
  validarRespostaErro,
  gerarTelefoneUnico,
  gerarPlacaUnica
} from '../helpers/testHelpers.js';
import { 
  passageirosFixture, 
  motoristasFixture, 
  errosFixture,
  gerarDadosUnicos 
} from '../fixtures/testData.js';

setupTestHooks();
setupCustomAssertions();

describe('deve criar um passageiro quando informo nome e telefone válidos; recusar se faltar algo', () => {
  const usuarioHooks = setupUsuarioTestHooks();

  it('deve retornar 201 com dados do passageiro quando nome e telefone são fornecidos', async function() {
    const dadosUnicos = gerarDadosUnicos();
    const passageiroData = {
      nome: dadosUnicos.passageiro.nome,
      telefone: dadosUnicos.passageiro.telefone
    };

    const response = await criarPassageiroTeste(passageiroData);

    validarRespostaSucesso(response, 201);
    expect(response.body.data).to.validUser();
    expect(response.body.data.nome).to.equal(passageiroData.nome);
    expect(response.body.data.telefone).to.equal(passageiroData.telefone);
    
    usuarioHooks.adicionarUsuario(response.body.data);
  });

  it('deve retornar 400 com mensagem de erro quando nome está faltando', async function() {
    const passageiroData = {
      telefone: gerarTelefoneUnico()
    };

    const response = await criarPassageiroTeste(passageiroData);

    validarRespostaErro(response, 400);
    expect(response.body.message).to.be.a('string');
    expect(response.body.message.length).to.be.greaterThan(0);
  });

  it('deve retornar 400 com mensagem de erro quando telefone está faltando', async function() {
    const passageiroData = {
      nome: 'João Silva'
    };

    const response = await criarPassageiroTeste(passageiroData);

    validarRespostaErro(response, 400);
    expect(response.body.message).to.be.a('string');
    expect(response.body.message.length).to.be.greaterThan(0);
  });

  it('deve retornar 400 com mensagem de erro quando ambos os campos estão faltando', async function() {
    const passageiroData = {};

    const response = await criarPassageiroTeste(passageiroData);

    validarRespostaErro(response, 400);
    expect(response.body.message).to.be.a('string');
    expect(response.body.message.length).to.be.greaterThan(0);
  });
});

describe('motorista nasce disponível e precisa de nome, telefone e placa', () => {
  const usuarioHooks = setupUsuarioTestHooks();

  it('deve retornar 201 com status "disponível" quando todos os campos são fornecidos', async function() {
    const dadosUnicos = gerarDadosUnicos();
    const motoristaData = {
      nome: dadosUnicos.motorista.nome,
      telefone: dadosUnicos.motorista.telefone,
      placa: dadosUnicos.motorista.placa
    };

    const response = await criarMotoristaTeste(motoristaData);

    validarRespostaSucesso(response, 201);
    expect(response.body.data).to.validUser();
    expect(response.body.data.nome).to.equal(motoristaData.nome);
    expect(response.body.data.telefone).to.equal(motoristaData.telefone);
    expect(response.body.data.placa).to.equal(motoristaData.placa);
    expect(response.body.data.status).to.equal('disponível');
    
    usuarioHooks.adicionarUsuario(response.body.data);
  });

  it('deve retornar 400 quando nome está faltando', async function() {
    const motoristaData = {
      telefone: gerarTelefoneUnico(),
      placa: gerarPlacaUnica()
    };

    const response = await criarMotoristaTeste(motoristaData);

    validarRespostaErro(response, 400);
  });

  it('deve retornar 400 quando telefone está faltando', async function() {
    const motoristaData = {
      nome: 'Pedro Santos',
      placa: gerarPlacaUnica()
    };

    const response = await criarMotoristaTeste(motoristaData);

    validarRespostaErro(response, 400);
  });

  it('deve retornar 400 quando placa está faltando', async function() {
    const motoristaData = {
      nome: 'Pedro Santos',
      telefone: gerarTelefoneUnico()
    };

    const response = await criarMotoristaTeste(motoristaData);

    validarRespostaErro(response, 400);
  });

  it('deve retornar 400 quando todos os campos estão faltando', async function() {
    const motoristaData = {};

    const response = await criarMotoristaTeste(motoristaData);

    validarRespostaErro(response, 400);
  });
});

describe('não posso cadastrar dois usuários com o mesmo telefone', () => {
  const usuarioHooks = setupUsuarioTestHooks();

  it('deve retornar 409 quando tenta cadastrar passageiro com telefone já existente', async function() {
    const telefone = gerarTelefoneUnico();
    const passageiro1 = {
      nome: 'João Silva',
      telefone: telefone
    };
    const passageiro2 = {
      nome: 'Maria Santos',
      telefone: telefone
    };

    const response1 = await criarPassageiroTeste(passageiro1);
    expect(response1.status).to.equal(201);
    usuarioHooks.adicionarUsuario(response1.body.data);

    const response2 = await criarPassageiroTeste(passageiro2);

    validarRespostaErro(response2, 409);
    expect(response2.body.code).to.equal(errosFixture.telefoneDuplicado.code);
  });

  it('deve retornar 409 quando tenta cadastrar motorista com telefone já existente', async function() {
    const telefone = gerarTelefoneUnico();
    const passageiro = {
      nome: 'João Silva',
      telefone: telefone
    };
    const motorista = {
      nome: 'Pedro Santos',
      telefone: telefone,
      placa: gerarPlacaUnica()
    };

    const response1 = await criarPassageiroTeste(passageiro);
    expect(response1.status).to.equal(201);
    usuarioHooks.adicionarUsuario(response1.body.data);

    const response2 = await criarMotoristaTeste(motorista);

    validarRespostaErro(response2, 409);
    expect(response2.body.code).to.equal(errosFixture.telefoneDuplicado.code);
  });

  it('deve retornar 409 quando tenta cadastrar passageiro com telefone de motorista existente', async function() {
    const telefone = gerarTelefoneUnico();
    const motorista = {
      nome: 'Pedro Santos',
      telefone: telefone,
      placa: gerarPlacaUnica()
    };
    const passageiro = {
      nome: 'João Silva',
      telefone: telefone
    };

    const response1 = await criarMotoristaTeste(motorista);
    expect(response1.status).to.equal(201);
    usuarioHooks.adicionarUsuario(response1.body.data);

    const response2 = await criarPassageiroTeste(passageiro);

    validarRespostaErro(response2, 409);
    expect(response2.body.code).to.equal(errosFixture.telefoneDuplicado.code);
  });
});

describe('mensagens de erro amigáveis quando faltam campos obrigatórios', () => {
  it('deve retornar 400 com mensagem amigável quando passageiro não tem telefone', async function() {
    const passageiroData = {
      nome: passageirosFixture.joao.nome
    };

    const response = await criarPassageiroTeste(passageiroData);

    validarRespostaErro(response, 400);
    expect(response.body.message).to.be.a('string');
    expect(response.body.message.length).to.be.greaterThan(0);
  });

  it('deve retornar 400 com mensagem amigável quando motorista não tem placa', async function() {
    const motoristaData = {
      nome: motoristasFixture.pedro.nome,
      telefone: motoristasFixture.pedro.telefone
    };

    const response = await criarMotoristaTeste(motoristaData);

    validarRespostaErro(response, 400);
    expect(response.body.message).to.be.a('string');
    expect(response.body.message.length).to.be.greaterThan(0);
  });
});
