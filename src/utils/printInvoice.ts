import { Invoice, ClinicInformation } from '@/types';

interface PrintInvoiceOptions {
  invoice: Invoice;
  clinic?: ClinicInformation | null;
}

export function printInvoice({ invoice, clinic }: PrintInvoiceOptions) {
  const formatCurrency = (n: number) => `L ${n.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return d; }
  };

  const lineItemsHtml = invoice.lineItems.map((item) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${item.description}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; color: #666;">${item.toothNumbers || '—'}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('');

  const clinicName = clinic?.clinicName || 'Clínica Dental';
  const clinicLegalName = clinic?.legalName || '';
  const clinicRtn = clinic?.rtn || '';
  const clinicAddress = [clinic?.address, clinic?.city, clinic?.department].filter(Boolean).join(', ');
  const clinicPhone = clinic?.phone || '';
  const clinicEmail = clinic?.email || '';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #1a1a2e;
      background: #fff;
      padding: 0;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 3px solid #2563eb;
    }
    .clinic-info h1 {
      font-size: 24px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 4px;
    }
    .clinic-info .legal-name {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .clinic-info .detail {
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .invoice-badge {
      text-align: right;
    }
    .invoice-badge .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      font-weight: 600;
    }
    .invoice-badge .number {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      margin-top: 4px;
    }
    .invoice-badge .date {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }

    /* CAI */
    .cai-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 11px;
      color: #64748b;
    }
    .cai-section strong {
      color: #475569;
    }

    /* Patient */
    .patient-section {
      background: #f8fafc;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    .patient-section .section-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .patient-section .patient-name {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    /* Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .items-table thead th {
      padding: 10px 12px;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      font-weight: 600;
      border-bottom: 2px solid #e2e8f0;
      background: #f8fafc;
    }
    .items-table thead th:nth-child(3),
    .items-table thead th:nth-child(4),
    .items-table thead th:nth-child(5) {
      text-align: right;
    }
    .items-table thead th:nth-child(2),
    .items-table thead th:nth-child(3) {
      text-align: center;
    }
    .items-table tbody tr:last-child td {
      border-bottom: 2px solid #e2e8f0;
    }

    /* Totals */
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .totals-box {
      width: 280px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #64748b;
    }
    .totals-row.total {
      border-top: 2px solid #1a1a2e;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
    }
    .totals-row.total .amount {
      color: #2563eb;
    }

    /* Notes */
    .notes-section {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 32px;
    }
    .notes-section .notes-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #92400e;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .notes-section .notes-text {
      font-size: 13px;
      color: #78350f;
      line-height: 1.5;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.8;
    }
    .footer .thank-you {
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 4px;
    }

    @media print {
      body { padding: 0; }
      .invoice-container { padding: 20px; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="clinic-info">
        <h1>${clinicName}</h1>
        ${clinicLegalName ? `<div class="legal-name">${clinicLegalName}</div>` : ''}
        <div class="detail">
          ${clinicRtn ? `<div>RTN: ${clinicRtn}</div>` : ''}
          ${clinicAddress ? `<div>${clinicAddress}</div>` : ''}
          ${clinicPhone ? `<div>Tel: ${clinicPhone}</div>` : ''}
          ${clinicEmail ? `<div>${clinicEmail}</div>` : ''}
        </div>
      </div>
      <div class="invoice-badge">
        <div class="label">Factura</div>
        <div class="number">${invoice.invoiceNumber}</div>
        <div class="date">${formatDate(invoice.invoiceDate)}</div>
      </div>
    </div>

    <!-- CAI -->
    ${invoice.cai ? `
    <div class="cai-section">
      <strong>CAI:</strong> ${invoice.cai}
    </div>
    ` : ''}

    <!-- Patient -->
    <div class="patient-section">
      <div class="section-label">Paciente</div>
      <div class="patient-name">${invoice.patientName}</div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Descripción</th>
          <th>Dientes</th>
          <th>Cant.</th>
          <th style="text-align:right">Precio Unit.</th>
          <th style="text-align:right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHtml}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-box">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${formatCurrency(invoice.subtotal)}</span>
        </div>
        ${invoice.tax > 0 ? `
        <div class="totals-row">
          <span>Impuesto</span>
          <span>${formatCurrency(invoice.tax)}</span>
        </div>` : ''}
        ${invoice.discount > 0 ? `
        <div class="totals-row">
          <span>Descuento</span>
          <span>-${formatCurrency(invoice.discount)}</span>
        </div>` : ''}
        <div class="totals-row total">
          <span>Total</span>
          <span class="amount">${formatCurrency(invoice.total)}</span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    ${invoice.notes ? `
    <div class="notes-section">
      <div class="notes-label">Notas</div>
      <div class="notes-text">${invoice.notes}</div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <div class="thank-you">¡Gracias por su confianza!</div>
      <div>${clinicName}${clinicPhone ? ` · Tel: ${clinicPhone}` : ''}${clinicEmail ? ` · ${clinicEmail}` : ''}</div>
    </div>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => printWindow.print();
}
