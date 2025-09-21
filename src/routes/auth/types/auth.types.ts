export interface User {
  userID: number;
  username: string;
  phoneNumber: string;
  password: string;
  updatedAt: Date;
}

export interface UserWithoutPassword {
  userID: number;
  username: string;
  phoneNumber: string;
  updatedAt: Date;
}

export interface CreateUserData {
  username: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateUserData {
  username: string;
  phoneNumber: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  user: UserWithoutPassword;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse<T = any> {
  message: string;
  data: T | null;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DatabaseUser {
  userID: number;
  username: string;
  phoneNumber: string;
  password: string;
  updatedAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AuthContext {
  userID: number;
  username: string;
  phoneNumber: string;
}