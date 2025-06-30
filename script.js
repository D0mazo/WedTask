const firebaseConfig = {
    // Replace with your Firebase project configuration
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Authentication handling
function signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(error => {
        console.error("Sign-in error:", error);
    });
}

function signOut() {
    auth.signOut().catch(error => {
        console.error("Sign-out error:", error);
    });
}

auth.onAuthStateChanged(user => {
    const signInButton = document.getElementById('signInButton');
    const signOutButton = document.getElementById('signOutButton');
    const userStatus = document.getElementById('userStatus');
    const taskInput = document.getElementById('taskInput');
    if (user) {
        signInButton.style.display = 'none';
        signOutButton.style.display = 'inline-block';
        userStatus.textContent = `Signed in as ${user.displayName}`;
        taskInput.disabled = false;
        loadTasks(user.uid);
    } else {
        signInButton.style.display = 'inline-block';
        signOutButton.style.display = 'none';
        userStatus.textContent = 'Please sign in to manage tasks';
        taskInput.disabled = true;
        document.getElementById('taskList').innerHTML = '';
    }
});

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (taskText === '' || !auth.currentUser) return;

    const userId = auth.currentUser.uid;
    db.collection('users').doc(userId).collection('tasks').add({
        text: taskText,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        notes: ''
    }).then(() => {
        taskInput.value = '';
    }).catch(error => {
        console.error("Error adding task:", error);
    });
}

function deleteTask(id) {
    const userId = auth.currentUser.uid;
    db.collection('users').doc(userId).collection('tasks').doc(id).delete().catch(error => {
        console.error("Error deleting task:", error);
    });
}

function updateNotes(id, notes) {
    const userId = auth.currentUser.uid;
    db.collection('users').doc(userId).collection('tasks').doc(id).update({
        notes: notes
    }).catch(error => {
        console.error("Error updating notes:", error);
    });
}

function formatTimeElapsed(createdAt) {
    if (!createdAt) return "Just now";
    const now = new Date();
    const elapsed = Math.floor((now - createdAt.toDate()) / 1000);
    if (elapsed < 60) return `${elapsed} seconds ago`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)} minutes ago`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)} hours ago`;
    return `${Math.floor(elapsed / 86400)} days ago`;
}

function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskData = task.data();
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="task-header">
                <div class="task-content">
                    <div class="task-text">${taskData.text}</div>
                    <div class="task-time" data-created="${taskData.createdAt?.toDate().getTime() || Date.now()}">
                        ${formatTimeElapsed(taskData.createdAt)}
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
            <textarea class="task-notes" placeholder="Add notes (e.g., Florist contact: 555-1234)" 
                     oninput="updateNotes('${task.id}', this.value)">${taskData.notes || ''}</textarea>
        `;
        taskList.appendChild(taskItem);
    });
}

function updateTimeDisplays() {
    const timeElements = document.querySelectorAll('.task-time');
    timeElements.forEach(element => {
        const createdAt = parseInt(element.getAttribute('data-created'));
        element.textContent = formatTimeElapsed(new Date(createdAt));
    });
}

function loadTasks(userId) {
    if (!userId) return;
    db.collection('users').doc(userId).collection('tasks')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            const tasks = [];
            snapshot.forEach(doc => {
                tasks.push({ id: doc.id, ...doc.data() });
            });
            renderTasks(tasks);
        }, error => {
            console.error("Error loading tasks:", error);
        });
    setInterval(updateTimeDisplays, 1000);
}