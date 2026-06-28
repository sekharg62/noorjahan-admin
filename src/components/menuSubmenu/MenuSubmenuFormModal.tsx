import { useEffect, useState, type FormEvent } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import type { MenuItem as MenuSubmenuItem } from '../../types/menuSubmenu';

export type MenuSubmenuFormValues = {
  name: string;
  slug: string;
  parentId: string | null;
};

type MenuSubmenuFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: MenuSubmenuFormValues;
  parentMenus: MenuSubmenuItem[];
  editingId?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: MenuSubmenuFormValues) => Promise<void>;
};

const emptyValues: MenuSubmenuFormValues = {
  name: '',
  slug: '',
  parentId: null,
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function MenuSubmenuFormModal({
  open,
  mode,
  initialValues,
  parentMenus,
  editingId,
  isSubmitting,
  onClose,
  onSubmit,
}: MenuSubmenuFormModalProps) {
  const [values, setValues] = useState<MenuSubmenuFormValues>(emptyValues);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? emptyValues);
      setSlugTouched(Boolean(initialValues?.slug));
    }
  }, [open, initialValues]);

  const availableParents = parentMenus.filter((menu) => menu.id !== editingId);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  const handleNameChange = (name: string) => {
    setValues((prev) => ({
      ...prev,
      name,
      slug: !slugTouched && mode === 'create' ? slugify(name) : prev.slug,
    }));
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{mode === 'create' ? 'Add menu item' : 'Edit menu item'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={isSubmitting}
            />
            <TextField
              label="Slug"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setValues((prev) => ({ ...prev, slug: e.target.value }));
              }}
              required
              fullWidth
              disabled={isSubmitting}
              helperText="URL-friendly identifier, e.g. women-wear"
            />
            <FormControl fullWidth disabled={isSubmitting}>
              <InputLabel id="parent-menu-label">Parent menu</InputLabel>
              <Select
                labelId="parent-menu-label"
                label="Parent menu"
                value={values.parentId ?? ''}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    parentId: e.target.value ? String(e.target.value) : null,
                  }))
                }
              >
                <MenuItem value="">
                  <em>None (top-level menu)</em>
                </MenuItem>
                {availableParents.map((menu) => (
                  <MenuItem key={menu.id} value={menu.id}>
                    {menu.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select a parent to create a submenu. Only top-level menus can be parents.
              </FormHelperText>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !values.name.trim() || !values.slug.trim()}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
