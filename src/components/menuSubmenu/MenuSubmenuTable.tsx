import { useMemo } from 'react';
import { Chip, IconButton, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable, { type DataTableColumn } from '../common/DataTable';
import type { MenuItem } from '../../types/menuSubmenu';

type MenuSubmenuRow = MenuItem & {
  typeLabel: string;
  parentName: string;
  createdLabel: string;
};

type MenuSubmenuTableProps = {
  items: MenuItem[];
  parentById: Map<string, MenuItem>;
  loading: boolean;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function MenuSubmenuTable({
  items,
  parentById,
  loading,
  onEdit,
  onDelete,
}: MenuSubmenuTableProps) {
  const rows = useMemo<MenuSubmenuRow[]>(
    () =>
      items.map((item) => {
        const parent = item.parentId ? parentById.get(item.parentId) : null;
        const isSubmenu = Boolean(item.parentId);

        return {
          ...item,
          typeLabel: isSubmenu ? 'Submenu' : 'Menu',
          parentName: parent?.name ?? '—',
          createdLabel: formatDate(item.createdAt),
        };
      }),
    [items, parentById],
  );

  const columns = useMemo<DataTableColumn<MenuSubmenuRow>[]>(
    () => [
      {
        id: 'name',
        label: 'Name',
        sortable: true,
        width: '20%',
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
        width: '18%',
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
        id: 'type',
        label: 'Type',
        sortable: true,
        width: '12%',
        getSortValue: (row) => row.typeLabel,
        getSearchValue: (row) => row.typeLabel,
        getCopyValue: (row) => row.typeLabel,
        render: (row) => (
          <Chip
            label={row.typeLabel}
            size="small"
            color={row.parentId ? 'default' : 'primary'}
            variant={row.parentId ? 'outlined' : 'filled'}
          />
        ),
      },
      {
        id: 'parent',
        label: 'Parent',
        sortable: true,
        width: '15%',
        getSortValue: (row) => row.parentName,
        getSearchValue: (row) => row.parentName,
        getCopyValue: (row) => row.parentName,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.parentName}
          </Typography>
        ),
      },
      {
        id: 'createdAt',
        label: 'Created',
        sortable: true,
        width: '15%',
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
        getSearchValue: (row) => `${row.name} ${row.slug} ${row.typeLabel} ${row.parentName}`,
        render: (row) => (
          <>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(row)} aria-label={`Edit ${row.name}`}>
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
      searchPlaceholder="Search by name, slug, type, or parent…"
      emptyMessage="No menu items yet. Create your first menu."
      noResultsMessage="No menu items match your search."
    />
  );
}
