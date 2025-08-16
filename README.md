# API de Transporte Sob Demanda

API REST completa para sistema de corridas desenvolvida em Node.js com Express, implementando todas as regras de negócio especificadas nos cenários Gherkin.

## Visão Geral

Esta API implementa um sistema completo de transporte sob demanda com funcionalidades para cadastro de usuários (passageiros e motoristas), solicitação de corridas, aceitação por motoristas, controle de status e finalização de viagens.

## Tecnologias Utilizadas

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Documentação**: Swagger/OpenAPI 3.0
- **Armazenamento**: Memória (Map/Array)
- **Identificadores**: UUID v4
- **Formato de Data**: ISO 8601 (UTC)
- **Padrão de API**: REST com base URL `/api/v1`

## Arquitetura

### Estrutura do Projeto
```
src/
├── controllers/          # Controladores da aplicação
│   ├── PassageiroController.js
│   ├── MotoristaController.js
│   └── CorridaController.js
├── models/              # Modelos de dados e lógica de negócio
│   ├── Passageiro.js
│   ├── Motorista.js
│   └── Corrida.js
├── routes/              # Definição das rotas da API
│   ├── passageiros.js
│   ├── motoristas.js
│   └── corridas.js
└── server.js            # Servidor principal e configuração
```

### Padrões de Design
- **MVC**: Separação clara entre Model, View (Routes) e Controller
- **Service Layer**: Lógica de negócio encapsulada nos modelos
- **Repository Pattern**: Acesso a dados através de serviços
- **Middleware Pattern**: Validação e tratamento de erros centralizados

## Funcionalidades Implementadas

### 1. Gestão de Usuários

#### Passageiros
- Cadastro com nome e telefone E.164
- Validação de unicidade de telefone
- Busca por ID e telefone
- Listagem de todos os passageiros

#### Motoristas
- Cadastro com nome, telefone E.164 e placa do veículo
- Controle de status (disponível/ocupado)
- Validação de unicidade de telefone
- Busca por ID, telefone e status
- Listagem de motoristas disponíveis

### 2. Sistema de Corridas

#### Fluxo de Vida da Corrida
1. **Criação**: Passageiro solicita corrida informando origem e destino
2. **Aceitação**: Motorista disponível aceita a corrida
3. **Início**: Motorista inicia a viagem
4. **Finalização**: Motorista finaliza com distância e tempo reais
5. **Cancelamento**: Possível antes do início da viagem

#### Estados da Corrida
- `aguardando_motorista`: Corrida criada, aguardando aceitação
- `aceita`: Motorista aceitou, aguardando início
- `iniciada`: Viagem em andamento
- `finalizada`: Viagem concluída com preço final
- `cancelada_pelo_passageiro`: Cancelada pelo passageiro
- `cancelada_pelo_motorista`: Cancelada pelo motorista

### 3. Cálculo de Preços

#### Preço Estimado
- **Taxa base**: R$ 5,00
- **Por quilômetro**: R$ 2,00
- **Por minuto**: R$ 0,50
- **Fórmula**: `base + (distância × 2,00) + (tempo × 0,50)`

#### Preço Final
- **Padrão**: Igual ao preço estimado
- **Cancelamento pelo passageiro**: Multa de R$ 7,00
- **Cancelamento pelo motorista**: R$ 0,00

## Regras de Negócio Implementadas

### RN-01: Unicidade de Telefone (Passageiro)
- **Critério**: Telefone E.164 obrigatório com formato `^\+55\d{10,11}$`
- **Validação**: Telefone único por passageiro
- **Erro**: 409 REGRA_NEGOCIO se telefone duplicado

### RN-02: Unicidade de Telefone (Motorista)
- **Critério**: Mesmo formato da RN-01
- **Validação**: Telefone único por motorista
- **Erro**: 409 REGRA_NEGOCIO se telefone duplicado

### RN-03: Validação de Coordenadas
- **Critério**: Latitude ∈ [-90,90], Longitude ∈ [-180,180]
- **Validação**: Origem e destino devem ser diferentes
- **Erro**: 400 ERRO_VALIDACAO se coordenadas inválidas

### RN-04: Categorias de Veículo
- **Critério**: Categorias válidas (ECONOMY, COMFORT)
- **Validação**: Apenas categorias predefinidas aceitas
- **Erro**: 400 ERRO_VALIDACAO se categoria inválida

### RN-05: Criação de Pedido de Corrida
- **Critério**: Status inicial PROCURANDO
- **Validação**: Passageiro não pode ter corrida ativa
- **Resposta**: 201 com ID, status, preço estimado e expiração

### RN-06: Cálculo do Preço Estimado
- **Critério**: Distância via fórmula de Haversine
- **Velocidade**: Média de 25 km/h para estimativa de tempo
- **Tarifas**: Base R$ 3,00 + R$ 1,80/km + R$ 0,50/min
- **Multiplicadores**: COMFORT × 1.3, ECONOMY × 1.0

