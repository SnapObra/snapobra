# Guia de Segurança & Produção — SnapObra

Este documento descreve as configurações manuais necessárias para garantir que o **SnapObra** opere com segurança máxima em ambiente de produção.

## 1. Configuração de DNS & HTTPS
- **SSL/TLS**: Ative o HTTPS obrigatório em seu provedor de domínio.
- **HSTS**: Configure o header `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` no seu host (Vercel/Netlify).

## 2. Headers de Segurança (Hospedagem)
Adicione os seguintes headers na configuração do seu servidor/host:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(), geolocation=()
```

## 3. Supabase Dashboard (Hardening)
### A. CORS
No painel do Supabase, em **API Settings > CORS**, adicione apenas o seu domínio de produção (ex: `https://app.snapobra.com.br`). Evite usar `*`.

### B. Rate Limiting
Ative a proteção contra Rate Limiting no Supabase para evitar ataques de força bruta no login. O Supabase já tem limites padrão, mas você pode ajustá-los em **Auth > Settings**.

### C. Email Confirmation
Garanta que a opção **Confirm Email** esteja habilitada em **Auth > Settings** para evitar criação de contas fakes ilimitadas.

## 4. Backups & Recuperação
- O Supabase realiza backups diários automaticamente. 
- Para conformidade extra (GDPR/LGPD), você pode habilitar o **Point-in-Time Recovery (PITR)** no plano Pro para restaurar o banco para qualquer segundo exato nos últimos 7 dias.

## 5. Auditoria
Verifique periodicamente a tabela `public.audit_logs`. Ela registra:
- `INSERT/UPDATE/DELETE` em Relatórios e Obras.
- O `user_id` de quem realizou a ação.
- O conteúdo anterior e posterior da alteração.

---
*SnapObra Security Framework v1.0*
