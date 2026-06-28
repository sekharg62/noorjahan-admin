import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import BannerTable from '../components/banners/BannerTable';
import BannerFormModal, { type BannerFormValues } from '../components/banners/BannerFormModal';
import DeleteBannerDialog from '../components/banners/DeleteBannerDialog';
import { BannerType, BANNER_TYPE_LABELS } from '../constants/enum';
import { getApiErrorMessage } from '../lib/apiClient';
import * as bannerService from '../services/bannerService';
import type { Banner } from '../types/banner';

type TypeFilter = 'ALL' | BannerType;

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: BannerType.HOME, label: BANNER_TYPE_LABELS[BannerType.HOME] },
  { value: BannerType.CATEGORY, label: BANNER_TYPE_LABELS[BannerType.CATEGORY] },
  { value: BannerType.PRODUCT, label: BANNER_TYPE_LABELS[BannerType.PRODUCT] },
];

export default function BannersPage() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const suggestedOrder = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(...items.map((item) => item.order)) + 1;
  }, [items]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await bannerService.getAllBanners(
        typeFilter === 'ALL' ? undefined : { type: typeFilter },
      );
      setItems(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load banners'));
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const openCreateModal = () => {
    setFormMode('create');
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEditModal = (item: Banner) => {
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

  const handleFormSubmit = async (values: BannerFormValues) => {
    setIsSubmitting(true);

    try {
      const redirectUrl = values.redirectUrl.trim();
      const payload = {
        imgUrl: values.imgUrl.trim(),
        order: values.order,
        type: values.type,
        ...(redirectUrl ? { redirectUrl } : {}),
      };

      if (formMode === 'create') {
        await bannerService.createBanner(payload);
        toast.success('Banner created');
      } else if (editingItem) {
        await bannerService.updateBanner(editingItem.id, payload);
        toast.success('Banner updated');
      }

      setFormOpen(false);
      setEditingItem(null);
      await fetchItems();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save banner'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (item: Banner) => {
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
      await bannerService.deleteBanner(deletingItem.id);
      toast.success('Banner deleted');
      setDeleteOpen(false);
      setDeletingItem(null);
      await fetchItems();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete banner'));
    } finally {
      setIsDeleting(false);
    }
  };

  const showEmptyState = !loading && !error && items.length === 0;

  return (
    <Box>
      <PageHeader
        title="Banners"
        description="Manage homepage and category banners for your storefront."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
            Add banner
          </Button>
        }
      />

      <Tabs
        value={typeFilter}
        onChange={(_event, value: TypeFilter) => setTypeFilter(value)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {TYPE_TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {showEmptyState ? (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <EmptyState
            icon={<ViewCarouselIcon />}
            title="No banners yet"
            description="Create banners for your home page, categories, or product pages."
          />
        </Card>
      ) : (
        <BannerTable
          items={items}
          loading={loading}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
        />
      )}

      <BannerFormModal
        open={formOpen}
        mode={formMode}
        suggestedOrder={suggestedOrder}
        initialValues={
          editingItem
            ? {
                imgUrl: editingItem.imgUrl,
                redirectUrl: editingItem.redirectUrl,
                order: editingItem.order,
                type: editingItem.type,
              }
            : undefined
        }
        isSubmitting={isSubmitting}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />

      <DeleteBannerDialog
        open={deleteOpen}
        banner={deletingItem}
        isDeleting={isDeleting}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
