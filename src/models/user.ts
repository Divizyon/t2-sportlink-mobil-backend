/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *         - phone
 *         - profile_picture
 *         - default_location_latitude
 *         - default_location_longitude
 *         - role
 *         - created_at
 *         - updated_at
 *       properties:
 *         id:
 *           type: string
 *           format: bigint
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         phone:
 *           type: string
 *         profile_picture:
 *           type: string
 *         default_location_latitude:
 *           type: number
 *           format: float
 *         default_location_longitude:
 *           type: number
 *           format: float
 *         role:
 *           type: string
 *           default: user
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */
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

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUserDTO:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - confirm_password
 *         - first_name
 *         - last_name
 *         - phone
 *         - default_location_latitude
 *         - default_location_longitude
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         confirm_password:
 *           type: string
 *           format: password
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         phone:
 *           type: string
 *         profile_picture:
 *           type: string
 *         default_location_latitude:
 *           type: number
 *           format: float
 *         default_location_longitude:
 *           type: number
 *           format: float
 *         role:
 *           type: string
 *           default: user
 */
export interface RegisterUserDTO {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture?: string;
  default_location_latitude: number;
  default_location_longitude: number;
  role?: string; // Varsayılan olarak "user" ayarlanabilir
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginUserDTO:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 */
export interface LoginUserDTO {
  username: string;
  password: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserDTO:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         phone:
 *           type: string
 *         profile_picture:
 *           type: string
 *         default_location_latitude:
 *           type: number
 *           format: float
 *         default_location_longitude:
 *           type: number
 *           format: float
 */
// Kullanıcı profil güncellemesi için DTO
export interface UpdateUserDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_picture?: string;
  default_location_latitude?: number;
  default_location_longitude?: number;
} 