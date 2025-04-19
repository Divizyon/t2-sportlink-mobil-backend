export interface User {
  id: BigInt;
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture: string;
  default_location_latitude: number;
  default_location_longitude: number;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterUserDTO {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture?: string;
  default_location_latitude?: number;
  default_location_longitude?: number;
  role?: string; // Varsayılan olarak "user" ayarlanabilir
}

export interface LoginUserDTO {
  username: string;
  password: string;
}

// Kullanıcı profil güncellemesi için DTO
export interface UpdateUserDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_picture?: string;
  default_location_latitude?: number;
  default_location_longitude?: number;
} 