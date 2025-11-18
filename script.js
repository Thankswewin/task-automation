// State Management
let tasks = [];
let workflows = [];
let templates = [];
let isProcessing = false;
let currentTask = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadTheme();
    loadSampleData();
    updateDashboard();
    renderTaskList();
});

// Event Listeners
function initializeEventListeners() {
    // Task form listeners
    const taskTrigger = document.getElementById('taskTrigger');
    if (taskTrigger) {
        taskTrigger.addEventListener('change', handleTriggerChange);
    }

    const scheduleType = document.getElementById('scheduleType');
    if (scheduleType) {
        scheduleType.addEventListener('change', handleScheduleTypeChange);
    }

    const taskAction = document.getElementById('taskAction');
    if (taskAction) {
        taskAction.addEventListener('change', handleActionChange);
    }

    // Task search
    const taskSearch = document.getElementById('taskSearch');
    if (taskSearch) {
        taskSearch.addEventListener('input', handleTaskSearch);
    }

    // Filter controls
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');
    if (filterCategory) filterCategory.addEventListener('change', handleFilterChange);
    if (filterStatus) filterStatus.addEventListener('change', handleFilterChange);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            createNewTask();
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveTask();
        }
        if (e.key === 'Escape') {
            hideLoading();
        }
    });
}

// Theme Management
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle i');

    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.classList.remove('fa-sun');
        themeToggle.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.querySelector('.theme-toggle i');

    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
    }
}

// Sample Data
function loadSampleData() {
    tasks = [
        {
            id: 1,
            name: 'Daily Email Report',
            category: 'email',
            description: 'Send daily sales report to management team',
            trigger: 'schedule',
            schedule: 'daily',
            action: 'send-email',
            priority: 'high',
            status: 'active',
            tags: ['reports', 'sales', 'daily'],
            nextRun: new Date(Date.now() + 3600000),
            lastRun: new Date(Date.now() - 86400000),
            executionCount: 45,
            successRate: 98,
            timeSaved: 2.5
        },
        {
            id: 2,
            name: 'Database Backup',
            category: 'backup',
            description: 'Automated daily database backup to cloud storage',
            trigger: 'schedule',
            schedule: 'daily',
            action: 'backup',
            priority: 'critical',
            status: 'active',
            tags: ['backup', 'database', 'security'],
            nextRun: new Date(Date.now() + 7200000),
            lastRun: new Date(Date.now() - 3600000),
            executionCount: 30,
            successRate: 100,
            timeSaved: 3
        },
        {
            id: 3,
            name: 'Social Media Posts',
            category: 'social',
            description: 'Schedule and post content to social media platforms',
            trigger: 'schedule',
            schedule: 'weekly',
            action: 'api-call',
            priority: 'medium',
            status: 'active',
            tags: ['marketing', 'social', 'content'],
            nextRun: new Date(Date.now() + 86400000),
            lastRun: new Date(Date.now() - 604800000),
            executionCount: 12,
            successRate: 95,
            timeSaved: 4
        },
        {
            id: 4,
            name: 'File Cleanup',
            category: 'file',
            description: 'Clean up temporary files and old logs',
            trigger: 'schedule',
            schedule: 'weekly',
            action: 'script',
            priority: 'low',
            status: 'paused',
            tags: ['maintenance', 'cleanup', 'storage'],
            nextRun: null,
            lastRun: new Date(Date.now() - 1209600000),
            executionCount: 8,
            successRate: 100,
            timeSaved: 1.5
        },
        {
            id: 5,
            name: 'API Data Sync',
            category: 'data',
            description: 'Sync data between external API and internal database',
            trigger: 'event',
            schedule: 'event',
            action: 'api-call',
            priority: 'high',
            status: 'failed',
            tags: ['api', 'sync', 'integration'],
            nextRun: null,
            lastRun: new Date(Date.now() - 1800000),
            executionCount: 15,
            successRate: 80,
            timeSaved: 2
        }
    ];

    templates = [
        {
            id: 'email-digest',
            name: 'Email Digest',
            description: 'Send daily/weekly email summaries',
            category: 'email',
            action: 'send-email',
            trigger: 'schedule'
        },
        {
            id: 'file-backup',
            name: 'File Backup',
            description: 'Automated file and folder backups',
            category: 'backup',
            action: 'backup',
            trigger: 'schedule'
        },
        {
            id: 'data-sync',
            name: 'Data Synchronization',
            description: 'Sync data between systems',
            category: 'data',
            action: 'api-call',
            trigger: 'schedule'
        }
    ];
}

