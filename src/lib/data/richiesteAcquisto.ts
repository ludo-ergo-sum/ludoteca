import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import * as mock from "./richiesteAcquisto.mock";
import * as mongo from "./richiesteAcquisto.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const getRichiesteAcquisto = impl.getRichiesteAcquisto;
export const creaRichiestaAcquisto = impl.creaRichiestaAcquisto;
export const segnaRichiestaGestita = impl.segnaRichiestaGestita;
