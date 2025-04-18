export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  profile_image?: string;
  interests?: string[];
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterUserDTO {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  profile_image?: string;
  interests?: string[];
}

export interface LoginUserDTO {
  username: string;
  password: string;
} 