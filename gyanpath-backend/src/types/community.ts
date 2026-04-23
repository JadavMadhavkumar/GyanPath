// Community and Group types
export type GroupType = 'subject' | 'school' | 'class' | 'career' | 'general';

export type GroupRole = 'owner' | 'admin' | 'moderator' | 'member';

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'deleted';

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  type: GroupType;
  avatar_url?: string | null;
  created_by: string;
  is_active: boolean;
  member_count: number;
  requires_approval: boolean;
  membership_plan_required?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  type: GroupType;
  requires_approval?: boolean;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
  is_active: boolean;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'quiz_link' | 'material_link';
  media_url?: string | null;
  status: MessageStatus;
  is_flagged: boolean;
  flagged_reason?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
}

export interface CreateMessageInput {
  group_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'quiz_link' | 'material_link';
  media_url?: string;
}

export interface GroupInvite {
  id: string;
  group_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  responded_at?: string | null;
}

// Moderation types
export interface ModerationAction {
  id: string;
  group_id?: string | null;
  message_id?: string | null;
  user_id: string;
  moderator_id: string;
  action: 'delete_message' | 'warn_user' | 'mute_user' | 'ban_user' | 'approve_message';
  reason?: string | null;
  created_at: string;
}
