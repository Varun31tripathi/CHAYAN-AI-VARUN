class ActivityManager {
    constructor() {
        this.activities = [];
        this.listeners = [];
        this.loadActivities();
    }

    // Load activities from localStorage
    loadActivities() {
        try {
            const stored = localStorage.getItem('chayanai_activities');
            this.activities = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading activities:', error);
            this.activities = [];
        }
    }

    // Save activities to localStorage
    saveActivities() {
        try {
            localStorage.setItem('chayanai_activities', JSON.stringify(this.activities));
        } catch (error) {
            console.error('Error saving activities:', error);
        }
    }

    // Add new activity
    addActivity(type, message, data = {}) {
        const activity = {
            id: Date.now() + Math.random(),
            type,
            message,
            timestamp: new Date().toISOString(),
            data,
            read: false
        };

        this.activities.unshift(activity);
        
        // Keep only last 50 activities
        if (this.activities.length > 50) {
            this.activities = this.activities.slice(0, 50);
        }

        this.saveActivities();
        this.notifyListeners();
        return activity;
    }

    // Get activities by type
    getActivitiesByType(types = []) {
        if (types.length === 0) return this.activities;
        return this.activities.filter(activity => types.includes(activity.type));
    }

    // Get unread count
    getUnreadCount() {
        return this.activities.filter(activity => !activity.read).length;
    }

    // Mark activity as read
    markAsRead(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (activity) {
            activity.read = true;
            this.saveActivities();
            this.notifyListeners();
            
            // Remove the activity from display after marking as read
            const activityElement = document.querySelector(`[onclick="activityManager.markAsRead('${activityId}')"]`);
            if (activityElement) {
                activityElement.style.opacity = '0';
                setTimeout(() => {
                    activityElement.remove();
                    // Check if no activities left
                    const container = document.getElementById('activityFeed');
                    if (container && container.children.length === 0) {
                        container.innerHTML = '<div class="text-center py-8 text-gray-500 dark:text-gray-400"><p>No new activities</p></div>';
                    }
                }, 300);
            }
        }
    }

    // Mark all as read
    markAllAsRead() {
        this.activities.forEach(activity => activity.read = true);
        this.saveActivities();
        this.notifyListeners();
    }

    // Add listener for activity updates
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Remove listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.activities);
            } catch (error) {
                console.error('Error in activity listener:', error);
            }
        });
    }

    // Interview-specific methods
    logInterviewStart(interviewType, questionCount) {
        return this.addActivity('interview_start', 
            `Started ${interviewType} practice interview with ${questionCount} questions`, 
            { interviewType, questionCount, startTime: new Date().toISOString() }
        );
    }

    logInterviewEnd(interviewType, score, duration) {
        return this.addActivity('interview_end', 
            `Completed ${interviewType} interview - Score: ${score}% (${duration})`, 
            { interviewType, score, duration }
        );
    }

    logViolation(violationType, description) {
        return this.addActivity('violation', 
            `Security violation: ${description}`, 
            { violationType, severity: 'high' }
        );
    }

    logQuestionAnswer(questionNumber, isCorrect, timeSpent) {
        return this.addActivity('question_answered', 
            `Question ${questionNumber} ${isCorrect ? 'answered correctly' : 'needs improvement'} (${timeSpent}s)`, 
            { questionNumber, isCorrect, timeSpent }
        );
    }

    logInterviewApplication(company, position) {
        return this.addActivity('application', 
            `Applied for ${position} at ${company}`, 
            { company, position }
        );
    }

    logInterviewScheduled(company, position, date, time) {
        return this.addActivity('scheduled', 
            `Interview scheduled: ${position} at ${company} on ${date} at ${time}`, 
            { company, position, date, time }
        );
    }

    // Get formatted time ago
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return time.toLocaleDateString();
    }

    // Get activity icon
    getActivityIcon(type) {
        const icons = {
            interview_start: '🎯',
            interview_end: '✅',
            violation: '⚠️',
            question_answered: '💭',
            application: '📝',
            scheduled: '📅',
            warning: '🚨',
            result: '📊',
            practice: '🎯'
        };
        return icons[type] || '📌';
    }

    // Get activity color class
    getActivityColorClass(type) {
        const colors = {
            interview_start: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20',
            interview_end: 'border-l-green-500 bg-green-50 dark:bg-green-900/20',
            violation: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
            question_answered: 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20',
            application: 'border-l-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
            scheduled: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20',
            warning: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
            result: 'border-l-green-500 bg-green-50 dark:bg-green-900/20',
            practice: 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20'
        };
        return colors[type] || 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }

    // Render activities to container
    renderActivities(containerId, filterTypes = []) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const activities = this.getActivitiesByType(filterTypes).filter(activity => !activity.read);
        
        if (activities.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-gray-500 dark:text-gray-400"><p>No new activities</p></div>';
            return;
        }

        let html = '';
        activities.forEach(activity => {
            const urgentClass = activity.type === 'violation' ? 'animate-pulse ring-2 ring-red-300' : '';
            
            html += `
                <div class="${this.getActivityColorClass(activity.type)} ${urgentClass} ring-1 ring-blue-300 border-l-4 p-4 rounded-r-lg hover:shadow-md transition-all cursor-pointer" 
                     onclick="activityManager.markAsRead('${activity.id}')">
                    <div class="flex items-start space-x-3">
                        <span class="text-lg">${this.getActivityIcon(activity.type)}</span>
                        <div class="flex-1">
                            <p class="text-sm text-gray-900 dark:text-white font-medium font-bold">${activity.message}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${this.getTimeAgo(activity.timestamp)}</p>
                            <div class="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Update activity badge
    updateActivityBadge(badgeId) {
        const badge = document.getElementById(badgeId);
        if (!badge) return;

        const unreadCount = this.getUnreadCount();
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Create global instance
window.activityManager = new ActivityManager();

// Auto-update activity displays every 30 seconds
setInterval(() => {
    if (document.getElementById('activityFeed')) {
        window.activityManager.renderActivities('activityFeed', ['interview_start', 'interview_end', 'violation', 'application', 'scheduled', 'warning', 'result', 'practice']);
    }
    if (document.getElementById('activityBadge')) {
        window.activityManager.updateActivityBadge('activityBadge');
    }
}, 30000);