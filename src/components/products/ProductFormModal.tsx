import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import type { MenuItem as MenuSubmenuItem } from '../../types/menuSubmenu';
import type { Product } from '../../types/product';
import { slugify } from '../../utils/slugify';

export type ProductFormValues = {
  menuSubmenuId: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  offerPrice: string;
  stock: number;
  isActive: boolean;
};

type ProductFormModalProps = {
  open: boolean;
  initialValues?: ProductFormValues;
  submenus: MenuSubmenuItem[];
  submenuById: Map<string, { name: string; menuName: string }>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
};

const emptyValues = (): ProductFormValues => ({
  menuSubmenuId: '',
  name: '',
  slug: '',
  description: '',
  price: '',
  offerPrice: '',
  stock: 0,
  isActive: true,
});

export default function ProductFormModal({
  open,
  initialValues,
  submenus,
  submenuById,
  isSubmitting,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const slugEditedRef = useRef(false);
  const [values, setValues] = useState<ProductFormValues>(emptyValues());

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? emptyValues());
      slugEditedRef.current = Boolean(initialValues?.slug);
    }
  }, [open, initialValues]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  const handleNameChange = (name: string) => {
    setValues((current) => ({
      ...current,
      name,
      slug: slugEditedRef.current ? current.slug : slugify(name),
    }));
  };

  const handleSlugChange = (slug: string) => {
    slugEditedRef.current = true;
    setValues((current) => ({ ...current, slug: slugify(slug) }));
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <DialogTitle>Edit product</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <FormControl fullWidth required>
              <InputLabel id="edit-product-submenu-label">Subcategory</InputLabel>
              <Select
                labelId="edit-product-submenu-label"
                label="Subcategory"
                value={values.menuSubmenuId}
                onChange={(e) => setValues((current) => ({ ...current, menuSubmenuId: e.target.value }))}
              >
                {submenus.map((submenu) => {
                  const parent = submenuById.get(submenu.id);
                  const label = parent ? `${parent.menuName} → ${submenu.name}` : submenu.name;
                  return (
                    <MenuItem key={submenu.id} value={submenu.id}>
                      {label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              label="Product name"
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Slug"
              value={values.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              fullWidth
              helperText="URL-friendly identifier"
            />

            <TextField
              label="Description"
              value={values.description}
              onChange={(e) => setValues((current) => ({ ...current, description: e.target.value }))}
              required
              fullWidth
              multiline
              minRows={3}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Price"
                value={values.price}
                onChange={(e) => setValues((current) => ({ ...current, price: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Offer price"
                value={values.offerPrice}
                onChange={(e) => setValues((current) => ({ ...current, offerPrice: e.target.value }))}
                fullWidth
                helperText="Leave empty to clear"
              />
            </Stack>

            <TextField
              label="Stock"
              type="number"
              value={values.stock}
              onChange={(e) => {
                const next = Number.parseInt(e.target.value, 10);
                setValues((current) => ({
                  ...current,
                  stock: Number.isNaN(next) ? 0 : Math.max(0, next),
                }));
              }}
              fullWidth
              slotProps={{ htmlInput: { min: 0 } }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={values.isActive}
                  onChange={(e) => setValues((current) => ({ ...current, isActive: e.target.checked }))}
                />
              }
              label="Active on storefront"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function productToFormValues(product: Product): ProductFormValues {
  return {
    menuSubmenuId: product.menuSubmenuId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    offerPrice: product.offerPrice ?? '',
    stock: product.stock,
    isActive: product.isActive,
  };
}

export { productToFormValues };
