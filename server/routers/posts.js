const express = require('express');
const router = express.Router();  
 const Post = require('../models/Post');
const User = require('../models/User');

// create a post
router.post('/', async (req, res)=>{
    const newPost = await Post(req.body);

    try {
        const savedPost = await newPost.save();
        return res.status(201).json({ post: savedPost, message: 'Post saved successfully' });
    } catch (error) {
        console.error('Error while creating post:', error);
        return res.status(500).json({ message: 'An error occurred while creating the post', error: error.message });
    }
});
//update a post
router.put('/:id', async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
        const updatedPost =  await post.updateOne({ $set: req.body }, {new:true});
          return res.status(200).json({ post: updatedPost, message: 'Post updated successfully' });
        }else{
          return res.status(403).json("you can only update your post")
        }
    } catch (error) {
        console.error('Error while updating post:', error);
        return res.status(500).json({ message: 'An error occurred while creating the post', error: error.message });
    }
    
})
//delete a post
router.delete('/:id', async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
        const deletedPost =  await post.deleteOne({ $set: req.body }, {new:true});
          return res.status(200).json({ post: deletedPost, message: 'Post deleted successfully' });
        }else{
          return res.status(403).json("you can only delete your post")
        }
    } catch (error) {
        console.error('Error while deleting post:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the post', error: error.message });
    }
    
})
//like a post
router.put("/:id/like", async (req, res) => {
    try {
      // Retrieve the post by ID
      const post = await Post.findById(req.params.id);  
      // Check if the post exists
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }  
      // Check if the user has already liked the post
      const isLiked = post.likes.includes(req.body.userId);  
      if (!isLiked) {
        // If not liked, add the user's ID to the likes array
        await post.updateOne({ $push: { likes: req.body.userId } });
        return res.status(200).json({ message: "Post has been liked" });
      } else {
        // If already liked, remove the user's ID from the likes array
        await post.updateOne({ $pull: { likes: req.body.userId } });
        return res.status(200).json({ message: "Post has been disliked" });
      }
    } catch (error) {
      console.error("Error while toggling like status:", error);
  
      // Return a server error response
      return res.status(500).json({
        message: "An error occurred while processing the request",
        error: error.message,
      });
    }
  });
  
  router.get('/:id', async (req, res) => {
    try {
      // Retrieve the post by ID
      const post = await Post.findById(req.params.id);  
      // Check if the post exists
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }  
      // Return the post data
      return res.status(200).json(post);
    } catch (error) {
      console.error("Error while retrieving the post:", error);  
      // Return a server error response
      return res.status(500).json({
        message: "An error occurred while retrieving the post",
        error: error.message,
      });
    }
  });
  
//get timeline posts
router.get('/timeline/all', async (req,res)=>{
     
    try {
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({ userId:currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId)=>{
             return  Post.find({userId:friendId})
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts))
    } catch (error) {
        res.status(400).json(error);
    }
})



 module.exports = router;