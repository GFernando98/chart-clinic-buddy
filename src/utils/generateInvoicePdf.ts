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
      year: 'numeric', month: 'numeric', day: 'numeric',
    });
  } catch {
    return d;
  }
};

// Number to words in Spanish (Honduran style for invoices)
function numberToWords(n: number): string {
  const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  if (n === 0) return 'CERO';
  if (n === 100) return 'CIEN';

  const convertGroup = (num: number): string => {
    if (num === 0) return '';
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const t = Math.floor(num / 10);
      const u = num % 10;
      if (t === 2 && u > 0) return `VEINTI${units[u]}`;
      return u === 0 ? tens[t] : `${tens[t]} Y ${units[u]}`;
    }
    if (num === 100) return 'CIEN';
    if (num < 1000) {
      const h = Math.floor(num / 100);
      const rest = num % 100;
      return rest === 0 ? (h === 1 ? 'CIEN' : hundreds[h]) : `${hundreds[h]} ${convertGroup(rest)}`;
    }
    if (num < 1000000) {
      const thousands = Math.floor(num / 1000);
      const rest = num % 1000;
      const prefix = thousands === 1 ? 'MIL' : `${convertGroup(thousands)} MIL`;
      return rest === 0 ? prefix : `${prefix} ${convertGroup(rest)}`;
    }
    return num.toString();
  };

  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);
  const intWords = convertGroup(intPart);
  return `${intWords} CON ${decPart.toString().padStart(2, '0')}/100 LEMPIRAS`;
}

