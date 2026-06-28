import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import CategoryStep from '../components/products/createProduct/CategoryStep';
import DetailsStep from '../components/products/createProduct/DetailsStep';
import ImagesStep from '../components/products/createProduct/ImagesStep';
import PreviewStep from '../components/products/createProduct/PreviewStep';
import {
  createImageDraft,
  emptyProductFormValues,
  reorderImages,
  type ProductFormValues,
  type ProductImageDraft,
} from '../components/products/createProduct/types';
import { API_URL } from '../config/env';
import { getApiErrorMessage } from '../lib/apiClient';
import * as menuSubmenuService from '../services/menuSubmenuService';
import * as productImageService from '../services/productImageService';
import * as productService from '../services/productService';
import type { MenuItem, MenuItemWithChildren } from '../types/menuSubmenu';
import {
  getSubcategoriesForCategory,
  isRootMenuItem,
  resolveMenuSubmenuLists,
} from '../utils/menuSubmenu';
import { uploadProductImage } from '../utils/generateUrl';
import { slugify } from '../utils/slugify';

type ProductTab = 'category' | 'details' | 'images' | 'preview';

const TABS: { id: ProductTab; label: string }[] = [
  { id: 'category', label: 'Category' },
  { id: 'details', label: 'Details' },
  { id: 'images', label: 'Images' },
  { id: 'preview', label: 'Preview' },
];

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function validateCategory(values: ProductFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.categoryId) errors.categoryId = 'Select a category';
  if (!values.menuSubmenuId) errors.menuSubmenuId = 'Select a subcategory';
  return errors;
}

function validateDetails(values: ProductFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = 'Product name is required';
  if (!values.slug.trim()) errors.slug = 'Slug is required';
  if (!values.description.trim()) errors.description = 'Description is required';
  if (!values.price.trim()) errors.price = 'Price is required';
  if (values.stock < 0) errors.stock = 'Stock cannot be negative';
  return errors;
}

function validateImages(images: ProductImageDraft[]): Record<string, string> {
  const errors: Record<string, string> = {};
  if (images.length === 0) errors.images = 'Upload at least one product image';
  if (images.length > 0 && !images.some((image) => image.isPrimary)) {
    errors.images = 'Select a primary image';
  }
  return errors;
}

