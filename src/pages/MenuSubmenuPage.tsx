import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card } from '@mui/material';
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
import type { DataTablePagination } from '../components/common/DataTable';
import { getApiErrorMessage } from '../lib/apiClient';
import * as menuSubmenuService from '../services/menuSubmenuService';
import type { MenuItem } from '../types/menuSubmenu';
import type { PaginationMeta } from '../types/api';
import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  DEFAULT_PAGINATION,
  PAGE_SIZE_OPTIONS,
} from '../constants/pagination';

export default function MenuSubmenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [parentMenus, setParentMenus] = useState<MenuItem[]>([]);
  const [parentById, setParentById] = useState<Map<string, MenuItem>>(new Map());

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchParentLookup = useCallback(async () => {
    try {
      const response = await menuSubmenuService.getAllMenuSubmenus({ page: 1, limit: 1000 });
      const lookup = new Map<string, MenuItem>();
      response.flat.forEach((item) => lookup.set(item.id, item));
      setParentById(lookup);
      setParentMenus(response.flat.filter((item) => !item.parentId));
    } catch {
      // Parent lookup is optional for table display; form may have limited parent options.
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await menuSubmenuService.getAllMenuSubmenus({ page, limit });
      setItems(response.flat);
      setPagination(response.pagination ?? { ...DEFAULT_PAGINATION, page, limit, total: response.flat.length });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load menu items'));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void fetchParentLookup();
  }, [fetchParentLookup]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const tablePagination = useMemo<DataTablePagination>(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      onPageChange: (nextPage) => setPage(nextPage),
      onLimitChange: (nextLimit) => {
        setLimit(nextLimit);
        setPage(DEFAULT_PAGE);
      },
    }),
    [pagination],
  );

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

  const refreshAfterMutation = async () => {
    await fetchParentLookup();
    if (items.length === 1 && page > 1) {
      setPage((current) => current - 1);
      return;
    }
    await fetchItems();
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
      await fetchParentLookup();

      if (formMode === 'create') {
        if (page !== DEFAULT_PAGE) {
          setPage(DEFAULT_PAGE);
        } else {
          await fetchItems();
        }
      } else {
        await refreshAfterMutation();
      }
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
      await refreshAfterMutation();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete menu item'));
    } finally {
      setIsDeleting(false);
    }
  };

  const showEmptyState = !loading && !error && pagination.total === 0;

  return (
    <Box>
      <PageHeader
        title="Menu & Submenu"
        description="Manage navigation menus and submenus for your storefront."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
            Add menu item
          </Button>
        }
      />

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
          pagination={tablePagination}
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
