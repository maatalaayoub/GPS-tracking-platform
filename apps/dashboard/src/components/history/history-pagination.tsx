'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

const HISTORY_PAGE_SIZE = 50;

interface HistoryPaginationProps {
  total: number;
  page: number;
}

export function HistoryPagination({ total, page }: HistoryPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  function navigate(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/history?${params.toString()}`);
  }

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground text-sm">
        Showing{' '}
        <span className="font-medium">
          {(page - 1) * HISTORY_PAGE_SIZE + 1}
        </span>{' '}
        to{' '}
        <span className="font-medium">
          {Math.min(page * HISTORY_PAGE_SIZE, total)}
        </span>{' '}
        of <span className="font-medium">{total}</span> positions
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(page - 1)}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <span className="text-muted-foreground text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(page + 1)}
          disabled={!hasNext}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
