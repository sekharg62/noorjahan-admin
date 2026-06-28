import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  type Theme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CopyableCell from './CopyableCell';

export type SortDirection = 'asc' | 'desc';

export type DataTableColumn<T> = {
  id: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  getSortValue?: (row: T) => string | number;
  getSearchValue?: (row: T) => string;
  getCopyValue?: (row: T) => string;
  render: (row: T, rowIndex: number) => ReactNode;
};

type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  showSerialNumber?: boolean;
  serialNumberLabel?: string;
};

type SortState = {
  columnId: string;
  direction: SortDirection;
};

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
}

export default function DataTable<T>({
  rows,
  columns,
  getRowKey,
  loading = false,
  searchPlaceholder = 'Search…',
  emptyMessage = 'No data available.',
  noResultsMessage = 'No results match your search.',
  showSerialNumber = true,
  serialNumberLabel = 'S.No',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortState | null>(null);

  const handleSort = (columnId: string) => {
    setSort((current) => {
      if (current?.columnId !== columnId) {
        return { columnId, direction: 'asc' };
      }
      return {
        columnId,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      };
    });
  };

  const processedRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let filtered = rows;

    if (query) {
      filtered = rows.filter((row) =>
        columns.some((column) => {
          const value = column.getSearchValue?.(row) ?? '';
          return value.toLowerCase().includes(query);
        }),
      );
    }

    if (!sort) {
      return filtered;
    }

    const column = columns.find((item) => item.id === sort.columnId);
    if (!column?.getSortValue) {
      return filtered;
    }

    const sorted = [...filtered].sort((rowA, rowB) => {
      const valueA = column.getSortValue!(rowA);
      const valueB = column.getSortValue!(rowB);
      const result = compareValues(valueA, valueB);
      return sort.direction === 'asc' ? result : -result;
    });

    return sorted;
  }, [rows, columns, searchQuery, sort]);

  const showToolbar = !loading && rows.length > 0;
  const hasRows = rows.length > 0;
  const hasFilteredRows = processedRows.length > 0;
  const columnCount = columns.length + (showSerialNumber ? 1 : 0);

  const headCellSx = {
    fontWeight: 600,
    whiteSpace: 'nowrap',
    bgcolor: (theme: Theme) =>
      theme.palette.mode === 'light'
        ? `${theme.palette.primary.main}14`
        : 'rgba(255, 255, 255, 0.06)',
    borderBottom: 1,
    borderColor: 'divider',
    color: 'text.primary',
    py: 1.5,
    px: 2,
    '& .MuiTableSortLabel-root': {
      color: 'text.secondary',
      '&:hover': { color: 'text.primary' },
      '&.Mui-active': { color: 'primary.main' },
      '& .MuiTableSortLabel-icon': {
        color: 'primary.main !important',
      },
    },
  };

  const serialCellSx = {
    whiteSpace: 'nowrap',
    width: 72,
    minWidth: 72,
    maxWidth: 72,
    px: 2,
    textAlign: 'center',
  };

  const bodyCellSx = {
    px: 2,
    py: 1.5,
    verticalAlign: 'middle',
  };

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <TableContainer>
        <Table size="medium" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            {showToolbar && (
              <TableRow>
                <TableCell colSpan={columnCount} sx={{ ...headCellSx, py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TextField
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={searchPlaceholder}
                      size="small"
                      sx={{ width: { xs: '100%', sm: 360 } }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              {showSerialNumber && (
                <TableCell sx={{ ...headCellSx, ...serialCellSx }}>
                  {serialNumberLabel}
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align ?? 'left'}
                  width={column.width}
                  sx={{
                    ...headCellSx,
                    ...(column.width ? { width: column.width } : undefined),
                  }}
                >
                  {column.sortable && column.getSortValue ? (
                    <TableSortLabel
                      active={sort?.columnId === column.id}
                      direction={sort?.columnId === column.id ? sort.direction : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {showSerialNumber && (
                    <TableCell sx={{ ...serialCellSx, ...bodyCellSx }}>
                      <Skeleton width={20} sx={{ mx: 'auto' }} />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.id} sx={bodyCellSx}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && !hasRows && (
              <TableRow>
                <TableCell colSpan={columns.length + (showSerialNumber ? 1 : 0)}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading && hasRows && !hasFilteredRows && (
              <TableRow>
                <TableCell colSpan={columns.length + (showSerialNumber ? 1 : 0)}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    {noResultsMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              hasFilteredRows &&
              processedRows.map((row, index) => (
                <TableRow key={getRowKey(row)} hover>
                  {showSerialNumber && (
                    <TableCell sx={{ ...serialCellSx, ...bodyCellSx }}>
                      <CopyableCell value={String(index + 1)}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ textAlign: 'center' }}
                        >
                          {index + 1}
                        </Typography>
                      </CopyableCell>
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align ?? 'left'}
                      sx={{
                        ...bodyCellSx,
                        ...(column.width ? { width: column.width } : undefined),
                      }}
                    >
                      {column.getCopyValue ? (
                        <CopyableCell value={column.getCopyValue(row)}>
                          {column.render(row, index)}
                        </CopyableCell>
                      ) : (
                        column.render(row, index)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && hasRows && (
        <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Showing {processedRows.length} of {rows.length} items
            {searchQuery.trim() ? ` for "${searchQuery.trim()}"` : ''}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
