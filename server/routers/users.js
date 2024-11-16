const express = require('express');
const User = require('../models/User');
const bcrypt = require("bcrypt");
const router = express.Router();  
 
// Update user
router.put('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (error) {
                return res.status(500).json({ message: 'Error while hashing password', error: error.message });
            }
        }
        try {
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true } // Return the updated document
            );
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({ message: 'Account has been updated', user: updatedUser });
        } catch (error) {
            return res.status(500).json({ message: 'Error while updating user', error: error.message });
        }
    } else {
        return res.status(403).json({ message: 'You can only update your own account' });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        // Check if the requesting user matches the target user or is an admin
        if (req.body.userId === req.params.id || req.body.isAdmin) {
            const deletedUser = await User.findByIdAndDelete(req.params.id);
            
            // Check if the user was found and deleted
            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Return a success response without sending sensitive user data
            return res.status(200).json({ message: 'Account has been deleted successfully' });
        } else {
            return res.status(403).json({ message: 'You can only delete your own account' });
        }
    } catch (error) {
        console.error('Error while deleting user:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the user', error: error.message });
    }
});
//get user
router.get('/:id', async (req,res)=>{
    try {
        const user = await User.findById(req.params.id);
        const {password, updatedAt, ...other} = user._doc;
          // Check if the user was found and deleted
          if (!user) {
            return res.status(404).json({ message: 'User not found' });        }
        res.status(200).json(other);
    } catch (error) {
        console.error('Error while deleting user:', error);
        return res.status(500).json({ message: 'An error occurred while finding the user', error: error.message });
    }
})
//follow user
router.put('/:id/follow', async (req,res)=>{
         if (req.body.userId !== req.params.id) {
            try {
                const user = await User.findById(req.params.id);
                const currentUser = await User.findById(req.body.userId);
                if (!user.followers.includes(req.body.userId)) {
                    await user.updateOne({$push:{followers:req.body.userId}});
                    await currentUser.updateOne({$push:{followings: req.params.id}})
                    return res.status(200).json("user have been followed")
                } else {
                    res.status(403).json("you allready follow this user");
                }
            } catch (error) {
                return res.status(500).json({ message: 'An error occurred while finding the user', error: error.message });
            }
         }else{
        return res.status(403).res("you can not follow yourself")
         }
})
//unfollow user
router.put('/:id/unfollow', async (req,res)=>{
    if (req.body.userId !== req.params.id) {
       try {
           const user = await User.findById(req.params.id);
           const currentUser = await User.findById(req.body.userId);
           if (user.followers.includes(req.body.userId)) {
               await user.updateOne({$pull:{followers:req.body.userId}});
               await currentUser.updateOne({$pull:{followings: req.params.id}})
               return res.status(200).json("user has been unfollowed")
           } else {
               res.status(403).json("you donot follow this user");
           }
       } catch (error) {
           return res.status(500).json({ message: 'An error occurred while finding the user', error: error.message });
       }
    }else{
   return res.status(403).res("you can not unfollow yourself")
    }
})


module.exports = router;
