import type { Ruolo } from "@/lib/types";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      ruolo: Ruolo;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    utenteId?: string;
    ruolo?: Ruolo;
  }
}
