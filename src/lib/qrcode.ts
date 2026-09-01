import "server-only";
import QRCode from "qrcode";

export function urlSchedaCopia(codice: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return `${base}/copie/${codice}`;
}

// SVG inline (data URL) del QR che punta alla scheda della copia: nessun file
// da salvare su disco, comodo da stampare direttamente dal pannello admin.
export async function generaQrCodeSvg(codice: string): Promise<string> {
  const url = urlSchedaCopia(codice);
  return QRCode.toString(url, {
    type: "svg",
    margin: 1,
    color: { dark: "#1F4D3E", light: "#00000000" },
  });
}
