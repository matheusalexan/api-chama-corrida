import { PassageiroService } from '../models/Passageiro.js';

export class PassageiroController {
  static async criar(req, res) {
    try {
      const { nome, telefone } = req.body;
      
      if (!nome || !telefone) {
        return res.status(400).json({
          message: 'Nome e telefone são obrigatórios',
          code: 'CAMPOS_OBRIGATORIOS'
        });
      }

      const passageiro = PassageiroService.criar(nome, telefone);
      
      res.status(201).json({
        message: 'Passageiro criado com sucesso',
        data: passageiro
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
      const passageiro = PassageiroService.buscarPorId(id);
      
      if (!passageiro) {
        return res.status(404).json({
          message: 'Passageiro não encontrado',
          code: 'NAO_ENCONTRADO'
        });
      }
      
      res.json({
        message: 'Passageiro encontrado',
        data: passageiro
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
      const passageiro = PassageiroService.buscarPorTelefone(telefone);
      
      if (!passageiro) {
        return res.status(404).json({
          message: 'Passageiro não encontrado',
          code: 'NAO_ENCONTRADO'
        });
      }
      
      res.json({
        message: 'Passageiro encontrado',
        data: passageiro
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
      const passageiros = PassageiroService.listarTodos();
      
      res.json({
        message: 'Lista de passageiros',
        data: passageiros,
        total: passageiros.length
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erro interno do servidor',
        code: 'ERRO_INTERNO'
      });
    }
  }
}
