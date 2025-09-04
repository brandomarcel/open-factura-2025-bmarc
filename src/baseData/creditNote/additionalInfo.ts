// src/baseData/creditNote/additionalInfo.ts
import { InfoAdicional } from './creditNote';

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function additionalInfoToXML(ia?: InfoAdicional) {
  if (!ia || !ia.campos?.length) return "";
  const inner = ia.campos.map(c =>
    `<campoAdicional nombre="${esc(c.nombre)}">${esc(c.valor)}</campoAdicional>`
  ).join("");
  return `<infoAdicional>${inner}</infoAdicional>`;
}
