# 🚗 API de Transporte Sob Demanda

API completa para sistema de chamada de corridas com armazenamento em memória e documentação Swagger/OpenAPI em português do Brasil.

## ⚠️ Importante

**Todos os dados são armazenados em memória e são perdidos ao reiniciar a aplicação.** Esta é uma implementação para desenvolvimento e testes.

## 🧱 Stack Tecnológica

- **Node.js** (JavaScript ESM)
- **Express.js** para API
- **Swagger/OpenAPI** para documentação
- **Armazenamento em memória** (Map/Array)
- **UUID v4** para identificadores
- **ISO 8601** para datas (UTC)

## 📋 Pré-requisitos

- Node.js 18.0.0 ou superior
- npm ou yarn

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd api-chama-corrida
```

2. Instale as dependências:
```bash
npm install
```

3. Execute a aplicação:
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

A API estará disponível em `http://localhost:3000`

## 📚 Documentação

- **Swagger UI**: http://localhost:3000/docs
- **JSON do Swagger**: http://localhost:3000/docs-json
- **Health Check**: http://localhost:3000/saude

## 🌐 Endpoints da API

### Base URL
```
/api/v1
```

### 🚶‍♂️ Passageiros

| Método | Endpoint | Descrição |
|--------|----------|------------|
| `POST` | `/passageiros` | Criar novo passageiro |
| `GET` | `/passageiros` | Listar todos os passageiros |
| `GET` | `/passageiros/:id` | Buscar passageiro por ID |
| `PUT` | `/passageiros/:id` | Atualizar passageiro |
| `DELETE` | `/passageiros/:id` | Remover passageiro |
| `GET` | `/passageiros/telefone/:telefone` | Buscar por telefone |
| `GET` | `/passageiros/buscar/:nome` | Buscar por nome |

### 🚗 Motoristas

| Método | Endpoint | Descrição |
|--------|----------|------------|
| `POST` | `/motoristas` | Criar novo motorista |
| `GET` | `/motoristas` | Listar todos os motoristas |
| `GET` | `/motoristas/:id` | Buscar motorista por ID |
| `PUT` | `/motoristas/:id` | Atualizar motorista |
| `DELETE` | `/motoristas/:id` | Remover motorista |
| `PATCH` | `/motoristas/:id/disponibilidade` | Alterar disponibilidade |
| `GET` | `/motoristas/telefone/:telefone` | Buscar por telefone |
| `GET` | `/motoristas/disponiveis` | Listar motoristas disponíveis |
| `GET` | `/motoristas/categoria/:categoria` | Filtrar por categoria |
| `GET` | `/motoristas/buscar/:nome` | Buscar por nome |

### 📋 Pedidos de Corrida

| Método | Endpoint | Descrição |
|--------|----------|------------|
| `POST` | `/pedidos-corrida` | Criar novo pedido |
| `GET` | `/pedidos-corrida` | Listar todos os pedidos |
| `GET` | `/pedidos-corrida/:id` | Buscar pedido por ID |
| `DELETE` | `/pedidos-corrida/:id` | Remover pedido |
| `POST` | `/pedidos-corrida/:id/cancelar` | Cancelar pedido |
| `POST` | `/pedidos-corrida/:id/aceitar` | Aceitar pedido (motorista) |
| `GET` | `/pedidos-corrida/passageiro/:passageiroId` | Pedidos de um passageiro |
| `GET` | `/pedidos-corrida/status/:status` | Filtrar por status |
| `GET` | `/pedidos-corrida/categoria/:categoria` | Filtrar por categoria |
| `POST` | `/pedidos-corrida/limpar-expirados` | Limpar pedidos expirados |

### 🚕 Corridas

| Método | Endpoint | Descrição |
|--------|----------|------------|
| `GET` | `/corridas` | Listar todas as corridas |
| `GET` | `/corridas/:id` | Buscar corrida por ID |
| `DELETE` | `/corridas/:id` | Remover corrida |
| `POST` | `/corridas/:id/status` | Atualizar status |
| `POST` | `/corridas/:id/cancelar` | Cancelar pelo passageiro |
| `POST` | `/corridas/:id/cancelar-motorista` | Cancelar pelo motorista |
| `POST` | `/corridas/:id/concluir` | Concluir corrida |
| `GET` | `/corridas/motorista/:motoristaId` | Corridas de um motorista |
| `GET` | `/corridas/passageiro/:passageiroId` | Corridas de um passageiro |
| `GET` | `/corridas/status/:status` | Filtrar por status |
| `GET` | `/corridas/pedido/:pedidoId` | Buscar por pedido |

