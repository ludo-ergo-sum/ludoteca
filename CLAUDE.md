@AGENTS.md

## Ludo Ergo Sum

Ludoteca associativa (via Foce 40, Imperia). App per il noleggio di giochi da tavolo tra socie/i, con approvazione admin e QR code per copia fisica.

- **Dati**: mock in-memory in `src/lib/mock/` (seed + store), letti/scritti tramite `src/lib/data/*.ts`. Quelle funzioni sono scritte async apposta per essere sostituite in futuro da query MongoDB senza toccare le pagine/azioni che le chiamano.
- **Ruoli**: anonimo (solo lettura catalogo), socio, admin. Il ruolo viene assegnato al primo login in `trovaOCreaUtenteDaGoogle` (`src/lib/data/users.ts`), admin se l'email è in `ADMIN_EMAILS`.
- **Auth**: NextAuth v5 (`src/auth.ts`) con Google. Per sviluppo/demo senza credenziali Google reali, impostare `ENABLE_DEV_LOGIN=true` in `.env.local`: in `/login` compaiono bottoni per entrare come uno degli utenti seed (admin o socie), senza password. Da disattivare prima di aprire l'app a socie reali.
- **Route protette**: `src/proxy.ts` (non `middleware.ts` — Next.js 16 ha rinominato la convenzione) redirige `/admin/*` e `/profilo/*` se non autorizzati.
- Env richieste: vedi `.env.local.example`.

