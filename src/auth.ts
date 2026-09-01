import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getUtenteById, trovaOCreaUtenteDaGoogle } from "@/lib/data/users";
import type { Ruolo } from "@/lib/types";

// Login rapido per la fase di sviluppo/demo: entra direttamente come uno
// degli utenti mock, senza passare da Google. Va tenuto disattivato appena
// l'app e' aperta a socie reali (nessuna password, chiunque potrebbe
// impersonare l'admin). Attivo solo se ENABLE_DEV_LOGIN=true.
const devLoginAttivo = process.env.ENABLE_DEV_LOGIN === "true";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    ...(devLoginAttivo
      ? [
          Credentials({
            id: "dev-login",
            name: "Accesso di sviluppo",
            credentials: { utenteId: { label: "Utente", type: "text" } },
            async authorize(credentials) {
              const utenteId = credentials?.utenteId;
              if (typeof utenteId !== "string") return null;
              const utente = await getUtenteById(utenteId);
              if (!utente) return null;
              return { id: utente.id, name: utente.nome, email: utente.email, image: utente.immagine };
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, profile, user }) {
      if (profile) {
        const utente = await trovaOCreaUtenteDaGoogle({
          googleId: String(profile.sub),
          nome: String(profile.name ?? profile.email ?? "Socio"),
          email: String(profile.email),
          immagine: typeof profile.picture === "string" ? profile.picture : null,
        });
        token.utenteId = utente.id;
        token.ruolo = utente.ruolo;
      } else if (user) {
        const utente = await getUtenteById(user.id!);
        if (utente) {
          token.utenteId = utente.id;
          token.ruolo = utente.ruolo;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.utenteId as string;
        session.user.ruolo = token.ruolo as Ruolo;
      }
      return session;
    },
  },
});
