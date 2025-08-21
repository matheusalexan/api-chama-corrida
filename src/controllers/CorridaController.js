import { CorridaService } from '../models/Corrida.js';
import { MotoristaService } from '../models/Motorista.js';

export class CorridaController {
  static async criar(req, res) {
    try {
      const { passageiroId, origem, destino } = req.body;
      
      if (!passageiroId || !origem || !destino) {
        return res.status(400).json({
          message: 'Passageiro ID, origem e destino são obrigatórios',
          code: 'CAMPOS_OBRIGATORIOS'
        });
      }

      if (!origem.lat || !origem.lng || !destino.lat || !destino.lng) {
        return res.status(400).json({
          message: 'Origem e destino devem ter lat e lng',
          code: 'COORDENADAS_INVALIDAS'
        });
      }

      const corrida = CorridaService.criar(passageiroId, origem, destino);
      
      res.status(201).json({
        message: 'Corrida criada com sucesso',
        data: corrida
      });
    } catch (error) {
      if (error.message.includes('já possui corrida em andamento')) {
        return res.status(409).json({
          message: error.message,
          code: 'CORRIDA_EM_ANDAMENTO'
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
      const corrida = CorridaService.buscarPorId(id);
      
      if (!corrida) {
        return res.status(404).json({
          message: 'Corrida não encontrada',
          code: 'NAO_ENCONTRADO'
        });
      }
      
      res.json({
        message: 'Corrida encontrada',
        data: corrida
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erro interno do servidor',
        code: 'ERRO_INTERNO'
      });
    }
  }

  static async aceitar(req, res) {
    try {
      const { id } = req.params;
      const { motoristaId } = req.body;
      
      if (!motoristaId) {
        return res.status(400).json({
          message: 'Motorista ID é obrigatório',
          code: 'CAMPOS_OBRIGATORIOS'
        });
      }

      // Verificar se motorista está disponível
      const motorista = MotoristaService.buscarPorId(motoristaId);
      if (!motorista) {
        return res.status(404).json({
          message: 'Motorista não encontrado',
          code: 'NAO_ENCONTRADO'
        });
      }

      if (motorista.status !== 'disponível') {
        return res.status(409).json({
          message: 'Motorista não está disponível',
          code: 'MOTORISTA_INDISPONIVEL'
        });
      }

      const corrida = CorridaService.aceitarCorrida(id, motoristaId);
      
      // Alterar status do motorista para ocupado
      MotoristaService.alterarStatus(motoristaId, 'ocupado');
      
      res.json({
        message: 'Corrida aceita com sucesso',
        data: corrida
      });
    } catch (error) {
      if (error.message.includes('já foi aceita por outro motorista')) {
        return res.status(409).json({
          message: error.message,
          code: 'CORRIDA_JA_ACEITA'
        });
      }
      
      if (error.message.includes('não está aguardando motorista')) {
        return res.status(422).json({
          message: error.message,
          code: 'ESTADO_INVALIDO'
        });
      }
      
      if (error.message.includes('não encontrada')) {
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

  static async iniciar(req, res) {
    try {
      const { id } = req.params;
      const corrida = CorridaService.iniciarCorrida(id);
      
      res.json({
        message: 'Corrida iniciada com sucesso',
        data: corrida
      });
    } catch (error) {
      if (error.message.includes('deve estar aceita')) {
        return res.status(422).json({
          message: error.message,
          code: 'ESTADO_INVALIDO'
        });
      }
      
      if (error.message.includes('não encontrada')) {
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

  static async finalizar(req, res) {
    try {
      const { id } = req.params;
      const { km, min } = req.body;
      
      if (!km || !min) {
        return res.status(400).json({
          message: 'Distância (km) e duração (min) são obrigatórias',
          code: 'CAMPOS_OBRIGATORIOS'
        });
      }

      // Validar valores negativos
      if (km < 0 || min < 0) {
        return res.status(400).json({
          message: 'Distância e duração não podem ser negativas',
          code: 'VALORES_INVALIDOS'
        });
      }

      const corrida = CorridaService.finalizarCorrida(id, km, min);
      
      // Liberar motorista
      if (corrida.motoristaId) {
        MotoristaService.alterarStatus(corrida.motoristaId, 'disponível');
      }
      
      res.json({
        message: 'Corrida finalizada com sucesso',
        data: corrida
      });
    } catch (error) {
      if (error.message.includes('deve estar iniciada')) {
        return res.status(422).json({
          message: error.message,
          code: 'ESTADO_INVALIDO'
        });
      }
      
      if (error.message.includes('não encontrada')) {
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

  static async cancelar(req, res) {
    try {
      const { id } = req.params;
      
      const corrida = CorridaService.cancelarCorrida(id);
      
      // Liberar motorista se for cancelamento de corrida aceita
      if (corrida.motoristaId && corrida.status === 'cancelada') {
        MotoristaService.alterarStatus(corrida.motoristaId, 'disponível');
      }
      
      res.json({
        message: 'Corrida cancelada com sucesso',
        data: corrida
      });
    } catch (error) {
      if (error.message.includes('não é possível cancelar')) {
        return res.status(409).json({
          message: error.message,
          code: 'NAO_PODE_CANCELAR'
        });
      }
      
      if (error.message.includes('não encontrada')) {
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

  static async buscarPorPassageiro(req, res) {
    try {
      const { passageiroId } = req.params;
      const corridas = CorridaService.buscarPorPassageiro(passageiroId);
      
      res.json({
        message: 'Corridas do passageiro',
        data: corridas,
        total: corridas.length
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erro interno do servidor',
        code: 'ERRO_INTERNO'
      });
    }
  }

  static async buscarPorMotorista(req, res) {
    try {
      const { motoristaId } = req.params;
      const corridas = CorridaService.buscarPorMotorista(motoristaId);
      
      res.json({
        message: 'Corridas do motorista',
        data: corridas,
        total: corridas.length
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erro interno do servidor',
        code: 'ERRO_INTERNO'
      });
    }
  }

  static async buscarAguardandoMotorista(req, res) {
    try {
      const corridas = CorridaService.buscarAguardandoMotorista();
      
      res.json({
        message: 'Corridas aguardando motorista',
        data: corridas,
        total: corridas.length
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erro interno do servidor',
        code: 'ERRO_INTERNO'
      });
    }
  }

  static async listarTodas(req, res) {
    try {
      const corridas = CorridaService.listarTodas();
      
      res.json({
        message: 'Lista de corridas',
        data: corridas,
        total: corridas.length
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erro interno do servidor',
        code: 'ERRO_INTERNO'
      });
    }
  }
}
