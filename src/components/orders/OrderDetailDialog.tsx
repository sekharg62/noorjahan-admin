import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ORDER_STATUS_LABELS } from '../../constants/enum';
import type { Order } from '../../types/order';
import {
  formatOrderMoney,
  getOrderCustomerEmail,
  getOrderCustomerName,
  getOrderCustomerPhone,
  isGuestOrder,
} from '../../utils/order';

type OrderDetailDialogProps = {
  open: boolean;
  order: Order | null;
  onClose: () => void;
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetailDialog({ open, order, onClose }: OrderDetailDialogProps) {
  if (!order) return null;

  const shippingAddress = order.address
    ? `${order.address.address}, ${order.address.city} — ${order.address.pincode}`
    : order.guest
      ? `${order.guest.address}, ${order.guest.city} — ${order.guest.pincode}`
      : '—';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Order {order.orderNo}
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip label={ORDER_STATUS_LABELS[order.status]} size="small" color="primary" />
            <Chip label={order.paymentMethod} size="small" variant="outlined" />
            {isGuestOrder(order) && <Chip label="Guest order" size="small" variant="outlined" />}
          </Stack>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Customer
            </Typography>
            <Typography variant="body2">{getOrderCustomerName(order)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {getOrderCustomerPhone(order)} · {getOrderCustomerEmail(order)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Shipping address
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {shippingAddress}
            </Typography>
            {order.address?.notes && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Notes: {order.address.notes}
              </Typography>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Items
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Size</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2">{item.productName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.productSlug}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{item.size}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{formatOrderMoney(item.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
            <Typography variant="body2" color="text.secondary">
              Subtotal: {formatOrderMoney(order.subtotal)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Shipping: {formatOrderMoney(order.shipping)}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Total: {formatOrderMoney(order.total)}
            </Typography>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Placed {formatDateTime(order.createdAt)}
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