// Dashboard
function updateDashboard() {
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(t => t.status === 'active').length;
    const completedToday = Math.floor(Math.random() * 50) + 10; // Simulated
    const timeSaved = tasks.reduce((total, task) => total + (task.timeSaved || 0), 0);

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('activeAutomations').textContent = activeTasks;
    document.getElementById('completedToday').textContent = completedToday;
    document.getElementById('timeSaved').textContent = `${timeSaved.toFixed(1)}h`;
}

// Task Management
function renderTaskList(filteredTasks = tasks) {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>No tasks found. Create your first automation task to get started!</p>
                <button class="btn btn-primary" onclick="createNewTask()">
                    <i class="fas fa-plus"></i> Create Task
                </button>
            </div>
        `;
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-item" data-task-id="${task.id}">
            <div class="task-status ${task.status}"></div>
            <div class="task-info">
                <div class="task-name">${task.name}</div>
                <div class="task-description">${task.description}</div>
                <div class="task-meta">
                    <span><i class="fas fa-folder"></i> ${getCategoryLabel(task.category)}</span>
                    <span><i class="fas fa-clock"></i> ${task.schedule}</span>
                    <span><i class="fas fa-fire"></i> ${task.priority}</span>
                    <span><i class="fas fa-chart-line"></i> ${task.successRate}% success</span>
                </div>
            </div>
            <div class="task-actions">
                ${task.status === 'active' ?
                    `<button class="task-action-btn pause" onclick="toggleTaskStatus(${task.id})" title="Pause">
                        <i class="fas fa-pause"></i>
                    </button>` :
                    `<button class="task-action-btn play" onclick="toggleTaskStatus(${task.id})" title="Resume">
                        <i class="fas fa-play"></i>
                    </button>`
                }
                <button class="task-action-btn edit" onclick="editTask(${task.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete" onclick="deleteTask(${task.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function getCategoryLabel(category) {
    const labels = {
        'email': 'Email Automation',
        'file': 'File Management',
        'data': 'Data Processing',
        'social': 'Social Media',
        'backup': 'Backup & Sync',
        'monitoring': 'Monitoring',
        'reporting': 'Reporting',
        'integration': 'API Integration',
        'custom': 'Custom'
    };
    return labels[category] || category;
}

function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = task.status === 'active' ? 'paused' : 'active';
        renderTaskList();
        updateDashboard();
        showNotification(`Task ${task.name} ${task.status === 'active' ? 'resumed' : 'paused'}`);
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        // Populate form with task data
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskTrigger').value = task.trigger;
        document.getElementById('taskAction').value = task.action;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskTags').value = task.tags.join(', ');

        currentTask = task;

        // Switch to task creation section
        document.querySelector('.task-creation-section').scrollIntoView({ behavior: 'smooth' });

        showNotification(`Editing task: ${task.name}`);
    }
}

function deleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && confirm(`Are you sure you want to delete "${task.name}"?`)) {
        tasks = tasks.filter(t => t.id !== taskId);
        renderTaskList();
        updateDashboard();
        showNotification(`Task "${task.name}" deleted`);
    }
}

// Form Handling
function handleTriggerChange(event) {
    const trigger = event.target.value;
    const scheduleGroup = document.getElementById('scheduleGroup');

    if (trigger === 'schedule') {
        scheduleGroup.style.display = 'block';
    } else {
        scheduleGroup.style.display = 'none';
    }
}

function handleScheduleTypeChange(event) {
    const scheduleType = event.target.value;
    const scheduleTime = document.getElementById('scheduleTime');
    const cronExpression = document.getElementById('cronExpression');

    scheduleTime.style.display = 'none';
    cronExpression.style.display = 'none';

    if (scheduleType === 'once') {
        scheduleTime.style.display = 'block';
        scheduleTime.type = 'datetime-local';
    } else if (scheduleType === 'cron') {
        cronExpression.style.display = 'block';
    }
}

function handleActionChange(event) {
    const action = event.target.value;
    const configContent = document.getElementById('actionConfigContent');

    const actionConfigs = {
        'send-email': `
            <div class="config-form">
                <div class="form-group">
                    <label>Recipient Email</label>
                    <input type="email" placeholder="recipient@example.com">
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <input type="text" placeholder="Email subject">
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea rows="3" placeholder="Email message content"></textarea>
                </div>
            </div>
        `,
        'process-file': `
            <div class="config-form">
                <div class="form-group">
                    <label>Input File Path</label>
                    <input type="text" placeholder="/path/to/input/file">
                </div>
                <div class="form-group">
                    <label>Output Directory</label>
                    <input type="text" placeholder="/path/to/output/directory">
                </div>
                <div class="form-group">
                    <label>Processing Type</label>
                    <select>
                        <option value="convert">Convert Format</option>
                        <option value="compress">Compress</option>
                        <option value="extract">Extract Data</option>
                        <option value="transform">Transform</option>
                    </select>
                </div>
            </div>
        `,
        'api-call': `
            <div class="config-form">
                <div class="form-group">
                    <label>API Endpoint</label>
                    <input type="url" placeholder="https://api.example.com/endpoint">
                </div>
                <div class="form-group">
                    <label>HTTP Method</label>
                    <select>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Headers (JSON)</label>
                    <textarea rows="3" placeholder='{"Authorization": "Bearer token"}'></textarea>
                </div>
                <div class="form-group">
                    <label>Request Body (JSON)</label>
                    <textarea rows="3" placeholder='{"key": "value"}'></textarea>
                </div>
            </div>
        `,
        'backup': `
            <div class="config-form">
                <div class="form-group">
                    <label>Source Directory</label>
                    <input type="text" placeholder="/path/to/source">
                </div>
                <div class="form-group">
                    <label>Backup Location</label>
                    <select>
                        <option value="local">Local Directory</option>
                        <option value="cloud">Cloud Storage</option>
                        <option value="ftp">FTP Server</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Backup Type</label>
                    <select>
                        <option value="full">Full Backup</option>
                        <option value="incremental">Incremental</option>
                        <option value="differential">Differential</option>
                    </select>
                </div>
            </div>
        `,
        'notification': `
            <div class="config-form">
                <div class="form-group">
                    <label>Notification Type</label>
                    <select>
                        <option value="email">Email</option>
                        <option value="slack">Slack</option>
                        <option value="discord">Discord</option>
                        <option value="teams">Microsoft Teams</option>
                        <option value="webhook">Custom Webhook</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea rows="3" placeholder="Notification message"></textarea>
                </div>
            </div>
        `,
        'script': `
            <div class="config-form">
                <div class="form-group">
                    <label>Script Type</label>
                    <select>
                        <option value="bash">Bash</option>
                        <option value="python">Python</option>
                        <option value="node">Node.js</option>
                        <option value="powershell">PowerShell</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Script Path</label>
                    <input type="text" placeholder="/path/to/script.sh">
                </div>
                <div class="form-group">
                    <label>Arguments</label>
                    <input type="text" placeholder="--arg1 value1 --arg2 value2">
                </div>
            </div>
        `
    };

    configContent.innerHTML = actionConfigs[action] || '<p>Select an action type to configure its parameters</p>';
}

function clearForm() {
    if (confirm('Clear all form fields?')) {
        document.querySelectorAll('.task-form input, .task-form select, .task-form textarea').forEach(field => {
            field.value = '';
        });
        currentTask = null;
        document.getElementById('actionConfigContent').innerHTML = '<p>Select an action type to configure its parameters</p>';
    }
}

function saveTask() {
    const formData = collectTaskFormData();
    if (!formData) return;

    showLoading('Saving Task...', 'Configuring your automation task');

    setTimeout(() => {
        if (currentTask) {
            // Update existing task
            Object.assign(currentTask, formData);
            showNotification(`Task "${formData.name}" updated successfully`);
        } else {
            // Create new task
            const newTask = {
                id: Date.now(),
                ...formData,
                status: 'paused',
                nextRun: null,
                lastRun: null,
                executionCount: 0,
                successRate: 0,
                timeSaved: 0
            };
            tasks.push(newTask);
            showNotification(`Task "${formData.name}" created successfully`);
        }

        renderTaskList();
        updateDashboard();
        clearForm();
        hideLoading();
    }, 2000);
}

function testTask() {
    const formData = collectTaskFormData();
    if (!formData) return;

    showLoading('Testing Task...', 'Running a test execution of your automation');

    setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate for testing
        if (success) {
            showNotification(`Test execution successful! Task "${formData.name}" is ready to use.`);
        } else {
            showNotification('Test execution failed. Please check your configuration.', 'error');
        }
        hideLoading();
    }, 3000);
}

function collectTaskFormData() {
    const name = document.getElementById('taskName')?.value?.trim();
    const category = document.getElementById('taskCategory')?.value;
    const description = document.getElementById('taskDescription')?.value?.trim();
    const trigger = document.getElementById('taskTrigger')?.value;
    const action = document.getElementById('taskAction')?.value;
    const priority = document.getElementById('taskPriority')?.value;
    const tags = document.getElementById('taskTags')?.value?.trim();

    if (!name || !category || !trigger || !action) {
        alert('Please fill in all required fields');
        return null;
    }

    return {
        name,
        category,
        description,
        trigger,
        schedule: trigger === 'schedule' ? document.getElementById('scheduleType')?.value || 'daily' : null,
        action,
        priority,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []
    };
}

// Tab Management
function switchTaskTab(tabName) {
    // Hide all tabs
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.style.display = 'none');

    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }

    // Add active class to clicked button
    event.target.classList.add('active');
}

// Template Management
function useTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (template) {
        // Switch to single task tab
        document.querySelector('.tab-btn').click();
        switchTaskTab('single');

        // Populate form with template data
        document.getElementById('taskName').value = template.name;
        document.getElementById('taskCategory').value = template.category;
        document.getElementById('taskDescription').value = template.description;
        document.getElementById('taskTrigger').value = template.trigger;
        document.getElementById('taskAction').value = template.action;

        // Trigger action change to show configuration
        const actionSelect = document.getElementById('taskAction');
        actionSelect.dispatchEvent(new Event('change'));

        closeModal('templatesModal');
        showNotification(`Template "${template.name}" loaded. Customize and save your task.`);
    }
}

function showTemplates() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'templatesModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-folder-open"></i> Task Templates</h3>
                <button class="close-btn" onclick="closeModal('templatesModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="template-grid">
                    ${templates.map(template => `
                        <div class="template-card" onclick="useTemplate('${template.id}')">
                            <div class="template-icon">
                                <i class="fas ${getTemplateIcon(template.category)}"></i>
                            </div>
                            <h4>${template.name}</h4>
                            <p>${template.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function getTemplateIcon(category) {
    const icons = {
        'email': 'fa-envelope',
        'backup': 'fa-save',
        'data': 'fa-database',
        'social': 'fa-share-alt',
        'file': 'fa-file',
        'monitoring': 'fa-heartbeat'
    };
    return icons[category] || 'fa-cog';
}

// Workflow Management
function addWorkflowStep() {
    showNotification('Workflow builder coming soon! Use single tasks for now.');
}

function saveWorkflow() {
    showNotification('Workflow save functionality coming soon!');
}

function testWorkflow() {
    showNotification('Workflow testing coming soon!');
}

// Search and Filter
function handleTaskSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.name.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    renderTaskList(filteredTasks);
}

function handleFilterChange() {
    const categoryFilter = document.getElementById('filterCategory')?.value;
    const statusFilter = document.getElementById('filterStatus')?.value;
    const searchTerm = document.getElementById('taskSearch')?.value?.toLowerCase();

    let filteredTasks = tasks;

    if (categoryFilter) {
        filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
    }

    if (statusFilter) {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }

    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task =>
            task.name.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }

    renderTaskList(filteredTasks);
}

