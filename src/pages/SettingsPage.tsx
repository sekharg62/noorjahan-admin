import { Card, CardContent, Typography } from '@mui/material';
import PageHeader from '../components/PageHeader';

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Site configuration, hero slides, and admin preferences."
      />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Coming soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Site settings, hero slides, and contact form submissions will be manageable from
            this section once the admin API is implemented.
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
