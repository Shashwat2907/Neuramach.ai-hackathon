/**
 * STATE MANAGEMENT
 * Handles LocalStorage interactions and "Backend" logic.
 */

// Get all registered users (mock + signed-up)
function getAllUsers() {
    const stored = localStorage.getItem('neuraUsers');
    const signedUp = stored ? JSON.parse(stored) : [];
    const mock = mockUsers || [];
    const byEmail = {};
    mock.forEach(u => { byEmail[u.email.toLowerCase()] = u; });
    signedUp.forEach(u => { byEmail[u.email.toLowerCase()] = u; });
    return Object.values(byEmail);
}

const State = {
    // --- AUTHENTICATION ---
    login: (email, password) => {
        const all = getAllUsers();
        const user = all.find(u => (u.email || '').toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            localStorage.setItem('neuraUser', JSON.stringify(user));
            return { success: true, user: user };
        }
        return { success: false, message: "Invalid credentials" };
    },

    signup: (name, email, password) => {
        const all = getAllUsers();
        if (all.some(u => (u.email || '').toLowerCase() === email.toLowerCase())) {
            return { success: false, message: "An account with this email already exists." };
        }
        const newUser = {
            id: 'u' + Date.now(),
            email,
            password,
            name: name || email.split('@')[0],
            isAdmin: false,
            enrolledCourses: [],
            streak: 0,
            xp: 0,
            level: 1,
            progress: {},
            lastViewed: null
        };
        const signedUp = JSON.parse(localStorage.getItem('neuraUsers') || '[]');
        signedUp.push(newUser);
        localStorage.setItem('neuraUsers', JSON.stringify(signedUp));
        localStorage.setItem('neuraUser', JSON.stringify(newUser));
        localStorage.setItem('neuraUserType', 'new');
        return { success: true, user: newUser };
    },

    logout: () => {
        localStorage.removeItem('neuraUser');
        window.location.href = 'login.html';
    },

    getCurrentUser: () => {
        const stored = localStorage.getItem('neuraUser');
        return stored ? JSON.parse(stored) : null;
    },

    // Persist current user back (e.g. after updating progress/streak)
    saveCurrentUser: (user) => {
        if (!user) return;
        localStorage.setItem('neuraUser', JSON.stringify(user));
        const signedUp = JSON.parse(localStorage.getItem('neuraUsers') || '[]');
        const idx = signedUp.findIndex(u => (u.email || '').toLowerCase() === (user.email || '').toLowerCase());
        if (idx >= 0) signedUp[idx] = user;
        else {
            const mockIdx = mockUsers.findIndex(u => (u.email || '').toLowerCase() === (user.email || '').toLowerCase());
            if (mockIdx >= 0) mockUsers[mockIdx] = user;
        }
        if (idx >= 0) localStorage.setItem('neuraUsers', JSON.stringify(signedUp));
    },

    // --- COURSES (Unchanged + Enrolled Filter) ---
    getCourses: () => {
        const stored = localStorage.getItem('neuraCourses');
        return stored ? JSON.parse(stored) : mockCourses;
    },

    getCourse: (courseId) => {
        return State.getCourses().find(c => c.id === courseId);
    },

    getEnrolledCourses: () => {
        const user = State.getCurrentUser();
        if (!user || !user.enrolledCourses) return [];
        return State.getCourses().filter(c => user.enrolledCourses.includes(c.id));
    },

    // --- RESUME LOGIC (last viewed batch + lesson + timestamp) ---
    getResumeCourse: () => {
        const user = State.getCurrentUser();
        if (!user || !user.lastViewed) {
            const enrolled = State.getEnrolledCourses();
            return enrolled.length > 0 ? { course: enrolled[0], lessonId: null, timestamp: 0 } : null;
        }
        const course = State.getCourse(user.lastViewed.courseId);
        if (!course) return null;
        return {
            course,
            lessonId: user.lastViewed.lessonId || null,
            timestamp: user.lastViewed.timestamp || 0
        };
    },
    setLastViewed: (courseId, lessonId, timestamp) => {
        const user = State.getCurrentUser();
        if (!user) return;
        user.lastViewed = { courseId, lessonId, timestamp: timestamp || 0 };
        State.saveCurrentUser(user);
    },
    getVideoProgress: (courseId, lessonId) => {
        const user = State.getCurrentUser();
        const key = (courseId || '') + '_' + (lessonId || '');
        const stored = JSON.parse(localStorage.getItem('neuraVideoProgress') || '{}');
        return stored[key] || 0;
    },
    saveVideoProgress: (courseId, lessonId, timestamp) => {
        const key = (courseId || '') + '_' + (lessonId || '');
        const stored = JSON.parse(localStorage.getItem('neuraVideoProgress') || '{}');
        stored[key] = timestamp;
        localStorage.setItem('neuraVideoProgress', JSON.stringify(stored));
    },
    getLevelForCourse: (courseId) => {
        const user = State.getCurrentUser();
        if (!user || !user.progress) return 1;
        const pct = user.progress[courseId] || 0;
        if (pct >= 90) return 5;
        if (pct >= 70) return 4;
        if (pct >= 50) return 3;
        if (pct >= 25) return 2;
        return 1;
    },

    // --- ACTIONS ---
    enroll: (courseId) => {
        const user = State.getCurrentUser();
        if (!user) return false;
        if (!user.enrolledCourses) user.enrolledCourses = [];
        if (!user.progress) user.progress = {};
        if (!user.enrolledCourses.includes(courseId)) {
            user.enrolledCourses.push(courseId);
            user.progress[courseId] = user.progress[courseId] || 0;
            State.saveCurrentUser(user);
            const course = State.getCourse(courseId);
            State.logActivity('enrollment', (user.name || user.email) + ' enrolled in ' + (course ? course.title : courseId), { courseId, userEmail: user.email });
            return true;
        }
        return false;
    },

    // --- TASKS (synced with calendar) ---
    getTasks: () => {
        const stored = localStorage.getItem('neuraTasks');
        return stored ? JSON.parse(stored) : (typeof mockTasks !== 'undefined' ? mockTasks : []);
    },
    saveTasks: (tasks) => {
        localStorage.setItem('neuraTasks', JSON.stringify(tasks));
    },
    toggleTask: (taskId) => {
        const tasks = State.getTasks();
        const t = tasks.find(x => x.id === taskId);
        if (t) { t.completed = !t.completed; State.saveTasks(tasks); return true; }
        return false;
    },
    deleteTask: (taskId) => {
        const tasks = State.getTasks().filter(x => x.id !== taskId);
        State.saveTasks(tasks);
        return true;
    },
    addTask: (title, date) => {
        const tasks = State.getTasks();
        const id = 't' + Date.now();
        tasks.push({ id, title, date: date || new Date().toISOString().slice(0, 10), completed: false });
        State.saveTasks(tasks);
        return id;
    },

    // --- AI RESOURCES (per course + lesson: transcripts, quizzes, smart notes) ---
    saveAIResource: (courseId, lessonId, type, content) => {
        const key = courseId + '_' + (lessonId || 'general');
        let aiStore = JSON.parse(localStorage.getItem('neuraAIResources') || '{}');
        if (!aiStore[key]) aiStore[key] = [];
        aiStore[key].push({
            id: Date.now(),
            type: type,
            content: content,
            date: new Date().toLocaleDateString()
        });
        localStorage.setItem('neuraAIResources', JSON.stringify(aiStore));
    },
    getAIResources: (courseId, lessonId) => {
        const aiStore = JSON.parse(localStorage.getItem('neuraAIResources') || '{}');
        const key = courseId + '_' + (lessonId || 'general');
        return aiStore[key] || [];
    },

    // --- ADMIN UPLOAD ---
    addOrUpdateLesson: (courseId, lessonTitle, videoUrl) => {
        const courses = State.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return false;
        if (!course.lessons) course.lessons = [];
        let lesson = course.lessons.find(l => l.title === lessonTitle);
        if (lesson) {
            lesson.videoUrl = videoUrl;
        } else {
            course.lessons.push({
                id: "l" + Date.now(),
                title: lessonTitle,
                duration: "N/A",
                locked: false,
                videoUrl: videoUrl
            });
        }
        course.lessonsCount = course.lessons.length;
        localStorage.setItem('neuraCourses', JSON.stringify(courses));
        return true;
    },
    addCourseResource: (courseId, title, url, type) => {
        const courses = State.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return false;
        if (!course.resources) course.resources = [];
        course.resources.push({ title, type: type || 'pdf', url });
        localStorage.setItem('neuraCourses', JSON.stringify(courses));
        return true;
    },
    addCourse: (title) => {
        const courses = State.getCourses();
        const id = 'c' + Date.now();
        courses.push({
            id, title, instructor: 'Instructor', thumbnail: '📚', tags: [], rating: 0, lessonsCount: 0,
            description: '', resources: [], announcements: [], lessons: []
        });
        localStorage.setItem('neuraCourses', JSON.stringify(courses));
        return { id, title };
    },
    deleteCourse: (courseId) => {
        const courses = State.getCourses().filter(c => c.id !== courseId);
        localStorage.setItem('neuraCourses', JSON.stringify(courses));
        return true;
    },
    getStudentCount: (courseId) => {
        const all = getAllUsers();
        return all.filter(u => !u.isAdmin && (u.enrolledCourses || []).includes(courseId)).length;
    },
    getTotalStudents: () => getAllUsers().filter(u => !u.isAdmin).length,
    getEnrolledUsersForBatch: (courseId) => {
        return getAllUsers().filter(u => !u.isAdmin && (u.enrolledCourses || []).includes(courseId));
    },
    addAnnouncement: (courseId, text, opts) => {
        const courses = State.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return false;
        if (!course.announcements) course.announcements = [];
        course.announcements.push({
            date: new Date().toLocaleDateString(),
            text,
            pdfUrl: (opts && opts.pdfUrl) || null,
            link: (opts && opts.link) || null,
            timestamp: Date.now()
        });
        localStorage.setItem('neuraCourses', JSON.stringify(courses));
        return true;
    },
    addAnnouncementToBatches: (courseIds, text, opts) => {
        if (!Array.isArray(courseIds) || courseIds.length === 0) return 0;
        let count = 0;
        courseIds.forEach(cid => {
            if (State.addAnnouncement(cid, text, opts)) count++;
        });
        const names = State.getCourses().filter(c => courseIds.includes(c.id)).map(c => c.title).join(', ');
        State.logActivity('broadcast', 'Broadcast to ' + courseIds.length + ' batch(es): ' + (names.slice(0, 50) + (names.length > 50 ? '…' : '')), { courseIds });
        return count;
    },
    deleteAnnouncement: (courseId, timestamp) => {
        const courses = State.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course || !course.announcements) return false;
        course.announcements = course.announcements.filter(a => a.timestamp !== timestamp);
        localStorage.setItem('neuraCourses', JSON.stringify(courses));
        return true;
    },
    getBlockedForBatch: (courseId) => {
        const raw = localStorage.getItem('neuraBlocked');
        const obj = raw ? JSON.parse(raw) : {};
        return obj[courseId] || [];
    },
    blockStudent: (courseId, userEmail) => {
        const raw = localStorage.getItem('neuraBlocked');
        const obj = raw ? JSON.parse(raw) : {};
        if (!obj[courseId]) obj[courseId] = [];
        if (!obj[courseId].includes(userEmail)) obj[courseId].push(userEmail);
        localStorage.setItem('neuraBlocked', JSON.stringify(obj));
        return true;
    },
    unblockStudent: (courseId, userEmail) => {
        const raw = localStorage.getItem('neuraBlocked');
        const obj = raw ? JSON.parse(raw) : {};
        if (!obj[courseId]) return false;
        obj[courseId] = obj[courseId].filter(e => e !== userEmail);
        localStorage.setItem('neuraBlocked', JSON.stringify(obj));
        return true;
    },
    isBlocked: (courseId, userEmail) => {
        return (State.getBlockedForBatch(courseId) || []).includes(userEmail);
    },
    // --- ACTIVITY FEED (for admin Recent Updates) ---
    logActivity: (type, message, meta) => {
        const feed = JSON.parse(localStorage.getItem('neuraActivityFeed') || '[]');
        feed.unshift({ time: Date.now(), type, message, meta: meta || {} });
        localStorage.setItem('neuraActivityFeed', JSON.stringify(feed.slice(0, 100)));
    },
    getActivityFeed: (limit) => {
        const feed = JSON.parse(localStorage.getItem('neuraActivityFeed') || '[]');
        return feed.slice(0, limit || 20);
    }
};