import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import {v2 as cloudinary} from "cloudinary"

export const createPost = async (req, res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;

        const userId = req.user._id.toString();

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        if(!text && !img){
            return res.status(400).json({error: "Post must have text or image"});
        }

        if(img){
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text,
            img
        });

        await newPost.save();
        res.status(201).json({newPost});
    } catch (error) {
        console.log("Error in create post ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const {id} = req.params;

        const post = await Post.findById(id);

        if(!post) {
            return res.status(404).json({error: "Post not found"});
        }

        const isAlreadyLiked = post.likes.includes(userId);

        if(isAlreadyLiked){
            await Post.updateOne({_id:id}, {$pull: {likes: userId}});
            await User.updateOne({_id:userId}, {$pull: {likedPosts: id}});

            const updateLikes = post.likes.filter((id) => id.toString() !== userId.toString());

            return res.status(200).json(updateLikes);
        }else{
            post.likes.push(userId);
            await User.updateOne({_id:userId}, {$push: {likedPosts: id}});
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            });

            await notification.save();

            return res.status(200).json(post.likes);
        }
    } catch (error) {
        console.log("Error in like unlike ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            return res.status(400).json({error: "Text field is required"});
        }

        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        const comment = {
            text: text,
            user: userId
        };

        post.comments.push(comment);
        await post.save();

        const notification = new Notification({
            from: userId,
            to: post.user,
            type: "comment"
        });

        await notification.save();

        const populatedPost = await Post.findById(postId).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(populatedPost);
    } catch (error) {
        console.log("Error in comment on post ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error: "You are not authorised to delete this post"});
        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);

        return res.status(200).json({message: "Post deleted successfully"});
    } catch (error) {
        console.log("Error in delete post ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        if(posts.length === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getAllPosts ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getLikedPost = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
            path:"user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        });

        return res.status(200).json(likedPosts);
    } catch (error) {
        console.log("Error in getLikedPost ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const following = user.following;

        const feedPosts = await Post.find({user: {$in: following}}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(feedPosts);
    } catch (error) {
        console.log("Error in getFollowingPosts ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username});
        
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        
        const posts = await Post.find({$or: [{user: user._id}, {retweets: user._id}]}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getUserPosts ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const retweetsPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        
        const {id} = req.params;

        const post = await Post.findById(id);
        if(!post) {
            return res.status(404).json({error: "Post not found"});
        }

        const isAlreadyretweetsed = post.retweets.includes(userId);

        if(isAlreadyretweetsed){
            await Post.updateOne({_id:id}, {$pull: {retweets: userId}});

            const updateretweets = post.retweets.filter((id) => id.toString() !== userId.toString());

            return res.status(200).json(updateretweets);
        }else{
            post.retweets.push(userId);
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "retweet"
            });

            await notification.save();

            return res.status(200).json(post.retweets);
        }
    } catch (error) {
        console.log("Error in getUserPosts ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}