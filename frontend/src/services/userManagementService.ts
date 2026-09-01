import api from "../api/axios";

import type {
  ManagedUser,
  UserCreateRequest,
  UserListResponse,
  UserQueryParams,
  UserStatusRequest,
  UserUpdateRequest,
} from "../types/userManagement";


export const getUsers = async (
  params: UserQueryParams = {},
): Promise<UserListResponse> => {
  const response =
    await api.get<UserListResponse>(
      "/admin/users",
      {
        params,
      },
    );

  return response.data;
};


export const getUser = async (
  userId: number,
): Promise<ManagedUser> => {
  const response =
    await api.get<ManagedUser>(
      `/admin/users/${userId}`,
    );

  return response.data;
};


export const createUser = async (
  data: UserCreateRequest,
): Promise<ManagedUser> => {
  const response =
    await api.post<ManagedUser>(
      "/admin/users",
      data,
    );

  return response.data;
};


export const updateUser = async (
  userId: number,
  data: UserUpdateRequest,
): Promise<ManagedUser> => {
  const response =
    await api.put<ManagedUser>(
      `/admin/users/${userId}`,
      data,
    );

  return response.data;
};


export const updateUserStatus = async (
  userId: number,
  data: UserStatusRequest,
): Promise<ManagedUser> => {
  const response =
    await api.patch<ManagedUser>(
      `/admin/users/${userId}/status`,
      data,
    );

  return response.data;
};


export const deleteUser = async (
  userId: number,
): Promise<ManagedUser> => {
  const response =
    await api.delete<ManagedUser>(
      `/admin/users/${userId}`,
    );

  return response.data;
};