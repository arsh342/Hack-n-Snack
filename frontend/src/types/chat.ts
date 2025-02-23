export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_role: string;
  sender_name: string;
  recipient_id?: string;
  recipient_role?: string;
  content: string;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  user_id: string;
  support_id: string;
  status: 'open' | 'closed';
  created_at: string;
}