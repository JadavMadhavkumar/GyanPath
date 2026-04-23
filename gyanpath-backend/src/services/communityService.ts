import { getSupabaseAdmin } from '../lib/supabase';
import { Group, GroupMember, GroupMessage, CreateGroupInput, CreateMessageInput, GroupType, GroupRole } from '../types';
import logger from '../utils/logger';

class CommunityService {
  /**
   * Create a new group
   */
  async createGroup(userId: string, input: CreateGroupInput) {
    const supabase = getSupabaseAdmin();

    // Check membership requirement for group creation
    const { data: membership } = await supabase
      .from('user_memberships')
      .select('*, plan:membership_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .single();

    // Create group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: input.name,
        description: input.description,
        type: input.type,
        created_by: userId,
        requires_approval: input.requires_approval || false,
        member_count: 1,
        is_active: true,
      })
      .select()
      .single();

    if (groupError) {
      throw groupError;
    }

    // Add creator as owner
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: userId,
      role: 'owner',
      is_active: true,
    });

    logger.info(`Group created: ${group.id} by user ${userId}`);

    return group as Group;
  }

  /**
   * Get group details
   */
  async getGroup(groupId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) {
      throw error;
    }

    return data as Group;
  }

  /**
   * Get user's groups
   */
  async getUserGroups(userId: string, type?: GroupType) {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('group_members')
      .select(`
        *,
        group:groups(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (type) {
      query = query.eq('group.type', type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string, limit: number = 50) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        user:users(id, full_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('role', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data as GroupMember[];
  }

  /**
   * Join a group
   */
  async joinGroup(groupId: string, userId: string) {
    const supabase = getSupabaseAdmin();

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      if (existingMember.is_active) {
        throw new Error('Already a member of this group');
      }

      // Reactivate membership
      await supabase
        .from('group_members')
        .update({ is_active: true, joined_at: new Date().toISOString() })
        .eq('id', existingMember.id);

      return { success: true, message: 'Rejoined group' };
    }

    // Get group details
    const group = await this.getGroup(groupId);

    // Add member
    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role: 'member',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update member count
    await supabase
      .from('groups')
      .update({ member_count: group.member_count + 1 })
      .eq('id', groupId);

    logger.info(`User ${userId} joined group ${groupId}`);

    return { success: true, message: 'Joined group' };
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string) {
    const supabase = getSupabaseAdmin();

    const { data: member } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      throw new Error('Not a member of this group');
    }

    if (member.role === 'owner') {
      throw new Error('Owner cannot leave the group. Transfer ownership or delete the group.');
    }

    await supabase
      .from('group_members')
      .update({ is_active: false })
      .eq('id', member.id);

    // Update member count
    const group = await this.getGroup(groupId);
    await supabase
      .from('groups')
      .update({ member_count: Math.max(0, group.member_count - 1) })
      .eq('id', groupId);

    return { success: true, message: 'Left group' };
  }

  /**
   * Send message to group
   */
  async sendMessage(userId: string, input: CreateMessageInput) {
    const supabase = getSupabaseAdmin();

    // Check membership
    const { data: member } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', input.group_id)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (!member) {
      throw new Error('Not a member of this group');
    }

    // Create message
    const { data, error } = await supabase
      .from('group_messages')
      .insert({
        group_id: input.group_id,
        user_id: userId,
        content: input.content,
        message_type: input.message_type || 'text',
        media_url: input.media_url,
        is_flagged: false,
      })
      .select(`
        *,
        user:users(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    // TODO: Run AI moderation check
    // await this.moderateMessage(data.id, input.content);

    return data as GroupMessage;
  }

  /**
   * Get group messages
   */
  async getGroupMessages(groupId: string, limit: number = 50, offset: number = 0) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('group_messages')
      .select(`
        *,
        user:users(id, full_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .eq('is_flagged', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return data as GroupMessage[];
  }

  /**
   * Moderate message (admin or group admin)
   */
  async moderateMessage(messageId: string, action: 'delete' | 'approve' | 'flag', moderatorId: string, reason?: string) {
    const supabase = getSupabaseAdmin();

    if (action === 'delete') {
      const { error } = await supabase
        .from('group_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      logger.info(`Message ${messageId} deleted by ${moderatorId}`);
      return { success: true, message: 'Message deleted' };
    }

    const { data, error } = await supabase
      .from('group_messages')
      .update({
        is_flagged: action === 'flag',
        flagged_reason: reason,
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as GroupMessage;
  }

  /**
   * Delete group (admin or owner)
   */
  async deleteGroup(groupId: string, userId: string, isAdmin: boolean = false) {
    const supabase = getSupabaseAdmin();

    if (!isAdmin) {
      // Check if user is owner
      const { data: member } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .eq('role', 'owner')
        .single();

      if (!member) {
        throw new Error('Only group owner or admin can delete the group');
      }
    }

    // Delete messages
    await supabase.from('group_messages').delete().eq('group_id', groupId);

    // Delete members
    await supabase.from('group_members').delete().eq('group_id', groupId);

    // Delete group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      throw error;
    }

    logger.info(`Group ${groupId} deleted by ${userId}`);

    return { success: true, message: 'Group deleted' };
  }

  /**
   * Invite user to group
   */
  async inviteToGroup(groupId: string, inviterId: string, inviteeId: string) {
    const supabase = getSupabaseAdmin();

    // Check if inviter is member
    const { data: inviterMember } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', inviterId)
      .eq('is_active', true)
      .single();

    if (!inviterMember) {
      throw new Error('Only members can invite others');
    }

    // Check if already invited or member
    const { data: existingInvite } = await supabase
      .from('group_invites')
      .select('*')
      .eq('group_id', groupId)
      .eq('invitee_id', inviteeId)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      throw new Error('User already invited');
    }

    // Create invite
    const { data, error } = await supabase
      .from('group_invites')
      .insert({
        group_id: groupId,
        inviter_id: inviterId,
        invitee_id: inviteeId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // TODO: Send notification to invitee
    // await notificationService.createNotification({...});

    return data;
  }

  /**
   * Get all groups (admin)
   */
  async getAllGroups(page: number = 1, limit: number = 20, type?: GroupType) {
    const supabase = getSupabaseAdmin();

    let query = supabase.from('groups').select('*', { count: 'exact' });

    if (type) {
      query = query.eq('type', type);
    }

    const offset = (page - 1) * limit;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      groups: data as Group[],
      total: count || 0,
      page,
      limit,
    };
  }
}

export const communityService = new CommunityService();
