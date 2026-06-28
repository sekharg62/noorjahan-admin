import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <Box sx={{ mb: 2, '& svg': { fontSize: 48, opacity: 0.4 } }}>{icon}</Box>
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: 420, mx: 'auto' }}>
        {description}
      </Typography>
    </Box>
  );
}