### ⭐ Avaliações

| Método | Endpoint | Descrição |
|--------|----------|------------|
| `POST` | `/corridas/:corridaId/avaliar` | Avaliar uma corrida |
| `GET` | `/avaliacoes` | Listar todas as avaliações |
| `GET` | `/avaliacoes/:id` | Buscar avaliação por ID |
| `PUT` | `/avaliacoes/:id` | Atualizar avaliação |
| `DELETE` | `/avaliacoes/:id` | Remover avaliação |
| `GET` | `/avaliacoes/corrida/:corridaId` | Avaliações de uma corrida |
| `GET` | `/avaliacoes/autor/:autor` | Avaliações de um autor |
| `GET` | `/avaliacoes/nota/:nota` | Filtrar por nota |
| `GET` | `/avaliacoes/corrida/:corridaId/media` | Média de uma corrida |
| `GET` | `/avaliacoes/buscar` | Busca com filtros |
| `GET` | `/avaliacoes/estatisticas` | Estatísticas gerais |

### 🔧 Utilitários

| Método | Endpoint | Descrição |
|--------|----------|------------|
| `GET` | `/utilitarios/estatisticas` | Estatísticas do sistema |
| `POST` | `/utilitarios/limpar-dados` | Limpar dados expirados |
| `GET` | `/utilitarios/status-sistema` | Status do sistema |
| `GET` | `/utilitarios/buscar` | Busca global |

## 📊 Paginação

Todos os endpoints de listagem suportam paginação:

```
?pagina=1&limite=20
```

- **pagina**: Número da página (padrão: 1)
- **limite**: Itens por página (padrão: 20, máximo: 100)

## 🚦 Rate Limiting

- **Limite**: 100 requisições por minuto por IP
- **Resposta**: 429 (Too Many Requests) quando excedido

## 🧪 Exemplos de Uso

### Criar um passageiro
```bash
curl -X POST http://localhost:3000/api/v1/passageiros \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva Santos",
    "telefoneE164": "+5511999999999"
  }'
```

### Criar um motorista
```bash
curl -X POST http://localhost:3000/api/v1/motoristas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Carlos Oliveira",
    "telefoneE164": "+5511888888888",
    "categoria": "ECONOMY"
  }'
```

### Solicitar uma corrida
```bash
curl -X POST http://localhost:3000/api/v1/pedidos-corrida \
  -H "Content-Type: application/json" \
  -d '{
    "passageiroId": "123e4567-e89b-12d3-a456-426614174000",
    "origemLat": -23.5505,
    "origemLng": -46.6333,
    "destinoLat": -23.5629,
    "destinoLng": -46.6544,
    "categoria": "ECONOMY"
  }'
```

## 🏗️ Estrutura do Projeto

```
src/
├── config/          # Configurações (Swagger)
├── controllers/     # Lógica de negócio
├── middleware/      # Middlewares (validação, erros)
├── models/          # Modelos de dados e serviços
├── routes/          # Definição das rotas
├── utils/           # Utilitários (cálculos, respostas)
└── server.js        # Servidor principal
```

## 🔍 Validações

- **UUIDs**: Validação de formato UUID v4
- **Telefones**: Formato E.164 (+5511999999999)
- **Coordenadas**: Latitude (-90 a 90), Longitude (-180 a 180)
- **Categorias**: ECONOMY ou COMFORT
- **Notas**: 1 a 5 estrelas
- **Nomes**: 3 a 80 caracteres

## 🚨 Tratamento de Erros

Todos os erros seguem o padrão:
```json
{
  "codigo": "CODIGO_ERRO",
  "mensagem": "Descrição do erro",
  "detalhes": {}
}
```

### Códigos de Erro
- `ERRO_VALIDACAO`: Dados inválidos (400)
- `NAO_ENCONTRADO`: Recurso não encontrado (404)
- `REGRA_NEGOCIO`: Violação de regra de negócio (409)
- `ESTADO_INVALIDO`: Estado inválido para operação (422)
- `LIMITE_REQUISICOES`: Rate limit excedido (429)
- `ERRO_INTERNO`: Erro interno do servidor (500)

## 📝 Licença

MIT

## 👨‍💻 Autor

Matheus Macedo

---

**⚠️ Lembre-se**: Esta é uma implementação para desenvolvimento. Em produção, considere usar um banco de dados persistente e implementar autenticação/autorização. 