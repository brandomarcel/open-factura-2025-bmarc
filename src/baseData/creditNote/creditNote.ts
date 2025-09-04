// Tipos base para Nota de Crédito

export type CreditNoteVersion = "1.1.0";

export type InfoTributaria = {
  ambiente: "1" | "2";            // 1: pruebas, 2: producción
  tipoEmision: "1";               // normal
  razonSocial: string;
  nombreComercial?: string;
  ruc: string;                    // 13 dígitos
  codDoc?: "04";                  // se forzará a '04' al generar XML
  estab: string;                  // 3 dígitos
  ptoEmi: string;                 // 3 dígitos
  secuencial: string;             // 9 dígitos
  dirMatriz: string;
  contribuyenteRimpe?: string;
  obligadoContabilidad?: "SI" | "NO" | string;
};

export type TotalImpuesto = {
  codigo: string;               // '2' = IVA, etc.
  codigoPorcentaje: string;     // '0','2','4', etc.
  baseImponible: number;
  valor: number;
  tarifa?: number;
};

export type InfoNotaCredito = {
  // Fechas aceptan dd/mm/yyyy o yyyy-mm-dd; el generador normaliza a dd/mm/yyyy
  fechaEmision: string;
  // En NC el dirEstablecimiento puede venir o no (según XSD); si lo tienes, envíalo.
  dirEstablecimiento?: string;

  // Comprador (debe ir antes que los opcionales en el XML)
  tipoIdentificacionComprador: string;
  razonSocialComprador: string;
  identificacionComprador: string;

  // Opcionales (van después del comprador)
  contribuyenteEspecial?: string;
  obligadoContabilidad?: "SI" | "NO" | string;
  rise?: string;

  // Documento de sustento
  codDocModificado: "01" | "03" | "04" | "05" | "06"; // usual: '01' (factura)
  // El XSD exige ###-###-#########; el generador también acepta “pegado” y lo normaliza.
  numDocModificado: string;
  fechaEmisionDocSustento: string;

  // Totales
  totalSinImpuestos: number;
  valorModificacion: number;     // total de la NC (TSI + impuestos)
  moneda?: string;
  totalConImpuestos: TotalImpuesto[];

  // Obligatorio en NC
  motivo: string;
};

export type DetalleImpuesto = {
  codigo: string;
  codigoPorcentaje: string;
  tarifa?: number;
  baseImponible?: number;
  valor?: number;
};

export type DetalleNC = {
  // En el XSD de NC se usa codigoInterno/codigoAdicional;
  // si vienes desde factura puedes mandar codigoPrincipal/codigoAuxiliar y el generador los mapea.
  codigoInterno?: string;
  codigoAdicional?: string;
  codigoPrincipal?: string; // compat
  codigoAuxiliar?: string;  // compat

  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  precioTotalSinImpuesto: number;
  impuestos: DetalleImpuesto[];

  // Soporte a <detallesAdicionales> como en factura
  detallesAdicionales?: { nombre: string; valor: string }[];
};

export type InfoAdicional = {
  campos: { nombre: string; valor: string }[];
};

export type CreditNote = {
  version: CreditNoteVersion;
  infoTributaria: InfoTributaria;
  infoNotaCredito: InfoNotaCredito;
  detalles: DetalleNC[];
  infoAdicional?: InfoAdicional;
};
