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


**Padrões adotados:**
- MVC (Models, Controllers, Routes)  
- Service Layer (lógica de negócio encapsulada)  
- Middleware centralizado para validação/erros  
- Repository Pattern (simulado, em memória)

---

## Funcionalidades Principais

### Gestão de Usuários
- Cadastro de passageiros (nome + telefone único).  
- Cadastro de motoristas (nome + telefone único + placa).  
- Controle de status de motorista (disponível/ocupado).  
- Listagem e busca por ID ou telefone.  

### Sistema de Corridas
- Solicitação de corrida com origem e destino.  
- Aceitação por motoristas disponíveis.  
- Início e finalização com cálculo de valor.  
- Cancelamento (restrito a estados iniciais).  
- Consultas por ID, histórico do passageiro e histórico do motorista.  

### Fluxo da Corrida
- `aguardando_motorista` → `aceita` → `iniciada` → `finalizada`  
- Cancelamento permitido apenas em `aguardando_motorista` ou `aceita`.

---

## Cálculo de Preços

- **Taxa base:** R$ 5,00  
- **Por km:** R$ 2,00  
- **Por minuto:** R$ 0,50  
- **Fórmula:** `5 + (km × 2) + (min × 0,5)`  

---

## Regras de Negócio Implementadas

### RN-01: Unicidade de Telefone (Passageiro)
Telefone obrigatório em formato E.164. Não pode haver duplicidade.  

### RN-02: Unicidade de Telefone (Motorista)
Mesma regra do passageiro. Telefone único obrigatório.  

### RN-03: Validação de Coordenadas
Lat ∈ [-90,90], Lng ∈ [-180,180]. Origem ≠ destino.  

### RN-04: Categorias de Veículo
Apenas `ECONOMY` ou `COMFORT`. Inválidas → 400.  

### RN-05: Criação de Pedido de Corrida
- Status inicial: `PROCURANDO`  
- Passageiro não pode ter corrida ativa  
- Resposta: 201 com ID, status, preço estimado, expiração  

### RN-06: Cálculo de Preço Estimado (detalhado)
- Distância: fórmula de Haversine  
- Tempo: média 25 km/h  
- Tarifas: Base R$ 3 + R$ 1,80/km + R$ 0,50/min  
- Multiplicadores: COMFORT × 1.3, ECONOMY × 1.0  

### RN-07: Expiração Automática
Pedido expira em 90s se não aceito. Status = `EXPIRADO`.  

### RN-08: Aceitação de Pedido
Apenas motoristas disponíveis. O primeiro aceite é válido.  
Transição: `PEDIDO` → `MOTORISTA_ATRIBUIDO` → `MOTORISTA_A_CAMINHO`.  

### RN-09: Fluxo de Estados
- `MOTORISTA_A_CAMINHO` → `EM_ANDAMENTO` → `CONCLUIDA`  
- Qualquer transição inválida → 422.  

### RN-10: Cancelamento pelo Passageiro
Permitido antes de `CONCLUIDA`. Multa R$ 7,00 se após `MOTORISTA_A_CAMINHO`.  

### RN-11: Cancelamento pelo Motorista
Permitido antes de `CONCLUIDA`. Sem multa.  

### RN-12: Preço Final
Em regra = preço estimado. Exceto cancelamentos (RN-10, RN-11).  

### RN-13: Paginação nas Listagens
Parâmetros: `?pagina=1&limite=20`. Máx. limite = 100.  

### RN-14: Rate Limiting
100 requisições/minuto por IP. Excedido → 429.  

### RN-15: IDs e Datas
- IDs: UUID v4  
- Datas: ISO 8601 (UTC)  

### RN-16: Health Check
`GET /health` → 200 com `{status:"ok", uptime}`  

---
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
