import {
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type { MenuItem as MenuSubmenuItem } from '../../../types/menuSubmenu';
import type { ProductFormValues, ProductImageDraft } from './types';

type PreviewStepProps = {
  values: ProductFormValues;
  category?: MenuSubmenuItem;
  subcategory?: MenuSubmenuItem;
  images: ProductImageDraft[];
};

function formatPrice(value: string): string {
  const trimmed = value.trim();
  return trimmed ? `₹${trimmed}` : '—';
}

export default function PreviewStep({
  values,
  category,
  subcategory,
  images,
}: PreviewStepProps) {
  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const primaryImage = sortedImages.find((image) => image.isPrimary) ?? sortedImages[0];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Review &amp; create
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Confirm everything looks correct before creating the product.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            {primaryImage ? (
              <Box
                component="img"
                src={primaryImage.previewUrl}
                alt={values.name}
                sx={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <Box
                sx={{
                  aspectRatio: '4 / 5',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No image
                </Typography>
              </Box>
            )}

            {sortedImages.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ p: 1.5, overflowX: 'auto' }}>
                {sortedImages.map((image) => (
                  <Box
                    key={image.id}
                    component="img"
                    src={image.previewUrl}
                    alt=""
                    sx={{
                      width: 56,
                      height: 56,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: 2,
                      borderColor: image.isPrimary ? 'primary.main' : 'divider',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                {category && <Chip label={category.name} size="small" variant="outlined" />}
                {subcategory && <Chip label={subcategory.name} size="small" color="primary" variant="outlined" />}
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {values.name || '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                /{values.slug || '—'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'baseline' }}>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                {formatPrice(values.offerPrice.trim() ? values.offerPrice : values.price)}
              </Typography>
              {values.offerPrice.trim() && values.price.trim() && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'line-through' }}
                >
                  {formatPrice(values.price)}
                </Typography>
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Stock: {values.stock}
            </Typography>

            <Divider />

            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {values.description || '—'}
            </Typography>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Images ({sortedImages.length})
              </Typography>
              <Stack spacing={0.75}>
                {sortedImages.map((image) => (
                  <Typography key={image.id} variant="body2" color="text.secondary">
                    #{image.displayOrder} — {image.file.name}
                    {image.isPrimary ? ' (Primary)' : ''}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
