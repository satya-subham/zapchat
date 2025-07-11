import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { getUsersForSidebar, getMessages, sendMessages } from '../controllers/getUsersForSidebar.controller.js';

const router = express.Router();

router.get('/users', protectRoute, getUsersForSidebar);
router.get('/users/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, sendMessages);

export default router;