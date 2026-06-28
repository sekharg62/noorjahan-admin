import { Box, Stack, TextField, Typography } from '@mui/material';
import type { ProductFormValues } from './types';

type DetailsStepProps = {
  values: ProductFormValues;
  errors: Partial<
    Record<'name' | 'slug' | 'description' | 'price' | 'offerPrice' | 'stock', string>
  >;
  onChange: (patch: Partial<ProductFormValues>) => void;
  onNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
};

export default function DetailsStep({
  values,
  errors,
  onChange,
  onNameChange,
  onSlugChange,
}: DetailsStepProps) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Product details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter the product information customers will see on your storefront.
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        <TextField
          label="Product name"
          value={values.name}
          onChange={(e) => onNameChange(e.target.value)}
          error={!!errors.name}
          helperText={errors.name ?? 'Slug is generated automatically from the name'}
          required
          fullWidth
        />

        <TextField
          label="Slug"
          value={values.slug}
          onChange={(e) => onSlugChange(e.target.value)}
          error={!!errors.slug}
          helperText={errors.slug ?? 'URL-friendly identifier (e.g. silk-kurti)'}
          required
          fullWidth
        />

        <TextField
          label="Description"
          value={values.description}
          onChange={(e) => onChange({ description: e.target.value })}
          error={!!errors.description}
          helperText={errors.description}
          required
          fullWidth
          multiline
          minRows={4}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Price"
            value={values.price}
            onChange={(e) => onChange({ price: e.target.value })}
            error={!!errors.price}
            helperText={errors.price}
            required
            fullWidth
            placeholder="1299"
          />
          <TextField
            label="Offer price"
            value={values.offerPrice}
            onChange={(e) => onChange({ offerPrice: e.target.value })}
            error={!!errors.offerPrice}
            helperText={errors.offerPrice ?? 'Optional discounted price'}
            fullWidth
            placeholder="999"
          />
        </Stack>

        <TextField
          label="Stock"
          type="number"
          value={values.stock}
          onChange={(e) => {
            const next = Number.parseInt(e.target.value, 10);
            onChange({ stock: Number.isNaN(next) ? 0 : Math.max(0, next) });
          }}
          error={!!errors.stock}
          helperText={errors.stock ?? 'Available inventory quantity'}
          fullWidth
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </Stack>
    </Stack>
  );
}