### RN-07: Expiração Automática do Pedido
- **Critério**: Expiração em 90 segundos
- **Comportamento**: Status muda para EXPIRADO automaticamente
- **Cancelamento**: Timer é cancelado se pedido aceito

### RN-08: Aceitação de Pedido
- **Critério**: Motorista deve estar disponível
- **Validação**: Primeiro aceite válido cria corrida
- **Transição**: Pedido → MOTORISTA_ATRIBUIDO → Corrida MOTORISTA_A_CAMINHO

### RN-09: Fluxo de Estados da Corrida
- **Transições válidas**: 
  - MOTORISTA_A_CAMINHO → EM_ANDAMENTO → CONCLUIDA
- **Validação**: Qualquer transição inválida retorna 422 ESTADO_INVALIDO

### RN-10: Cancelamento pelo Passageiro
- **Permissão**: Antes de CONCLUIDA
- **Multa**: R$ 7,00 se após MOTORISTA_A_CAMINHO
- **Status**: CANCELADA_PELO_PASSAGEIRO

### RN-11: Cancelamento pelo Motorista
- **Permissão**: Antes de CONCLUIDA
- **Preço**: R$ 0,00
- **Status**: CANCELADA_PELO_MOTORISTA

### RN-12: Preço Final
- **Padrão**: precoFinal = precoEstimado
- **Exceções**: RN-10 (multa) e RN-11 (zero)

### RN-13: Paginação nas Listagens
- **Parâmetros**: ?pagina=1&limite=20 (máximo 100)
- **Resposta**: meta: { pagina, limite, total }

### RN-14: Rate Limiting
- **Limite**: 100 requisições/minuto por IP
- **Resposta**: 429 LIMITE_REQUISICOES se excedido

### RN-15: Padrões de ID e Datas
- **IDs**: UUID v4
- **Datas**: ISO 8601 (UTC)

### RN-16: Health Check
- **Endpoint**: GET /health
- **Resposta**: 200 com { status: "ok", uptime }

## Endpoints da API

### Base URL
```
http://localhost:3000/api/v1
```

### Passageiros
| Método | Endpoint | Descrição | Status Codes |
|--------|----------|-----------|--------------|
| POST | `/passageiros` | Criar novo passageiro | 201, 400, 409 |
| GET | `/passageiros` | Listar todos os passageiros | 200 |
| GET | `/passageiros/:id` | Buscar passageiro por ID | 200, 404 |
| GET | `/passageiros/telefone/:telefone` | Buscar por telefone | 200, 404 |

### Motoristas
| Método | Endpoint | Descrição | Status Codes |
|--------|----------|-----------|--------------|
| POST | `/motoristas` | Criar novo motorista | 201, 400, 409 |
| GET | `/motoristas` | Listar todos os motoristas | 200 |
| GET | `/motoristas/:id` | Buscar motorista por ID | 200, 404 |
| PATCH | `/motoristas/:id/status` | Alterar status | 200, 400, 404 |
| GET | `/motoristas/telefone/:telefone` | Buscar por telefone | 200, 404 |
| GET | `/motoristas/disponiveis` | Listar disponíveis | 200 |

### Corridas
| Método | Endpoint | Descrição | Status Codes |
|--------|----------|-----------|--------------|
| POST | `/corridas` | Criar nova corrida | 201, 400, 409 |
| GET | `/corridas` | Listar todas as corridas | 200 |
| GET | `/corridas/:id` | Buscar corrida por ID | 200, 404 |
| POST | `/corridas/:id/aceitar` | Motorista aceita corrida | 200, 400, 404, 409, 422 |
| POST | `/corridas/:id/iniciar` | Iniciar corrida | 200, 404, 422 |
| POST | `/corridas/:id/finalizar` | Finalizar corrida | 200, 400, 404, 422 |
| POST | `/corridas/:id/cancelar` | Cancelar corrida | 200, 400, 404, 409 |
| GET | `/corridas/passageiro/:passageiroId` | Por passageiro | 200 |
| GET | `/corridas/motorista/:motoristaId` | Por motorista | 200 |
| GET | `/corridas/aguardando-motorista` | Aguardando motorista | 200 |

### Utilitários
| Método | Endpoint | Descrição | Status Codes |
|--------|----------|-----------|--------------|
| GET | `/health` | Health check da API | 200 |
| GET | `/` | Informações da API | 200 |

## Códigos de Status HTTP

### 2xx - Sucesso
- **200 OK**: Requisição processada com sucesso
- **201 Created**: Recurso criado com sucesso

### 4xx - Erro do Cliente
- **400 Bad Request**: Dados inválidos ou campos obrigatórios ausentes
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Conflito de regra de negócio (telefone duplicado, corrida em andamento)
- **422 Unprocessable Entity**: Estado inválido para a operação
- **429 Too Many Requests**: Rate limit excedido

### 5xx - Erro do Servidor
- **500 Internal Server Error**: Erro interno não tratado

## Padrão de Resposta de Erro

```json
{
  "message": "Descrição clara do erro",
  "code": "CODIGO_DO_ERRO"
}
```

