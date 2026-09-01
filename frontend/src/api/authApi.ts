import api from "./axios";
import type {
  RegisterRequest,
  TokenResponse,
  User,
} from "../types/auth";

export const registerUser = async (
  data: RegisterRequest
): Promise<User> => {
  const response = await api.post<User>(
    "/auth/register",
    data
  );

  return response.data;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<TokenResponse> => {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post<TokenResponse>(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>("/auth/me");

  return response.data;
};