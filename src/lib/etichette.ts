import "server-only";
import PDFDocument from "pdfkit";
import { generaQrCodePng } from "@/lib/qrcode";

// Un foglietto per copia (titolo gioco + codice + QR verso la scheda della
// copia), in griglia su A4: gli admin stampano il PDF e tagliano i singoli
// foglietti lungo il bordo tratteggiato per metterli dentro le scatole.

export interface VoceEtichetta {
  codice: string;
  titoloGioco: string;
  giocoId: string;
}

const MM = 72 / 25.4; // pdfkit lavora in punti (72 per pollice)
const COLONNE = 2;
const ALTEZZA_ETICHETTA = 42 * MM;

// Una riga per gioco, massimo 2 copie (colonne) per riga: se un gioco ha un
// numero dispari di copie l'ultima riga di quel gioco ha un solo slot
// occupato, cosi' il foglio resta sempre diviso in due colonne uguali.
function raggruppaInRighe(voci: VoceEtichetta[]): (VoceEtichetta | null)[][] {
  const perGioco = new Map<string, VoceEtichetta[]>();
  for (const voce of voci) {
    const gruppo = perGioco.get(voce.giocoId);
    if (gruppo) gruppo.push(voce);
    else perGioco.set(voce.giocoId, [voce]);
  }

  const righe: (VoceEtichetta | null)[][] = [];
  for (const copieGioco of perGioco.values()) {
    for (let i = 0; i < copieGioco.length; i += COLONNE) {
      righe.push([copieGioco[i], copieGioco[i + 1] ?? null]);
    }
  }
  return righe;
}

export async function generaPdfEtichette(voci: VoceEtichetta[]): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 20 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const pronto = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  if (voci.length === 0) {
    doc.fontSize(12).text("Nessuna etichetta da stampare.");
    doc.end();
    return pronto;
  }

  const righe = raggruppaInRighe(voci);

  const larghezzaUtile = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const altezzaUtile = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;
  const larghezzaEtichetta = larghezzaUtile / COLONNE;
  const righePerPagina = Math.max(1, Math.floor(altezzaUtile / ALTEZZA_ETICHETTA));

  for (let r = 0; r < righe.length; r++) {
    const posizione = r % righePerPagina;
    if (r > 0 && posizione === 0) doc.addPage();

    const y = doc.page.margins.top + posizione * ALTEZZA_ETICHETTA;

    for (let colonna = 0; colonna < righe[r].length; colonna++) {
      const voce = righe[r][colonna];
      if (!voce) continue; // slot vuoto: nessun bordo, nessun contenuto

      const x = doc.page.margins.left + colonna * larghezzaEtichetta;

      doc.save();
      doc.dash(3, { space: 2 }).rect(x, y, larghezzaEtichetta, ALTEZZA_ETICHETTA).stroke("#999999");
      doc.undash();
      doc.restore();

      const qrLato = ALTEZZA_ETICHETTA - 16;
      const qrPng = await generaQrCodePng(voce.codice);
      doc.image(qrPng, x + 8, y + 8, { width: qrLato, height: qrLato });

      const testoX = x + qrLato + 16;
      const testoLarghezza = larghezzaEtichetta - qrLato - 24;
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(voce.titoloGioco, testoX, y + 10, {
          width: testoLarghezza,
          height: ALTEZZA_ETICHETTA - 24,
          ellipsis: true,
        });
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(voce.codice, testoX, y + ALTEZZA_ETICHETTA - 22, { width: testoLarghezza });
    }
  }

  doc.end();
  return pronto;
}
