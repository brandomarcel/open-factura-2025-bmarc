import { create } from 'xmlbuilder2';
import { getAccessKey } from '../utils/utils';
import type { CreditNote } from '../baseData/creditNote/creditNote';
import { appendInfoNotaCredito } from '../baseData/creditNote/infoCreditNote';

function two(n: number) { return n.toFixed(2); }
function qty(n: number, version: string) { return (version === '1.1.0' ? n.toFixed(6) : n.toFixed(2)); }

export function generateCreditNoteXML(note: CreditNote, codigoNumerico: string) {
  if (!/^\d{8}$/.test(codigoNumerico)) {
    throw new Error('El código numérico debe ser un string de 8 dígitos numéricos. Ejemplo: "12345678"');
  }
  if (!note.infoTributaria || !note.infoNotaCredito || !note.detalles?.length) {
    throw new Error('Faltan bloques obligatorios: infoTributaria, infoNotaCredito o detalles.');
  }

  const totalDetalles = note.detalles.reduce((a, d) => a + d.precioTotalSinImpuesto, 0);
  if (Math.abs(totalDetalles - note.infoNotaCredito.totalSinImpuestos) > 0.01) {
    throw new Error('La suma de los detalles no coincide con totalSinImpuestos.');
  }
  const totalImp = note.infoNotaCredito.totalConImpuestos.reduce((a, t) => a + t.valor, 0);
  if (Math.abs((note.infoNotaCredito.totalSinImpuestos + totalImp) - note.infoNotaCredito.valorModificacion) > 0.01) {
    throw new Error('totalSinImpuestos + impuestos debe igualar valorModificacion.');
  }

  const accessKey = getAccessKey({
    date: note.infoNotaCredito.fechaEmision,
    voucherType: '04',
    ruc: note.infoTributaria.ruc,
    environment: note.infoTributaria.ambiente,
    series: `${note.infoTributaria.estab}${note.infoTributaria.ptoEmi}`,
    sequence: note.infoTributaria.secuencial,
    numericCode: codigoNumerico,
    emissionType: note.infoTributaria.tipoEmision,
  });

  const xml = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('notaCredito', { id: 'comprobante', version: note.version });

  // <infoTributaria>
  const it = xml.ele('infoTributaria');
  it.ele('ambiente').txt(note.infoTributaria.ambiente);
  it.ele('tipoEmision').txt(note.infoTributaria.tipoEmision);
  it.ele('razonSocial').txt(note.infoTributaria.razonSocial);
  if (note.infoTributaria.nombreComercial) it.ele('nombreComercial').txt(note.infoTributaria.nombreComercial);
  it.ele('ruc').txt(note.infoTributaria.ruc);
  it.ele('claveAcceso').txt(accessKey);
  it.ele('codDoc').txt('04'); // forzado
  it.ele('estab').txt(note.infoTributaria.estab);
  it.ele('ptoEmi').txt(note.infoTributaria.ptoEmi);
  it.ele('secuencial').txt(note.infoTributaria.secuencial);
  it.ele('dirMatriz').txt(note.infoTributaria.dirMatriz);
  if (note.infoTributaria.contribuyenteRimpe) it.ele('contribuyenteRimpe').txt(note.infoTributaria.contribuyenteRimpe);
  if (note.infoTributaria.obligadoContabilidad) it.ele('obligadoContabilidad').txt(note.infoTributaria.obligadoContabilidad);

  // <infoNotaCredito> con builder (sin .raw)
  appendInfoNotaCredito(xml, note.infoNotaCredito);

  // <detalles>
  const dets = xml.ele('detalles');
  note.detalles.forEach((d) => {
    const det = dets.ele('detalle');
    const codInt = d.codigoInterno || d.codigoPrincipal;
    const codAd  = d.codigoAdicional || (d as any).codigoAuxiliar;
    if (codInt) det.ele('codigoInterno').txt(String(codInt));
    if (codAd)  det.ele('codigoAdicional').txt(String(codAd));
    det.ele('descripcion').txt(d.descripcion);
    det.ele('cantidad').txt(qty(d.cantidad, note.version));
    det.ele('precioUnitario').txt(qty(d.precioUnitario, note.version));
    det.ele('descuento').txt(two(d.descuento ?? 0));
    det.ele('precioTotalSinImpuesto').txt(two(d.precioTotalSinImpuesto));

    if (d.detallesAdicionales?.length) {
      const da = det.ele('detallesAdicionales');
      d.detallesAdicionales.forEach(x => da.ele('detAdicional', { nombre: x.nombre, valor: x.valor }));
    }

    const imps = det.ele('impuestos');
    d.impuestos.forEach((i) => {
      const imp = imps.ele('impuesto');
      imp.ele('codigo').txt(i.codigo);
      imp.ele('codigoPorcentaje').txt(i.codigoPorcentaje);
      if (i.tarifa != null) imp.ele('tarifa').txt(String(i.tarifa));
      if (i.baseImponible != null) imp.ele('baseImponible').txt(two(i.baseImponible));
      if (i.valor != null) imp.ele('valor').txt(two(i.valor));
    });
  });

  // <infoAdicional> (opcional)
  if (note.infoAdicional?.campos?.length) {
    const ia = xml.ele('infoAdicional');
    note.infoAdicional.campos.forEach((c) => ia.ele('campoAdicional', { nombre: c.nombre }).txt(c.valor));
  }

  return { xml: xml.end({ prettyPrint: true }), accessKey };
}
