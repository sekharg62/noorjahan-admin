import { Button, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

export default function CollectionsPage() {
  return (
    <>
      <PageHeader
        title="Collections"
        description="Organize products into collections for navigation and merchandising."
      />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'flex-end', pb: 1 }}>
          <Button variant="contained" startIcon={<AddIcon />} disabled>
            Add collection
          </Button>
        </CardContent>
        <EmptyState
          icon={<CategoryIcon />}
          title="No collections yet"
          description="Create collections like Lawn, Unstitched, or Ready to Wear to group your products."
        />
      </Card>
    </>
  );
}
