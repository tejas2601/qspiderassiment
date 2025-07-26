import express from 'express';
import { register, login, updatePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.put('/update-password', authenticate, updatePassword);

export default router;