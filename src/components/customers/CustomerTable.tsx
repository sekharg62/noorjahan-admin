import { useMemo } from 'react';
import { Typography } from '@mui/material';
import DataTable, { type DataTableColumn, type DataTablePagination } from '../common/DataTable';
import type { Customer } from '../../types/customer';

type CustomerRow = Customer & {
  ordersLabel: string;
  addressesLabel: string;
  createdLabel: string;
};

type CustomerTableProps = {
  items: Customer[];
  loading: boolean;
  pagination: DataTablePagination;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CustomerTable({ items, loading, pagination }: CustomerTableProps) {
  const rows = useMemo<CustomerRow[]>(
    () =>
      items.map((item) => ({
        ...item,
        ordersLabel: String(item.totalOrders),
        addressesLabel: String(item.totalAddresses),
        createdLabel: formatDate(item.createdAt),
      })),
    [items],
  );

  const columns = useMemo<DataTableColumn<CustomerRow>[]>(
    () => [
      {
        id: 'name',
        label: 'Name',
        sortable: true,
        width: '18%',
        getSortValue: (row) => row.name,
        getSearchValue: (row) => row.name,
        getCopyValue: (row) => row.name,
        render: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
            {row.name}
          </Typography>
        ),
      },
      {
        id: 'phone',
        label: 'Phone',
        sortable: true,
        width: '14%',
        getSortValue: (row) => row.phone,
        getSearchValue: (row) => row.phone,
        getCopyValue: (row) => row.phone,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.phone}
          </Typography>
        ),
      },
      {
        id: 'email',
        label: 'Email',
        sortable: true,
        width: '22%',
        getSortValue: (row) => row.email,
        getSearchValue: (row) => row.email,
        getCopyValue: (row) => row.email,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.email}
          </Typography>
        ),
      },
      {
        id: 'totalOrders',
        label: 'Orders',
        sortable: true,
        width: '10%',
        align: 'center',
        getSortValue: (row) => row.totalOrders,
        getSearchValue: (row) => row.ordersLabel,
        getCopyValue: (row) => row.ordersLabel,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.totalOrders}
          </Typography>
        ),
      },
      {
        id: 'totalAddresses',
        label: 'Addresses',
        sortable: true,
        width: '12%',
        align: 'center',
        getSortValue: (row) => row.totalAddresses,
        getSearchValue: (row) => row.addressesLabel,
        getCopyValue: (row) => row.addressesLabel,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.totalAddresses}
          </Typography>
        ),
      },
      {
        id: 'createdAt',
        label: 'Joined',
        sortable: true,
        width: '14%',
        getSortValue: (row) => new Date(row.createdAt).getTime(),
        getSearchValue: (row) => row.createdLabel,
        getCopyValue: (row) => row.createdLabel,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.createdLabel}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowKey={(row) => row.id}
      loading={loading}
      pagination={pagination}
      searchPlaceholder="Search current page by name, phone, or email…"
      emptyMessage="No customers found."
      noResultsMessage="No customers match your search on this page."
      exportFilename="customers"
      exportTitle="Customers"
      maxBodyHeight="calc(100vh - 280px)"
    />
  );
}
