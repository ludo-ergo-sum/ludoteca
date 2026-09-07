import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-20">
      <Loader2 className="animate-spin text-felt" size={28} aria-label="Caricamento in corso" />
    </div>
  );
}
