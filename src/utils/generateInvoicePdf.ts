import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Invoice, ClinicInformation, TaxInformation } from '@/types';

(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;



interface GenerateInvoicePdfOptions {
  invoice: Invoice;
  clinic?: ClinicInformation | null;
  taxInfo?: TaxInformation | null;
}

const formatCurrency = (n: number) =>
  `L ${n.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('es-HN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return d;
  }
};

export function generateInvoicePdf({ invoice, clinic, taxInfo }: GenerateInvoicePdfOptions) {
  const clinicName = clinic?.clinicName || 'Clínica Dental';
  const clinicLegalName = clinic?.legalName || '';
  const clinicRtn = clinic?.rtn || '';
  const clinicAddress = [clinic?.address, clinic?.city, clinic?.department].filter(Boolean).join(', ');
  const clinicPhone = clinic?.phone || '';
  const clinicEmail = clinic?.email || '';

  // Build header info
  const clinicInfoContent: any[] = [
    { text: clinicName, style: 'clinicName' },
  ];
  if (clinicLegalName) clinicInfoContent.push({ text: clinicLegalName, style: 'clinicDetail' });
  if (clinicRtn) clinicInfoContent.push({ text: `RTN: ${clinicRtn}`, style: 'clinicDetail' });
  if (clinicAddress) clinicInfoContent.push({ text: clinicAddress, style: 'clinicDetail' });
  if (clinicPhone) clinicInfoContent.push({ text: `Tel: ${clinicPhone}`, style: 'clinicDetail' });
  if (clinicEmail) clinicInfoContent.push({ text: clinicEmail, style: 'clinicDetail' });

  // CAI section
  const caiContent: any[] = [];
  if (invoice.cai) {
    caiContent.push({
      table: {
        widths: ['*'],
        body: [[{
          text: [
            { text: 'CAI: ', bold: true },
            invoice.cai,
          ],
          fontSize: 8,
          color: '#475569',
          margin: [8, 6, 8, 6] as [number, number, number, number],
        }]],
      },
      layout: {
        fillColor: '#f8fafc',
        hLineColor: () => '#e2e8f0',
        vLineColor: () => '#e2e8f0',
      },
      margin: [0, 0, 0, 12] as [number, number, number, number],
    });
  }

  // Tax info (ranges)
  const taxContent: any[] = [];
  if (taxInfo) {
    taxContent.push({
      table: {
        widths: ['auto', '*', 'auto', '*'],
        body: [[
          { text: 'Rango Autorizado:', bold: true, fontSize: 8, color: '#475569' },
          { text: `${taxInfo.rangeStart} - ${taxInfo.rangeEnd}`, fontSize: 8, color: '#475569' },
          { text: 'Fecha Límite Emisión:', bold: true, fontSize: 8, color: '#475569' },
          { text: formatDate(taxInfo.expirationDate), fontSize: 8, color: '#475569' },
        ]],
      },
      layout: {
        fillColor: '#f8fafc',
        hLineColor: () => '#e2e8f0',
        vLineColor: () => '#e2e8f0',
      },
      margin: [0, 0, 0, 12] as [number, number, number, number],
    });
  }

  // Line items table
  const tableBody: any[][] = [
    [
      { text: 'Descripción', style: 'tableHeader' },
      { text: 'Dientes', style: 'tableHeader', alignment: 'center' },
      { text: 'Cant.', style: 'tableHeader', alignment: 'center' },
      { text: 'Precio Unit.', style: 'tableHeader', alignment: 'right' },
      { text: 'Subtotal', style: 'tableHeader', alignment: 'right' },
    ],
  ];

  invoice.lineItems.forEach((item) => {
    tableBody.push([
      { text: item.description, fontSize: 9 },
      { text: item.toothNumbers || '—', fontSize: 9, alignment: 'center', color: '#666' },
      { text: item.quantity.toString(), fontSize: 9, alignment: 'center' },
      { text: formatCurrency(item.unitPrice), fontSize: 9, alignment: 'right' },
      { text: formatCurrency(item.subtotal), fontSize: 9, alignment: 'right', bold: true },
    ]);
  });

  // Totals
  const totalsContent: any[] = [];
  totalsContent.push({
    columns: [
      { width: '*', text: '' },
      {
        width: 200,
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Subtotal', fontSize: 9, color: '#64748b' },
              { text: formatCurrency(invoice.subtotal), fontSize: 9, alignment: 'right' },
            ],
            ...(invoice.tax > 0 ? [[
              { text: 'ISV (15%)', fontSize: 9, color: '#64748b' },
              { text: formatCurrency(invoice.tax), fontSize: 9, alignment: 'right' },
            ]] : []),
            ...(invoice.discount > 0 ? [[
              { text: 'Descuento', fontSize: 9, color: '#64748b' },
              { text: `-${formatCurrency(invoice.discount)}`, fontSize: 9, alignment: 'right' },
            ]] : []),
            [
              { text: 'TOTAL', fontSize: 12, bold: true, color: '#1a1a2e', margin: [0, 6, 0, 0] as [number, number, number, number] },
              { text: formatCurrency(invoice.total), fontSize: 12, bold: true, color: '#2563eb', alignment: 'right', margin: [0, 6, 0, 0] as [number, number, number, number] },
            ],
          ],
        },
        layout: 'noBorders',
      },
    ],
    margin: [0, 12, 0, 16] as [number, number, number, number],
  });

  const docDefinition: any = {
    pageSize: 'LETTER',
    pageMargins: [40, 40, 40, 60],
    content: [
      // Header
      {
        columns: [
          { width: '*', stack: clinicInfoContent },
          {
            width: 'auto',
            stack: [
              { text: 'FACTURA', fontSize: 10, color: '#64748b', alignment: 'right', bold: true, letterSpacing: 1.5 },
              { text: invoice.invoiceNumber, fontSize: 16, bold: true, color: '#1a1a2e', alignment: 'right', margin: [0, 4, 0, 0] as [number, number, number, number] },
              { text: formatDate(invoice.invoiceDate), fontSize: 10, color: '#64748b', alignment: 'right', margin: [0, 4, 0, 0] as [number, number, number, number] },
            ],
          },
        ],
        margin: [0, 0, 0, 16] as [number, number, number, number],
      },

      // Separator
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#2563eb' }], margin: [0, 0, 0, 16] as [number, number, number, number] },

      // CAI
      ...caiContent,

      // Tax ranges
      ...taxContent,

      // Patient
      {
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: 'PACIENTE', fontSize: 8, color: '#94a3b8', bold: true, letterSpacing: 1 },
              { text: invoice.patientName, fontSize: 13, bold: true, color: '#1e293b', margin: [0, 2, 0, 0] as [number, number, number, number] },
            ],
            margin: [12, 8, 12, 8] as [number, number, number, number],
          }]],
        },
        layout: {
          fillColor: '#f8fafc',
          hLineColor: () => '#e2e8f0',
          vLineColor: () => '#e2e8f0',
        },
        margin: [0, 0, 0, 16] as [number, number, number, number],
      },

      // Items table
      {
        table: {
          headerRows: 1,
          widths: ['*', 60, 40, 80, 80],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#f8fafc' : null,
          hLineColor: () => '#e2e8f0',
          vLineWidth: () => 0,
          hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1.5 : 0.5,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
        margin: [0, 0, 0, 8] as [number, number, number, number],
      },

      // Totals
      ...totalsContent,

      // Notes
      ...(invoice.notes ? [{
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: 'NOTAS', fontSize: 8, color: '#92400e', bold: true, letterSpacing: 1 },
              { text: invoice.notes, fontSize: 10, color: '#78350f', margin: [0, 4, 0, 0] as [number, number, number, number] },
            ],
            margin: [12, 8, 12, 8] as [number, number, number, number],
          }]],
        },
        layout: {
          fillColor: '#fffbeb',
          hLineColor: () => '#fef3c7',
          vLineColor: () => '#fef3c7',
        },
        margin: [0, 0, 0, 16] as [number, number, number, number],
      } as any] : []),

      // Footer
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#e2e8f0' }], margin: [0, 8, 0, 12] as [number, number, number, number] },
      { text: '¡Gracias por su confianza!', fontSize: 11, bold: true, color: '#64748b', alignment: 'center' },
      {
        text: [clinicName, clinicPhone ? ` · Tel: ${clinicPhone}` : '', clinicEmail ? ` · ${clinicEmail}` : ''].join(''),
        fontSize: 9,
        color: '#94a3b8',
        alignment: 'center',
        margin: [0, 4, 0, 0] as [number, number, number, number],
      },
      { text: 'Original: Cliente | Copia: Obligado Tributario | Copia: Archivo', fontSize: 7, color: '#94a3b8', alignment: 'center', margin: [0, 8, 0, 0] as [number, number, number, number] },
    ],
    styles: {
      clinicName: { fontSize: 18, bold: true, color: '#2563eb', margin: [0, 0, 0, 2] as [number, number, number, number] },
      clinicDetail: { fontSize: 9, color: '#64748b', lineHeight: 1.4 },
      tableHeader: { fontSize: 8, bold: true, color: '#64748b', fillColor: '#f8fafc' },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  };

  pdfMake.createPdf(docDefinition).open();
}
