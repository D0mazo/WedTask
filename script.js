document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setInterval(updateTimeDisplays, 1000); // Update time every second
});

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const tasks = getTasks();
    const task = {
        id: Date.now().toString(),
        text: taskText,
        createdAt: Date.now()
    };
    tasks.push(task);
    saveTasks(tasks);
    renderTasks();
    taskInput.value = '';
}

function deleteTask(id) {
    const tasks = getTasks().filter(task => task.id !== id);
    saveTasks(tasks);
    renderTasks();
}

function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function formatTimeElapsed(createdAt) {
    const now = Date.now();
    const elapsed = Math.floor((now - createdAt) / 1000); // Seconds elapsed
    if (elapsed < 60) return `${elapsed} seconds ago`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)} minutes ago`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)} hours ago`;
    return `${Math.floor(elapsed / 86400)} days ago`;
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    const tasks = getTasks();
    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="task-content">
                <div class="task-text">${task.text}</div>
                <div class="task-time" data-created="${task.createdAt}">
                    ${formatTimeElapsed(task.createdAt)}
                </div>
            </div>
            <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
        `;
        taskList.appendChild(taskItem);
    });
}

function updateTimeDisplays() {
    const timeElements = document.querySelectorAll('.task-time');
    timeElements.forEach(element => {
        const createdAt = parseInt(element.getAttribute('data-created'));
        element.textContent = formatTimeElapsed(createdAt);
    });
}

function loadTasks() {
    renderTasks();
}