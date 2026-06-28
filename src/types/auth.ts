export type AdminRole = 'admin' | 'super_admin';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  admin: AdminUser;
};
