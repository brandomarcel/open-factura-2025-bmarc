import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { InfoNotaCredito, TotalImpuesto } from './creditNote';

const money = (n: number) => (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);

export function normalizeDate_ddmmyyyy(s: string) {
  const m1 = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (m1) return `${m1[1]}/${m1[2]}/${m1[3]}`;
  const m2 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m2) return `${m2[3]}/${m2[2]}/${m2[1]}`;
  return s;
}

function normalizeNumDocModificado(s: string) {
  const withHyphens = /^(\d{3})-(\d{3})-(\d{9})$/;
  if (withHyphens.test(s)) return s;
  const compact = /^(\d{3})(\d{3})(\d{9})$/.exec(s);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  return s;
}

function addOpt(parent: XMLBuilder, name: string, value?: string | number | null) {
  if (value === undefined || value === null || value === '') return;
  parent.ele(name).txt(String(value));
}

function totalsNode(parent: XMLBuilder, list: TotalImpuesto[]) {
  const tci = parent.ele('totalConImpuestos');
  (list || []).forEach(t => {
    const ti = tci.ele('totalImpuesto');
    ti.ele('codigo').txt(t.codigo);
    ti.ele('codigoPorcentaje').txt(t.codigoPorcentaje);
    ti.ele('baseImponible').txt(money(t.baseImponible));
    ti.ele('valor').txt(money(t.valor));
    if (typeof t.tarifa === 'number') ti.ele('tarifa').txt(String(t.tarifa));
  });
}

/**
 * Agrega <infoNotaCredito> al builder con el orden exigido por el XSD del SRI.
 */
export function appendInfoNotaCredito(parent: XMLBuilder, info: InfoNotaCredito) {
  const inc = parent.ele('infoNotaCredito');

  // 1) Cabecera
  inc.ele('fechaEmision').txt(normalizeDate_ddmmyyyy(info.fechaEmision));
  addOpt(inc, 'dirEstablecimiento', info.dirEstablecimiento);

  // 2) Comprador
  inc.ele('tipoIdentificacionComprador').txt(info.tipoIdentificacionComprador);
  inc.ele('razonSocialComprador').txt(info.razonSocialComprador);
  inc.ele('identificacionComprador').txt(info.identificacionComprador);

  // 3) Opcionales
  addOpt(inc, 'contribuyenteEspecial', info.contribuyenteEspecial);
  addOpt(inc, 'obligadoContabilidad', info.obligadoContabilidad);
  addOpt(inc, 'rise', info.rise);

  // 4) Sustento
  inc.ele('codDocModificado').txt(info.codDocModificado);
  inc.ele('numDocModificado').txt(normalizeNumDocModificado(info.numDocModificado));
  inc.ele('fechaEmisionDocSustento').txt(normalizeDate_ddmmyyyy(info.fechaEmisionDocSustento));

  // 5) Totales (orden correcto)
  inc.ele('totalSinImpuestos').txt(money(info.totalSinImpuestos));
  inc.ele('valorModificacion').txt(money(info.valorModificacion));
  addOpt(inc, 'moneda', info.moneda);
  totalsNode(inc, info.totalConImpuestos);

  // 6) Motivo (obligatorio)
  inc.ele('motivo').txt(info.motivo);
}
