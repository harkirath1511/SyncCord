import { Router } from "express";
import { addMemebers, deleteChat, deleteMember, getChatDetails, getMessages, getMyChats, newGroupChat, sendAttachment } from "../controllers/Chat.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/createGrp').post(verifyJwt, newGroupChat);
router.route('/getMyChats').get(verifyJwt, getMyChats);
router.route('/addMem').patch(verifyJwt, addMemebers);
router.route('/removeMem').delete(verifyJwt, deleteMember);
router.route('/message').post(verifyJwt, upload.array('files', 5), sendAttachment);
router.route('/chatDetails/:id').get(verifyJwt, getChatDetails);
router.route('/deleteChat/:id').delete(verifyJwt, deleteChat);
router.route('/getMessages/:chatId').get(verifyJwt, getMessages);


export default router

