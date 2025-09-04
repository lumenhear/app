// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- FIREBASE CONFIGURATION ---
    // IMPORTANT: Replace this with your actual Firebase project configuration
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- DOM ELEMENT REFERENCES ---
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutButton = document.getElementById('logout-button');
    const welcomeMessage = document.getElementById('welcome-message');

    // Sections
    const sections = document.querySelectorAll('.app-section');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const therapyContent = document.getElementById('therapy-content');
    const therapyInfo = document.getElementById('therapy-info');
    const hearingAidContent = document.getElementById('hearing-aid-content');
    const progressList = document.getElementById('progress-list');
    const progressForm = document.getElementById('progress-form');
    const appointmentsList = document.getElementById('appointments-list');
    const videosList = document.getElementById('videos-list');

    let currentUser = null;
    let patientData = null;

    // --- MOCK DATA FOR THERAPY & HEARING AIDS ---
    // In a real app, this data would likely come from a separate 'materials' collection in Firestore.
    // For this PWA, we'll keep it local to demonstrate filtering.
    const allTherapyMaterials = {
        'Articulation Disorder': {
            Mild: [{ title: 'Initial /p/ Sound Flashcards', type: 'image', content: 'Practice saying words like "pig", "pan", "pot".' }],
            Moderate: [{ title: 'Minimal Pairs /t/ vs /k/', type: 'audio', content: 'Listen and repeat: "tea" vs "key", "tape" vs "cape".' }],
            Severe: [{ title: 'Mouth Placement for /s/', type: 'video', content: 'https://www.youtube.com/embed/example1' }]
        },
        'Aphasia': {
            Mild: [{ title: 'Naming Common Objects', type: 'text', content: 'Name 10 items in your kitchen.' }],
            Moderate: [{ title: 'Sentence Completion', type: 'text', content: '"The grass is..." -> "green". Complete 15 sentences.' }],
            Severe: [{ title: 'Picture Exchange Communication (PECS) Intro', type: 'image', content: 'Use this board to request "water".' }]
        }
        // ... Add all other disorders and severities here
    };

    const allHearingAidGuides = [
        { title: 'How to Change Your Battery', content: 'Step 1: Open the battery door. Step 2: Remove the old battery. Step 3: Insert the new battery with the flat side up.', image: 'https://via.placeholder.com/300x150.png?text=Battery+Change' },
        { title: 'Daily Cleaning Routine', content: 'Use a soft, dry cloth to wipe your hearing aid every night. Use the small brush to clean the microphone port.', image: 'https://via.placeholder.com/300x150.png?text=Cleaning' },
        { title: 'Troubleshooting: No Sound', content: 'Check if the battery is dead. Check if the wax guard is blocked. Make sure the device is turned on.', video: 'https://www.youtube.com/embed/example2' }
    ];

    const educationalVideos = [
        { title: 'Understanding Stuttering', videoId: 'dQw4w9WgXcQ' },
        { title: 'Tips for Parents of Children with DLD', videoId: 'dQw4w9WgXcQ' }
    ];

    // --- AUTHENTICATION ---
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loginScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            fetchPatientData(user.uid);
        } else {
            currentUser = null;
            patientData = null;
            loginScreen.classList.remove('hidden');
            mainApp.classList.add('hidden');
            showSection('login-screen');
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                loginError.textContent = error.message;
                loginError.style.display = 'block';
            });
    });

    logoutButton.addEventListener('click', () => {
        auth.signOut();
    });

    // --- DATA FETCHING & RENDERING ---
    async function fetchPatientData(uid) {
        try {
            const doc = await db.collection('patients').doc(uid).get();
            if (doc.exists) {
                patientData = doc.data();
                renderAllSections();
            } else {
                console.error("No patient data found!");
                // Handle case where user is authenticated but has no data
            }
        } catch (error) {
            console.error("Error fetching patient data:", error);
        }
    }

    function renderAllSections() {
        if (!patientData) return;
        renderDashboard();
        renderTherapyMaterials();
        renderHearingAidCare();
        renderProgress();
        renderAppointments();
        renderVideos();
        showSection('dashboard-screen');
    }

    function renderDashboard() {
        welcomeMessage.textContent = `Welcome, ${patientData.profile.name}!`;
    }

    function renderTherapyMaterials() {
        const { diagnosis, severity } = patientData.profile;
        therapyInfo.textContent = `Showing materials for: ${diagnosis} (${severity})`;
        
        const materials = allTherapyMaterials[diagnosis]?.[severity] || [];
        therapyContent.innerHTML = '';
        if (materials.length === 0) {
            therapyContent.innerHTML = '<p>No specific therapy materials assigned. Please contact your therapist.</p>';
            return;
        }

        materials.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            let contentHTML = `<h3>${item.title}</h3><p>${item.content}</p>`;
            // Add more types as needed (audio, video, etc.)
            card.innerHTML = contentHTML;
            therapyContent.appendChild(card);
        });
    }

    function renderHearingAidCare() {
        hearingAidContent.innerHTML = '';
        allHearingAidGuides.forEach(guide => {
            const card = document.createElement('div');
            card.className = 'card';
            let contentHTML = `<h3>${guide.title}</h3><p>${guide.content}</p>`;
            if (guide.image) {
                contentHTML += `<img src="${guide.image}" alt="${guide.title}">`;
            }
            if (guide.video) {
                contentHTML += `<div class="video-card"><iframe src="${guide.video}" frameborder="0" allowfullscreen></iframe></div>`;
            }
            card.innerHTML = contentHTML;
            hearingAidContent.appendChild(card);
        });
    }

    function renderProgress() {
        const progressEntries = patientData.progress || [];
        progressList.innerHTML = '<h3>Completed Activities</h3>'; // Reset
        if (progressEntries.length === 0) {
            progressList.innerHTML += '<p>You haven\'t logged any activities yet.</p>';
            return;
        }

        // Sort by date descending
        progressEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        progressEntries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${new Date(entry.date).toLocaleDateString()}</h3>
                <p>${entry.notes}</p>
            `;
            progressList.appendChild(card);
        });
    }

    function renderAppointments() {
        const appointments = patientData.appointments || [];
        appointmentsList.innerHTML = '';
        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p>You have no upcoming appointments scheduled.</p>';
            return;
        }
        
        appointments.forEach(appt => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${new Date(appt.date).toLocaleString()}</h3>
                <p>Notes: ${appt.notes || 'No notes'}</p>
            `;
            appointmentsList.appendChild(card);
        });
    }

    function renderVideos() {
        videosList.innerHTML = '';
        educationalVideos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${video.title}</h3>
                <div class="video-card">
                    <iframe src="https://www.youtube.com/embed/${video.videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
            videosList.appendChild(card);
        });
    }

    // --- PROGRESS FORM HANDLING ---
    progressForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('progress-date').value;
        const notes = document.getElementById('progress-notes').value;

        if (!date || !notes) {
            alert('Please fill out all fields.');
            return;
        }

        const newProgressEntry = {
            date: date,
            notes: notes
        };

        try {
            await db.collection('patients').doc(currentUser.uid).update({
                progress: firebase.firestore.FieldValue.arrayUnion(newProgressEntry)
            });
            // Optimistic update
            patientData.progress.push(newProgressEntry);
            renderProgress();
            progressForm.reset();
        } catch (error) {
            console.error("Error adding progress:", error);
            alert("Could not save progress. Please try again.");
        }
    });

    // --- NAVIGATION ---
    function showSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        window.scrollTo(0, 0); // Scroll to top on section change
    }

    document.body.addEventListener('click', (e) => {
        const targetButton = e.target.closest('[data-target]');
        if (targetButton) {
            const targetSectionId = targetButton.dataset.target;
            showSection(targetSectionId);
        }
    });

    // --- PWA SERVICE WORKER REGISTRATION ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
    
    // Example patient data structure for Firestore
    /*
    collection: patients
    documentId: {user_uid}
    fields:
        profile: {
            name: "Jane Doe",
            age: 32,
            diagnosis: "Aphasia",
            severity: "Moderate"
        },
        therapyMaterials: [
            // This could be a list of IDs referencing a central 'materials' collection
        ],
        progress: [
            { date: "2025-09-04", notes: "Practiced sentence completion for 20 minutes. It was challenging but good." }
        ],
        appointments: [
            { date: "2025-09-10T14:00:00", notes: "Session with Dr. Smith" }
        ]
    */
});
