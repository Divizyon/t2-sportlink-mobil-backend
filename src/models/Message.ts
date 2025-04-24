/* eslint-disable prettier/prettier */
import { user } from '@prisma/client';

export interface Conversation {
  id: string;
  name?: string;
  is_group: boolean;
  created_at: Date;
  updated_at: Date;
  participants?: ConversationParticipant[];
  messages?: Message[];
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  joined_at: Date;
  left_at?: Date | null;
  is_admin: boolean;
  user?: user;
  conversation?: Conversation;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_url?: string | null;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
  sender?: user;
  conversation?: Conversation;
  read_by?: MessageRead[];
}

export interface MessageRead {
  message_id: string;
  user_id: string;
  read_at: Date;
  message?: Message;
  user?: user;
}