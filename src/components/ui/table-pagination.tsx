import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPrevPage,
  onNextPage,
  isFirstPage,
  isLastPage,
}: TablePaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        {t('common.showing')} {startIndex + 1}-{endIndex} {t('common.of')} {totalItems} {t('common.results')}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={isFirstPage}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('pagination.previous')}
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={isLastPage}
        >
          {t('pagination.next')}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Mobile version - more compact
export function MobilePagination({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  isFirstPage,
  isLastPage,
}: Pick<TablePaginationProps, 'currentPage' | 'totalPages' | 'onPrevPage' | 'onNextPage' | 'isFirstPage' | 'isLastPage'>) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevPage}
        disabled={isFirstPage}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNextPage}
        disabled={isLastPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
