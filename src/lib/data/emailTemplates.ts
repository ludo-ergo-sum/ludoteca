import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import * as mock from "./emailTemplates.mock";
import * as mongo from "./emailTemplates.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const getTemplateEmail = impl.getTemplateEmail;
export const getTuttiITemplateEmail = impl.getTuttiITemplateEmail;
export const salvaTemplateEmail = impl.salvaTemplateEmail;
export const getImpostazioniEmail = impl.getImpostazioniEmail;
export const salvaImpostazioniEmail = impl.salvaImpostazioniEmail;
