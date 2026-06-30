import { useMemo } from 'react';
import { Avatar, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DataTable, { type DataTableColumn, type DataTablePagination } from '../common/DataTable';
import type { Product } from '../../types/product';

type ProductRow = Product & {
  menuName: string;
  submenuName: string;
  primaryImageUrl: string;
  priceLabel: string;
  stockLabel: string;
  statusLabel: string;
  createdLabel: string;
};

type ProductTableProps = {
  items: Product[];
  submenuById: Map<string, { name: string; menuName: string }>;
  loading: boolean;
  pagination: DataTablePagination;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPrice(value: string): string {
  const trimmed = value.trim();
  return trimmed ? `₹${trimmed}` : '—';
}

function getPrimaryImageUrl(product: Product): string {
  const primary = product.images?.find((image) => image.isPrimary) ?? product.images?.[0];
  return primary?.imgUrl ?? '';
}

export default function ProductTable({
  items,
  submenuById,
  loading,
  pagination,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const rows = useMemo<ProductRow[]>(
    () =>
      items.map((item) => {
        const submenu = submenuById.get(item.menuSubmenuId);
        const priceLabel = item.offerPrice
          ? `${formatPrice(item.offerPrice)} (${formatPrice(item.price)})`
          : formatPrice(item.price);

        return {
          ...item,
          menuName: submenu?.menuName ?? '—',
          submenuName: submenu?.name ?? '—',
          primaryImageUrl: getPrimaryImageUrl(item),
          priceLabel,
          stockLabel: String(item.stock),
          statusLabel: item.isActive ? 'Active' : 'Inactive',
          createdLabel: formatDate(item.createdAt),
        };
      }),
    [items, submenuById],
  );

  const columns = useMemo<DataTableColumn<ProductRow>[]>(
    () => [
      {
        id: 'image',
        label: 'Image',
        width: 72,
        exportable: false,
        getSearchValue: (row) => row.primaryImageUrl,
        render: (row) => (
          <Avatar
            variant="rounded"
            src={row.primaryImageUrl || undefined}
            alt={row.name}
            sx={{ width: 48, height: 48 }}
          >
            {row.name.charAt(0).toUpperCase()}
          </Avatar>
        ),
      },
      {
        id: 'name',
        label: 'Name',
        sortable: true,
        width: '16%',
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
        id: 'slug',
        label: 'Slug',
        sortable: true,
        width: '14%',
        getSortValue: (row) => row.slug,
        getSearchValue: (row) => row.slug,
        getCopyValue: (row) => row.slug,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.slug}
          </Typography>
        ),
      },
      {
        id: 'menu',
        label: 'Menu',
        sortable: true,
        width: '10%',
        getSortValue: (row) => row.menuName,
        getSearchValue: (row) => row.menuName,
        getCopyValue: (row) => row.menuName,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.menuName}
          </Typography>
        ),
      },
      {
        id: 'submenu',
        label: 'Submenu',
        sortable: true,
        width: '10%',
        getSortValue: (row) => row.submenuName,
        getSearchValue: (row) => row.submenuName,
        getCopyValue: (row) => row.submenuName,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.submenuName}
          </Typography>
        ),
      },
      {
        id: 'price',
        label: 'Price',
        sortable: true,
        width: '12%',
        getSortValue: (row) => Number.parseFloat(row.offerPrice ?? row.price) || 0,
        getSearchValue: (row) => row.priceLabel,
        getCopyValue: (row) => row.priceLabel,
        render: (row) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              {row.offerPrice ? formatPrice(row.offerPrice) : formatPrice(row.price)}
            </Typography>
            {row.offerPrice && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
                noWrap
              >
                {formatPrice(row.price)}
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        id: 'stock',
        label: 'Stock',
        sortable: true,
        width: '8%',
        align: 'center',
        getSortValue: (row) => row.stock,
        getSearchValue: (row) => row.stockLabel,
        getCopyValue: (row) => row.stockLabel,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.stock}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        width: '10%',
        getSortValue: (row) => row.statusLabel,
        getSearchValue: (row) => row.statusLabel,
        getCopyValue: (row) => row.statusLabel,
        render: (row) => (
          <Chip
            label={row.statusLabel}
            size="small"
            color={row.isActive ? 'success' : 'default'}
            variant={row.isActive ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        id: 'createdAt',
        label: 'Created',
        sortable: true,
        width: '10%',
        getSortValue: (row) => new Date(row.createdAt).getTime(),
        getSearchValue: (row) => row.createdLabel,
        getCopyValue: (row) => row.createdLabel,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.createdLabel}
          </Typography>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        width: 100,
        exportable: false,
        getSearchValue: (row) => row.name,
        render: (row) => (
          <>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit(row)}
                aria-label={`Edit ${row.name}`}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(row)}
                aria-label={`Delete ${row.name}`}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    [onDelete, onEdit],
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowKey={(row) => row.id}
      loading={loading}
      pagination={pagination}
      searchPlaceholder="Search by name, slug, menu, price, or stock…"
      emptyMessage="No products found for the selected filters."
      noResultsMessage="No products match your search."
      exportFilename="products"
      exportTitle="Products"
      maxBodyHeight="calc(100vh - 340px)"
    />
  );
}
