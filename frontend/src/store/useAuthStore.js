import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';


const BASE_URL = import.meta.env.MODE === "development" ? 'http://localhost:5001' : '/';

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({
                authUser: res.data,
            });
            get().connectSocket(); // Connect to socket after checking auth
        } catch (error) {
            console.error('Error checking authentication:', error);
            set({
                authUser: null,
            });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signUp: async ({ fullName, email, password }) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', { fullName, email, password });
            set({
                authUser: res.data,
            });
            toast.success('Account created successfully!');

            get().connectSocket(); // Connect to socket after signup
        }
        catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create account');
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            toast.success('Logged out successfully!');
            get().disConnectSocket(); // Disconnect socket on logout
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error(error.response?.data?.message || 'Failed to log out');
        }
    },

    login: async ({ email, password }) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', { email, password });
            set({
                authUser: res.data,
            });
            toast.success('Logged in successfully!');

            get().connectSocket(); // Connect to socket after login
        } catch (error) {
            console.error('Error logging in:', error);
            toast.error(error.response?.data?.message || 'Failed to log in');
        } finally {
            set({ isLoggingIn: false });
        }
    },
    updateProfile: async ({ profilePic }) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile', { profilePic });
            set({
                authUser: res.data,
            });
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if(!authUser || get().socket?.connected) {
            return;
        }
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id, // Assuming userId is available in authUser
            },
        });

        socket.connect();

        // socket.on('connect', () => {
        //     console.log('Socket connected:', socket.id);
        // });

        // socket.on('disconnect', () => {
        //     console.log('Socket disconnected:', socket.id);
        // });

        socket.on('getOnlineUsers', (users) => {
            set({ onlineUsers: users });
        });

        set({ socket });
    },
    disConnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect();
    }
}));