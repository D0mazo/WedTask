// Local storage functions
function getLocalTasks() {
    return JSON.parse(localStorage.getItem('localTasks')) || [];
}

function saveLocalTasks(tasks) {
    localStorage.setItem('localTasks', JSON.stringify(tasks));
}

// Add task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (taskText === '') return;
//working? 
    const tasks = getLocalTasks();
    tasks.push({
        id: Date.now().toString(),
        text: taskText,
        createdAt: Date.now(),
        notes: ''
    });
    saveLocalTasks(tasks);
    taskInput.value = '';
    loadLocalTasks();
}

// Delete task
function deleteTask(id) {
    const tasks = getLocalTasks().filter(task => task.id !== id);
    saveLocalTasks(tasks);
    loadLocalTasks();
}

// Update notes
function updateNotes(id, notes) {
    const tasks = getLocalTasks();
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.notes = notes;
        saveLocalTasks(tasks);
        loadLocalTasks();
    }
}

// Format time elapsed
function formatTimeElapsed(createdAt) {
    if (!createdAt) return "Just now";
    const now = new Date();
    const elapsed = Math.floor((now - new Date(createdAt)) / 1000);
    if (elapsed < 60) return `${elapsed} seconds ago`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)} minutes ago`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)} hours ago`;
    return `${Math.floor(elapsed / 86400)} days ago`;
}

// Render tasks
function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="task-header">
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    <div class="task-time" data-created="${task.createdAt}">
                        ${formatTimeElapsed(task.createdAt)}
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
            <textarea class="task-notes" placeholder="Add notes (e.g., Florist contact: 555-1234)" 
                     oninput="updateNotes('${task.id}', this.value)">${task.notes || ''}</textarea>
        `;
        taskList.appendChild(taskItem);
    });
}

// Update time displays
function updateTimeDisplays() {
    const timeElements = document.querySelectorAll('.task-time');
    timeElements.forEach(element => {
        const createdAt = parseInt(element.getAttribute('data-created'));
        element.textContent = formatTimeElapsed(new Date(createdAt));
    });
}

// Load tasks
function loadLocalTasks() {
    const tasks = getLocalTasks();
    renderTasks(tasks);
    setInterval(updateTimeDisplays, 1000);
}

// Initial load
loadLocalTasks();