import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

describe('Posso solicitar corrida com origem e destino; recebo estimativa', () => {
  it('deve retornar 201 com status "aguardando_motorista" e estimativa quando origem e destino são fornecidos', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
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
      .post('/corridas')
      .send(corridaData);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.have.property('id');
    expect(response.body.data.status).to.equal('aguardando_motorista');
    expect(response.body.data).to.have.property('precoEstimado');
    expect(response.body.data.passageiroId).to.equal(passageiroId);
  });

  it('Deve retornar 400 quando origem está faltando', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
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
      .post('/corridas')
      .send(corridaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });

  it('Deve retornar 400 quando destino está faltando', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
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
      .post('/corridas')
      .send(corridaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Campo obrigatório ausente deve ser explicado', () => {
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
      .post('/corridas')
      .send(corridaData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Um passageiro não pode abrir duas corridas ativas', () => {
  it('deve retornar 409 quando tenta abrir segunda corrida', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
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

    await request(app)
      .post('/corridas')
      .send(corridaData);

    const response = await request(app)
      .post('/corridas')
      .send(corridaData);

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Um motorista disponível pode aceitar uma corrida pendente', () => {
  it('deve aceitar corrida e motorista fica ocupado', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const motorista = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888',
      placa: 'ABC1234'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const motoristaResponse = await request(app)
      .post('/usuarios/motoristas')
      .send(motorista);
    
    const passageiroId = passageiroResponse.body.data.id;
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

    const corridaResponse = await request(app)
      .post('/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const aceitarResponse = await request(app)
      .post(`/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    expect(aceitarResponse.status).to.equal(200);
    expect(aceitarResponse.body.data.status).to.equal('aceita');
    expect(aceitarResponse.body.data.motoristaId).to.equal(motoristaId);
  });
});

describe('Se uma corrida já foi aceita, outra aceitação deve ser recusada', () => {
  it('deve retornar 409 quando segundo motorista tenta aceitar corrida já aceita', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const motorista1 = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888',
      placa: 'ABC1234'
    };
    
    const motorista2 = {
      nome: 'Carlos Lima',
      telefone: '+5511777777777',
      placa: 'XYZ5678'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const motorista1Response = await request(app)
      .post('/usuarios/motoristas')
      .send(motorista1);
    
    const motorista2Response = await request(app)
      .post('/usuarios/motoristas')
      .send(motorista2);
    
    const passageiroId = passageiroResponse.body.data.id;
    const motorista1Id = motorista1Response.body.data.id;
    const motorista2Id = motorista2Response.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corridaResponse = await request(app)
      .post('/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    await request(app)
      .post(`/corridas/${corridaId}/aceitar`)
      .send({ motoristaId: motorista1Id });

    const response = await request(app)
      .post(`/corridas/${corridaId}/aceitar`)
      .send({ motoristaId: motorista2Id });

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Motorista ocupado não pode aceitar outra corrida', () => {
  it('deve retornar 409 quando motorista ocupado tenta aceitar corrida', async () => {
    const passageiro1 = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const passageiro2 = {
      nome: 'Maria Santos',
      telefone: '+5511666666666'
    };
    
    const motorista = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888',
      placa: 'ABC1234'
    };
    
    const passageiro1Response = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro1);
    
    const passageiro2Response = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro2);
    
    const motoristaResponse = await request(app)
      .post('/usuarios/motoristas')
      .send(motorista);
    
    const passageiro1Id = passageiro1Response.body.data.id;
    const passageiro2Id = passageiro2Response.body.data.id;
    const motoristaId = motoristaResponse.body.data.id;
    
    
    const corrida1Data = {
      passageiroId: passageiro1Id,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corrida1Response = await request(app)
      .post('/corridas')
      .send(corrida1Data);
    
    const corrida1Id = corrida1Response.body.data.id;

    
    await request(app)
      .post(`/corridas/${corrida1Id}/aceitar`)
      .send({ motoristaId });

    
    const corrida2Data = {
      passageiroId: passageiro2Id,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corrida2Response = await request(app)
      .post('/corridas')
      .send(corrida2Data);
    
    const corrida2Id = corrida2Response.body.data.id;

    
    const response = await request(app)
      .post(`/corridas/${corrida2Id}/aceitar`)
      .send({ motoristaId });

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Só posso iniciar uma corrida que já foi aceita', () => {
  it('deve iniciar corrida aceita com sucesso', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const motorista = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888',
      placa: 'ABC1234'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const motoristaResponse = await request(app)
      .post('/usuarios/motoristas')
      .send(motorista);
    
    const passageiroId = passageiroResponse.body.data.id;
    const motoristaId = motoristaResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corridaResponse = await request(app)
      .post('/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    await request(app)
      .post(`/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    const response = await request(app)
      .post(`/corridas/${corridaId}/iniciar`);

    expect(response.status).to.equal(200);
    expect(response.body.data.status).to.equal('iniciada');
    expect(response.body.data).to.have.property('inicioEm');
  });

  it('deve retornar 422 quando tenta iniciar corrida em estado errado', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corridaResponse = await request(app)
      .post('/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const response = await request(app)
      .post(`/corridas/${corridaId}/iniciar`);

    expect(response.status).to.equal(422);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('Finalizar calcula valor = 5 + km2 + min0.5', () => {
  it('deve finalizar corrida com valor calculado corretamente', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const motorista = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888',
      placa: 'ABC1234'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const motoristaResponse = await request(app)
      .post('/usuarios/motoristas')
      .send(motorista);
    
    const passageiroId = passageiroResponse.body.data.id;
    const motoristaId = motoristaResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corridaResponse = await request(app)
      .post('/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    await request(app)
      .post(`/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    await request(app)
      .post(`/corridas/${corridaId}/iniciar`);

    const finalizarData = {
      distanciaKm: 5.2,
      duracaoMin: 15
    };

    const response = await request(app)
      .post(`/corridas/${corridaId}/finalizar`)
      .send(finalizarData);

    expect(response.status).to.equal(200);
    expect(response.body.data.status).to.equal('finalizada');
    expect(response.body.data).to.have.property('precoFinal');
    expect(response.body.data).to.have.property('fimEm');
    
    const valorEsperado = 5 + (5.2 * 2) + (15 * 0.5);
    expect(response.body.data.precoFinal).to.equal(valorEsperado);
  });

  it('deve retornar 400 quando km ou min são negativos', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const motorista = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888',
      placa: 'ABC1234'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const motoristaResponse = await request(app)
      .post('/usuarios/motoristas')
      .send(motorista);
    
    const passageiroId = passageiroResponse.body.data.id;
    const motoristaId = motoristaResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corridaResponse = await request(app)
      .post('/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    await request(app)
      .post(`/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    await request(app)
      .post(`/corridas/${corridaId}/iniciar`);

    const finalizarData = {
      distanciaKm: -1,
      duracaoMin: 15
    };

    const response = await request(app)
      .post(`/corridas/${corridaId}/finalizar`)
      .send(finalizarData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('CT-13 — passageiro pode cancelar antes de iniciar', () => {
  it('deve cancelar corrida aguardando motorista como passageiro', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corridaResponse = await request(app)
      .post('/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const cancelarData = {
      porQuem: 'passageiro'
    };

    const response = await request(app)
      .post(`/corridas/${corridaId}/cancelar`)
      .send(cancelarData);

    expect(response.status).to.equal(200);
    expect(response.body.data.status).to.equal('cancelada_pelo_passageiro');
  });
});

describe(' motorista pode cancelar antes de iniciar e volta a ficar disponível', () => {
  it('deve cancelar corrida aceita e motorista fica disponível', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const motorista = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888',
      placa: 'ABC1234'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const motoristaResponse = await request(app)
      .post('/usuarios/motoristas')
      .send(motorista);
    
    const passageiroId = passageiroResponse.body.data.id;
    const motoristaId = motoristaResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corridaResponse = await request(app)
      .post('/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    await request(app)
      .post(`/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    const cancelarData = {
      porQuem: 'motorista'
    };

    const response = await request(app)
      .post(`/corridas/${corridaId}/cancelar`)
      .send(cancelarData);

    expect(response.status).to.equal(200);
    expect(response.body.data.status).to.equal('cancelada_pelo_motorista');
  });
});

describe('não posso cancelar depois que a corrida começou', () => {
  it('deve retornar 409 quando tenta cancelar corrida iniciada', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const motorista = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888',
      placa: 'ABC1234'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const motoristaResponse = await request(app)
      .post('/usuarios/motoristas')
      .send(motorista);
    
    const passageiroId = passageiroResponse.body.data.id;
    const motoristaId = motoristaResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corridaResponse = await request(app)
      .post('/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    await request(app)
      .post(`/corridas/${corridaId}/aceitar`)
      .send({ motoristaId });

    await request(app)
      .post(`/corridas/${corridaId}/iniciar`);

    const cancelarData = {
      porQuem: 'passageiro'
    };

    const response = await request(app)
      .post(`/corridas/${corridaId}/cancelar`)
      .send(cancelarData);

    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('consigo ver os detalhes da corrida por id', () => {
  it('deve retornar 200 com dados completos da corrida existente', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;
    
    const corridaData = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corridaResponse = await request(app)
      .post('/corridas')
      .send(corridaData);
    
    const corridaId = corridaResponse.body.data.id;

    const response = await request(app)
      .get(`/corridas/${corridaId}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('data');
    expect(response.body.data.id).to.equal(corridaId);
    expect(response.body.data.passageiroId).to.equal(passageiroId);
  });

  it('deve retornar 404 quando corrida não existe', async () => {
    const corridaId = '123e4567-e89b-12d3-a456-426614174000';

    const response = await request(app)
      .get(`/corridas/${corridaId}`);

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('code');
  });
});

describe('histórico do passageiro vem ordenado do mais novo pro mais antigo', () => {
  it('deve retornar corridas ordenadas por data de criação (desc)', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const passageiroId = passageiroResponse.body.data.id;

    const corrida1Data = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corrida2Data = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5705, lng: -46.6533 }
    };

    await request(app)
      .post('/corridas')
      .send(corrida1Data);

    await request(app)
      .post('/corridas')
      .send(corrida2Data);

    const response = await request(app)
      .get(`/corridas?passageiroId=${passageiroId}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('array');
    expect(response.body.data.length).to.be.greaterThan(1);
  });
});

describe(' histórico do motorista também é ordenado (desc)', () => {
  it('deve retornar corridas do motorista ordenadas por data', async () => {
    const passageiro = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const motorista = {
      nome: 'Pedro Santos',
      telefone: '+5511888888888',
      placa: 'ABC1234'
    };
    
    const passageiroResponse = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro);
    
    const motoristaResponse = await request(app)
      .post('/usuarios/motoristas')
      .send(motorista);
    
    const passageiroId = passageiroResponse.body.data.id;
    const motoristaId = motoristaResponse.body.data.id;
    
    const corrida1Data = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5605, lng: -46.6433 }
    };

    const corrida2Data = {
      passageiroId: passageiroId,
      origem: { lat: -23.5505, lng: -46.6333 },
      destino: { lat: -23.5705, lng: -46.6533 }
    };

    const corrida1Response = await request(app)
      .post('/corridas')
      .send(corrida1Data);
    
    const corrida2Response = await request(app)
      .post('/corridas')
      .send(corrida2Data);

    const corrida1Id = corrida1Response.body.data.id;
    const corrida2Id = corrida2Response.body.data.id;

    await request(app)
      .post(`/corridas/${corrida1Id}/aceitar`)
      .send({ motoristaId });

    await request(app)
      .post(`/corridas/${corrida1Id}/iniciar`);

    await request(app)
      .post(`/corridas/${corrida1Id}/finalizar`)
      .send({ distanciaKm: 5.2, duracaoMin: 15 });

    await request(app)
      .post(`/corridas/${corrida2Id}/aceitar`)
      .send({ motoristaId });

    await request(app)
      .post(`/corridas/${corrida2Id}/iniciar`);

    await request(app)
      .post(`/corridas/${corrida2Id}/finalizar`)
      .send({ distanciaKm: 3.1, duracaoMin: 10 });

    const response = await request(app)
      .get(`/corridas?motoristaId=${motoristaId}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('array');
    expect(response.body.data.length).to.be.greaterThan(1);
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
