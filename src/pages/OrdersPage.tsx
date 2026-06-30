import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import {
  Alert,
  Box,
  Card,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import OrderDetailDialog from '../components/orders/OrderDetailDialog';
import OrderTable from '../components/orders/OrderTable';
import type { DataTablePagination } from '../components/common/DataTable';
import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  DEFAULT_PAGINATION,
  PAGE_SIZE_OPTIONS,
} from '../constants/pagination';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  type OrderStatus as OrderStatusType,
} from '../constants/enum';
import { getApiErrorMessage } from '../lib/apiClient';
import * as orderService from '../services/orderService';
import type { PaginationMeta } from '../types/api';
import type { Order } from '../types/order';

const ALL_STATUS = 'ALL';

const STATUS_TABS: { value: typeof ALL_STATUS | OrderStatusType; label: string }[] = [
  { value: ALL_STATUS, label: 'All' },
  ...ORDER_STATUS_OPTIONS.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABELS[status],
  })),
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);

  const [statusFilter, setStatusFilter] = useState<typeof ALL_STATUS | OrderStatusType>(ALL_STATUS);
  const [orderNoInput, setOrderNoInput] = useState('');
  const [orderNoFilter, setOrderNoFilter] = useState('');

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderService.getAllOrders({
        page,
        limit,
        ...(statusFilter !== ALL_STATUS ? { status: statusFilter } : {}),
        ...(orderNoFilter ? { orderNo: orderNoFilter } : {}),
      });

      setOrders(response.orders);
      setPagination(
        response.pagination ?? {
          ...DEFAULT_PAGINATION,
          page,
          limit,
          total: response.orders.length,
        },
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, orderNoFilter]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOrderNoFilter(orderNoInput.trim());
      setPage(DEFAULT_PAGE);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [orderNoInput]);

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

  const handleStatusFilterChange = (_: SyntheticEvent, value: typeof ALL_STATUS | OrderStatusType) => {
    setStatusFilter(value);
    setPage(DEFAULT_PAGE);
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatusType) => {
    const previous = orders.find((order) => order.id === orderId);
    if (!previous || previous.status === status) return;

    setUpdatingOrderId(orderId);
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status } : order)),
    );

    try {
      const updated = await orderService.updateOrderStatus(orderId, { status });
      setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
      if (detailOrder?.id === orderId) {
        setDetailOrder(updated);
      }
      toast.success(`Order ${previous.orderNo} → ${ORDER_STATUS_LABELS[status]}`);
    } catch (err) {
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? previous : order)),
      );
      toast.error(getApiErrorMessage(err, 'Failed to update order status'));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const hasActiveFilter = statusFilter !== ALL_STATUS || orderNoFilter.length > 0;
  const showEmptyState = !loading && !error && pagination.total === 0 && !hasActiveFilter;

  return (
    <Box>
      <PageHeader
        title="Orders"
        description="View and manage customer orders, shipping, and payment status."
      />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2, p: 2 }}>
        <TextField
          value={orderNoInput}
          onChange={(e) => setOrderNoInput(e.target.value)}
          placeholder="Search by order number…"
          size="small"
          fullWidth
          sx={{ mb: 2, maxWidth: 360 }}
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

        <Tabs
          value={statusFilter}
          onChange={handleStatusFilterChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            minHeight: 44,
            '& .MuiTab-root': { textTransform: 'none', minHeight: 44 },
          }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {showEmptyState ? (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <EmptyState
            icon={<ShoppingBagIcon />}
            title="No orders yet"
            description="Orders placed on the storefront will appear here for fulfillment and status updates."
          />
        </Card>
      ) : (
        <OrderTable
          items={orders}
          loading={loading}
          pagination={tablePagination}
          updatingOrderId={updatingOrderId}
          onStatusChange={(orderId, status) => void handleOrderStatusChange(orderId, status)}
          onView={setDetailOrder}
        />
      )}

      <OrderDetailDialog
        open={detailOrder != null}
        order={detailOrder}
        onClose={() => setDetailOrder(null)}
      />
    </Box>
  );
}