async function loadLogoDataUrl(logo: string): Promise<string | null> {
  try {
    if (logo.startsWith('data:')) return logo;
    if (logo.startsWith('http')) {
      const resp = await fetch(logo);
      const blob = await resp.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
    return `data:image/png;base64,${logo}`;
  } catch (e) {
    console.warn('Could not load clinic logo for PDF:', e);
    return null;
  }
}

export async function generateInvoicePdf({ invoice, clinic, taxInfo }: GenerateInvoicePdfOptions) {
  const clinicName = clinic?.clinicName || 'Clínica Dental';
  const clinicLegalName = clinic?.legalName || clinicName;
  const clinicRtn = clinic?.rtn || '';
  const clinicAddress = clinic?.address || '';
  const clinicCityDept = [clinic?.city, clinic?.department].filter(Boolean).join(', ');
  const clinicPhone = clinic?.phone || '';
  const clinicEmail = clinic?.email || '';

  let logoDataUrl: string | null = null;
  if (clinic?.logo) {
    logoDataUrl = await loadLogoDataUrl(clinic.logo);
  }

  // ── HEADER: Logo + Clinic info (left) | FACTURA title + number (right) ──
  const leftHeaderStack: any[] = [];

  if (logoDataUrl) {
    leftHeaderStack.push({
      image: logoDataUrl,
      width: 70,
      margin: [0, 0, 0, 6] as [number, number, number, number],
    });
  }

  leftHeaderStack.push(
    { text: clinicLegalName, fontSize: 13, bold: true, color: '#1a1a2e' },
    { text: clinicAddress, fontSize: 9, color: '#475569', margin: [0, 2, 0, 0] as [number, number, number, number] },
    { text: clinicCityDept, fontSize: 9, color: '#475569' },
  );
  if (clinicPhone) leftHeaderStack.push({ text: `Tel. ${clinicPhone}`, fontSize: 9, color: '#475569' });
  if (clinicEmail) leftHeaderStack.push({ text: clinicEmail, fontSize: 9, color: '#475569' });
  if (clinicRtn) leftHeaderStack.push({ text: `RTN: ${clinicRtn}`, fontSize: 9, bold: true, color: '#1a1a2e', margin: [0, 4, 0, 0] as [number, number, number, number] });

  const rightHeaderStack: any[] = [
    {
      table: {
        widths: ['*'],
        body: [[{
          text: 'FACTURA',
          fontSize: 18,
          bold: true,
          color: '#ffffff',
          alignment: 'center',
          margin: [0, 6, 0, 6] as [number, number, number, number],
        }]],
      },
      layout: {
        fillColor: () => '#2563eb',
        hLineWidth: () => 0,
        vLineWidth: () => 0,
      },
    },
    { text: invoice.invoiceNumber, fontSize: 11, bold: true, color: '#1a1a2e', alignment: 'center', margin: [0, 6, 0, 2] as [number, number, number, number] },
    { text: `Fecha: ${formatDate(invoice.invoiceDate)}`, fontSize: 9, color: '#475569', alignment: 'center' },
  ];

  // ── CAI + Client + Tax Ranges section ──
  const infoRows: any[] = [];

  // Client row
  infoRows.push(
    {
      table: {
        widths: ['auto', '*'],
        body: [
          [
            { text: 'CLIENTE:', fontSize: 9, bold: true, color: '#1a1a2e', border: [false, false, false, false] },
            { text: invoice.patientName, fontSize: 9, color: '#1a1a2e', border: [false, false, false, true], borderColor: ['', '', '', '#cbd5e1'] },
          ],
        ],
      },
      layout: {
        hLineColor: () => '#cbd5e1',
        vLineWidth: () => 0,
        hLineWidth: (i: number) => i === 1 ? 0.5 : 0,
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
      margin: [0, 0, 0, 4] as [number, number, number, number],
    }
  );

  // CAI
  if (invoice.cai) {
    infoRows.push({
      table: {
        widths: ['auto', '*'],
        body: [[
          { text: 'CAI:', fontSize: 8, bold: true, color: '#475569' },
          { text: invoice.cai, fontSize: 8, color: '#475569' },
        ]],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 2] as [number, number, number, number],
    });
  }

  // Tax info ranges
  if (taxInfo) {
    infoRows.push({
      table: {
        widths: ['auto', '*'],
        body: [
          [
            { text: 'Rango Autorizado:', fontSize: 8, bold: true, color: '#475569' },
            { text: `${taxInfo.rangeStart} a la ${taxInfo.rangeEnd}`, fontSize: 8, color: '#475569' },
          ],
          [
            { text: 'Fecha Límite Emisión:', fontSize: 8, bold: true, color: '#475569' },
            { text: formatDate(taxInfo.expirationDate), fontSize: 8, color: '#475569' },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 4] as [number, number, number, number],
    });
  }

  // ── LINE ITEMS TABLE ──
  const tableBody: any[][] = [
    [
      { text: 'CANTIDAD', style: 'tableHeader', alignment: 'center' },
      { text: 'DESCRIPCIÓN', style: 'tableHeader' },
      { text: 'DIENTES', style: 'tableHeader', alignment: 'center' },
      { text: 'IMPUESTO', style: 'tableHeader', alignment: 'center' },
      { text: 'TOTAL', style: 'tableHeader', alignment: 'right' },
    ],
  ];

  invoice.lineItems.forEach((item) => {
    tableBody.push([
      { text: item.quantity.toFixed(2), fontSize: 9, alignment: 'center' },
      { text: item.description, fontSize: 9 },
      { text: item.toothNumbers || '—', fontSize: 9, alignment: 'center', color: '#64748b' },
      { text: '15%', fontSize: 9, alignment: 'center', color: '#64748b' },
      { text: formatCurrency(item.subtotal), fontSize: 9, alignment: 'right', bold: true },
    ]);
  });

  // ── TOTALS (right side, Honduran format) ──
  const totalInWords = numberToWords(invoice.total);

  const totalsBody: any[][] = [
    [
      { text: 'Descuento y rebajas otorgados:', fontSize: 8, color: '#475569' },
      { text: formatCurrency(invoice.discount), fontSize: 8, alignment: 'right' },
    ],
    [
      { text: 'Importe Exento:', fontSize: 8, color: '#475569' },
      { text: formatCurrency(0), fontSize: 8, alignment: 'right' },
    ],
    [
      { text: 'Importe Gravado 15%:', fontSize: 8, color: '#475569' },
      { text: formatCurrency(invoice.subtotal), fontSize: 8, alignment: 'right' },
    ],
    [
      { text: 'Importe Gravado 18%:', fontSize: 8, color: '#475569' },
      { text: formatCurrency(0), fontSize: 8, alignment: 'right' },
    ],
    [
      { text: 'ISV 15%:', fontSize: 8, bold: true, color: '#475569' },
      { text: formatCurrency(invoice.tax), fontSize: 8, alignment: 'right', bold: true },
    ],
    [
      { text: 'ISV 18%:', fontSize: 8, color: '#475569' },
      { text: formatCurrency(0), fontSize: 8, alignment: 'right' },
    ],
  ];

  // ── NOTES ──
  const notesContent: any[] = invoice.notes ? [{
    table: {
      widths: ['*'],
      body: [[{
        stack: [
          { text: 'NOTAS:', fontSize: 8, bold: true, color: '#92400e' },
          { text: invoice.notes, fontSize: 9, color: '#78350f', margin: [0, 2, 0, 0] as [number, number, number, number] },
        ],
        margin: [8, 6, 8, 6] as [number, number, number, number],
      }]],
    },
    layout: {
      fillColor: () => '#fffbeb',
      hLineColor: () => '#fef3c7',
      vLineColor: () => '#fef3c7',
    },
    margin: [0, 8, 0, 0] as [number, number, number, number],
  }] : [];

  // ── DOCUMENT DEFINITION ──
  const docDefinition: any = {
    pageSize: 'LETTER',
    pageMargins: [40, 40, 40, 40],
    content: [
      // Header
      {
        columns: [
          { width: '*', stack: leftHeaderStack },
          { width: 180, stack: rightHeaderStack },
        ],
        margin: [0, 0, 0, 12] as [number, number, number, number],
      },

      // Blue separator
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 2, lineColor: '#2563eb' }], margin: [0, 0, 0, 10] as [number, number, number, number] },

      // Client + CAI + Tax ranges
      ...infoRows,

      // Thin separator before table
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }], margin: [0, 6, 0, 8] as [number, number, number, number] },

      // Items table
      {
        table: {
          headerRows: 1,
          widths: [50, '*', 55, 55, 70],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#2563eb' : (rowIndex % 2 === 0 ? '#f8fafc' : null),
          hLineColor: () => '#e2e8f0',
          vLineColor: () => '#e2e8f0',
          hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
          vLineWidth: () => 0.5,
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
        margin: [0, 0, 0, 8] as [number, number, number, number],
      },

      // Amount in words + Totals side by side
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Son:', fontSize: 8, bold: true, color: '#475569', margin: [0, 0, 0, 2] as [number, number, number, number] },
              { text: totalInWords, fontSize: 8, italics: true, color: '#1a1a2e' },
              ...notesContent,
            ],
          },
          {
            width: 200,
            stack: [
              {
                table: {
                  widths: ['*', 'auto'],
                  body: totalsBody,
                },
                layout: {
                  hLineColor: () => '#e2e8f0',
                  vLineWidth: () => 0,
                  hLineWidth: () => 0.5,
                  paddingLeft: () => 4,
                  paddingRight: () => 4,
                  paddingTop: () => 3,
                  paddingBottom: () => 3,
                },
              },
              // Grand total
              {
                table: {
                  widths: ['*', 'auto'],
                  body: [[
                    { text: 'TOTAL L.:', fontSize: 12, bold: true, color: '#ffffff' },
                    { text: formatCurrency(invoice.total), fontSize: 12, bold: true, color: '#ffffff', alignment: 'right' },
                  ]],
                },
                layout: {
                  fillColor: () => '#2563eb',
                  hLineWidth: () => 0,
                  vLineWidth: () => 0,
                  paddingLeft: () => 8,
                  paddingRight: () => 8,
                  paddingTop: () => 6,
                  paddingBottom: () => 6,
                },
                margin: [0, 4, 0, 0] as [number, number, number, number],
              },
            ],
          },
        ],
        margin: [0, 4, 0, 16] as [number, number, number, number],
      },

      // Footer separator
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }], margin: [0, 0, 0, 8] as [number, number, number, number] },

      // Footer
      { text: 'ORIGINAL: CLIENTE — COPIA: OBLIGADO TRIBUTARIO EMISOR', fontSize: 7, color: '#94a3b8', alignment: 'center', margin: [0, 0, 0, 6] as [number, number, number, number] },
      { text: '¡Gracias por su confianza!', fontSize: 10, bold: true, color: '#475569', alignment: 'center' },
      {
        text: [clinicName, clinicPhone ? ` · Tel: ${clinicPhone}` : '', clinicEmail ? ` · ${clinicEmail}` : ''].join(''),
        fontSize: 8,
        color: '#94a3b8',
        alignment: 'center',
        margin: [0, 2, 0, 0] as [number, number, number, number],
      },
    ],
    styles: {
      tableHeader: { fontSize: 8, bold: true, color: '#ffffff' },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  };

  pdfMake.createPdf(docDefinition).open();
}
