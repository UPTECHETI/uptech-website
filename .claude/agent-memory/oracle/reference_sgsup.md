---
name: reference-sgsup-api
description: Credenciais e detalhes de acesso ao sistema UPTECH Service Manager (sgsup) via API bridge
metadata:
  type: reference
---

# UPTECH Service Manager — Acesso via API

**URL do sistema:** https://sgsup.uptech.eti.br/  
**Endpoint da API (bridge PHP):** https://sgsup.uptech.eti.br/api.php  
**Token de acesso:** `2cKs0dL4zqC1rWm1`  
**Projeto local:** `/workspace/workspace/projects/up-tech-service-manager/`

## Como usar a API

Todas as chamadas são POST com `Content-Type: application/json`:

```bash
curl -s -X POST https://sgsup.uptech.eti.br/api.php \
  -H "Content-Type: application/json" \
  -d '{"action":"select","table":"clients","token":"2cKs0dL4zqC1rWm1"}'
```

### Actions disponíveis
- `select` — busca todos os registros de uma tabela
- `upsert` — cria ou atualiza um registro (requer campo `id`)
- `delete` — remove um registro (requer campo `id`)
- `setup` — cria tabelas no banco

### Tabelas principais
- `clients` — clientes cadastrados
- `budgets` — orçamentos
- `proposals` — propostas
- `services` — serviços/produtos
- `equipments` — equipamentos
- `users` — usuários do sistema
- `service_orders` — ordens de serviço
- `contracts` — contratos
- `finance` — projetos financeiros

## Estrutura dos dados

Os registros têm sempre `id` + campo `data` (JSON stringificado com os dados reais).  
Ao fazer upsert, o campo `data` deve ser enviado como **dict/objeto Python**, NUNCA como `json.dumps()`.

## ⚠️ REGRA CRÍTICA — Como fazer upsert corretamente

O `api.php` recebe o payload, faz `json_decode` no PHP e armazena o campo `data` com `json_encode`. Se o `data` já vier como string JSON (pré-codificado com `json.dumps`), o PHP faz `json_encode` de uma string → **dupla codificação → sistema quebra**.

### ✅ CORRETO — data como dict Python

```python
svc = {"id": "123", "name": "Serviço X", "price": 100, "unit": "UN"}

api_call({
    "action": "upsert",
    "table": "services",
    "data": {"id": "123", "name": "Serviço X", "data": svc},  # ← dict, não json.dumps
    "token": TOKEN
})
```

### ❌ ERRADO — data como string json.dumps

```python
api_call({
    "action": "upsert",
    "table": "services",
    "data": {"id": "123", "name": "Serviço X", "data": json.dumps(svc)},  # ← NUNCA FAZER ISSO
    "token": TOKEN
})
```

O `json.dumps(payload)` do `api_call` já cuida da serialização completa. Não pré-serializar nada.

### Padrão Python completo para upsert

```python
import json, urllib.request, time

API_URL = "https://sgsup.uptech.eti.br/api.php"
TOKEN = "2cKs0dL4zqC1rWm1"

def api_call(payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(API_URL, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

# Gerar ID no padrão do sistema
record_id = str(int(time.time() * 1000))

# Objeto de dados (dict Python puro)
record = {"id": record_id, "name": "...", "price": 100}

# Upsert correto
api_call({
    "action": "upsert",
    "table": "services",
    "data": {"id": record_id, "name": record["name"], "data": record},
    "token": TOKEN
})

# Select para verificar
result = api_call({"action": "select", "table": "services", "token": TOKEN})
for item in result["data"]:
    parsed = json.loads(item["data"]) if isinstance(item["data"], str) else item["data"]
    print(parsed.get("name"), parsed.get("price"))
```

### Campos auxiliares de índice (opcionais por tabela)

| Tabela | Campos extras no payload |
|---|---|
| `budgets` | `date`, `client_name` |
| `clients` | `name`, `document`, `email` |
| `services` | `name` |
| `service_orders` | `date`, `client_name`, `technician_name` |

**Why:** Bug causado em 2026-06-29 ao usar `json.dumps()` no campo `data` antes de enviar. PHP fez `json_encode` de uma string → resultado foi string dentro de string → `JSON.parse` no frontend retornou string em vez de objeto → módulos de Serviços e Finanças travaram, orçamento apareceu sem dados.

**How to apply:** Sempre que criar ou atualizar registros via API, enviar `data` como dict Python puro. O `json.dumps` do `api_call` cuida de tudo.
