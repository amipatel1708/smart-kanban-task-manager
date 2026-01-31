let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editingTaskId = null;

// Elements
const modal = document.getElementById("taskModal");
const addTaskBtn = document.getElementById("addTaskBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const cancelBtn = document.getElementById("cancelBtn");

const priorityFilter = document.getElementById("priorityFilter");
const dateFilter = document.getElementById("dateFilter");

const modalTitle = document.getElementById("modalTitle");
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");

addTaskBtn.onclick = () => openModal();
cancelBtn.onclick = closeModal;
saveTaskBtn.onclick = saveTask;

priorityFilter.onchange = renderTasks;
dateFilter.onchange = renderTasks;

renderTasks();

// Modal
function openModal(task = null) {
    modal.classList.remove("hidden");

    if (task) {
        editingTaskId = task.id;
        modalTitle.innerText = "Update Task";
        taskTitle.value = task.title;
        taskDesc.value = task.desc;
        taskPriority.value = task.priority;
        taskDate.value = task.date;
    } else {
        editingTaskId = null;
        modalTitle.innerText = "Add Task";
        taskTitle.value = "";
        taskDesc.value = "";
        taskDate.value = "";
    }
}

function closeModal() {
    modal.classList.add("hidden");
}

function saveTask() {
    const task = {
        id: editingTaskId || Date.now(),
        title: taskTitle.value,
        desc: taskDesc.value,
        priority: taskPriority.value,
        date: taskDate.value,
        status: editingTaskId
            ? tasks.find(t => t.id === editingTaskId).status
            : "todo"
    };

    if (editingTaskId) {
        tasks = tasks.map(t => t.id === editingTaskId ? task : t);
    } else {
        tasks.push(task);
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    closeModal();
    renderTasks();
}

function renderTasks() {
    ["todo", "in-progress", "done"].forEach(id => {
        document.getElementById(id).innerHTML = "";
    });

    const today = new Date().toISOString().split("T")[0];

    tasks.forEach(task => {
        if (priorityFilter.value !== "all" && task.priority !== priorityFilter.value) return;
        if (dateFilter.value === "today" && task.date !== today) return;
        if (dateFilter.value === "overdue" && (!task.date || task.date >= today)) return;

        const div = document.createElement("div");
        div.className = `task ${task.priority}`;
        div.draggable = true;
        div.dataset.id = task.id;

        if (task.date && task.date < today) {
            div.classList.add("overdue");
        }

        div.innerHTML = `
            <div class="task-header">
                <h4>${task.title}</h4>
                <span class="priority-badge ${task.priority}">
                    ${task.priority.toUpperCase()}
                </span>
            </div>

            <p class="task-desc">${task.desc}</p>

            <div class="task-footer">
                <small class="task-date">Due: ${task.date || "N/A"}</small>
                <div class="task-actions">
                    <button class="edit-btn" onclick="editTask(${task.id})"> <img src="assets/icons/edit.png" alt="edit"> </button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})"> <img src="assets/icons/delete.png" alt="Delete"> </button>
                </div>
            </div>
        `;

        addDragEvents(div);
        document.getElementById(task.status).appendChild(div);
    });
}

// Drag & Drop
function addDragEvents(task) {
    task.addEventListener("dragstart", () => {
        task.classList.add("dragging");
    });

    task.addEventListener("dragend", () => {
        task.classList.remove("dragging");
    });
}

document.querySelectorAll(".task-list").forEach(col => {
    col.addEventListener("dragover", e => e.preventDefault());

    col.addEventListener("drop", e => {
        const dragged = document.querySelector(".dragging");
        if (!dragged) return;

        const task = tasks.find(t => t.id == dragged.dataset.id);
        task.status = col.id;

        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    });
});

// Edit / Delete 
function editTask(id) {
    openModal(tasks.find(t => t.id === id));
}

function deleteTask(id) {
    if (confirm("Delete this task?")) {
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    }
}
