export const passageirosFixture = {
  joao: {
    nome: 'João Silva',
    telefone: '+5511999999999'
  },
  maria: {
    nome: 'Maria Santos',
    telefone: '+5511888888888'
  },
  carlos: {
    nome: 'Carlos Lima',
    telefone: '+5511777777777'
  },
  ana: {
    nome: 'Ana Costa',
    telefone: '+5511666666666'
  },
  pedro: {
    nome: 'Pedro Oliveira',
    telefone: '+5511555555555'
  }
};

export const motoristasFixture = {
  pedro: {
    nome: 'Pedro Santos',
    telefone: '+5511444444444',
    placa: 'ABC1234'
  },
  carlos: {
    nome: 'Carlos Silva',
    telefone: '+5511333333333',
    placa: 'XYZ5678'
  },
  marcos: {
    nome: 'Marcos Costa',
    telefone: '+5511222222222',
    placa: 'DEF9012'
  },
  roberto: {
    nome: 'Roberto Lima',
    telefone: '+5511111111111',
    placa: 'GHI3456'
  }
};

export const coordenadasFixture = {
  saoPaulo: {
    origem: {
      lat: -23.5505,
      lng: -46.6333
    },
    destino: {
      lat: -23.5605,
      lng: -46.6433
    }
  },
  rioDeJaneiro: {
    origem: {
      lat: -22.9068,
      lng: -43.1729
    },
    destino: {
      lat: -22.9519,
      lng: -43.2105
    }
  },
  beloHorizonte: {
    origem: {
      lat: -19.9167,
      lng: -43.9345
    },
    destino: {
      lat: -19.9245,
      lng: -43.9352
    }
  }
};

export const corridasFixture = {
  corridaSimples: {
    distanciaKm: 5.2,
    duracaoMin: 15,
    precoEsperado: 22.9
  },
  corridaMedia: {
    distanciaKm: 12.5,
    duracaoMin: 25,
    precoEsperado: 37.5
  },
  corridaLonga: {
    distanciaKm: 25.0,
    duracaoMin: 45,
    precoEsperado: 67.5
  }
};

export const errosFixture = {
  camposObrigatorios: {
    message: 'Campos obrigatórios não informados',
    code: 'CAMPOS_OBRIGATORIOS'
  },
  telefoneDuplicado: {
    message: 'Telefone já cadastrado',
    code: 'TELEFONE_DUPLICADO'
  },
  corridaEmAndamento: {
    message: 'Passageiro já possui corrida em andamento',
    code: 'CORRIDA_EM_ANDAMENTO'
  },
  motoristaIndisponivel: {
    message: 'Motorista não está disponível',
    code: 'MOTORISTA_INDISPONIVEL'
  },
  estadoInvalido: {
    message: 'Estado inválido da corrida',
    code: 'ESTADO_INVALIDO'
  },
  naoEncontrado: {
    message: 'Recurso não encontrado',
    code: 'NAO_ENCONTRADO'
  }
};

export const statusCorridaFixture = {
  aguardandoMotorista: 'aguardando_motorista',
  aceita: 'aceita',
  iniciada: 'iniciada',
  finalizada: 'finalizada',
  canceladaPeloPassageiro: 'cancelada_pelo_passageiro',
  canceladaPeloMotorista: 'cancelada_pelo_motorista'
};

export const statusMotoristaFixture = {
  disponivel: 'disponível',
  ocupado: 'ocupado'
};

export function gerarDadosUnicos() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  return {
    passageiro: {
      nome: `Usuário Teste ${timestamp}`,
      telefone: `+5511${timestamp.toString().slice(-8)}`
    },
    motorista: {
      nome: `Motorista Teste ${timestamp}`,
      telefone: `+5511${timestamp.toString().slice(-8)}`,
      placa: `TST${random.toString().padStart(4, '0')}`
    }
  };
}

export function gerarPassageirosEmLote(quantidade = 5) {
  const passageiros = [];
  
  for (let i = 0; i < quantidade; i++) {
    const timestamp = Date.now() + i;
    passageiros.push({
      nome: `Passageiro ${i + 1}`,
      telefone: `+5511${timestamp.toString().slice(-8)}`
    });
  }
  
  return passageiros;
}

export function gerarMotoristasEmLote(quantidade = 3) {
  const motoristas = [];
  
  for (let i = 0; i < quantidade; i++) {
    const timestamp = Date.now() + i;
    motoristas.push({
      nome: `Motorista ${i + 1}`,
      telefone: `+5511${timestamp.toString().slice(-8)}`,
      placa: `MOT${(i + 1).toString().padStart(3, '0')}`
    });
  }
  
  return motoristas;
}
