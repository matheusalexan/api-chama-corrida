import { Erro, CodigosHTTP } from '../models/Erro.js';

/**
 * Middleware para tratamento padronizado de erros
 * Converte erros da aplicação para o formato padrão da API
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  let erro;
  let statusCode = 500;

  // Se já é um erro da aplicação, usa diretamente
  if (err instanceof Erro) {
    erro = err;
    statusCode = CodigosHTTP[err.codigo] || 500;
  }
  // Se é um erro de validação do Express
  else if (err.name === 'ValidationError') {
    erro = Erro.criarErroValidacao('Dados de entrada inválidos', {
      detalhes: err.message
    });
    statusCode = 400;
  }
  // Se é um erro de sintaxe JSON
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    erro = Erro.criarErroValidacao('JSON inválido no corpo da requisição');
    statusCode = 400;
  }
  // Se é um erro de validação de UUID
  else if (err.message && err.message.includes('UUID')) {
    erro = Erro.criarErroValidacao('ID inválido fornecido');
    statusCode = 400;
  }
  // Se é um erro de validação de coordenadas
  else if (err.message && err.message.includes('coordenadas')) {
    erro = Erro.criarErroValidacao(err.message);
    statusCode = 400;
  }
  // Se é um erro de validação de categoria
  else if (err.message && err.message.includes('categoria')) {
    erro = Erro.criarErroValidacao(err.message);
    statusCode = 400;
  }
  // Se é um erro de telefone único
  else if (err.message && err.message.includes('Telefone já está em uso')) {
    erro = Erro.criarErroRegraNegocio(err.message);
    statusCode = 409;
  }
  // Se é um erro de avaliação única
  else if (err.message && err.message.includes('Já existe uma avaliação')) {
    erro = Erro.criarErroRegraNegocio(err.message);
    statusCode = 409;
  }
  // Se é um erro de transição de estado
  else if (err.message && err.message.includes('Transição de status inválida')) {
    erro = Erro.criarErroEstadoInvalido(err.message);
    statusCode = 422;
  }
  // Se é um erro de estado inválido para operação
  else if (err.message && err.message.includes('não pode ser cancelado') || 
           err.message && err.message.includes('Só é possível concluir')) {
    erro = Erro.criarErroEstadoInvalido(err.message);
    statusCode = 422;
  }
  // Se é um erro de validação geral
  else if (err.message && err.message.includes('Validação falhou')) {
    erro = Erro.criarErroValidacao(err.message);
    statusCode = 400;
  }
  // Se é um erro de recurso não encontrado
  else if (err.message && err.message.includes('não encontrado')) {
    erro = Erro.criarErroNaoEncontrado(err.message);
    statusCode = 404;
  }
  // Erro genérico
  else {
    erro = Erro.criarErroInterno('Erro interno do servidor');
    statusCode = 500;
  }

  // Log do erro para debugging
  if (statusCode >= 500) {
    console.error('Erro interno:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  // Resposta padronizada
  res.status(statusCode).json(erro.toJSON());
};

/**
 * Middleware para capturar erros assíncronos
 */
export const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 