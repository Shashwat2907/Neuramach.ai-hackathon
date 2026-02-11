/**
 * STATE MANAGEMENT
 * Handles LocalStorage interactions and "Backend" logic.
 */

const State = {
    // --- AUTHENTICATION ---
    login: (email, password) => {
        const user = mockUsers.find(u => u.email === email && u.password === password);
        if (user) {
            // "Session" is just storing the user object in localStorage
            localStorage.setItem('neuraUser', JSON.stringify(user));
            return { success: true, user: user };
        }
        return { success: false, message: "Invalid credentials" };
    },

    logout: () => {
        localStorage.removeItem('neuraUser');
        window.location.href = 'login.html';
    },

    getCurrentUser: () => {
        const stored = localStorage.getItem('neuraUser');
        return stored ? JSON.parse(stored) : null;
    },

    // --- COURSES ---
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

    // --- ACTIONS ---
    enroll: (courseId) => {
        const user = State.getCurrentUser();
        if (!user) return false;

        if (!user.enrolledCourses.includes(courseId)) {
            user.enrolledCourses.push(courseId);
            // Initialize progress
            if (!user.progress) user.progress = {};
            user.progress[courseId] = 0;

            // Save to localStorage
            localStorage.setItem('neuraUser', JSON.stringify(user));
            return true;
        }
        return false; // Already enrolled
    },

    updateProgress: (courseId, percent) => {
        const user = State.getCurrentUser();
        if (!user) return;

        if (!user.progress) user.progress = {};
        user.progress[courseId] = percent;

        localStorage.setItem('neuraUser', JSON.stringify(user));
    },

    // --- TASKS & CALENDAR ---
    getTasks: () => {
        // In a real app we might store these in localStorage too
        const stored = localStorage.getItem('neuraTasks');
        return stored ? JSON.parse(stored) : mockTasks; // mockTasks checks data.js
    },

    toggleTask: (taskId) => {
        const tasks = State.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            localStorage.setItem('neuraTasks', JSON.stringify(tasks));
            return true;
        }
        return false;
    },

    addTask: (title, date) => {
        const tasks = State.getTasks();
        const newTask = {
            id: "t" + (tasks.length + 1) + Date.now(), // Ensure unique ID
            title: title,
            date: date,
            completed: false,
            type: "task"
        };
        tasks.push(newTask);
        localStorage.setItem('neuraTasks', JSON.stringify(tasks));
        return true;
    },

    deleteTask: (id) => {
        let tasks = State.getTasks();
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('neuraTasks', JSON.stringify(tasks));
        return true;
    },

    // --- NOTES ---
    saveNote: (lessonId, text) => {
        const user = State.getCurrentUser();
        if (!user) return;

        if (!user.notes) user.notes = {};
        if (!user.notes[lessonId]) user.notes[lessonId] = [];

        user.notes[lessonId].push({
            text: text,
            timestamp: Date.now()
        });

        localStorage.setItem('neuraUser', JSON.stringify(user));
    },

    getNotes: (lessonId) => {
        const user = State.getCurrentUser();
        if (!user || !user.notes || !user.notes[lessonId]) return [];
        return user.notes[lessonId];
    },

    // --- ADMIN UPLOAD ---
    // --- ADMIN UPLOAD ---
    addOrUpdateLesson: (courseId, lessonTitle, videoUrl) => {
        const courses = State.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return false;

        // Check if lesson exists by title (fuzzy match?)
        let lesson = course.lessons.find(l => l.title === lessonTitle);

        if (lesson) {
            // Update existing
            lesson.videoUrl = videoUrl;
        } else {
            // Create New Lesson
            lesson = {
                id: "l" + Date.now(), // Simple unique ID
                title: lessonTitle,
                duration: "N/A", // Placeholder
                locked: false,
                videoUrl: videoUrl
            };
            course.lessons.push(lesson);
            course.lessonsCount = course.lessons.length; // Update count
        }

        // Persist
        localStorage.setItem('neuraCourses', JSON.stringify(courses));
        return true;
    },

    addCourse: (title) => {
        const courses = State.getCourses();
        const newCourse = {
            id: "c" + Date.now(),
            title: title,
            instructor: "Admin Instructor", // Default
            thumbnail: "📘", // Default
            tags: ["New"],
            rating: 5.0,
            lessonsCount: 0,
            description: "Newly created course subject.",
            lessons: []
        };
        courses.push(newCourse);
        localStorage.setItem('neuraCourses', JSON.stringify(courses));
        return newCourse;
    },

    deleteCourse: (courseId) => {
        let courses = State.getCourses();
        courses = courses.filter(c => c.id !== courseId);
        localStorage.setItem('neuraCourses', JSON.stringify(courses));
        return true;
    },

    // --- BATCH MANAGEMENT ---
    getStudentCount: (courseId) => {
        // In a real app, we'd query the DB. Here we check mockUsers + localStorage users?
        // For prototype simplicity, let's just use mockUsers + checking if current user is enrolled
        // Actually, we should check ALL "users". But we only have mockUsers and "neuraUser" in storage.
        // Let's rely on mockUsers which is our "database" of users.
        return mockUsers.filter(u => u.enrolledCourses && u.enrolledCourses.includes(courseId)).length;
    },

    addAnnouncement: (courseId, message) => {
        const courses = State.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return false;

        if (!course.announcements) course.announcements = [];
        course.announcements.unshift({
            text: message,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        });

        localStorage.setItem('neuraCourses', JSON.stringify(courses));
        return true;
    },

    deleteAnnouncement: (courseId, timestamp) => {
        const courses = State.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course || !course.announcements) return false;

        course.announcements = course.announcements.filter(a => a.timestamp !== timestamp);
        localStorage.setItem('neuraCourses', JSON.stringify(courses));
        return true;
    }
};
