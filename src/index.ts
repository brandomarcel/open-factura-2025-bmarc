/**
 * @file src/index.ts
 * @description Punto de entrada principal de la librería OpenFactura.
 * Incluye generación/firma/envío/autorización para Facturas y Notas de Crédito.
 */

import { Invoice } from './baseData/invoice/invoice';
import { generateInvoiceXML } from './services/generateInvoice';
import { signXML } from './services/signing';
import { sendSignedXml, ReceptionResponse } from './services/reception';
import { checkAuthorization, Autorizacion } from './services/authorization';
import { Ambiente } from './baseData/invoice/taxInfo';

// --- Nota de Crédito ---
import { CreditNote } from './baseData/creditNote/creditNote';
import { generateCreditNoteXML } from './services/generateCreditNote';

export interface OpenFacturaConfig {
  p12Path: string;
  p12Password: string;
  ambiente: Ambiente;
}

export class OpenFactura {
  private config: OpenFacturaConfig;

  constructor(config: OpenFacturaConfig) {
    if (!config.p12Path || !config.p12Password || !config.ambiente) {
      throw new Error('La configuración debe incluir p12Path, p12Password y ambiente.');
    }
    this.config = config;
  }

  // ----------------- FACTURA -----------------
  public async createAndSignInvoice(
    invoiceData: Invoice,
    codigoNumerico: string
  ): Promise<{ accessKey: string; signedXml: string }> {
    invoiceData.infoTributaria.ambiente = this.config.ambiente;
    const { xml: unsignedXml, accessKey } = generateInvoiceXML(invoiceData, codigoNumerico);
    const signedXml = await signXML(unsignedXml, this.config.p12Path, this.config.p12Password);
    return { accessKey, signedXml };
  }

  // ----------------- NOTA DE CRÉDITO -----------------
  public async createAndSignCreditNote(
    creditNoteData: CreditNote,
    codigoNumerico: string
  ): Promise<{ accessKey: string; signedXml: string }> {
    creditNoteData.infoTributaria.ambiente = this.config.ambiente;
    const { xml: unsignedXml, accessKey } = generateCreditNoteXML(creditNoteData, codigoNumerico);
    const signedXml = await signXML(unsignedXml, this.config.p12Path, this.config.p12Password);
    return { accessKey, signedXml };
  }

  // ----------------- ENVÍO / AUTORIZACIÓN (genéricos) -----------------
  public async sendDocument(signedXml: string): Promise<ReceptionResponse> {
    return await sendSignedXml(signedXml, this.config.ambiente);
  }

  public async authorizeDocument(accessKey: string): Promise<Autorizacion> {
    return await checkAuthorization(accessKey, this.config.ambiente);
  }

  // Compat con nombres anteriores
  public async sendInvoice(signedXml: string): Promise<ReceptionResponse> {
    return this.sendDocument(signedXml);
  }
  public async authorizeInvoice(accessKey: string): Promise<Autorizacion> {
    return this.authorizeDocument(accessKey);
  }
}

// ----------------- Exportaciones -----------------

// Factura
export * from './baseData/invoice/invoice';
export * from './baseData/invoice/taxInfo';
export * from './baseData/invoice/invoiceInfo';
export * from './baseData/invoice/details';
export * from './baseData/invoice/additionalInfo';
export * from './baseData/invoice/reimbursements';
export * from './baseData/invoice/remissionGuidesSustitutiveInfo';
export * from './baseData/invoice/retentions';
export * from './baseData/invoice/otherThirdPartyValues';
export { generateInvoiceXML } from './services/generateInvoice';

// Nota de Crédito (usar alias para evitar colisión con tipos de factura)
export { generateCreditNoteXML } from './services/generateCreditNote';
export type {
  CreditNote,
  CreditNoteVersion,
  InfoTributaria as CreditNoteInfoTributaria,
  InfoNotaCredito,
  DetalleNC as CreditNoteDetalle,
  DetalleImpuesto as CreditNoteDetalleImpuesto,
  TotalImpuesto as CreditNoteTotalImpuesto,
  InfoAdicional as CreditNoteInfoAdicional,
} from './baseData/creditNote/creditNote';

// Servicios comunes
export * from './services/reception';
export * from './services/authorization';
export { signXML } from './services/signing';
