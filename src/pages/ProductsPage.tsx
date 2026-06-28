import { Button, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        description="Manage product catalog, variants, images, and inventory."
      />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'flex-end', pb: 1 }}>
          <Button variant="contained" startIcon={<AddIcon />} disabled>
            Add product
          </Button>
        </CardContent>
        <EmptyState
          icon={<InventoryIcon />}
          title="No products yet"
          description="Product management will be available once admin API routes are added to the backend."
        />
      </Card>
    </>
  );
}
