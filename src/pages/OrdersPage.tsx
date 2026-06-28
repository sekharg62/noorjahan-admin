import { Card } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        title="Orders"
        description="View and manage customer orders, shipping, and payment status."
      />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <EmptyState
          icon={<ShoppingBagIcon />}
          title="No orders yet"
          description="Orders placed on the storefront will appear here for fulfillment and status updates."
        />
      </Card>
    </>
  );
}
