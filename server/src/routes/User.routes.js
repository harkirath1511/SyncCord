import { Router } from "express";
import {  changeUserPassword, getAllUsers, getMyFriends, getUserInfo, loginUser, logoutUser, registerUser, updateImgs, updateUserDetails } from "../controllers/User.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJwt } from '../middlewares/auth.middleware.js'

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImg",
            maxCount :1
        }
    ]),
    registerUser
);
router.route('/login').post(loginUser);
router.route('/logout').get(verifyJwt, logoutUser);
router.route('/change-password').post(verifyJwt, changeUserPassword);
router.route('/update-profile').post(verifyJwt, updateUserDetails);
router.route('/update-avatar').patch( verifyJwt, 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]), 
    updateImgs
);
router.route('/user-details').get(verifyJwt, getUserInfo);
router.route('/getAllFriends').get(verifyJwt, getMyFriends);
router.route('/getAllUsers').get(getAllUsers);


export default router
