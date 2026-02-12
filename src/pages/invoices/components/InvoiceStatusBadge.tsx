import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const statusConfig: Record<InvoiceStatus, { key: string; variant: string }> = {
  [InvoiceStatus.Pending]: { key: 'statusPending', variant: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30' },
  [InvoiceStatus.PartiallyPaid]: { key: 'statusPartiallyPaid', variant: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30' },
  [InvoiceStatus.Paid]: { key: 'statusPaid', variant: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30' },
  [InvoiceStatus.Cancelled]: { key: 'statusCancelled', variant: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30' },
  [InvoiceStatus.Overdue]: { key: 'statusOverdue', variant: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30' },
};

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const { t } = useTranslation();
  const config = statusConfig[status] || statusConfig[InvoiceStatus.Pending];

  return (
    <Badge variant="outline" className={config.variant}>
      {t(`invoices.${config.key}`)}
    </Badge>
  );
}
