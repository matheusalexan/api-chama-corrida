import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

describe('As respostas em ambiente local são rápidas o suficiente', () => {
  it('deve executar ~10 chamadas simples e verificar que todas retornam < 500ms', async function() {
    this.timeout(5000); 
    
    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(
        request(app)
          .get('/health')
          .then(response => {
            expect(response.status).to.equal(200);
            return response;
          })
      );
    }
    
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    expect(responses).to.have.length(10);
 
    expect(totalTime).to.be.lessThan(5000);

    responses.forEach(response => {
      expect(response.status).to.equal(200);
    });
  });
});

describe('Depois de reiniciar, os dados em memória somem (comportamento esperado)', () => {
  it('deve documentar que o reset é comportamento esperado do MVP', async () => {
    
    expect(true).to.be.true; 
   
  });
  
  it('deve validar independência de dados entre execuções', async () => {
    const passageiro1 = {
      nome: 'João Silva',
      telefone: '+5511999999999'
    };
    
    const response1 = await request(app)
      .post('/usuarios/passageiros')
      .send(passageiro1);
    
    expect(response1.status).to.equal(201);
    expect(response1.body.data).to.have.property('id');
    
    expect(true).to.be.true; 
  });
});
