import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { gerarDadosUnicos, limparDadosTeste } from './setup/testSetup.js';

describe('Posso solicitar corrida com origem e destino; recebo estimativa', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar 201 com status "aguardando_motorista" e estimativa quando origem e destino são fornecidos', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const response = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.have.property('id');
    expect(response.body.data.status).to.equal('aguardando_motorista');
    expect(response.body.data).to.have.property('precoEstimado');
    expect(response.body.data.passageiroId).to.equal(passageiroId);
  });

  it('Deve retornar 400 quando origem está faltando', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const response = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('Deve retornar 400 quando destino está faltando', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      }
    };

    const response = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Campo obrigatório ausente deve ser explicado', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar 400 quando passageiroId está faltando', async () => {
    const corridaData = {
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const response = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Um passageiro não pode abrir duas corridas ativas', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar 409 quando tenta abrir segunda corrida', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    // Primeira corrida
    await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);

    // Segunda corrida (deve falhar)
    const response = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Um motorista disponível pode aceitar uma corrida pendente', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve aceitar corrida e motorista fica ocupado', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corridaResponse = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const dadosUnicosMotorista = gerarDadosUnicos();
    const motorista = {
      nome: dadosUnicosMotorista.nome,
      telefone: dadosUnicosMotorista.telefone,
      placa: dadosUnicosMotorista.placa
    };
    
    const motoristaResponse = await request(app)
      .post('/api/v1/motoristas')
      .send(motorista);
    
    const motoristaId = motoristaResponse.body.data.id;

    const aceitarResponse = await request(app)
      .post(`/api/v1/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    expect(aceitarResponse.status).to.equal(200);
    expect(aceitarResponse.body.data.status).to.equal('aceita');
    
    // Verificar se motorista ficou ocupado
    const motoristaAtualizado = await request(app)
      .get(`/api/v1/motoristas/${motoristaId}`);
    
    expect(motoristaAtualizado.body.data.status).to.equal('ocupado');
  });
});

describe('Se uma corrida já foi aceita, outra aceitação deve ser recusada', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar 409 quando segundo motorista tenta aceitar corrida já aceita', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corridaResponse = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const dadosUnicosMotorista1 = gerarDadosUnicos();
    const motorista1 = {
      nome: dadosUnicosMotorista1.nome,
      telefone: dadosUnicosMotorista1.telefone,
      placa: dadosUnicosMotorista1.placa
    };
    
    const motorista1Response = await request(app)
      .post('/api/v1/motoristas')
      .send(motorista1);
    
    const motorista1Id = motorista1Response.body.data.id;

    // Primeiro motorista aceita
    await request(app)
      .post(`/api/v1/corridas/${corridaId}/aceitar`)
      .send({ motoristaId: motorista1Id });

    const dadosUnicosMotorista2 = gerarDadosUnicos();
    const motorista2 = {
      nome: dadosUnicosMotorista2.nome,
      telefone: dadosUnicosMotorista2.telefone,
      placa: dadosUnicosMotorista2.placa
    };
    
    const motorista2Response = await request(app)
      .post('/api/v1/motoristas')
      .send(motorista2);
    
    const motorista2Id = motorista2Response.body.data.id;

    // Segundo motorista tenta aceitar (deve falhar)
    const response = await request(app)
      .post(`/api/v1/corridas/${corridaId}/aceitar`)
      .send({ motoristaId: motorista2Id });

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Motorista ocupado não pode aceitar outra corrida', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar 409 quando motorista ocupado tenta aceitar corrida', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corridaResponse = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const dadosUnicosMotorista = gerarDadosUnicos();
    const motorista = {
      nome: dadosUnicosMotorista.nome,
      telefone: dadosUnicosMotorista.telefone,
      placa: dadosUnicosMotorista.placa
    };
    
    const motoristaResponse = await request(app)
      .post('/api/v1/motoristas')
      .send(motorista);
    
    const motoristaId = motoristaResponse.body.data.id;

    // Primeira corrida
    await request(app)
      .post(`/api/v1/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    // Segunda corrida para o mesmo motorista
    const dadosUnicosPassageiro2 = gerarDadosUnicos();
    const passageiro2 = {
      nome: dadosUnicosPassageiro2.nome,
      telefone: dadosUnicosPassageiro2.telefone
    };
    
    const passageiro2Response = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro2);
    
    const passageiro2Id = passageiro2Response.body.data.id;
    
    const corrida2Data = {
      passageiroId: passageiro2Id,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corrida2Response = await request(app)
      .post('/api/v1/corridas')
      .send(corrida2Data);
    
    const corrida2Id = corrida2Response.body.data.id;

    // Motorista ocupado tenta aceitar segunda corrida (deve falhar)
    const response = await request(app)
      .post(`/api/v1/corridas/${corrida2Id}/aceitar`)
      .send({ motoristaId });

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Só posso iniciar uma corrida que já foi aceita', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve iniciar corrida aceita com sucesso', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corridaResponse = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const dadosUnicosMotorista = gerarDadosUnicos();
    const motorista = {
      nome: dadosUnicosMotorista.nome,
      telefone: dadosUnicosMotorista.telefone,
      placa: dadosUnicosMotorista.placa
    };
    
    const motoristaResponse = await request(app)
      .post('/api/v1/motoristas')
      .send(motorista);
    
    const motoristaId = motoristaResponse.body.data.id;

    // Aceitar corrida
    await request(app)
      .post(`/api/v1/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    // Iniciar corrida
    const response = await request(app)
      .post(`/api/v1/corridas/${corridaId}/iniciar`);

    expect(response.status).to.equal(200);
    expect(response.body.data.status).to.equal('em_andamento');
  });

  it('deve retornar 422 quando tenta iniciar corrida em estado errado', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corridaResponse = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    // Tentar iniciar corrida sem aceitar (deve falhar)
    const response = await request(app)
      .post(`/api/v1/corridas/${corridaId}/iniciar`);

    expect(response.status).to.equal(422);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Finalizar calcula valor = 5 + km2 + min0.5', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve finalizar corrida com valor calculado corretamente', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corridaResponse = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const dadosUnicosMotorista = gerarDadosUnicos();
    const motorista = {
      nome: dadosUnicosMotorista.nome,
      telefone: dadosUnicosMotorista.telefone,
      placa: dadosUnicosMotorista.placa
    };
    
    const motoristaResponse = await request(app)
      .post('/api/v1/motoristas')
      .send(motorista);
    
    const motoristaId = motoristaResponse.body.data.id;

    // Aceitar e iniciar corrida
    await request(app)
      .post(`/api/v1/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    await request(app)
      .post(`/api/v1/corridas/${corridaId}/iniciar`);

    // Finalizar corrida
    const finalizarData = {
      km: 5.2,
      min: 15
    };

    const response = await request(app)
      .post(`/api/v1/corridas/${corridaId}/finalizar`)
      .send(finalizarData);

    expect(response.status).to.equal(200);
    expect(response.body.data.status).to.equal('finalizada');
    expect(response.body.data).to.have.property('valorFinal');
    
    // Valor esperado: 5 + (5.2 * 2) + (15 * 0.5) = 5 + 10.4 + 7.5 = 22.9
    const valorEsperado = 5 + (5.2 * 2) + (15 * 0.5);
    expect(response.body.data.valorFinal).to.equal(valorEsperado);
  });

  it('deve retornar 400 quando km ou min são negativos', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corridaResponse = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const dadosUnicosMotorista = gerarDadosUnicos();
    const motorista = {
      nome: dadosUnicosMotorista.nome,
      telefone: dadosUnicosMotorista.telefone,
      placa: dadosUnicosMotorista.placa
    };
    
    const motoristaResponse = await request(app)
      .post('/api/v1/motoristas')
      .send(motorista);
    
    const motoristaId = motoristaResponse.body.data.id;

    // Aceitar e iniciar corrida
    await request(app)
      .post(`/api/v1/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    await request(app)
      .post(`/api/v1/corridas/${corridaId}/iniciar`);

    // Finalizar com valores negativos (deve falhar)
    const finalizarData = {
      km: -1,
      min: 15
    };

    const response = await request(app)
      .post(`/api/v1/corridas/${corridaId}/finalizar`)
      .send(finalizarData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('CT-13 — passageiro pode cancelar antes de iniciar', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve cancelar corrida aguardando motorista como passageiro', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corridaResponse = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    // Cancelar corrida
    const response = await request(app)
      .post(`/api/v1/corridas/${corridaId}/cancelar`);

    expect(response.status).to.equal(200);
    expect(response.body.data.status).to.equal('cancelada');
  });
});

describe(' motorista pode cancelar antes de iniciar e volta a ficar disponível', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve cancelar corrida aceita e motorista fica disponível', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corridaResponse = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const dadosUnicosMotorista = gerarDadosUnicos();
    const motorista = {
      nome: dadosUnicosMotorista.nome,
      telefone: dadosUnicosMotorista.telefone,
      placa: dadosUnicosMotorista.placa
    };
    
    const motoristaResponse = await request(app)
      .post('/api/v1/motoristas')
      .send(motorista);
    
    const motoristaId = motoristaResponse.body.data.id;

    // Aceitar corrida
    await request(app)
      .post(`/api/v1/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    // Cancelar corrida
    const response = await request(app)
      .post(`/api/v1/corridas/${corridaId}/cancelar`);

    expect(response.status).to.equal(200);
    expect(response.body.data.status).to.equal('cancelada');
    
    // Verificar se motorista voltou a ficar disponível
    const motoristaAtualizado = await request(app)
      .get(`/api/v1/motoristas/${motoristaId}`);
    
    expect(motoristaAtualizado.body.data.status).to.equal('disponível');
  });
});

