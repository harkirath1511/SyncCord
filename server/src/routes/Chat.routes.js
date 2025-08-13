import { Router } from "express";
import { deleteChat, getChatDetails, getMyChats } from "../controllers/Chat.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/getMyChats').get(verifyJwt, getMyChats);
router.route('/chatDetails/:id').get(verifyJwt, getChatDetails);
router.route('/deleteChat/:id').delete(verifyJwt, deleteChat);



export default router

