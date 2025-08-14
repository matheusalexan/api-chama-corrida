import { Erro } from '../models/Erro.js';

/**
 * Middleware para validação de UUID
 */
export const validarUUID = (paramName) => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    
    if (!uuid) {
      return next(Erro.criarErroValidacao(`Parâmetro ${paramName} é obrigatório`));
    }

    // Regex para validar UUID v4
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(uuid)) {
      return next(Erro.criarErroValidacao(`Parâmetro ${paramName} deve ser um UUID válido`));
    }

    next();
  };
};

/**
 * Middleware para validação de paginação
 */
export const validarPaginacao = (req, res, next) => {
  const { pagina, limite } = req.query;
  
  // Valores padrão
  let paginaNum = 1;
  let limiteNum = 20;

  // Validação da página
  if (pagina !== undefined) {
    paginaNum = parseInt(pagina);
    if (isNaN(paginaNum) || paginaNum < 1) {
      return next(Erro.criarErroValidacao('Parâmetro página deve ser um número maior que 0'));
    }
  }

  // Validação do limite
  if (limite !== undefined) {
    limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum < 1 || limiteNum > 100) {
      return next(Erro.criarErroValidacao('Parâmetro limite deve ser um número entre 1 e 100'));
    }
  }

  // Adiciona os valores validados ao request
  req.paginacao = {
    pagina: paginaNum,
    limite: limiteNum,
    offset: (paginaNum - 1) * limiteNum
  };

  next();
};

/**
 * Middleware para validação de coordenadas
 */
export const validarCoordenadas = (req, res, next) => {
  const { origemLat, origemLng, destinoLat, destinoLng } = req.body;

  // Validação de latitude e longitude
  const validarLat = (lat, nome) => {
    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      throw Erro.criarErroValidacao(`${nome} deve ser um número entre -90 e 90`);
    }
  };

  const validarLng = (lng, nome) => {
    if (typeof lng !== 'number' || lng < -180 || lng > 180) {
      throw Erro.criarErroValidacao(`${nome} deve ser um número entre -180 e 180`);
    }
  };

  try {
    if (origemLat !== undefined) validarLat(origemLat, 'origemLat');
    if (origemLng !== undefined) validarLng(origemLng, 'origemLng');
    if (destinoLat !== undefined) validarLat(destinoLat, 'destinoLat');
    if (destinoLng !== undefined) validarLng(destinoLng, 'destinoLng');

    // Validação de origem diferente do destino
    if (origemLat !== undefined && origemLng !== undefined && 
        destinoLat !== undefined && destinoLng !== undefined) {
      if (origemLat === destinoLat && origemLng === destinoLng) {
        throw Erro.criarErroValidacao('Origem e destino não podem ser iguais');
      }
    }

    next();
  } catch (erro) {
    next(erro);
  }
};

/**
 * Middleware para validação de categoria
 */
export const validarCategoria = (req, res, next) => {
  const { categoria } = req.body;
  
  if (categoria && !['ECONOMY', 'COMFORT'].includes(categoria)) {
    return next(Erro.criarErroValidacao('Categoria deve ser ECONOMY ou COMFORT'));
  }

  next();
};

/**
 * Middleware para validação de telefone E.164
 */
export const validarTelefoneE164 = (req, res, next) => {
  const { telefoneE164 } = req.body;
  
  if (telefoneE164 && !/^\+[0-9]{10,15}$/.test(telefoneE164)) {
    return next(Erro.criarErroValidacao('Telefone deve estar no formato E.164 (ex: +5511999999999)'));
  }

  next();
};

/**
 * Middleware para validação de nota de avaliação
 */
export const validarNotaAvaliacao = (req, res, next) => {
  const { nota } = req.body;
  
  if (nota !== undefined) {
    if (typeof nota !== 'number' || nota < 1 || nota > 5 || !Number.isInteger(nota)) {
      return next(Erro.criarErroValidacao('Nota deve ser um número inteiro entre 1 e 5'));
    }
  }

  next();
};

/**
 * Middleware para validação de autor de avaliação
 */
export const validarAutorAvaliacao = (req, res, next) => {
  const { autor } = req.body;
  
  if (autor && !['PASSAGEIRO', 'MOTORISTA'].includes(autor)) {
    return next(Erro.criarErroValidacao('Autor deve ser PASSAGEIRO ou MOTORISTA'));
  }

  next();
};

/**
 * Middleware para validação de disponibilidade do motorista
 */
export const validarDisponibilidade = (req, res, next) => {
  const { disponivel } = req.body;
  
  if (disponivel !== undefined && typeof disponivel !== 'boolean') {
    return next(Erro.criarErroValidacao('Disponibilidade deve ser um valor booleano'));
  }

  next();
};

/**
 * Middleware para validação de status de corrida
 */
export const validarStatusCorrida = (req, res, next) => {
  const { status } = req.body;
  
  const statusValidos = [
    'MOTORISTA_A_CAMINHO',
    'EM_ANDAMENTO',
    'CONCLUIDA',
    'CANCELADA_PELO_PASSAGEIRO',
    'CANCELADA_PELO_MOTORISTA'
  ];
  
  if (status && !statusValidos.includes(status)) {
    return next(Erro.criarErroValidacao(`Status deve ser um dos valores: ${statusValidos.join(', ')}`));
  }

  next();
}; 