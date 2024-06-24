import Notification from "../models/notification.model.js";
import User from "../models/user.model.js"
import {v2 as cloudinary} from "cloudinary" 
import bcrypt from "bcryptjs"
import { validateEmail } from "../utils/validateEmail.js";


export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile ", error.message);
        res.status(500).json({ error: error.message });
    }
}

export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;

		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
		]);

		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToFollowUnfollow = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === currentUser._id.toString()) {
            return res.status(400).json({ error: "Cann't follow or unfollow self" });
        }

        if (!userToFollowUnfollow || !currentUser) {
            res.status(404).json({ error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            
            res.status(200).json({message: "User unfollowed successfully"});
        } else {
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToFollowUnfollow._id
            });

            await newNotification.save(); 

            res.status(200).json({message: "User followed successfully"});
        }
    } catch (error) {
        console.log("Error in followUnfollowUser ", error.message);
        res.status(500).json({ error: error.message });
    }
}

export const updateUser = async (req, res) => {
    const {username, fullName, currentPassword, newPassword, email, bio, link} = req.body;

    let {profileImg, coverImg} = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findOne(userId);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        if((!currentPassword && newPassword) || (currentPassword && !newPassword)){
            return res.status(404).json({error: "Provide both current password as well as new password"});
        }

        if(currentPassword && newPassword){
            const isMatched = await bcrypt.compare(currentPassword, user.password);

            if(!isMatched){
                return res.status(400).json({error: "Password is incorrect"});
            }

            if(newPassword.length < 6) {
                return res.status(400).json({error: "Password must be minimum of 6 characters"});
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        if(profileImg){
            if(user.profileImg){
                // we can destroy the image using a ID which is present at the end of the URL
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadRes = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadRes.secure_url;
        }

        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const coverRes = await cloudinary.uploader.upload(coverImg);
            coverImg = coverRes.secure_url;
        }

        if(email && !validateEmail(email)){
            return res.status(400).json({error: "Invalid email"});
        }

        const existingUser = await User.findOne({ username });
        if(existingUser){
            return res.status(400).json({error: "Username already exists"});
        }

        user.username = username || user.username;
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.coverImg = coverImg || user.coverImg;
        user.profileImg = profileImg || user.profileImg;

        user = await user.save();
        user.password = null;

        return res.status(201).json(user);
    } catch (error) {
        console.log("Error in update profile ", error.message);
        res.status(500).json({ error: error.message });
    }
}