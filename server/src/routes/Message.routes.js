import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { sendAttachment, getMessages } from "../controllers/Message.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/message').post(verifyJwt, upload.array('files', 5), sendAttachment);
router.route('/getMessages/:chatId').get(verifyJwt, getMessages);


export default router;
