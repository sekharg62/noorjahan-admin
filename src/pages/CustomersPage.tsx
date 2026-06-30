import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Card } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import CustomerTable from '../components/customers/CustomerTable';
import type { DataTablePagination } from '../components/common/DataTable';
import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  DEFAULT_PAGINATION,
  PAGE_SIZE_OPTIONS,
} from '../constants/pagination';
import { getApiErrorMessage } from '../lib/apiClient';
import * as customerService from '../services/customerService';
import type { PaginationMeta } from '../types/api';
import type { Customer } from '../types/customer';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await customerService.getAllCustomers({ page, limit });
      setCustomers(response.customers);
      setPagination(
        response.pagination ?? {
          ...DEFAULT_PAGINATION,
          page,
          limit,
          total: response.customers.length,
        },
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load customers'));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const tablePagination = useMemo<DataTablePagination>(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      onPageChange: (nextPage) => setPage(nextPage),
      onLimitChange: (nextLimit) => {
        setLimit(nextLimit);
        setPage(DEFAULT_PAGE);
      },
    }),
    [pagination],
  );

  const showEmptyState = !loading && !error && pagination.total === 0;

  return (
    <Box>
      <PageHeader
        title="Customers"
        description="View registered customers and their order history."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {showEmptyState ? (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <EmptyState
            icon={<PeopleIcon />}
            title="No customers yet"
            description="Registered customers from your storefront will appear here."
          />
        </Card>
      ) : (
        <CustomerTable items={customers} loading={loading} pagination={tablePagination} />
      )}
    </Box>
  );
}
