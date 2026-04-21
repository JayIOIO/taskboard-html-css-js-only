document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const columns = {
        'todo': document.getElementById('todo-list'),
        'in-progress': document.getElementById('inprogress-list'),
        'done': document.getElementById('done-list')
    };

    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks();

    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // CRUD Functions
    function addTask() {
        const text = taskInput.value.trim();
        if (text) {
            const task = {
                id: Date.now().toString(),
                text: text,
                status: 'todo'
            };
            tasks.push(task);
            saveTasks();
            renderTasks();
            taskInput.value = '';
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    function updateTaskStatus(id, newStatus) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.status = newStatus;
            saveTasks();
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        // Clear existing lists
        Object.values(columns).forEach(list => list.innerHTML = '');

        tasks.forEach(task => {
            const card = createTaskCard(task);
            const list = columns[task.status] || columns['todo'];
            list.appendChild(card);
        });
    }

    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.id = `task-${task.id}`;
        card.dataset.id = task.id;

        card.innerHTML = `
            <span>${task.text}</span>
            <button class="delete-btn" aria-label="Delete task">&times;</button>
        `;

        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });

        // Drag events
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);

        return card;
    }

    // Drag and Drop Logic
    function handleDragStart(e) {
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        
        // Remove highlight from all columns
        document.querySelectorAll('.column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    // Set up drop zones
    document.querySelectorAll('.column').forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const newStatus = column.id;
            
            updateTaskStatus(taskId, newStatus);
            renderTasks();
        });
    });
});
