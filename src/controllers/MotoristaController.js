import { MotoristaService } from '../models/Motorista.js';

export class MotoristaController {
  static async criar(req, res) {
    try {
      const { nome, telefone, placa } = req.body;
      
      if (!nome || !telefone || !placa) {
        return res.status(400).json({
          message: 'Nome, telefone e placa são obrigatórios',
          code: 'CAMPOS_OBRIGATORIOS'
        });
      }

      const motorista = MotoristaService.criar(nome, telefone, placa);
      
      res.status(201).json({
        message: 'Motorista criado com sucesso',
        data: motorista
      });
    } catch (error) {
      if (error.message.includes('Telefone já cadastrado')) {
        return res.status(409).json({
          message: error.message,
          code: 'TELEFONE_DUPLICADO'
        });
      }
      
      res.status(400).json({
        message: error.message,
        code: 'ERRO_VALIDACAO'
      });
    }
  }

  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const motorista = MotoristaService.buscarPorId(id);
      
      if (!motorista) {
        return res.status(404).json({
          message: 'Motorista não encontrado',
          code: 'NAO_ENCONTRADO'
        });
      }
      
      res.json({
        message: 'Motorista encontrado',
        data: motorista
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erro interno do servidor',
        code: 'ERRO_INTERNO'
      });
    }
  }

  static async buscarPorTelefone(req, res) {
    try {
      const { telefone } = req.params;
      const motorista = MotoristaService.buscarPorTelefone(telefone);
      
      if (!motorista) {
        return res.status(404).json({
          message: 'Motorista não encontrado',
          code: 'NAO_ENCONTRADO'
        });
      }
      
      res.json({
        message: 'Motorista encontrado',
        data: motorista
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erro interno do servidor',
        code: 'ERRO_INTERNO'
      });
    }
  }

  static async alterarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          message: 'Status é obrigatório',
          code: 'CAMPOS_OBRIGATORIOS'
        });
      }

      const motorista = MotoristaService.alterarStatus(id, status);
      
      res.json({
        message: 'Status alterado com sucesso',
        data: motorista
      });
    } catch (error) {
      if (error.message.includes('Motorista não encontrado')) {
        return res.status(404).json({
          message: error.message,
          code: 'NAO_ENCONTRADO'
        });
      }
      
      res.status(400).json({
        message: error.message,
        code: 'ERRO_VALIDACAO'
      });
    }
  }

  static async buscarDisponiveis(req, res) {
    try {
      const motoristas = MotoristaService.buscarDisponiveis();
      
      res.json({
        message: 'Motoristas disponíveis',
        data: motoristas,
        total: motoristas.length
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erro interno do servidor',
        code: 'ERRO_INTERNO'
      });
    }
  }

  static async listarTodos(req, res) {
    try {
      const motoristas = MotoristaService.listarTodos();
      
      res.json({
        message: 'Lista de motoristas',
        data: motoristas,
        total: motoristas.length
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erro interno do servidor',
        code: 'ERRO_INTERNO'
      });
    }
  }
}
