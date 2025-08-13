import { Router } from "express";
import { sendRequest, acceptOrRejectReq, getMyRequests } from "../controllers/Request.controller.js";
import {verifyJwt } from '../middlewares/auth.middleware.js'

const router = Router();


router.route('/sendReq').post(verifyJwt, sendRequest);
router.route('/acceptReq').patch(verifyJwt, acceptOrRejectReq);
router.route('/getMyReqs').get(verifyJwt , getMyRequests);

export default router;
