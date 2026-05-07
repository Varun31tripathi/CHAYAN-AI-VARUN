import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';
import { updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Authentication functions
export const authService = {
    // Sign up new user
    async signUp(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Set display name on Firebase profile
            await updateProfile(user, { displayName: displayName });
            
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: displayName
            }));
            
            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Sign in existing user
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Wait for profile to be loaded
            await user.reload();
            const displayName = user.displayName || user.email.split('@')[0];
            
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: displayName
            }));
            
            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Sign out user
    async signOut() {
        try {
            await signOut(auth);
            localStorage.removeItem('user');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get current user
    getCurrentUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    // Listen to auth state changes
    onAuthStateChange(callback) {
        return onAuthStateChanged(auth, (user) => {
            if (user) {
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email
                };
                localStorage.setItem('user', JSON.stringify(userData));
                callback(userData);
            } else {
                localStorage.removeItem('user');
                callback(null);
            }
        });
    }
};