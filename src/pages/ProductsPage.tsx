import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { Alert, Box, Button, Card, Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Link as RouterLink } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ProductTable from '../components/products/ProductTable';
import type { DataTablePagination } from '../components/common/DataTable';
import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  DEFAULT_PAGINATION,
  PAGE_SIZE_OPTIONS,
} from '../constants/pagination';
import { getApiErrorMessage } from '../lib/apiClient';
import * as menuSubmenuService from '../services/menuSubmenuService';
import * as productService from '../services/productService';
import type { PaginationMeta } from '../types/api';
import type { MenuItem, MenuItemWithChildren } from '../types/menuSubmenu';
import type { Product } from '../types/product';
import {
  getSubcategoriesForCategory,
  isRootMenuItem,
  resolveMenuSubmenuLists,
} from '../utils/menuSubmenu';

const ALL_FILTER = 'ALL';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);

  const [menuTree, setMenuTree] = useState<MenuItemWithChildren[]>([]);
  const [menuItemsFlat, setMenuItemsFlat] = useState<MenuItem[]>([]);
  const [menuFilter, setMenuFilter] = useState(ALL_FILTER);
  const [submenuFilter, setSubmenuFilter] = useState(ALL_FILTER);

  const fetchMenus = useCallback(async () => {
    try {
      const response = await menuSubmenuService.getAllMenuSubmenus();
      const { menus, flat } = resolveMenuSubmenuLists(response);
      setMenuTree(menus);
      setMenuItemsFlat(flat);
    } catch {
      // Menu labels in the table fall back to em dash when lookup fails.
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getAllProducts({
        page,
        limit,
        ...(menuFilter !== ALL_FILTER ? { menuId: menuFilter } : {}),
        ...(submenuFilter !== ALL_FILTER ? { submenuId: submenuFilter } : {}),
      });

      setProducts(response.products);
      setPagination(response.pagination ?? { ...DEFAULT_PAGINATION, page, limit, total: response.products.length });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  }, [page, limit, menuFilter, submenuFilter]);

  useEffect(() => {
    void fetchMenus();
  }, [fetchMenus]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const categories = useMemo(() => {
    if (menuTree.length > 0) {
      return menuTree.map(({ children: _children, ...menu }) => menu);
    }

    return menuItemsFlat.filter(isRootMenuItem);
  }, [menuTree, menuItemsFlat]);

  const subcategories = useMemo(
    () =>
      menuFilter === ALL_FILTER
        ? []
        : getSubcategoriesForCategory(menuTree, menuItemsFlat, menuFilter),
    [menuTree, menuItemsFlat, menuFilter],
  );

  const submenuById = useMemo(() => {
    const lookup = new Map<string, { name: string; menuName: string }>();

    menuItemsFlat.forEach((item) => {
      if (!item.parentId) return;

      const menu = menuItemsFlat.find((parent) => parent.id === item.parentId);
      lookup.set(item.id, {
        name: item.name,
        menuName: menu?.name ?? '—',
      });
    });

    if (menuTree.length > 0) {
      menuTree.forEach((menu) => {
        menu.children?.forEach((child) => {
          lookup.set(child.id, { name: child.name, menuName: menu.name });
        });
      });
    }

    return lookup;
  }, [menuItemsFlat, menuTree]);

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

  const handleMenuFilterChange = (_: SyntheticEvent, value: string) => {
    setMenuFilter(value);
    setSubmenuFilter(ALL_FILTER);
    setPage(DEFAULT_PAGE);
  };

  const handleSubmenuFilterChange = (_: SyntheticEvent, value: string) => {
    setSubmenuFilter(value);
    setPage(DEFAULT_PAGE);
  };

  const hasActiveFilter = menuFilter !== ALL_FILTER || submenuFilter !== ALL_FILTER;
  const showEmptyState = !loading && !error && pagination.total === 0 && !hasActiveFilter;

  return (
    <Box>
      <PageHeader
        title="Products"
        description="Browse and manage products by menu and submenu."
        action={
          <Button
            variant="contained"
            component={RouterLink}
            to="/products/new"
            startIcon={<AddIcon />}
          >
            Add product
          </Button>
        }
      />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={menuFilter}
          onChange={handleMenuFilterChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            borderBottom: subcategories.length > 0 ? 0 : 1,
            borderColor: 'divider',
            minHeight: 48,
            '& .MuiTab-root': { textTransform: 'none', minHeight: 48 },
          }}
        >
          <Tab label="All menus" value={ALL_FILTER} />
          {categories.map((category) => (
            <Tab key={category.id} label={category.name} value={category.id} />
          ))}
        </Tabs>

        {menuFilter !== ALL_FILTER && subcategories.length > 0 && (
          <Tabs
            value={submenuFilter}
            onChange={handleSubmenuFilterChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 1,
              borderBottom: 1,
              borderColor: 'divider',
              minHeight: 44,
              bgcolor: 'action.hover',
              '& .MuiTab-root': { textTransform: 'none', minHeight: 44, fontSize: '0.875rem' },
            }}
          >
            <Tab label="All submenus" value={ALL_FILTER} />
            {subcategories.map((subcategory) => (
              <Tab key={subcategory.id} label={subcategory.name} value={subcategory.id} />
            ))}
          </Tabs>
        )}
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {showEmptyState ? (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <EmptyState
            icon={<InventoryIcon />}
            title="No products yet"
            description="Create your first product using the guided setup — category, details, images, and preview."
          />
        </Card>
      ) : (
        <ProductTable
          items={products}
          submenuById={submenuById}
          loading={loading}
          pagination={tablePagination}
        />
      )}
    </Box>
  );
}
