import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getAllGrps, addMemebers, deleteMembers, newGroupChat } from "../controllers/Group.controller.js";

const router = Router();

router.route('/getAllGrps').get(verifyJwt, getAllGrps);
router.route('/addMem').patch(verifyJwt, addMemebers);
router.route('/removeMem').delete(verifyJwt, deleteMembers);
router.route('/createGrp').post(verifyJwt, newGroupChat);


export default router; 
