---
name: project-sgsup-security-review
description: Revisão de segurança do UPTECH Service Manager (sgsup) pendente — sistema online com vulnerabilidades identificadas
metadata:
  type: project
---

# Revisão de Segurança — SGSUP (Prioridade Alta)

**Status:** Pendente — a fazer em breve  
**Sistema:** https://sgsup.uptech.eti.br/  
**Solicitado em:** 2026-06-29

## Pontos identificados para revisar

1. **Token de API exposto no localStorage** — qualquer pessoa com acesso ao navegador (sem precisar estar logada) consegue ver o token via F12 e chamar a API diretamente sem autenticação de usuário
2. **Token estático** — não há rotação ou expiração do token `uptech_db_key`
3. **api.php sem rate limiting** — chamadas ilimitadas à API sem bloqueio por IP ou tentativas
4. **Autenticação desacoplada da API** — o login (email/senha) não protege o endpoint `api.php`; quem tem o token tem acesso total independente de login
5. **HTTPS** — verificar se está ativo e forçado em todos os endpoints
6. **Exposição de dados sensíveis** — clientes com CNPJ, emails, endereços acessíveis via API sem escopo por usuário

## Por que isso importa
Sistema está em produção online com dados reais de clientes corporativos (Elgin Industrial, IUAM, BMS, etc.). Uma exposição do token dá acesso total ao banco.

**How to apply:** Quando o usuário mencionar segurança do sgsup, retomar essa lista e propagar para um plano de hardening com @vault-security + @bolt-executor.
