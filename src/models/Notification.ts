import { notification } from '@prisma/client';

export type NotificationType = 'event' | 'news' | 'friend_request' | 'message' | 'system' | 'announcement';

export type NotificationWithDetails = notification & {
  event?: {
    id: string;
    title: string;
    event_date: Date;
  } | null;
};

export interface NotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  redirectUrl?: string;
}

export interface NotificationResponse {
  notifications: NotificationWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DeviceTokenInput {
  token: string;
  platform: 'ios' | 'android' | 'expo';
}