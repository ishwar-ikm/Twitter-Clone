import express from "express";
import { followUnfollowUser, getFollowersFollowing, getSearchUser, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/profile/:username/connections", protectRoute, getFollowersFollowing);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.get("/searchUser/:searchTerm", protectRoute, getSearchUser);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);

export default router;