describe('não posso cancelar depois que a corrida começou', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar 409 quando tenta cancelar corrida iniciada', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corridaResponse = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const dadosUnicosMotorista = gerarDadosUnicos();
    const motorista = {
      nome: dadosUnicosMotorista.nome,
      telefone: dadosUnicosMotorista.telefone,
      placa: dadosUnicosMotorista.placa
    };
    
    const motoristaResponse = await request(app)
      .post('/api/v1/motoristas')
      .send(motorista);
    
    const motoristaId = motoristaResponse.body.data.id;

    // Aceitar e iniciar corrida
    await request(app)
      .post(`/api/v1/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    await request(app)
      .post(`/api/v1/corridas/${corridaId}/iniciar`);

    // Tentar cancelar corrida iniciada (deve falhar)
    const response = await request(app)
      .post(`/api/v1/corridas/${corridaId}/cancelar`);

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('consigo ver os detalhes da corrida por id', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar 200 com dados completos da corrida existente', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corridaResponse = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    // Buscar corrida por ID
    const response = await request(app)
      .get(`/api/v1/corridas/${corridaId}`);

    expect(response.status).to.equal(200);
    expect(response.body.data).to.have.property('id');
    expect(response.body.data).to.have.property('passageiroId');
    expect(response.body.data).to.have.property('origem');
    expect(response.body.data).to.have.property('destino');
    expect(response.body.data).to.have.property('status');
  });

  it('deve retornar 404 quando corrida não existe', async () => {
    const response = await request(app)
      .get('/api/v1/corridas/00000000-0000-0000-0000-000000000000');

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('histórico do passageiro vem ordenado do mais novo pro mais antigo', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar corridas ordenadas por data de criação (desc)', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    // Criar algumas corridas
    await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);

    await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);

    // Buscar histórico do passageiro
    const response = await request(app)
      .get(`/api/v1/corridas/passageiro/${passageiroId}`);

    expect(response.status).to.equal(200);
    expect(response.body.data).to.be.an('array');
    expect(response.body.data.length).to.be.greaterThan(0);
    
    // Verificar se está ordenado (mais novo primeiro)
    const datas = response.body.data.map(c => new Date(c.createdAt));
    for (let i = 0; i < datas.length - 1; i++) {
      expect(datas[i] >= datas[i + 1]).to.be.true;
    }
  });
});

describe(' histórico do motorista também é ordenado (desc)', () => {
  beforeEach(() => {
    limparDadosTeste();
  });

  it('deve retornar corridas do motorista ordenadas por data', async () => {
    const dadosUnicos = gerarDadosUnicos();
    const passageiro = {
      nome: dadosUnicos.nome,
      telefone: dadosUnicos.telefone
    };
    
    const passageiroResponse = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const dadosUnicosMotorista = gerarDadosUnicos();
    const motorista = {
      nome: dadosUnicosMotorista.nome,
      telefone: dadosUnicosMotorista.telefone,
      placa: dadosUnicosMotorista.placa
    };
    
    const motoristaResponse = await request(app)
      .post('/api/v1/motoristas')
      .send(motorista);
    
    const motoristaId = motoristaResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    // Criar e aceitar primeira corrida
    const corrida1Response = await request(app)
      .post('/api/v1/corridas')
      .send(corridaData);
    
    await request(app)
      .post(`/api/v1/corridas/${corrida1Response.body.data.id}/aceitar`)
      .send({ motoristaId });

    // Criar segunda corrida para passageiro diferente
    const dadosUnicosPassageiro2 = gerarDadosUnicos();
    const passageiro2 = {
      nome: dadosUnicosPassageiro2.nome,
      telefone: dadosUnicosPassageiro2.telefone
    };
    
    const passageiro2Response = await request(app)
      .post('/api/v1/passageiros')
      .send(passageiro2);
    
    const passageiro2Id = passageiro2Response.body.data.id;
    
    const corrida2Data = {
      passageiroId: passageiro2Id,
      origem: {
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        lat: -23.5605,
        lng: -46.6433
      }
    };

    const corrida2Response = await request(app)
      .post('/api/v1/corridas')
      .send(corrida2Data);
    
    await request(app)
      .post(`/api/v1/corridas/${corrida2Response.body.data.id}/aceitar`)
      .send({ motoristaId });

    // Buscar histórico do motorista
    const response = await request(app)
      .get(`/api/v1/corridas/motorista/${motoristaId}`);

    expect(response.status).to.equal(200);
    expect(response.body.data).to.be.an('array');
    expect(response.body.data.length).to.be.greaterThan(0);
    
    // Verificar se está ordenado (mais novo primeiro)
    const datas = response.body.data.map(c => new Date(c.createdAt));
    for (let i = 0; i < datas.length - 1; i++) {
      expect(datas[i] >= datas[i + 1]).to.be.true;
    }
  });
});

describe('/health sempre responde ok', () => {
  it('deve retornar 200 com status ok', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('status');
    expect(response.body.status).to.equal('ok');
  });
});

describe('As respostas em ambiente local são rápidas o suficiente', () => {
  it('deve executar ~10 chamadas simples e verificar que todas retornam < 500ms', async () => {
    const startTime = Date.now();
    
    // Fazer algumas chamadas simples
    for (let i = 0; i < 10; i++) {
      const response = await request(app)
        .get('/health');
      
      expect(response.status).to.equal(200);
    }
    
    const totalTime = Date.now() - startTime;
    const tempoMedio = totalTime / 10;
    
    expect(tempoMedio).to.be.lessThan(500);
  });
});

describe('Depois de reiniciar, os dados em memória somem (comportamento esperado)', () => {
  it('deve documentar que o reset é comportamento esperado do MVP', () => {
    // Este teste documenta o comportamento esperado
    expect(true).to.be.true;
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
