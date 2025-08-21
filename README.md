# API de Transporte Sob Demanda

API REST desenvolvida em Node.js e Express, simulando um sistema de transporte sob demanda. Implementa regras de negócio descritas em cenários Gherkin, incluindo cadastro de usuários, solicitação e gerenciamento de corridas.

---

## Visão Geral

Este projeto representa um **MVP (Minimum Viable Product)** para sistemas de corrida similares a Uber e 99.  
O armazenamento é realizado em memória, com foco em demonstrar regras de negócio, fluxo de corridas e validações.

---

## Tecnologias Utilizadas

- **Node.js** 18+
- **Express.js**
- **Swagger/OpenAPI 3.0**
- **UUID v4**
- **ISO 8601 UTC**
- **Armazenamento em memória**

---

## Arquitetura

```
src/
├── controllers/   # Lógica de entrada e saída
├── models/        # Modelos e regras de negócio
├── routes/        # Definição de endpoints
└── server.js      # Configuração principal do servidor
```

### Padrões Adotados

- **MVC**: Separação entre modelos, controladores e rotas
- **Service Layer**: Regras de negócio centralizadas
- **Middleware**: Tratamento de erros e validações
- **Repository Pattern** (simulado): abstração de acesso a dados em memória

---

## Funcionalidades

### Gestão de Usuários

- Passageiros: cadastro, busca por ID/telefone, listagem
- Motoristas: cadastro, busca, alteração de status (disponível/ocupado), listagem
- Validação de unicidade de telefone

### Sistema de Corridas

- Solicitação de corrida (origem e destino obrigatórios)
- Aceitação de corrida por motorista disponível
- Início e finalização de viagens
- Cancelamento por passageiro ou motorista
- Consultas de histórico por passageiro e motorista

### Fluxo da Corrida

- **aguardando_motorista** → **aceita** → **iniciada** → **finalizada**
- Cancelamento permitido apenas antes da corrida iniciar

---

## Cálculo de Preços

- Taxa base: R$ 5,00
- Preço por km: R$ 2,00
- Preço por minuto: R$ 0,50
- Fórmula: `5 + (km × 2,00) + (min × 0,50)`

---

## Endpoints

Base URL: `http://localhost:3000/api/v1`

### Passageiros

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST   | `/passageiros` | Criar passageiro |
| GET    | `/passageiros` | Listar passageiros |
| GET    | `/passageiros/:id` | Buscar passageiro por ID |
| GET    | `/passageiros/telefone/:telefone` | Buscar por telefone |

### Motoristas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST   | `/motoristas` | Criar motorista |
| GET    | `/motoristas` | Listar motoristas |
| GET    | `/motoristas/:id` | Buscar motorista por ID |
| PATCH  | `/motoristas/:id/status` | Alterar status |
| GET    | `/motoristas/disponiveis` | Listar motoristas disponíveis |

### Corridas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST   | `/corridas` | Criar corrida |
| GET    | `/corridas/:id` | Buscar corrida |
| POST   | `/corridas/:id/aceitar` | Aceitar corrida |
| POST   | `/corridas/:id/iniciar` | Iniciar corrida |
| POST   | `/corridas/:id/finalizar` | Finalizar corrida |
| POST   | `/corridas/:id/cancelar` | Cancelar corrida |
| GET    | `/corridas/passageiro/:id` | Histórico de passageiro |
| GET    | `/corridas/motorista/:id` | Histórico de motorista |

### Utilitários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET    | `/health` | Verificação de saúde da API |
| GET    | `/` | Informações da API |

---

## Respostas e Códigos de Status

- **200 OK**: Sucesso
- **201 Created**: Recurso criado
- **400 Bad Request**: Campos inválidos ou ausentes
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Conflito de regra de negócio
- **422 Unprocessable Entity**: Estado inválido
- **500 Internal Server Error**: Erro interno inesperado

### Padrão de Erro

```json
{
  "message": "Descrição do erro",
  "code": "CODIGO_ESPECIFICO"
}
```

---

## Exemplos de Uso

```bash
curl -X POST http://localhost:3000/api/v1/passageiros \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","telefone":"+5511999999999"}'

curl -X POST http://localhost:3000/api/v1/corridas \
  -H "Content-Type: application/json" \
  -d '{
    "passageiroId": "uuid-passageiro",
    "origem": {"lat": -23.55, "lng": -46.63},
    "destino": {"lat": -23.56, "lng": -46.64}
  }'
```

---

## Instalação e Execução

**Pré-requisitos:**  
- Node.js 18+
- npm ou yarn

```bash
git clone https://github.com/matheusalexan/api-chama-corrida.git
cd api-chama-corrida
npm install
npm run dev   # desenvolvimento
npm start     # produção
```

A porta padrão é **3000** (pode ser alterada via variável de ambiente `PORT`).

---
