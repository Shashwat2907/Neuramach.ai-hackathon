/**
 * MOCK DATA STORE
 * Simulates a database for NeuraVault.
 */

const mockCourses = [
    {
        id: "c1",
        title: "Advanced Physics Masterclass",
        instructor: "Dr. Richard Feynman",
        thumbnail: "⚛️",
        tags: ["Physics", "Science"],
        rating: 4.8,
        lessonsCount: 12,
        description: "A comprehensive deep dive into Quantum Mechanics, Thermodynamics, and Particle Physics tailored for competitive exams.",
        // ADDED: Resources for the new 'Resources' tab
        resources: [
            { title: "Quantum Cheat Sheet", type: "pdf", url: "#" },
            { title: "Previous Year Questions", type: "pdf", url: "#" }
        ],
        announcements: [ // Kept your existing structure
            { date: "Feb 12", text: "Live Q&A session rescheduled to Friday at 5 PM." }
        ],
        lessons: [
            { id: "l1", title: "Introduction to Quantum Mechanics", duration: "45m", locked: false, videoUrl: "https://www.youtube.com/embed/P1ww1IXRfTA" },
            { id: "l2", title: "Wave Functions & Probability", duration: "55m", locked: false, videoUrl: "" },
            { id: "l3", title: "Heisenberg Uncertainty Principle", duration: "60m", locked: true, videoUrl: "" },
            { id: "l4", title: "Thermodynamics Laws", duration: "50m", locked: true, videoUrl: "" }
        ]
    },
    {
        id: "c2",
        title: "Calculus II: Integration",
        instructor: "Prof. Maryam Mirzakhani",
        thumbnail: "📐",
        tags: ["Math", "Calculus"],
        rating: 4.7,
        lessonsCount: 24,
        description: "Master the art of integration, sequences, and series. Perfect for engineering undergraduates.",
        resources: [
            { title: "Integration Formulas", type: "pdf", url: "#" }
        ],
        announcements: [],
        lessons: [
            { id: "l1", title: "Antiderivatives and Indefinite Integrals", duration: "40m", locked: false, videoUrl: "" },
            { id: "l2", title: "The Fundamental Theorem of Calculus", duration: "55m", locked: true, videoUrl: "" }
        ]
    },
    {
        id: "c3",
        title: "Molecular Genetics",
        instructor: "Dr. Jennifer Doudna",
        thumbnail: "🧬",
        tags: ["Biology", "Genetics"],
        rating: 4.9,
        lessonsCount: 18,
        description: "Explore the building blocks of life, from DNA replication to CRISPR gene editing technology.",
        resources: [],
        announcements: [],
        lessons: [
            { id: "l1", title: "DNA Structure and Replication", duration: "50m", locked: false, videoUrl: "" },
            { id: "l2", title: "Transcription and Translation", duration: "60m", locked: true, videoUrl: "" }
        ]
    },
    {
        id: "c4",
        title: "Organic Chemistry",
        instructor: "Dr. Marie Curie",
        thumbnail: "🧪",
        tags: ["Chemistry", "Science"],
        rating: 4.6,
        lessonsCount: 15,
        description: "Unlock the secrets of carbon compounds, reactions, and synthesis mechanisms.",
        resources: [],
        announcements: [],
        lessons: [
            { id: "l1", title: "Alkanes and Cycloalkanes", duration: "45m", locked: false, videoUrl: "" },
            { id: "l2", title: "Stereochemistry", duration: "55m", locked: true, videoUrl: "" }
        ]
    },
    {
        id: "c5",
        title: "Computer Science 101",
        instructor: "Alan Turing",
        thumbnail: "💻",
        tags: ["CS", "Programming"],
        rating: 4.8,
        lessonsCount: 30,
        description: "Introduction to algorithms, data structures, and the fundamentals of computing.",
        resources: [],
        announcements: [],
        lessons: [
            { id: "l1", title: "Binary and Data Representation", duration: "40m", locked: false, videoUrl: "" },
            { id: "l2", title: "Introduction to Python", duration: "60m", locked: true, videoUrl: "" }
        ]
    }
];

const mockUsers = [
    {
        email: "student@email.com",
        name: "John Doe",
        password: "password",
        enrolledCourses: ["c1", "c2"],
        streak: 5,
        xp: 1250,
        level: 3,
        progress: { "c1": 65, "c2": 10 },
        lastViewed: { courseId: "c1", lessonId: "l2", timestamp: 860 }
    },
    {
        email: "admin@neuramach.ai",
        name: "Super Admin",
        password: "admin",
        isAdmin: true,
        enrolledCourses: []
    }
];

const mockTasks = [
    { id: "t1", title: "Complete Physics Quiz", date: "2026-02-12", completed: false },
    { id: "t2", title: "Watch Calculus Lecture 3", date: "2026-02-14", completed: false }
];