// Analytics
function showAnalytics() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'analyticsModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-chart-bar"></i> Automation Analytics</h3>
                <button class="close-btn" onclick="closeModal('analyticsModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="analytics-period">
                    <select id="analyticsPeriod">
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>

                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h4>Task Execution Trend</h4>
                        <canvas id="executionChart"></canvas>
                    </div>
                    <div class="analytics-card">
                        <h4>Success Rate</h4>
                        <canvas id="successChart"></canvas>
                    </div>
                    <div class="analytics-card">
                        <h4>Time Saved</h4>
                        <canvas id="timeChart"></canvas>
                    </div>
                    <div class="analytics-card">
                        <h4>Task Categories</h4>
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>

                <div class="performance-metrics">
                    <h4>Performance Metrics</h4>
                    <div class="metrics-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                    <th>Change</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Total Tasks</td>
                                    <td>${tasks.length}</td>
                                    <td class="positive">+2</td>
                                    <td><i class="fas fa-arrow-up text-green"></i></td>
                                </tr>
                                <tr>
                                    <td>Active Tasks</td>
                                    <td>${tasks.filter(t => t.status === 'active').length}</td>
                                    <td class="positive">+1</td>
                                    <td><i class="fas fa-arrow-up text-green"></i></td>
                                </tr>
                                <tr>
                                    <td>Average Success Rate</td>
                                    <td>${Math.round(tasks.reduce((sum, t) => sum + t.successRate, 0) / tasks.length)}%</td>
                                    <td class="positive">+3%</td>
                                    <td><i class="fas fa-arrow-up text-green"></i></td>
                                </tr>
                                <tr>
                                    <td>Total Time Saved</td>
                                    <td>${tasks.reduce((sum, t) => sum + (t.timeSaved || 0), 0).toFixed(1)}h</td>
                                    <td class="positive">+2.5h</td>
                                    <td><i class="fas fa-arrow-up text-green"></i></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Initialize charts (placeholder - would use Chart.js in production)
    setTimeout(() => {
        initializeAnalyticsCharts();
    }, 100);
}