export default function CreateProductPage() {
  const navigate = useNavigate();
  const slugEditedRef = useRef(false);
  const menusFetchStartedRef = useRef(false);

  const [activeTab, setActiveTab] = useState<ProductTab>('details');
  const [formValues, setFormValues] = useState<ProductFormValues>(emptyProductFormValues);
  const [images, setImages] = useState<ProductImageDraft[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [menuTree, setMenuTree] = useState<MenuItemWithChildren[]>([]);
  const [menuItemsFlat, setMenuItemsFlat] = useState<MenuItem[]>([]);
  const [menusLoading, setMenusLoading] = useState(false);
  const [menusError, setMenusError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const fetchMenus = useCallback(async () => {
    setMenusLoading(true);
    setMenusError(null);

    try {
      const response = await menuSubmenuService.getAllMenuSubmenus();
      const { menus, flat } = resolveMenuSubmenuLists(response);
      setMenuTree(menus);
      setMenuItemsFlat(flat);
    } catch (err) {
      setMenusError(getApiErrorMessage(err, 'Failed to load categories'));
    } finally {
      setMenusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'category' || menusFetchStartedRef.current) {
      return;
    }

    menusFetchStartedRef.current = true;
    void fetchMenus();
  }, [activeTab, fetchMenus]);

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
    };
  }, [images]);

  const categories = useMemo(() => {
    if (menuTree.length > 0) {
      return menuTree.map(({ children: _children, ...menu }) => menu);
    }

    return menuItemsFlat.filter(isRootMenuItem);
  }, [menuTree, menuItemsFlat]);

  const subcategories = useMemo(
    () => getSubcategoriesForCategory(menuTree, menuItemsFlat, formValues.categoryId),
    [menuTree, menuItemsFlat, formValues.categoryId],
  );

  const category = useMemo(
    () => categories.find((item) => item.id === formValues.categoryId),
    [categories, formValues.categoryId],
  );

  const subcategory = useMemo(
    () => subcategories.find((item) => item.id === formValues.menuSubmenuId),
    [subcategories, formValues.menuSubmenuId],
  );

  const tabCompletion = useMemo(
    () => ({
      category:
        !!formValues.categoryId &&
        !!formValues.menuSubmenuId &&
        Object.keys(validateCategory(formValues)).length === 0,
      details:
        !!formValues.name.trim() &&
        !!formValues.slug.trim() &&
        !!formValues.description.trim() &&
        !!formValues.price.trim() &&
        Object.keys(validateDetails(formValues)).length === 0,
      images: images.length > 0 && images.some((image) => image.isPrimary),
    }),
    [formValues, images],
  );

  const updateFormValues = (patch: Partial<ProductFormValues>) => {
    setFormValues((current) => ({ ...current, ...patch }));
    setFieldErrors({});
  };

  const handleNameChange = (name: string) => {
    setFormValues((current) => ({
      ...current,
      name,
      slug: slugEditedRef.current ? current.slug : slugify(name),
    }));
    setFieldErrors({});
  };

  const handleSlugChange = (slug: string) => {
    slugEditedRef.current = true;
    setFormValues((current) => ({ ...current, slug: slugify(slug) }));
    setFieldErrors({});
  };

  const handleAddFiles = (files: File[]) => {
    setImages((current) => {
      const next = [...current];

      files.forEach((file, index) => {
        next.push(createImageDraft(file, next.length + 1, current.length === 0 && index === 0));
      });

      if (!next.some((image) => image.isPrimary) && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true };
      }

      return reorderImages(next);
    });
    setFieldErrors({});
  };

  const handleRemoveImage = (id: string) => {
    setImages((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed?.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      const next = current.filter((image) => image.id !== id);
      if (next.length > 0 && !next.some((image) => image.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }

      return reorderImages(next);
    });
    setFieldErrors({});
  };

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    setImages((current) => reorderImages(moveItem(current, fromIndex, toIndex)));
  };

  const handleSetPrimary = (id: string) => {
    setImages((current) =>
      current.map((image) => ({
        ...image,
        isPrimary: image.id === id,
      })),
    );
  };

  const handleTabChange = (_: SyntheticEvent, tab: ProductTab) => {
    setActiveTab(tab);
    setFieldErrors({});
  };

  const handleRetryMenus = () => {
    menusFetchStartedRef.current = true;
    void fetchMenus();
  };

  const validateAll = (): ProductTab | null => {
    const categoryErrors = validateCategory(formValues);
    if (Object.keys(categoryErrors).length > 0) {
      setFieldErrors(categoryErrors);
      return 'category';
    }

    const detailsErrors = validateDetails(formValues);
    if (Object.keys(detailsErrors).length > 0) {
      setFieldErrors(detailsErrors);
      return 'details';
    }

    const imageErrors = validateImages(images);
    if (Object.keys(imageErrors).length > 0) {
      setFieldErrors(imageErrors);
      return 'images';
    }

    setFieldErrors({});
    return null;
  };

  const handleCreate = async () => {
    const invalidTab = validateAll();
    if (invalidTab) {
      setActiveTab(invalidTab);
      toast.error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Creating product…');

    try {
      const product = await productService.createProduct({
        menuSubmenuId: formValues.menuSubmenuId,
        name: formValues.name.trim(),
        slug: formValues.slug.trim(),
        description: formValues.description.trim(),
        price: formValues.price.trim(),
        ...(formValues.offerPrice.trim() ? { offerPrice: formValues.offerPrice.trim() } : {}),
        stock: formValues.stock,
        isActive: formValues.isActive,
      });

      const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

      for (let index = 0; index < sortedImages.length; index += 1) {
        const image = sortedImages[index];
        setSubmitStatus(`Uploading image ${index + 1} of ${sortedImages.length}…`);

        const imgUrl = await uploadProductImage(image.file, API_URL);

        setSubmitStatus(`Saving image ${index + 1} of ${sortedImages.length}…`);
        await productImageService.createProductImage({
          productId: product.id,
          imgUrl,
          displayOrder: image.displayOrder,
          isPrimary: image.isPrimary,
        });
      }

      toast.success('Product created successfully');
      navigate('/products');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create product'));
    } finally {
      setIsSubmitting(false);
      setSubmitStatus(null);
    }
  };

  const renderTabPanel = () => {
    switch (activeTab) {
      case 'category':
        return (
          <CategoryStep
            values={formValues}
            categories={categories}
            subcategories={subcategories}
            loading={menusLoading}
            error={menusError}
            errors={{
              categoryId: fieldErrors.categoryId,
              menuSubmenuId: fieldErrors.menuSubmenuId,
            }}
            onChange={updateFormValues}
            onRetry={handleRetryMenus}
          />
        );
      case 'details':
        return (
          <DetailsStep
            values={formValues}
            errors={{
              name: fieldErrors.name,
              slug: fieldErrors.slug,
              description: fieldErrors.description,
              price: fieldErrors.price,
              offerPrice: fieldErrors.offerPrice,
              stock: fieldErrors.stock,
            }}
            onChange={updateFormValues}
            onNameChange={handleNameChange}
            onSlugChange={handleSlugChange}
          />
        );
      case 'images':
        return (
          <ImagesStep
            images={images}
            error={fieldErrors.images}
            onAddFiles={handleAddFiles}
            onRemove={handleRemoveImage}
            onReorder={handleReorderImages}
            onSetPrimary={handleSetPrimary}
          />
        );
      case 'preview':
        return (
          <PreviewStep
            values={formValues}
            category={category}
            subcategory={subcategory}
            images={images}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader
        title="Create product"
        description="Fill in each section — switch tabs anytime. Create when you are ready."
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/products')}
            disabled={isSubmitting}
          >
            Back to products
          </Button>
        }
      />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', maxWidth: 960, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 3,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 48 },
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <span>{tab.label}</span>
                    {tab.id !== 'preview' && tabCompletion[tab.id] && (
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          display: 'inline-block',
                        }}
                      />
                    )}
                  </Stack>
                }
              />
            ))}
          </Tabs>

          <Box sx={{ minHeight: 280 }}>{renderTabPanel()}</Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{
              mt: 4,
              pt: 3,
              borderTop: 1,
              borderColor: 'divider',
              justifyContent: 'flex-end',
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            {submitStatus && (
              <Typography variant="caption" color="text.secondary" sx={{ mr: { sm: 'auto' } }}>
                {submitStatus}
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
              onClick={() => void handleCreate()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating…' : 'Create product'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
