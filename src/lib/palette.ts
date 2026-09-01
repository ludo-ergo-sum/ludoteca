// Ogni gioco sullo scaffale ha un colore di copertina, come le vere scatole
// in una ludoteca. Nessuna foto: l'illustrazione e' il colore stesso piu'
// l'iniziale del titolo in Fraunces.

interface ColoreCopertina {
  bg: string;
  fg: string;
  ring: string;
}

const palette: ColoreCopertina[] = [
  { bg: "#1F4D3E", fg: "#F4ECD8", ring: "#0f2e23" },
  { bg: "#B4552F", fg: "#FBF6EA", ring: "#7c3a1f" },
  { bg: "#3E5C76", fg: "#F4ECD8", ring: "#233649" },
  { bg: "#8A6D3B", fg: "#FBF6EA", ring: "#5c471f" },
  { bg: "#6B4C6B", fg: "#F4ECD8", ring: "#432f43" },
  { bg: "#456B4B", fg: "#F4ECD8", ring: "#2b452f" },
];

export function copertinaPerGioco(id: string): ColoreCopertina {
  const somma = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[somma % palette.length];
}
