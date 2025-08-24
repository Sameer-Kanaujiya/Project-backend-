import {Router} from 'express';
import { registerUser } from '../controllers/user.controller';

const router = Router()

router.Router("/register").post(registerUser)


export default router