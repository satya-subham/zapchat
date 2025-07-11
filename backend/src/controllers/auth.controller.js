import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  if(req.body == undefined){
    return res.status(400).json({ message: 'Please provide user data' });
  }
  const { email, fullName, password, profilePic } = req.body;
  try {
    if(password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if(!email.length || !fullName.length || !password.length) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }
    // check if user already exists
    const user = await User.findOne({ email });
    if(user){
      return res.status(400).json({ message: 'User already exists'});
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create new user
    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
      profilePic
    });
    // save user to database
    if(newUser){
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        message: 'User created successfully',
        user: {
          _id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          profilePic: newUser.profilePic
        }
      });
    }else{
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ message: 'Internal server error' });
    
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if(!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    // check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    // generate jwt token here
    generateToken(user._id, res);
    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Internal server error' });
    
  }
}

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
      sameSite: "strict", // Helps prevent CSRF attacks
      maxAge: 0 // Set cookie to expire immediately
    });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error.message);
    res.status(500).json({ message: 'Internal server error' });
    
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id; // Get user ID from the request object
    if(!profilePic) {
      return res.status(400).json({ message: 'Please provide a profile picture' });
    }
    // Update user profile picture
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    res.status(200).json({
      message: 'Profile updated successfully',
      updatedUser
    })
  } catch (error) {
    console.error('Error during profile update:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error('Error during authentication check:', error.message);
    res.status(500).json({ message: 'Internal server error' });
    
  }
};