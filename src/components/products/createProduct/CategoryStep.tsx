import {
  Alert,
  Box,
  CircularProgress,
  FormHelperText,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import type { MenuItem as MenuSubmenuItem } from '../../../types/menuSubmenu';
import type { ProductFormValues } from './types';

type CategoryStepProps = {
  values: ProductFormValues;
  categories: MenuSubmenuItem[];
  subcategories: MenuSubmenuItem[];
  loading: boolean;
  error: string | null;
  errors: Partial<Record<'categoryId' | 'menuSubmenuId', string>>;
  onChange: (patch: Partial<ProductFormValues>) => void;
  onRetry: () => void;
};

export default function CategoryStep({
  values,
  categories,
  subcategories,
  loading,
  error,
  errors,
  onChange,
  onRetry,
}: CategoryStepProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">
          Loading categories…
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Typography
            component="button"
            variant="body2"
            onClick={onRetry}
            sx={{
              border: 0,
              bgcolor: 'transparent',
              cursor: 'pointer',
              textDecoration: 'underline',
              color: 'inherit',
            }}
          >
            Retry
          </Typography>
        }
      >
        {error}
      </Alert>
    );
  }

  if (categories.length === 0) {
    return (
      <Alert severity="info">
        No categories found. Create menu and submenu items first from the Menu &amp; Submenu page.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Category
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a category, then choose a subcategory.
        </Typography>
      </Box>

      <Box>
        <Tabs
          value={values.categoryId || false}
          onChange={(_, categoryId: string) =>
            onChange({
              categoryId,
              menuSubmenuId: '',
            })
          }
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            minHeight: 42,
            '& .MuiTab-root': { minHeight: 42, textTransform: 'none', fontWeight: 500 },
          }}
        >
          {categories.map((category) => (
            <Tab key={category.id} label={category.name} value={category.id} />
          ))}
        </Tabs>
        {errors.categoryId && (
          <FormHelperText error sx={{ mt: 1, mx: 0 }}>
            {errors.categoryId}
          </FormHelperText>
        )}
      </Box>

      {values.categoryId && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Subcategory
          </Typography>

          {subcategories.length === 0 ? (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              No subcategories under this category. Add one from Menu &amp; Submenu.
            </Alert>
          ) : (
            <Tabs
              value={values.menuSubmenuId || false}
              onChange={(_, menuSubmenuId: string) => onChange({ menuSubmenuId })}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                minHeight: 42,
                '& .MuiTab-root': { minHeight: 42, textTransform: 'none' },
              }}
            >
              {subcategories.map((subcategory) => (
                <Tab key={subcategory.id} label={subcategory.name} value={subcategory.id} />
              ))}
            </Tabs>
          )}

          {errors.menuSubmenuId && (
            <FormHelperText error sx={{ mt: 1, mx: 0 }}>
              {errors.menuSubmenuId}
            </FormHelperText>
          )}
        </Box>
      )}
    </Stack>
  );
}
