import { useMemo } from 'react';
import { Avatar, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable, { type DataTableColumn } from '../common/DataTable';
import { BANNER_TYPE_LABELS } from '../../constants/enum';
import type { Banner } from '../../types/banner';

type BannerRow = Banner & {
  typeLabel: string;
  createdLabel: string;
};

type BannerTableProps = {
  items: Banner[];
  loading: boolean;
  onEdit: (item: Banner) => void;
  onDelete: (item: Banner) => void;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BannerTable({ items, loading, onEdit, onDelete }: BannerTableProps) {
  const rows = useMemo<BannerRow[]>(
    () =>
      items.map((item) => ({
        ...item,
        typeLabel: BANNER_TYPE_LABELS[item.type],
        createdLabel: formatDate(item.createdAt),
      })),
    [items],
  );

  const columns = useMemo<DataTableColumn<BannerRow>[]>(
    () => [
      {
        id: 'preview',
        label: 'Preview',
        width: 80,
        exportable: false,
        getSearchValue: (row) => row.imgUrl,
        render: (row) => (
          <Avatar
            variant="rounded"
            src={row.imgUrl}
            alt="Banner"
            sx={{ width: 56, height: 36 }}
          />
        ),
      },
      {
        id: 'imgUrl',
        label: 'Image URL',
        sortable: true,
        width: '22%',
        getSortValue: (row) => row.imgUrl,
        getSearchValue: (row) => row.imgUrl,
        getCopyValue: (row) => row.imgUrl,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.imgUrl}
          </Typography>
        ),
      },
      {
        id: 'redirectUrl',
        label: 'Redirect URL',
        sortable: true,
        width: '18%',
        getSortValue: (row) => row.redirectUrl,
        getSearchValue: (row) => row.redirectUrl,
        getCopyValue: (row) => row.redirectUrl || '—',
        render: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
            {row.redirectUrl || '—'}
          </Typography>
        ),
      },
      {
        id: 'order',
        label: 'Order',
        sortable: true,
        width: '8%',
        getSortValue: (row) => row.order,
        getSearchValue: (row) => String(row.order),
        getCopyValue: (row) => String(row.order),
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.order}
          </Typography>
        ),
      },
      {
        id: 'type',
        label: 'Type',
        sortable: true,
        width: '12%',
        getSortValue: (row) => row.typeLabel,
        getSearchValue: (row) => row.typeLabel,
        getCopyValue: (row) => row.typeLabel,
        render: (row) => <Chip label={row.typeLabel} size="small" color="primary" variant="outlined" />,
      },
      {
        id: 'createdAt',
        label: 'Created',
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
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        width: 100,
        exportable: false,
        getSearchValue: (row) =>
          `${row.imgUrl} ${row.redirectUrl} ${row.typeLabel} ${row.order}`,
        render: (row) => (
          <>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit(row)}
                aria-label={`Edit banner order ${row.order}`}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(row)}
                aria-label={`Delete banner order ${row.order}`}
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
      searchPlaceholder="Search by image URL, redirect, type, or order…"
      emptyMessage="No banners yet. Create your first banner."
      noResultsMessage="No banners match your search."
      exportFilename="banners"
      exportTitle="Banners"
    />
  );
}
