// Firebase integration for interviewer.html
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, onSnapshot, query, orderBy, where, addDoc, updateDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
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

// Update interviewer profile
function updateInterviewerProfile(user) {
    if (user && user.displayName) {
        const userNameElement = document.querySelector('.text-gray-900.dark\\:text-white.font-medium.text-sm');
        const userInitialsElement = document.querySelector('.w-10.h-10 span');
        
        if (userNameElement) userNameElement.textContent = user.displayName;
        if (userInitialsElement) {
            const initials = user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
            userInitialsElement.textContent = initials;
        }
    }
}

// Load applications from Firebase
function loadApplicationsFromFirebase(interviewerId) {
    const q = query(collection(db, 'applications'), where('interviewerId', '==', interviewerId), orderBy('createdAt', 'desc'));
    
    onSnapshot(q, (querySnapshot) => {
        const applicationsContainer = document.querySelector('#applicationsContainer');
        if (!applicationsContainer) return;
        
        applicationsContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            applicationsContainer.innerHTML = '<div class="text-center py-8 text-gray-500"><p>No applications yet</p></div>';
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const application = doc.data();
            addApplicationCard(application, doc.id);
        });
        
        updateInterviewerStats(interviewerId);
    });
}

// Add application card to UI
function addApplicationCard(application, id) {
    const applicationsContainer = document.querySelector('#applicationsContainer');
    if (!applicationsContainer) return;
    
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        scheduled: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    
    const cardElement = document.createElement('div');
    cardElement.className = 'bg-white p-6 rounded-lg shadow border';
    cardElement.setAttribute('data-application-id', id);
    cardElement.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="font-semibold text-gray-900">${application.candidateName}</h3>
                <p class="text-sm text-gray-600">${application.interviewTitle}</p>
                <p class="text-xs text-gray-500 mt-1">${new Date(application.createdAt?.toDate()).toLocaleDateString()}</p>
            </div>
            <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}">
                ${application.status}
            </span>
        </div>
        <div class="space-y-2 text-sm text-gray-600">
            <p><strong>Email:</strong> ${application.email}</p>
            <p><strong>Experience:</strong> ${application.experience} years</p>
            <p><strong>Skills:</strong> ${application.skills}</p>
        </div>
        <div class="mt-4 flex space-x-2">
            ${application.status === 'pending' ? `
                <button onclick="updateApplicationStatus('${id}', 'scheduled')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm">Schedule</button>
                <button onclick="updateApplicationStatus('${id}', 'cancelled')" class="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
            ` : ''}
            ${application.status === 'scheduled' ? `
                <button onclick="updateApplicationStatus('${id}', 'completed')" class="bg-green-600 text-white px-3 py-1 rounded text-sm">Complete</button>
            ` : ''}
        </div>
    `;
    
    applicationsContainer.appendChild(cardElement);
}

// Update application status
window.updateApplicationStatus = async function(applicationId, newStatus) {
    try {
        await updateDoc(doc(db, 'applications', applicationId), {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating application status:', error);
    }
};

// Update interviewer stats
function updateInterviewerStats(interviewerId) {
    const q = query(collection(db, 'applications'), where('interviewerId', '==', interviewerId));
    
    onSnapshot(q, (snapshot) => {
        let total = 0, pending = 0, scheduled = 0, completed = 0;
        
        snapshot.forEach(doc => {
            const app = doc.data();
            total++;
            if (app.status === 'pending') pending++;
            if (app.status === 'scheduled') scheduled++;
            if (app.status === 'completed') completed++;
        });
        
        const totalElement = document.getElementById('totalApplications');
        const pendingElement = document.getElementById('pendingApplications');
        const scheduledElement = document.getElementById('scheduledInterviews');
        const completedElement = document.getElementById('completedInterviews');
        
        if (totalElement) totalElement.textContent = total;
        if (pendingElement) pendingElement.textContent = pending;
        if (scheduledElement) scheduledElement.textContent = scheduled;
        if (completedElement) completedElement.textContent = completed;
    });
}

// Load interview slots created by this interviewer
function loadInterviewerSlots(interviewerId) {
    const q = query(collection(db, 'interviews'), where('createdBy', '==', interviewerId), orderBy('createdAt', 'desc'));
    
    onSnapshot(q, (querySnapshot) => {
        const slotsContainer = document.querySelector('#interviewerSlots');
        if (!slotsContainer) return;
        
        slotsContainer.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const interview = doc.data();
            addInterviewerSlot(interview, doc.id);
        });
    });
}

// Add interviewer slot to UI
function addInterviewerSlot(interview, id) {
    const slotsContainer = document.querySelector('#interviewerSlots');
    if (!slotsContainer) return;
    
    const slotElement = document.createElement('div');
    slotElement.className = 'bg-white p-4 rounded-lg border';
    slotElement.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <h4 class="font-medium text-gray-900">${interview.title}</h4>
                <p class="text-sm text-gray-600">${interview.company} - ${interview.position}</p>
                <p class="text-xs text-gray-500 mt-1">Duration: ${interview.duration} min</p>
            </div>
            <span class="text-xs px-2 py-1 bg-gray-100 rounded">${interview.type}</span>
        </div>
    `;
    
    slotsContainer.appendChild(slotElement);
}

// Create new interview slot
window.createInterviewSlot = async function(slotData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');
        
        const docRef = await addDoc(collection(db, 'interviews'), {
            ...slotData,
            createdBy: user.uid,
            createdAt: serverTimestamp()
        });
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating interview slot:', error);
        return { success: false, error: error.message };
    }
};

// Initialize Firebase data loading
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateInterviewerProfile(user);
            loadApplicationsFromFirebase(user.uid);
            loadInterviewerSlots(user.uid);
            updateInterviewerStats(user.uid);
        } else {
            window.location.href = 'index.html';
        }
    });
});