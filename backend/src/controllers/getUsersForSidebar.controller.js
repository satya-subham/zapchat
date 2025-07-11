import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id; // Assuming user ID is stored in req.user

        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
            .select("-password") // Exclude password field
        res.status(200).json(filteredUsers);    
    } catch (error) {
        console.error("Error fetching users for sidebar:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
};

export const getMessages = async (req, res) => {
    try {
        const {id: userToChatId } = req.params; // Extract user ID from request parameters

        const senderId = req.user._id; // Assuming user ID is stored in req.user

        const messages = await Message.find({ $or: [{ senderId, receiverId: userToChatId }, { senderId: userToChatId, receiverId: senderId }] });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
}

export const sendMessages = async (req, res) => {
    try {
        const { text, image } = req.body; // Extract text and image from request body
        const { id: receiverId } = req.params; // Extract user ID from request parameters
        const senderId = req.user._id; // Assuming user ID is stored in req.user

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url; // Get the secure URL of the uploaded image
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl // Store the image URL if provided
        });

        await newMessage.save(); // Save the message to the database
        
        // todo : realtime functionality goes here => socket.io
        const receiverSocketId = getReceiverSocketId(receiverId); // Function to get the receiver's socket ID
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage); // Emit the new message to the receiver
        }

        
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
};