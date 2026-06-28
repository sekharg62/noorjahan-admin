import type { MenuItem, MenuItemWithChildren, MenuSubmenuListResponse } from '../types/menuSubmenu';

export function isRootMenuItem(item: MenuItem): boolean {
  return item.parentId == null || item.parentId === '';
}

export function flattenMenuTree(menus: MenuItemWithChildren[]): MenuItem[] {
  const flat: MenuItem[] = [];

  const visit = (items: MenuItemWithChildren[]) => {
    items.forEach((item) => {
      const { children, ...menu } = item;
      flat.push(menu);
      if (children?.length) {
        visit(children);
      }
    });
  };

  visit(menus);
  return flat;
}

export function resolveMenuSubmenuLists(response: MenuSubmenuListResponse): {
  menus: MenuItemWithChildren[];
  flat: MenuItem[];
  categories: MenuItem[];
} {
  const menus = response.menus ?? [];
  const flat = response.flat?.length ? response.flat : flattenMenuTree(menus);
  const categories = menus.length
    ? menus.map(({ children: _children, ...menu }) => menu)
    : flat.filter(isRootMenuItem);

  return { menus, flat, categories };
}

export function getSubcategoriesForCategory(
  menus: MenuItemWithChildren[],
  flat: MenuItem[],
  categoryId: string,
): MenuItem[] {
  if (!categoryId) {
    return [];
  }

  if (menus.length > 0) {
    return menus.find((menu) => menu.id === categoryId)?.children ?? [];
  }

  return flat.filter((item) => item.parentId === categoryId);
}