function initializeAnalyticsCharts() {
    // Placeholder for chart initialization
    // In a real implementation, you would use Chart.js or a similar library
    const charts = ['executionChart', 'successChart', 'timeChart', 'categoryChart'];
    charts.forEach(chartId => {
        const canvas = document.getElementById(chartId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            // Draw placeholder chart
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Chart visualization', canvas.width / 2, canvas.height / 2);
        }
    });
}

// Import/Export
function importTasks() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedTasks = JSON.parse(e.target.result);
                    tasks = [...tasks, ...importedTasks];
                    renderTaskList();
                    updateDashboard();
                    showNotification(`Successfully imported ${importedTasks.length} tasks`);
                } catch (error) {
                    showNotification('Failed to import tasks. Please check the file format.', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function exportTasks() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Tasks exported successfully');
}

// Utility Functions
function createNewTask() {
    document.querySelector('.task-creation-section').scrollIntoView({ behavior: 'smooth' });
    clearForm();
}

function scheduleTask() {
    document.getElementById('taskTrigger').value = 'schedule';
    document.getElementById('taskTrigger').dispatchEvent(new Event('change'));
    document.querySelector('.task-creation-section').scrollIntoView({ behavior: 'smooth' });
}

function showWorkflows() {
    switchTaskTab('workflow');
    document.querySelector('.task-creation-section').scrollIntoView({ behavior: 'smooth' });
}

// Modal Management
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Loading State
function showLoading(title = 'Processing...', description = 'Please wait') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    document.getElementById('loadingTitle').textContent = title;
    document.getElementById('loadingDescription').textContent = description;
    loadingOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'error' ? 'var(--error-color)' : type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-size: 0.875rem;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }

    .empty-state i {
        font-size: 3rem;
        color: var(--text-tertiary);
        margin-bottom: 1rem;
    }

    .empty-state p {
        margin-bottom: 2rem;
        font-size: 1.125rem;
    }

    .config-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .config-form .form-group {
        margin-bottom: 0;
    }

    .notification {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
`;
document.head.appendChild(style);