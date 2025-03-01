export type UserRole = 'user' | 'canteen' | 'admin';

export interface AuthState {
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  phone?: string;
}