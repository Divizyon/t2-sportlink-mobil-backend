export interface User {
  id: string;
  email?: string;
  name?: string;
  provider: 'google' | 'instagram';
  photoUrl?: string;
}
