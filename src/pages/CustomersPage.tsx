import { Card } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="View registered customers and their order history."
      />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <EmptyState
          icon={<PeopleIcon />}
          title="No customers yet"
          description="Customer accounts created on the storefront will be listed here."
        />
      </Card>
    </>
  );
}
