const express = require('express');
const router = express.Router();  
 const User = require('../models/User');
 const bcrypt = require('bcrypt');

//REGISTER
router.post("/register", async (req,res)=>{  
   try {
 // Validate input data
 const { username, email, password } = req.body;
 if (!username || !email || !password) {
   return res.status(400).json({ error: 'All fields are required.' });
 }
    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        error: 'Username or email is already in use. Please try a different one.',
      });
    }

    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
        username:req.body.username,
        email:req.body.email,
        password:hashedPassword
    });
    //save user and respond
    const user = await newUser.save();
    res.status(201).json({user,message: 'User registered successfully!',});
   } catch (error) {
    res.status(500).json({message: 'An error occurred while registering the user.',error: error.message, // Include the error message for better debugging
    });
   }
})

//LOGIN
router.post('/login', async (req,res)=>{
    try {
        // Find user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if password is valid
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Successful login response (consider sending a token here)
        res.status(200).json({
            message: "Login successful",
            user: {id: user._id,username: user.username,email: user.email               
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});




module.exports = router;
