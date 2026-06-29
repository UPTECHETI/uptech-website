# UP Tech Website

Site institucional da UP Tech Soluções em Informática — [uptech.eti.br](https://uptech.eti.br)

## Desenvolvimento local

```bash
npm install
npm run dev   # http://localhost:5173
```

## Build

```bash
npm run build   # gera dist/
```

## Deploy

- **Homologação (Vercel):** automático a cada push em `main`
- **Produção (Hostinger):** manual
  ```bash
  gh workflow run deploy-production.yml -f confirm=produção
  ```

## Stack

Vite + HTML/CSS/JS vanilla + Tailwind CSS. Site estático, sem backend.

## Secrets necessários no GitHub

| Secret | Descrição |
|--------|-----------|
| `VERCEL_TOKEN` | Token da conta Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto Vercel (`prj_...`) |
| `HOSTINGER_FTP_HOST` | Host FTP da Hostinger |
| `HOSTINGER_FTP_USER` | Usuário FTP |
| `HOSTINGER_FTP_PASS` | Senha FTP |
