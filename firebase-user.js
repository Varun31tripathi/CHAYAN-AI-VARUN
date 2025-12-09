// Firebase integration for user.html
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, onSnapshot, query, orderBy, where, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyDUcG95XK9gg3PBKqYZVBYk5rarf-vExck",
    authDomain: "chayan2-platform.firebaseapp.com",
    projectId: "chayan2-platform",
    storageBucket: "chayan2-platform.firebasestorage.app",
    messagingSenderId: "694117760821",
    appId: "1:694117760821:web:68d2b2dee6fd158984567c",
    measurementId: "G-PB84HY01ED"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Update user profile in sidebar
function updateUserProfile(user) {
    if (user && user.displayName) {
        const userNameElement = document.querySelector('.text-gray-900.dark\\:text-white.font-medium.text-sm');
        const userInitialsElement = document.querySelector('.w-10.h-10 span');
        
        if (userNameElement) {
            userNameElement.textContent = user.displayName;
        }
        
        if (userInitialsElement) {
            const initials = user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
            userInitialsElement.textContent = initials;
        }
    }
}

// Load interviews from Firebase with proper filtering
function loadInterviewsFromFirebase() {
    const q = query(
        collection(db, 'interviews'), 
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc')
    );
    
    onSnapshot(q, (querySnapshot) => {
        const slotsContainer = document.querySelector('#availableSlots');
        if (!slotsContainer) return;
        
        // Clear existing content
        slotsContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            slotsContainer.innerHTML = '<div class="text-center py-8 text-gray-500"><p>No available interviews</p></div>';
            return;
        }
        
        // Store interviews in a Map for better management
        const availableInterviews = new Map();
        
        querySnapshot.forEach((doc) => {
            const interviewData = doc.data();
            const normalizedInterview = normalizeInterviewData(interviewData, doc.id);
            availableInterviews.set(doc.id, normalizedInterview);
            addInterviewSlot(interviewData, doc.id);
        });
        
        // Store in window for global access
        window.availableInterviews = availableInterviews;
        
        // Update stats will be called from auth state change
    }, (error) => {
        console.error('Error loading interviews:', error);
        const slotsContainer = document.querySelector('#availableSlots');
        if (slotsContainer) {
            slotsContainer.innerHTML = '<div class="text-center py-8 text-red-500"><p>Error loading interviews</p></div>';
        }
    });
}

// Load headlines from Firebase for notifications
function loadHeadlinesFromFirebase() {
    const q = query(collection(db, 'headlines'), orderBy('createdAt', 'desc'));
    
    onSnapshot(q, (querySnapshot) => {
        const notificationsContainer = document.querySelector('#notifications');
        if (!notificationsContainer) return;
        
        // Clear existing content
        notificationsContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            notificationsContainer.innerHTML = '<div class="text-center py-8 text-gray-500"><p>No notifications</p></div>';
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const headline = doc.data();
            addHeadlineNotification(headline, doc.id);
        });
    });
}

