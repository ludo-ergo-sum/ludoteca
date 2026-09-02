export interface Tema {
  id: string;
  nome: string;
}

export const TEMI: Tema[] = [
  { id: "classico", nome: "Classico — feltro e ambra" },
  { id: "notte", nome: "Notte in ludoteca" },
  { id: "mare", nome: "Marino" },
  { id: "rame", nome: "Rame moderno" },
  { id: "pastello", nome: "Pastello gioco" },
];

export const TEMA_DEFAULT = "classico";
export const CHIAVE_STORAGE_TEMA = "les-tema";
