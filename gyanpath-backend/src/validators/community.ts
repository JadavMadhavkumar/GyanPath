import { z } from 'zod';

// Group type enum
const groupTypeEnum = z.enum(['subject', 'school', 'class', 'career', 'general']);

// Create group schema
export const createGroupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  type: groupTypeEnum,
  requires_approval: z.boolean().default(false),
});

// Create message schema
export const createMessageSchema = z.object({
  group_id: z.string().uuid('Invalid group ID'),
  content: z.string().min(1).max(2000),
  message_type: z.enum(['text', 'image', 'file', 'quiz_link', 'material_link']).default('text'),
  media_url: z.string().url().optional(),
});

// Group invite schema
export const groupInviteSchema = z.object({
  group_id: z.string().uuid('Invalid group ID'),
  invitee_id: z.string().uuid('Invalid user ID'),
});

// Moderate message schema
export const moderateMessageSchema = z.object({
  message_id: z.string().uuid('Invalid message ID'),
  action: z.enum(['delete', 'approve', 'flag']),
  reason: z.string().optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type GroupInviteInput = z.infer<typeof groupInviteSchema>;
export type ModerateMessageInput = z.infer<typeof moderateMessageSchema>;