// Add headline notification to the UI
function addHeadlineNotification(headline, id) {
    const notificationsContainer = document.querySelector('#notifications');
    if (!notificationsContainer) return;
    
    const notificationElement = document.createElement('div');
    notificationElement.className = 'border-l-4 border-blue-500 bg-blue-50 p-4 rounded-lg';
    notificationElement.setAttribute('data-headline-id', id);
    notificationElement.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
            </div>
            <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">${headline.title}</h3>
                <p class="text-sm text-blue-700 mt-1">${headline.content}</p>
                <p class="text-xs text-blue-600 mt-2">${new Date(headline.createdAt?.toDate()).toLocaleDateString()}</p>
            </div>
        </div>
    `;
    
    notificationsContainer.appendChild(notificationElement);
}

// Update stats from Firebase with user-specific data
function updateStats(userId) {
    const availableSlots = document.querySelectorAll('#availableSlots [data-firebase-id]').length;
    const availableElement = document.getElementById('availableCount');
    if (availableElement) availableElement.textContent = availableSlots;
    
    if (!userId) return;
    
    const appsQuery = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
    onSnapshot(appsQuery, (snapshot) => {
        let upcoming = 0, completed = 0;
        snapshot.forEach(doc => {
            const app = doc.data();
            if (app.userId === userId) {
                if (app.status === 'pending' || app.status === 'scheduled') upcoming++;
                if (app.status === 'completed') completed++;
            }
        });
        
        const upcomingElement = document.getElementById('upcomingCount');
        const completedElement = document.getElementById('completedCount');
        const successElement = document.getElementById('successRate');
        
        if (upcomingElement) upcomingElement.textContent = upcoming;
        if (completedElement) completedElement.textContent = completed;
        if (successElement) {
            successElement.textContent = completed > 0 ? Math.round((completed / (upcoming + completed)) * 100) + '%' : '0%';
        }
    });
}

// Normalize interview data structure
function normalizeInterviewData(interview, id) {
    return {
        id: id,
        title: interview.title || 'Interview Session',
        company: interview.company || 'Company',
        position: interview.position || 'Position',
        duration: parseInt(interview.duration) || 60,
        type: interview.type || 'technical',
        date: interview.date || new Date().toISOString().split('T')[0],
        status: interview.status || 'available',
        skills: interview.skills || [],
        notes: interview.notes || '',
        createdAt: interview.createdAt || null
    };
}

// Add interview slot to the UI
function addInterviewSlot(interviewData, id) {
    const slotsContainer = document.querySelector('#availableSlots');
    if (!slotsContainer) return;
    
    // Normalize the interview data
    const interview = normalizeInterviewData(interviewData, id);
    
    const typeColors = {
        technical: 'border-blue-200 bg-blue-50',
        behavioral: 'border-purple-200 bg-purple-50',
        'system-design': 'border-green-200 bg-green-50',
        coding: 'border-orange-200 bg-orange-50',
        hr: 'border-pink-200 bg-pink-50'
    };
    
    const buttonColors = {
        technical: 'bg-blue-600 hover:bg-blue-700',
        behavioral: 'bg-purple-600 hover:bg-purple-700',
        'system-design': 'bg-green-600 hover:bg-green-700',
        coding: 'bg-orange-600 hover:bg-orange-700',
        hr: 'bg-pink-600 hover:bg-pink-700'
    };
    
    const slotElement = document.createElement('div');
    slotElement.className = `${typeColors[interview.type] || 'border-gray-200 bg-gray-50'} p-4 rounded-lg`;
    slotElement.setAttribute('data-firebase-id', interview.id);
    slotElement.setAttribute('data-interview-status', interview.status);
    
    slotElement.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div>
                <p class="font-medium text-gray-900">${interview.title}</p>
                <p class="text-sm text-gray-600">${interview.company} - ${interview.position}</p>
            </div>
            <button class="book-btn ${buttonColors[interview.type] || 'bg-gray-600 hover:bg-gray-700'} text-white px-3 py-1 rounded text-xs font-medium" 
                    data-interview-id="${interview.id}" 
                    data-interview="${interview.title}">
                Apply
            </button>
        </div>
        <div class="flex items-center text-sm text-gray-500 space-x-4">
            <span>📅 ${interview.date}</span>
            <span>⏱️ ${interview.duration} min</span>
            <span class="text-xs px-2 py-1 rounded ${interview.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                ${interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
            </span>
        </div>
    `;
    
    // Add event listener to the new apply button
    const applyBtn = slotElement.querySelector('.book-btn');
    applyBtn.addEventListener('click', () => {
        const interviewId = applyBtn.getAttribute('data-interview-id');
        const interviewTitle = applyBtn.getAttribute('data-interview');
        if (window.openBookModal) {
            window.openBookModal(interviewTitle, interviewId);
        }
    });
    
    slotsContainer.insertBefore(slotElement, slotsContainer.firstChild);
}

// Store interview application to Firebase with proper data structure
window.storeInterviewApplication = async function(applicationData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        // Get interview details if interview ID is provided
        let interviewDetails = null;
        if (applicationData.interviewId && window.availableInterviews) {
            interviewDetails = window.availableInterviews.get(applicationData.interviewId);
        }
        
        const applicationRecord = {
            ...applicationData,
            userId: user.uid,
            userEmail: user.email,
            candidateName: user.displayName || user.email,
            createdAt: serverTimestamp(),
            status: 'pending',
            // Include normalized interview details
            interviewDetails: interviewDetails ? {
                id: interviewDetails.id,
                title: interviewDetails.title,
                company: interviewDetails.company,
                position: interviewDetails.position,
                type: interviewDetails.type,
                duration: interviewDetails.duration
            } : null
        };
        
        const docRef = await addDoc(collection(db, 'applications'), applicationRecord);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error storing application: ', error);
        return { success: false, error: error.message };
    }
};

// Initialize Firebase data loading
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateUserProfile(user);
            loadInterviewsFromFirebase();
            loadHeadlinesFromFirebase();
            updateStats(user.uid);
        } else {
            window.location.href = 'index.html';
        }
    });
});