import { AvaliacaoService } from '../models/Avaliacao.js';
import { CorridaService } from '../models/Corrida.js';
import { asyncErrorHandler } from '../middleware/errorHandler.js';
import { criarRespostaSucesso, criarRespostaCriacao, criarRespostaLista, aplicarPaginacao } from '../utils/respostas.js';

/**
 * Controller para operações relacionadas às avaliações
 */
export class AvaliacaoController {
  /**
   * Cria uma nova avaliação
   * @route POST /api/v1/corridas/:corridaId/avaliar
   */
  static criar = asyncErrorHandler(async (req, res) => {
    const { corridaId } = req.params;
    const { autor, nota, comentario } = req.body;

    // Verifica se a corrida existe
    const corrida = CorridaService.buscarPorId(corridaId);
    if (!corrida) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Corrida não encontrada',
        detalhes: { corridaId }
      });
    }

    // Verifica se a corrida está finalizada
    if (!corrida.isFinalizada()) {
      return res.status(422).json({
        codigo: 'ESTADO_INVALIDO',
        mensagem: 'Só é possível avaliar corridas finalizadas',
        detalhes: { status: corrida.status }
      });
    }

    // Verifica se já existe uma avaliação do mesmo autor para esta corrida
    const avaliacaoExistente = AvaliacaoService.buscarPorCorridaEAutor(corridaId, autor);
    if (avaliacaoExistente) {
      return res.status(409).json({
        codigo: 'REGRA_NEGOCIO',
        mensagem: 'Já existe uma avaliação deste autor para esta corrida',
        detalhes: { 
          corridaId, 
          autor, 
          avaliacaoId: avaliacaoExistente.id 
        }
      });
    }

    const avaliacao = AvaliacaoService.criar(corridaId, autor, nota, comentario);
    
    res.status(201).json(criarRespostaCriacao(avaliacao));
  });

  /**
   * Busca uma avaliação por ID
   * @route GET /api/v1/avaliacoes/:id
   */
  static buscarPorId = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const avaliacao = AvaliacaoService.buscarPorId(id);
    
    if (!avaliacao) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Avaliação não encontrada',
        detalhes: { id }
      });
    }

    res.json(criarRespostaSucesso(avaliacao));
  });

  /**
   * Lista todas as avaliações com paginação
   * @route GET /api/v1/avaliacoes
   */
  static listarTodas = asyncErrorHandler(async (req, res) => {
    const { paginacao } = req;
    
    const todasAvaliacoes = AvaliacaoService.listarTodas();
    const total = todasAvaliacoes.length;
    
    // Aplica paginação
    const avaliacoesPaginadas = aplicarPaginacao(todasAvaliacoes, paginacao);
    
    res.json(criarRespostaLista(avaliacoesPaginadas, paginacao, total));
  });

  /**
   * Busca avaliações por corrida
   * @route GET /api/v1/avaliacoes/corrida/:corridaId
   */
  static buscarPorCorrida = asyncErrorHandler(async (req, res) => {
    const { corridaId } = req.params;
    const { paginacao } = req;

    // Verifica se a corrida existe
    const corrida = CorridaService.buscarPorId(corridaId);
    if (!corrida) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Corrida não encontrada',
        detalhes: { corridaId }
      });
    }

    const avaliacoes = AvaliacaoService.buscarPorCorrida(corridaId);
    const total = avaliacoes.length;
    
    // Aplica paginação
    const avaliacoesPaginadas = aplicarPaginacao(avaliacoes, paginacao);
    
    res.json(criarRespostaLista(avaliacoesPaginadas, paginacao, total));
  });

  /**
   * Busca avaliações por autor
   * @route GET /api/v1/avaliacoes/autor/:autor
   */
  static buscarPorAutor = asyncErrorHandler(async (req, res) => {
    const { autor } = req.params;
    const { paginacao } = req;

    if (!['PASSAGEIRO', 'MOTORISTA'].includes(autor)) {
      return res.status(400).json({
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Autor deve ser PASSAGEIRO ou MOTORISTA',
        detalhes: { autor }
      });
    }

    const avaliacoes = AvaliacaoService.buscarPorAutor(autor);
    const total = avaliacoes.length;
    
    // Aplica paginação
    const avaliacoesPaginadas = aplicarPaginacao(avaliacoes, paginacao);
    
    res.json(criarRespostaLista(avaliacoesPaginadas, paginacao, total));
  });

  /**
   * Busca avaliações por nota
   * @route GET /api/v1/avaliacoes/nota/:nota
   */
  static buscarPorNota = asyncErrorHandler(async (req, res) => {
    const { nota } = req.params;
    const { paginacao } = req;

    const notaNum = parseInt(nota);
    if (isNaN(notaNum) || notaNum < 1 || notaNum > 5) {
      return res.status(400).json({
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Nota deve ser um número entre 1 e 5',
        detalhes: { nota }
      });
    }

    const todasAvaliacoes = AvaliacaoService.listarTodas();
    const avaliacoesFiltradas = todasAvaliacoes.filter(a => a.nota === notaNum);
    const total = avaliacoesFiltradas.length;
    
    // Aplica paginação
    const avaliacoesPaginadas = aplicarPaginacao(avaliacoesFiltradas, paginacao);
    
    res.json(criarRespostaLista(avaliacoesPaginadas, paginacao, total));
  });

  /**
   * Calcula a média de avaliações de uma corrida
   * @route GET /api/v1/avaliacoes/corrida/:corridaId/media
   */
  static calcularMediaCorrida = asyncErrorHandler(async (req, res) => {
    const { corridaId } = req.params;

    // Verifica se a corrida existe
    const corrida = CorridaService.buscarPorId(corridaId);
    if (!corrida) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Corrida não encontrada',
        detalhes: { corridaId }
      });
    }

    const media = AvaliacaoService.calcularMediaPorCorrida(corridaId);
    
    res.json(criarRespostaSucesso({
      corridaId,
      media,
      corrida: {
        id: corrida.id,
        status: corrida.status
      }
    }));
  });

  /**
   * Atualiza uma avaliação existente
   * @route PUT /api/v1/avaliacoes/:id
   */
  static atualizar = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const { nota, comentario } = req.body;

    const avaliacao = AvaliacaoService.buscarPorId(id);
    
    if (!avaliacao) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Avaliação não encontrada',
        detalhes: { id }
      });
    }

    // Validações
    if (nota !== undefined) {
      if (typeof nota !== 'number' || nota < 1 || nota > 5 || !Number.isInteger(nota)) {
        return res.status(400).json({
          codigo: 'ERRO_VALIDACAO',
          mensagem: 'Nota deve ser um número inteiro entre 1 e 5',
          detalhes: { nota }
        });
      }
      avaliacao.nota = nota;
    }

    if (comentario !== undefined) {
      if (typeof comentario !== 'string') {
        return res.status(400).json({
          codigo: 'ERRO_VALIDACAO',
          mensagem: 'Comentário deve ser uma string',
          detalhes: { comentario }
        });
      }
      
      if (comentario.length > 280) {
        return res.status(400).json({
          codigo: 'ERRO_VALIDACAO',
          mensagem: 'Comentário deve ter no máximo 280 caracteres',
          detalhes: { comentario, tamanho: comentario.length }
        });
      }
      
      avaliacao.comentario = comentario;
    }

    // Atualiza timestamp
    avaliacao.atualizadoEm = new Date().toISOString();

    res.json(criarRespostaSucesso(avaliacao));
  });

  /**
   * Remove uma avaliação
   * @route DELETE /api/v1/avaliacoes/:id
   */
  static remover = asyncErrorHandler(async (req, res) => {
    const { id } = req.params;

    const avaliacao = AvaliacaoService.buscarPorId(id);
    
    if (!avaliacao) {
      return res.status(404).json({
        codigo: 'NAO_ENCONTRADO',
        mensagem: 'Avaliação não encontrada',
        detalhes: { id }
      });
    }

    const removida = AvaliacaoService.deletar(id);
    
    if (removida) {
      res.json(criarRespostaSucesso({
        mensagem: 'Avaliação removida com sucesso',
        id
      }));
    } else {
      res.status(500).json({
        codigo: 'ERRO_INTERNO',
        mensagem: 'Erro ao remover avaliação',
        detalhes: { id }
      });
    }
  });

  /**
   * Busca avaliações com filtros combinados
   * @route GET /api/v1/avaliacoes/buscar
   */
  static buscarComFiltros = asyncErrorHandler(async (req, res) => {
    const { corridaId, autor, nota, paginacao } = req;

    let todasAvaliacoes = AvaliacaoService.listarTodas();
    let filtrosAplicados = [];

    // Filtro por corrida
    if (corridaId) {
      // Verifica se a corrida existe
      const corrida = CorridaService.buscarPorId(corridaId);
      if (!corrida) {
        return res.status(404).json({
          codigo: 'NAO_ENCONTRADO',
          mensagem: 'Corrida não encontrada',
          detalhes: { corridaId }
        });
      }
      
      todasAvaliacoes = todasAvaliacoes.filter(a => a.corridaId === corridaId);
      filtrosAplicados.push(`corridaId: ${corridaId}`);
    }

    // Filtro por autor
    if (autor) {
      if (!['PASSAGEIRO', 'MOTORISTA'].includes(autor)) {
        return res.status(400).json({
          codigo: 'ERRO_VALIDACAO',
          mensagem: 'Autor deve ser PASSAGEIRO ou MOTORISTA',
          detalhes: { autor }
        });
      }
      
      todasAvaliacoes = todasAvaliacoes.filter(a => a.autor === autor);
      filtrosAplicados.push(`autor: ${autor}`);
    }

    // Filtro por nota
    if (nota !== undefined) {
      const notaNum = parseInt(nota);
      if (isNaN(notaNum) || notaNum < 1 || notaNum > 5) {
        return res.status(400).json({
          codigo: 'ERRO_VALIDACAO',
          mensagem: 'Nota deve ser um número entre 1 e 5',
          detalhes: { nota }
        });
      }
      
      todasAvaliacoes = todasAvaliacoes.filter(a => a.nota === notaNum);
      filtrosAplicados.push(`nota: ${notaNum}`);
    }

    const total = todasAvaliacoes.length;
    const avaliacoesPaginadas = aplicarPaginacao(todasAvaliacoes, paginacao);
    
    res.json(criarRespostaLista(avaliacoesPaginadas, paginacao, total, {
      filtrosAplicados,
      totalFiltrado: total
    }));
  });

  /**
   * Estatísticas gerais das avaliações
   * @route GET /api/v1/avaliacoes/estatisticas
   */
  static estatisticas = asyncErrorHandler(async (req, res) => {
    const todasAvaliacoes = AvaliacaoService.listarTodas();
    
    if (todasAvaliacoes.length === 0) {
      return res.json(criarRespostaSucesso({
        totalAvaliacoes: 0,
        mediaGeral: 0,
        distribuicaoNotas: {},
        totalPorAutor: {},
        mensagem: 'Nenhuma avaliação encontrada'
      }));
    }

    // Cálculo da média geral
    const somaNotas = todasAvaliacoes.reduce((soma, a) => soma + a.nota, 0);
    const mediaGeral = Math.round((somaNotas / todasAvaliacoes.length) * 10) / 10;

    // Distribuição de notas
    const distribuicaoNotas = {};
    for (let i = 1; i <= 5; i++) {
      distribuicaoNotas[i] = todasAvaliacoes.filter(a => a.nota === i).length;
    }

    // Total por autor
    const totalPorAutor = {
      PASSAGEIRO: todasAvaliacoes.filter(a => a.autor === 'PASSAGEIRO').length,
      MOTORISTA: todasAvaliacoes.filter(a => a.autor === 'MOTORISTA').length
    };

    // Avaliações com comentário
    const totalComComentario = todasAvaliacoes.filter(a => a.comentario).length;
    const totalSemComentario = todasAvaliacoes.length - totalComComentario;

    res.json(criarRespostaSucesso({
      totalAvaliacoes: todasAvaliacoes.length,
      mediaGeral,
      distribuicaoNotas,
      totalPorAutor,
      totalComComentario,
      totalSemComentario,
      percentualComentarios: Math.round((totalComComentario / todasAvaliacoes.length) * 100)
    }));
  });
} 