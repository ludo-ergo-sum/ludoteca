import "server-only";
import { auth } from "@/auth";
import { getUtenteById } from "@/lib/data/users";
import type { Utente } from "@/lib/types";

export async function getUtenteCorrente(): Promise<Utente | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return getUtenteById(session.user.id);
}

export async function richiediSocio(): Promise<Utente> {
  const utente = await getUtenteCorrente();
  if (!utente) throw new Error("Devi accedere per compiere questa azione.");
  return utente;
}

export async function richiediAdmin(): Promise<Utente> {
  const utente = await getUtenteCorrente();
  if (!utente || utente.ruolo !== "admin") {
    throw new Error("Solo un amministratore puo' compiere questa azione.");
  }
  return utente;
}
