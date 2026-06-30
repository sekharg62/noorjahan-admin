import { useMemo } from 'react';
import {
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DataTable, { type DataTableColumn, type DataTablePagination } from '../common/DataTable';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  type OrderStatus,
} from '../../constants/enum';
import type { Order } from '../../types/order';
import {
  formatOrderMoney,
  getOrderCustomerName,
  getOrderCustomerPhone,
  getOrderItemCount,
  isGuestOrder,
} from '../../utils/order';

type OrderRow = Order & {
  customerName: string;
  customerPhone: string;
  itemCount: number;
  itemsLabel: string;
  totalLabel: string;
  createdLabel: string;
  guestLabel: string;
};

type OrderTableProps = {
  items: Order[];
  loading: boolean;
  pagination: DataTablePagination;
  updatingOrderId: string | null;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onView: (order: Order) => void;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusSelectSize(status: OrderStatus): 'small' | undefined {
  return status.length > 8 ? 'small' : undefined;
}

export default function OrderTable({
  items,
  loading,
  pagination,
  updatingOrderId,
  onStatusChange,
  onView,
}: OrderTableProps) {
  const rows = useMemo<OrderRow[]>(
    () =>
      items.map((item) => ({
        ...item,
        customerName: getOrderCustomerName(item),
        customerPhone: getOrderCustomerPhone(item),
        itemCount: getOrderItemCount(item),
        itemsLabel: `${item.items.length} line · ${getOrderItemCount(item)} qty`,
        totalLabel: formatOrderMoney(item.total),
        createdLabel: formatDate(item.createdAt),
        guestLabel: isGuestOrder(item) ? 'Guest' : 'Registered',
      })),
    [items],
  );

  const columns = useMemo<DataTableColumn<OrderRow>[]>(
    () => [
      {
        id: 'orderNo',
        label: 'Order #',
        sortable: true,
        width: '12%',
        getSortValue: (row) => row.orderNo,
        getSearchValue: (row) => row.orderNo,
        getCopyValue: (row) => row.orderNo,
        render: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {row.orderNo}
          </Typography>
        ),
      },
      {
        id: 'customer',
        label: 'Customer',
        sortable: true,
        width: '16%',
        getSortValue: (row) => row.customerName,
        getSearchValue: (row) => `${row.customerName} ${row.customerPhone} ${row.guestLabel}`,
        getCopyValue: (row) => row.customerName,
        render: (row) => (
          <>
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              {row.customerName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.customerPhone} · {row.guestLabel}
            </Typography>
          </>
        ),
      },
      {
        id: 'items',
        label: 'Items',
        sortable: true,
        width: '10%',
        getSortValue: (row) => row.itemCount,
        getSearchValue: (row) => row.itemsLabel,
        getCopyValue: (row) => row.itemsLabel,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.itemsLabel}
          </Typography>
        ),
      },
      {
        id: 'total',
        label: 'Total',
        sortable: true,
        width: '10%',
        getSortValue: (row) => Number.parseFloat(row.total) || 0,
        getSearchValue: (row) => row.totalLabel,
        getCopyValue: (row) => row.totalLabel,
        render: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
            {row.totalLabel}
          </Typography>
        ),
      },
      {
        id: 'paymentMethod',
        label: 'Payment',
        sortable: true,
        width: '8%',
        getSortValue: (row) => row.paymentMethod,
        getSearchValue: (row) => row.paymentMethod,
        getCopyValue: (row) => row.paymentMethod,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.paymentMethod}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        width: '14%',
        getSortValue: (row) => ORDER_STATUS_LABELS[row.status],
        getSearchValue: (row) => ORDER_STATUS_LABELS[row.status],
        getExportValue: (row) => ORDER_STATUS_LABELS[row.status],
        exportable: true,
        render: (row) => (
          <FormControl size="small" fullWidth>
            {updatingOrderId === row.id ? (
              <CircularProgress size={22} sx={{ mx: 'auto', display: 'block', py: 0.5 }} />
            ) : (
              <Select
                value={row.status}
                size={statusSelectSize(row.status)}
                onChange={(e) => onStatusChange(row.id, e.target.value as OrderStatus)}
                displayEmpty
                sx={{ fontSize: '0.8125rem' }}
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {ORDER_STATUS_LABELS[status]}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
        ),
      },
      {
        id: 'createdAt',
        label: 'Placed',
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
        label: '',
        align: 'right',
        width: 56,
        exportable: false,
        getSearchValue: (row) => row.orderNo,
        render: (row) => (
          <Tooltip title="View details">
            <IconButton size="small" onClick={() => onView(row)} aria-label={`View order ${row.orderNo}`}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [onStatusChange, onView, updatingOrderId],
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowKey={(row) => row.id}
      loading={loading}
      pagination={pagination}
      searchPlaceholder="Search current page by order #, customer, status…"
      emptyMessage="No orders found for the selected filters."
      noResultsMessage="No orders match your search on this page."
      exportFilename="orders"
      exportTitle="Orders"
      maxBodyHeight="calc(100vh - 380px)"
    />
  );
}
