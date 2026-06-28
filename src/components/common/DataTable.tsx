import { useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  type Theme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import DensitySmallIcon from '@mui/icons-material/DensitySmall';
import { toast } from 'sonner';
import CopyableCell from './CopyableCell';
import { STORAGE_KEYS } from '../../constants/storage';
import { PAGE_SIZE_OPTIONS } from '../../constants/pagination';
import { exportTableToCsv, exportTableToPdf } from '../../utils/exportTable';
import {
  readTableViewMode,
  saveTableViewMode,
  TABLE_VIEW_MODE_CONFIG,
  type TableViewMode,
} from '../../utils/tableViewMode';

export type SortDirection = 'asc' | 'desc';

export type DataTablePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
};

export type DataTableColumn<T> = {
  id: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  getSortValue?: (row: T) => string | number;
  getSearchValue?: (row: T) => string;
  getCopyValue?: (row: T) => string;
  getExportValue?: (row: T) => string;
  exportable?: boolean;
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
  exportFilename?: string;
  exportTitle?: string;
  showExport?: boolean;
  showViewMode?: boolean;
  viewModeStorageKey?: string;
  maxBodyHeight?: number | string;
  pagination?: DataTablePagination;
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
  exportFilename = 'table-export',
  exportTitle,
  showExport = true,
  showViewMode = true,
  viewModeStorageKey = STORAGE_KEYS.TABLE_VIEW_MODE,
  maxBodyHeight = 'min(480px, calc(100vh - 320px))',
  pagination,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortState | null>(null);
  const [viewMode, setViewMode] = useState<TableViewMode>(() =>
    readTableViewMode(viewModeStorageKey),
  );

  const viewConfig = TABLE_VIEW_MODE_CONFIG[viewMode];

  const handleViewModeChange = (_event: MouseEvent<HTMLElement>, nextMode: TableViewMode | null) => {
    if (!nextMode) return;
    setViewMode(nextMode);
    saveTableViewMode(viewModeStorageKey, nextMode);
  };

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

  const showToolbar = pagination
    ? pagination.total > 0 || (loading && rows.length > 0)
    : rows.length > 0 || loading;
  const hasRows = pagination ? pagination.total > 0 : rows.length > 0;
  const hasFilteredRows = processedRows.length > 0;
  const serialOffset = pagination ? (pagination.page - 1) * pagination.limit : 0;
  const pageSizeOptions = pagination?.pageSizeOptions ?? [...PAGE_SIZE_OPTIONS];

  const rowStart = pagination
    ? pagination.total === 0
      ? 0
      : serialOffset + 1
    : 1;
  const rowEnd = pagination
    ? Math.min(serialOffset + processedRows.length, pagination.total)
    : processedRows.length;
  const totalCount = pagination?.total ?? rows.length;

  const exportColumns = useMemo(
    () =>
      columns
        .filter((column) => column.exportable !== false)
        .map((column) => ({
          id: column.id,
          label: column.label,
          getValue: (row: T, _rowIndex: number) =>
            column.getExportValue?.(row) ??
            column.getCopyValue?.(row) ??
            column.getSearchValue?.(row) ??
            '',
        })),
    [columns],
  );

  const buildExportData = () => ({
    filename: exportFilename,
    title: exportTitle,
    columns: exportColumns.map((column) => ({
      ...column,
      getValue: (row: unknown, rowIndex: number) => column.getValue(row as T, rowIndex),
    })),
    rows: processedRows,
    showSerialNumber,
    serialNumberLabel,
  });

  const handleExportCsv = () => {
    if (processedRows.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      exportTableToCsv(buildExportData());
      toast.success('CSV exported');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPdf = async () => {
    if (processedRows.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      await exportTableToPdf(buildExportData());
      toast.success('PDF exported');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

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
    py: viewConfig.headPy,
    px: viewConfig.px,
    fontSize: viewConfig.fontSize,
    '& .MuiTableSortLabel-root': {
      color: 'text.secondary',
      '&:hover': { color: 'text.primary' },
      '&.Mui-active': { color: 'primary.main' },
      '& .MuiTableSortLabel-icon': {
        color: 'primary.main !important',
      },
    },
  };

  const stickyHeadCellSx = {
    ...headCellSx,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    bgcolor: (theme: Theme) =>
      theme.palette.mode === 'light' ? theme.palette.background.paper : theme.palette.background.paper,
    backgroundImage: (theme: Theme) =>
      theme.palette.mode === 'light'
        ? `linear-gradient(${theme.palette.primary.main}14, ${theme.palette.primary.main}14)`
        : 'linear-gradient(rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.06))',
  };

  const toolbarSx = {
    ...headCellSx,
    py: viewConfig.toolbarPy,
    px: viewConfig.px,
    borderBottom: 1,
    borderColor: 'divider',
  };

  const serialCellSx = {
    whiteSpace: 'nowrap',
    width: viewConfig.serialWidth,
    minWidth: viewConfig.serialWidth,
    maxWidth: viewConfig.serialWidth,
    px: viewConfig.px,
    textAlign: 'center',
  };

  const bodyCellSx = {
    px: viewConfig.px,
    py: viewConfig.bodyPy,
    verticalAlign: 'middle',
    fontSize: viewConfig.fontSize,
  };

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
      {showToolbar && (
        <Box sx={toolbarSx}>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              minHeight: 40,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: {
                  xs: showViewMode ? 'calc(100% - 168px)' : 'calc(100% - 96px)',
                  sm: 360,
                },
              }}
            >
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                size="small"
                fullWidth
                disabled={loading}
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

            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              {showViewMode && (
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  size="small"
                  onChange={handleViewModeChange}
                  aria-label="Table view mode"
                  sx={{
                    mr: 0.5,
                    height: 34,
                    '& .MuiToggleButton-root': {
                      px: 0.75,
                      py: 0,
                      minWidth: 30,
                      height: 34,
                      lineHeight: 1,
                    },
                  }}
                >
                  <ToggleButton value="comfortable" aria-label="Comfortable spacing">
                    <DensityLargeIcon sx={{ fontSize: 18 }} />
                  </ToggleButton>
                  <ToggleButton value="standard" aria-label="Standard spacing">
                    <DensityMediumIcon sx={{ fontSize: 18 }} />
                  </ToggleButton>
                  <ToggleButton value="compact" aria-label="Compact spacing">
                    <DensitySmallIcon sx={{ fontSize: 18 }} />
                  </ToggleButton>
                </ToggleButtonGroup>
              )}

              {showExport && (
                <>
                  <Tooltip title="Export PDF">
                    <IconButton
                      size="small"
                      onClick={() => void handleExportPdf()}
                      aria-label="Export table as PDF"
                    >
                      <Box
                        component="img"
                        src="/pdf.svg"
                        alt=""
                        sx={{ width: 22, height: 22, display: 'block' }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export CSV">
                    <IconButton
                      size="small"
                      onClick={handleExportCsv}
                      aria-label="Export table as CSV"
                    >
                      <Box
                        component="img"
                        src="/csv.svg"
                        alt=""
                        sx={{ width: 22, height: 22, display: 'block' }}
                      />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          </Box>
        </Box>
      )}

      <TableContainer sx={{ maxHeight: maxBodyHeight, overflow: 'auto', flex: 1 }}>
        <Table
          stickyHeader
          size={viewConfig.tableSize}
          sx={{ tableLayout: 'fixed', width: '100%' }}
        >
          <TableHead>
            <TableRow>
              {showSerialNumber && (
                <TableCell sx={{ ...stickyHeadCellSx, ...serialCellSx }}>
                  {serialNumberLabel}
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align ?? 'left'}
                  width={column.width}
                  sx={{
                    ...stickyHeadCellSx,
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
              Array.from({ length: pagination?.limit ?? 5 }).map((_, index) => (
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
                      <CopyableCell value={String(serialOffset + index + 1)}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ textAlign: 'center' }}
                        >
                          {serialOffset + index + 1}
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

      {hasRows && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {pagination
              ? loading
                ? `Loading page ${pagination.page}…`
                : `Showing ${rowStart}-${rowEnd} of ${totalCount} items`
              : `Showing ${processedRows.length} of ${rows.length} items`}
            {!pagination && searchQuery.trim() ? ` for "${searchQuery.trim()}"` : ''}
          </Typography>

          {pagination && pagination.totalPages > 0 && (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {pagination.onLimitChange && (
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <Select
                    value={pagination.limit}
                    onChange={(e) => pagination.onLimitChange?.(Number(e.target.value))}
                    displayEmpty
                    disabled={loading}
                  >
                    {pageSizeOptions.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size} / page
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={(_event, nextPage) => pagination.onPageChange(nextPage)}
                color="primary"
                shape="rounded"
                size="small"
                showFirstButton
                showLastButton
                disabled={loading}
              />
            </Stack>
          )}
        </Box>
      )}
    </Paper>
  );
}
