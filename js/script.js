document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const filterDropdown = document.getElementById('filter-dropdown');
    
    // Modal elements
    const confirmationModal = document.getElementById('confirmation-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    let currentFilter = 'all';

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    taskList.addEventListener('click', handleTaskActions);
    deleteAllBtn.addEventListener('click', deleteAllTasks);
    filterDropdown.addEventListener('change', handleFilterChange);
    
    // --- Initial Check ---
    checkEmptyState();

    // --- Core Functions ---

    /**
     * Adds a new task to the list.
     */
    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;

        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }

        const li = document.createElement('li');
        li.className = 'task-item bg-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all duration-300';
        
        li.innerHTML = `
            <div class="w-full sm:w-1/2 flex items-center">
                <span class="task-text text-gray-200">${taskText}</span>
            </div>
            <div class="w-full sm:w-1/4 text-left sm:text-center text-gray-400 text-sm pl-4 sm:pl-0">
                <span class="sm:hidden font-semibold">Due: </span>${dueDate || 'No date'}
            </div>
            <div class="w-full sm:w-1/4 flex justify-end sm:justify-center items-center gap-3">
                <button class="complete-btn text-xl text-gray-400 hover:text-green-500 transition-colors">✔️</button>
                <button class="delete-btn text-xl text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
            </div>
        `;
        taskList.appendChild(li);

        taskInput.value = '';
        dueDateInput.value = '';
        checkEmptyState();
        applyFilter();
    }

    /**
     * Handles async actions on tasks (complete, delete).
     * @param {Event} e The event object.
     */
    async function handleTaskActions(e) {
        const item = e.target;
        const taskItem = item.closest('.task-item');

        if (!taskItem) return;

        // Handle delete button click
        if (item.classList.contains('delete-btn')) {
            const confirmed = await showConfirmationModal('Are you sure you want to delete this task?');
            if (confirmed) {
                taskItem.remove();
                checkEmptyState();
                applyFilter();
            }
        }

        // Handle complete button click
        if (item.classList.contains('complete-btn')) {
            taskItem.classList.toggle('completed');
            const taskText = taskItem.querySelector('.task-text');
            const completeButton = item;

            if (taskItem.classList.contains('completed')) {
                // Styles for COMPLETED task
                taskItem.classList.add('opacity-60', 'bg-slate-900');
                taskText.classList.add('line-through', 'text-gray-500');
                completeButton.classList.add('text-green-500');
            } else {
                // Revert to PENDING styles
                taskItem.classList.remove('opacity-60', 'bg-slate-900');
                taskText.classList.remove('line-through', 'text-gray-500');
                completeButton.classList.remove('text-green-500');
            }
            applyFilter();
        }
    }
    
    /**
     * Deletes all tasks after confirmation.
     */
    async function deleteAllTasks() {
        if (taskList.children.length === 0 || taskList.querySelector('.no-tasks-message')) return;

        const confirmed = await showConfirmationModal('This will delete ALL tasks. Are you absolutely sure?');
        if (confirmed) {
            taskList.innerHTML = '';
            checkEmptyState();
        }
    }

    // --- Filter Functions ---

    function handleFilterChange(e) {
        currentFilter = e.target.value;
        applyFilter();
    }
    
    function applyFilter() {
        const tasks = taskList.querySelectorAll('.task-item');
        tasks.forEach(task => {
            const isCompleted = task.classList.contains('completed');
            let showTask = false;

            switch (currentFilter) {
                case 'all': showTask = true; break;
                case 'pending': if (!isCompleted) showTask = true; break;
                case 'completed': if (isCompleted) showTask = true; break;
            }
            task.style.display = showTask ? 'flex' : 'none';
        });
    }

    // --- UI Helper Functions ---

    /**
     * Shows a confirmation modal and returns a promise that resolves to true or false.
     * @param {string} message The message to display in the modal.
     * @returns {Promise<boolean>}
     */
    function showConfirmationModal(message) {
        return new Promise((resolve) => {
            modalMessage.textContent = message;
            confirmationModal.classList.remove('hidden');

            const confirmHandler = () => {
                confirmationModal.classList.add('hidden');
                resolve(true);
                cleanup();
            };

            const cancelHandler = () => {
                confirmationModal.classList.add('hidden');
                resolve(false);
                cleanup();
            };
            
            const cleanup = () => {
                modalConfirmBtn.removeEventListener('click', confirmHandler);
                modalCancelBtn.removeEventListener('click', cancelHandler);
            };

            modalConfirmBtn.addEventListener('click', confirmHandler);
            modalCancelBtn.addEventListener('click', cancelHandler);
        });
    }

    function checkEmptyState() {
        if (!taskList.querySelector('.task-item')) {
            deleteAllBtn.style.display = 'none';
            if (!taskList.querySelector('.no-tasks-message')) {
                taskList.innerHTML = '<li class="no-tasks-message text-center p-8 text-gray-500">No tasks found. Add one above!</li>';
            }
        } else {
            const noTasksMessage = taskList.querySelector('.no-tasks-message');
            if (noTasksMessage) {
                noTasksMessage.remove();
            }
            deleteAllBtn.style.display = 'block';
        }
    }
});