### Códigos de Erro Padrão
- `CAMPOS_OBRIGATORIOS`: Campos obrigatórios não informados
- `TELEFONE_DUPLICADO`: Telefone já cadastrado
- `NAO_ENCONTRADO`: Recurso não encontrado
- `CORRIDA_EM_ANDAMENTO`: Passageiro já possui corrida ativa
- `MOTORISTA_INDISPONIVEL`: Motorista não está disponível
- `ESTADO_INVALIDO`: Transição de estado inválida
- `NAO_PODE_CANCELAR`: Corrida não pode ser cancelada
- `ROTA_NAO_ENCONTRADA`: Endpoint não existe
- `ERRO_INTERNO`: Erro interno do servidor

## Exemplos de Uso

### Criar Passageiro
```bash
curl -X POST http://localhost:3000/api/v1/passageiros \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "telefone": "+5511999999999"
  }'
```

### Criar Motorista
```bash
curl -X POST http://localhost:3000/api/v1/motoristas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Pedro Santos",
    "telefone": "+5511888888888",
    "placa": "ABC1234"
  }'
```

### Solicitar Corrida
```bash
curl -X POST http://localhost:3000/api/v1/corridas \
  -H "Content-Type: application/json" \
  -d '{
    "passageiroId": "uuid-do-passageiro",
    "origem": {
      "lat": -23.5505,
      "lng": -46.6333
    },
    "destino": {
      "lat": -23.5605,
      "lng": -46.6433
    }
  }'
```

### Motorista Aceitar Corrida
```bash
curl -X POST http://localhost:3000/api/v1/corridas/uuid-da-corrida/aceitar \
  -H "Content-Type: application/json" \
  -d '{
    "motoristaId": "uuid-do-motorista"
  }'
```

## Instalação e Execução

### Pré-requisitos
- Node.js 18.0.0 ou superior
- npm ou yarn

### Instalação
```bash
# Clonar o repositório
git clone https://github.com/matheusalexan/api-chama-corrida.git
cd api-chama-corrida

# Instalar dependências
npm install

# Executar em desenvolvimento (com auto-reload)
npm run dev

# Executar em produção
npm start
```

### Variáveis de Ambiente
```bash
PORT=3000  # Porta do servidor (padrão: 3000)
```

### Acesso
- **API**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## Validações Implementadas

### Passageiros
- Nome: mínimo 2 caracteres
- Telefone: formato E.164 brasileiro (+55DDDNUMERO)
- Unicidade de telefone

### Motoristas
- Nome: mínimo 2 caracteres
- Telefone: formato E.164 brasileiro (+55DDDNUMERO)
- Placa: mínimo 5 caracteres
- Unicidade de telefone

### Corridas
- Passageiro ID obrigatório
- Coordenadas de origem e destino válidas
- Origem e destino diferentes
- Passageiro sem corrida ativa

## Limitações Atuais

### Armazenamento
- Dados armazenados em memória (volátil)
- Perda de dados ao reiniciar o servidor
- Não suporta múltiplas instâncias

### Escalabilidade
- Apenas para desenvolvimento e testes
- Sem persistência de dados
- Sem cache distribuído

### Segurança
- Sem autenticação ou autorização
- Sem rate limiting por usuário
- Sem validação de entrada robusta

## Próximas Melhorias

### Curto Prazo
- [ ] Implementar validação de entrada com Joi ou Yup
- [ ] Adicionar logging estruturado
- [ ] Implementar testes automatizados
- [ ] Adicionar middleware de CORS

### Médio Prazo
- [ ] Implementar autenticação JWT
- [ ] Adicionar banco de dados (PostgreSQL/MongoDB)
- [ ] Implementar cache Redis
- [ ] Adicionar monitoramento e métricas

### Longo Prazo
- [ ] Implementar microserviços
- [ ] Adicionar filas de mensagens
- [ ] Implementar notificações em tempo real
- [ ] Adicionar análise de dados e relatórios

## Contribuição

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use JavaScript ES6+ features
- Siga as convenções de nomenclatura camelCase
- Mantenha funções pequenas e focadas
- Adicione comentários para lógica complexa
- Teste suas mudanças antes de submeter

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

- **Desenvolvedor**: Matheus Macedo
- **Repositório**: [https://github.com/matheusalexan/api-chama-corrida](https://github.com/matheusalexan/api-chama-corrida)
- **Email**: [seu-email@exemplo.com]

## Changelog

### v1.0.0 (2025-08-16)
- Implementação inicial da API
- Sistema completo de passageiros, motoristas e corridas
- Documentação Swagger completa
- Todas as regras de negócio implementadas
- Validações de entrada e regras de negócio
- Tratamento de erros padronizado
- Health check e endpoints utilitários

---

**Nota**: Esta API foi desenvolvida como projeto de demonstração e portfólio. Para uso em produção, considere implementar as melhorias de segurança, persistência e escalabilidade listadas na seção de próximas melhorias.
