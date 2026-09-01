export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: string;
  is_active: boolean;
}

export interface UserListResponse {
  users: ManagedUser[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  is_active: boolean;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  role?: string;
}

export interface UserStatusRequest {
  is_active: boolean;
}

export interface UserQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}