// src/baseData/creditNote/details.ts
import { DetalleImpuesto, DetalleNC } from './creditNote';

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const tag = (n: string, v: string | number) => `<${n}>${esc(String(v))}</${n}>`;
const money = (n: number) => (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);

function impuestosXML(imps: DetalleImpuesto[]) {
  if (!imps || !imps.length) return `<impuestos></impuestos>`;
  const inner = imps.map(i =>
    `<impuesto>` +
      tag("codigo", i.codigo) +
      tag("codigoPorcentaje", i.codigoPorcentaje) +
      (typeof i.tarifa === "number" ? tag("tarifa", i.tarifa) : "") +
      (typeof i.baseImponible === "number" ? tag("baseImponible", money(i.baseImponible)) : "") +
      (typeof i.valor === "number" ? tag("valor", money(i.valor)) : "") +
    `</impuesto>`
  ).join("");
  return `<impuestos>${inner}</impuestos>`;
}

export function detallesToXML(detalles: DetalleNC[]) {
  const inner = detalles.map(d =>
    `<detalle>` +
      (d.codigoInterno ? tag("codigoInterno", d.codigoInterno) : (d.codigoPrincipal ? tag("codigoInterno", d.codigoPrincipal) : "")) +
      (d.codigoAdicional ? tag("codigoAdicional", d.codigoAdicional) : "") +
      tag("descripcion", d.descripcion) +
      tag("cantidad", money(d.cantidad)) +
      tag("precioUnitario", money(d.precioUnitario)) +
      tag("descuento", money(d.descuento ?? 0)) +
      tag("precioTotalSinImpuesto", money(d.precioTotalSinImpuesto)) +
      impuestosXML(d.impuestos) +
    `</detalle>`
  ).join("");
  return `<detalles>${inner}</detalles>`;
}
