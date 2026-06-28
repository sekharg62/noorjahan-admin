import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import MenuSubmenuTable from '../components/menuSubmenu/MenuSubmenuTable';
import MenuSubmenuFormModal, {
  type MenuSubmenuFormValues,
} from '../components/menuSubmenu/MenuSubmenuFormModal';
import DeleteMenuSubmenuDialog from '../components/menuSubmenu/DeleteMenuSubmenuDialog';
import { getApiErrorMessage } from '../lib/apiClient';
import * as menuSubmenuService from '../services/menuSubmenuService';
import type { MenuItem } from '../types/menuSubmenu';

export default function MenuSubmenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const parentMenus = useMemo(
    () => items.filter((item) => !item.parentId),
    [items],
  );

  const parentById = useMemo(
    () => new Map(parentMenus.map((menu) => [menu.id, menu])),
    [parentMenus],
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await menuSubmenuService.getAllMenuSubmenus();
      setItems(response.flat);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load menu items'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const openCreateModal = () => {
    setFormMode('create');
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setFormMode('edit');
    setEditingItem(item);
    setFormOpen(true);
  };

  const closeFormModal = () => {
    if (!isSubmitting) {
      setFormOpen(false);
      setEditingItem(null);
    }
  };

  const handleFormSubmit = async (values: MenuSubmenuFormValues) => {
    setIsSubmitting(true);

    try {
      if (formMode === 'create') {
        await menuSubmenuService.createMenuSubmenu({
          name: values.name.trim(),
          slug: values.slug.trim(),
          parentId: values.parentId,
        });
        toast.success('Menu item created');
      } else if (editingItem) {
        await menuSubmenuService.updateMenuSubmenu(editingItem.id, {
          name: values.name.trim(),
          slug: values.slug.trim(),
          parentId: values.parentId,
        });
        toast.success('Menu item updated');
      }

      setFormOpen(false);
      setEditingItem(null);
      await fetchItems();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save menu item'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (item: MenuItem) => {
    setDeletingItem(item);
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteOpen(false);
      setDeletingItem(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);

    try {
      await menuSubmenuService.deleteMenuSubmenu(deletingItem.id);
      toast.success('Menu item deleted');
      setDeleteOpen(false);
      setDeletingItem(null);
      await fetchItems();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete menu item'));
    } finally {
      setIsDeleting(false);
    }
  };

  const showEmptyState = !loading && !error && items.length === 0;

  return (
    <Box>
      <PageHeader
        title="Menu & Submenu"
        description="Manage navigation menus and submenus for your storefront."
      />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'flex-end', py: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
            Add menu item
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {showEmptyState ? (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <EmptyState
            icon={<AccountTreeIcon />}
            title="No menu items yet"
            description="Create top-level menus like Women or Men, then add submenus such as Kurti or T-Shirt."
          />
        </Card>
      ) : (
        <MenuSubmenuTable
          items={items}
          parentById={parentById}
          loading={loading}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
        />
      )}

      <MenuSubmenuFormModal
        open={formOpen}
        mode={formMode}
        initialValues={
          editingItem
            ? {
                name: editingItem.name,
                slug: editingItem.slug,
                parentId: editingItem.parentId,
              }
            : undefined
        }
        parentMenus={parentMenus}
        editingId={editingItem?.id}
        isSubmitting={isSubmitting}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />

      <DeleteMenuSubmenuDialog
        open={deleteOpen}
        item={deletingItem}
        isDeleting={isDeleting}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
