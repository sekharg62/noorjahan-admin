export type MenuItem = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt: string;
};

export type MenuItemWithChildren = MenuItem & {
  children?: MenuItem[];
};

export type MenuItemDetail = MenuItem & {
  parent: MenuItem | null;
  children?: MenuItem[];
};

export type MenuSubmenuListResponse = {
  menus: MenuItemWithChildren[];
  flat: MenuItem[];
};

export type CreateMenuSubmenuPayload = {
  name: string;
  slug: string;
  parentId?: string | null;
};

export type UpdateMenuSubmenuPayload = {
  name: string;
  slug: string;
  parentId: string | null;
};

export type PatchMenuSubmenuPayload = Partial<CreateMenuSubmenuPayload>;
