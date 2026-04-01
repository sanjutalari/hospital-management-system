import express from 'express';
import { getConversation, getConversationList } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.get('/conversations', authenticate, getConversationList);
router.get('/:userId', authenticate, getConversation);
export default router;