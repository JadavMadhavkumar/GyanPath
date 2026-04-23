import { Router } from 'express';
import { communityService } from '../services/communityService';
import { validateBody, validateParams } from '../middleware/validation';
import { createGroupSchema, createMessageSchema, groupInviteSchema } from '../validators/community';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { successResponse, createdResponse } from '../utils/response';

const router = Router();

/**
 * GET /api/v1/community/groups
 * Get user's groups
 */
router.get(
  '/groups',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { type } = req.query as any;
    const groups = await communityService.getUserGroups(req.userId!, type);
    return successResponse(res, groups);
  })
);

/**
 * POST /api/v1/community/groups
 * Create a group
 */
router.post(
  '/groups',
  authMiddleware,
  validateBody(createGroupSchema),
  asyncHandler(async (req, res) => {
    const group = await communityService.createGroup(req.userId!, req.body);
    return createdResponse(res, group);
  })
);

/**
 * GET /api/v1/community/groups/:groupId
 * Get group details
 */
router.get(
  '/groups/:groupId',
  asyncHandler(async (req, res) => {
    const group = await communityService.getGroup(req.params.groupId);
    return successResponse(res, group);
  })
);

/**
 * GET /api/v1/community/groups/:groupId/members
 * Get group members
 */
router.get(
  '/groups/:groupId/members',
  asyncHandler(async (req, res) => {
    const { limit = 50 } = req.query as any;
    const members = await communityService.getGroupMembers(req.params.groupId, limit);
    return successResponse(res, members);
  })
);

/**
 * POST /api/v1/community/groups/:groupId/join
 * Join a group
 */
router.post(
  '/groups/:groupId/join',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await communityService.joinGroup(req.params.groupId, req.userId!);
    return successResponse(res, result);
  })
);

/**
 * POST /api/v1/community/groups/:groupId/leave
 * Leave a group
 */
router.post(
  '/groups/:groupId/leave',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await communityService.leaveGroup(req.params.groupId, req.userId!);
    return successResponse(res, result);
  })
);

/**
 * POST /api/v1/community/groups/:groupId/invite
 * Invite user to group
 */
router.post(
  '/groups/:groupId/invite',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { invitee_id } = req.body;
    const invite = await communityService.inviteToGroup(
      req.params.groupId,
      req.userId!,
      invitee_id
    );
    return createdResponse(res, invite);
  })
);

/**
 * GET /api/v1/community/groups/:groupId/messages
 * Get group messages
 */
router.get(
  '/groups/:groupId/messages',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { limit = 50, offset = 0 } = req.query as any;
    const messages = await communityService.getGroupMessages(
      req.params.groupId,
      limit,
      offset
    );
    return successResponse(res, messages);
  })
);

/**
 * POST /api/v1/community/groups/:groupId/messages
 * Send message to group
 */
router.post(
  '/groups/:groupId/messages',
  authMiddleware,
  validateBody(createMessageSchema),
  asyncHandler(async (req, res) => {
    const message = await communityService.sendMessage(req.userId!, {
      ...req.body,
      group_id: req.params.groupId,
    });
    return createdResponse(res, message);
  })
);

/**
 * DELETE /api/v1/community/groups/:groupId
 * Delete group (owner or admin)
 */
router.delete(
  '/groups/:groupId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await communityService.deleteGroup(
      req.params.groupId,
      req.userId!,
      req.userRole === 'admin'
    );
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/community/admin/groups
 * Get all groups (admin only)
 */
router.get(
  '/admin/groups',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type } = req.query as any;
    const result = await communityService.getAllGroups(page, limit, type);
    return successResponse(res, result);
  })
);

export default router;
