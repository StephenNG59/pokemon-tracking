class TaskQueueManager {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    addTaskToQueue(task) {
        this.queue.push(task);
        if (!this.processing) {
            this.processQueue();
        }
    }

    fetchTodo() {
        fetch('/fetch_tasks')
        .then(response => response.json())
        .then(tasks => {
            openIndexedDBTasks()
            .then(db => {
                const transaction = db.transaction('Tasks', 'readwrite');
                const store = transaction.objectStore('Tasks');

                tasks.forEach(task => {
                    store.put({ ...task, id: task.id });

                    // 根据 DOM 中有无当前 id 的任务决定
                    const listItem = document.querySelector(`#heading-${task.id}`);
                    if (listItem) {
                        // 如果有相同 id 则更新 DOM
                        updateTaskInDOM(task.id, task);
                    } else {
                        // 如果没有相同 id 则新建展示任务
                        displayTask(task);
                    }
                });
            });
        });
    }

    createTodo(task) {
        fetch('/create_task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task.data),
        })
        .then(response => response.json())
        .then(() => this.processQueue())
        .catch(() => {
            console.error('Error creating task');
            this.queue.unshift(task);
            setTimeout(() => this.processQueue(), 10000);
        });
    }

    deleteTodo(task) {
        fetch(`/delete_task/${task.id}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(() => this.processQueue())
        .catch(() => {
            console.error('Error deleting task');
            this.queue.unshift(task);
            setTimeout(() => this.processQueue(), 10000);
        })
    }

    updateTodo(task) {
        fetch(`/update_task/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task.data),
        })
        .then(response => response.json())
        .then(() => this.processQueue())  // Process the next task
        .catch(() => {
            console.error('Error syncing task');
            this.queue.unshift(task);  // Re-add the task if it fails
            setTimeout(() => this.processQueue(), 10000);  // Retry in 10 seconds
        });
    }

    finishTodo(task) {
        // task.data.is_finished = true;
        fetch(`/finish_task/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task.data),
        })
        .then(response => response.json())
        .then(() => this.processQueue())  // Process the next task
        .catch(() => {
            console.error('Error syncing task');
            this.queue.unshift(task);  // Re-add the task if it fails
            setTimeout(() => this.processQueue(), 10000);  // Retry in 10 seconds
        });
    }

    processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }
    
        this.processing = true;
        const task = this.queue.shift();

        switch (task.action) {
            case 'fetch':
                this.fetchTodo();
                break;
            case 'create':
                this.createTodo(task);
                break;
            case 'delete':
                this.deleteTodo(task);
                break;
            case 'update':
                this.updateTodo(task);
                break;
            case 'finish':
                this.finishTodo(task);
                break;
            default:
                break;
        };  
    }
}
const taskQueueManager = new TaskQueueManager();


class Command {
    execute() { }
    undo() { }  // Optional, if you want undo functionality
}


class CommandManager {
    constructor() {

    }
    
    executeCommand(command) {
        command.execute();
    }
}


class FetchTasksCommand extends Command {
    constructor() {
        super();
    }

    // Step 1: Read from IndexedDB
    readIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDBTasks().then(db => {
                const transaction = db.transaction('Tasks', 'readonly');
                const store = transaction.objectStore('Tasks');
                const request = store.getAll();  // 获取所有任务

                request.onsuccess = (event) => {
                    const tasks = event.target.result;  // 获取到的所有任务数组
                    resolve(tasks);  // 返回任务数组
                };
    
                request.onerror = (event) => {
                    console.error('Error fetching tasks:', event.target.error);
                    reject('Error fetching tasks: ' + event.target.error);
                };
            }).catch(error => {
                reject('IndexedDB error: ' + error);  // 如果打开数据库失败
            });
        })
    }

    // Step 2: Update DOM
    updateDOMWithTasks(tasks) {
        tasks.forEach(task => {
            displayTask(task);  // 调用现有的 displayTask() 函数
        });
    }

    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            action: 'fetch',
        });
    }

    // Execute
    execute() {
        this.readIndexedDB().then((tasks) => {
            this.updateDOMWithTasks(tasks);
            this.addToSyncQueue();
        }).catch(error => {
            console.error('Error loading tasks:', error);
        });
    }
}

class AddTaskCommand extends Command {
    constructor(taskData) {
        super();
        this.taskData = taskData;
    }
  
    // Step 1: Add to IndexedDB & save auto-generated id
    updateIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDBTasks().then(db => {
                const transaction = db.transaction('Tasks', 'readwrite');
                const store = transaction.objectStore('Tasks');
                const request = store.add(this.taskData);
                
                request.onsuccess = (event) => {
                    const generatedId = event.target.result;  // 获取生成的 id
                    this.taskData.id = generatedId;
                    resolve(generatedId);
                }

                request.onerror = (event) => {
                    console.error('Error adding task:', event.target.error);
                    reject('Error adding task: ' + event.target.error);
                };
            }).catch(error => {
                reject('IndexedDB error: ' + error);  // 如果打开数据库失败
            });
        });
    }
  
    // Step 2: Update DOM
    updateDOM() {
        displayTask(this.taskData);  // this.taskData
        resetTaskInput();
    }
  
    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            data: this.taskData,
            action: 'create',
        });
    }
  
    // Execute all steps in order
    execute() {
        this.updateIndexedDB().then((generatedId) => {
            console.log('Task successfully added to IndexedDB with ID:', generatedId);
            this.updateDOM();
            this.addToSyncQueue();
        }).catch((error) => {
            console.error('Failed to add task:', error);
        });
    }
}

class UpdateTaskCommand extends Command {
    constructor(taskId, updatedData) {
        super();
        this.taskId = taskId;
        this.updatedData = updatedData;
    }

    // Step 1: Update IndexedDB
    updateIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDBTasks().then(db => {
                const transaction = db.transaction('Tasks', 'readwrite');
                const store = transaction.objectStore('Tasks');

                // 现货区现有的记录
                const getRequest = store.get(this.taskId);

                getRequest.onsuccess = (event) => {
                    const task = event.target.result;  // 获取到的完整记录

                    // 确保记录存在
                    if (task) {
                        // 更新需要修改的字段
                        Object.assign(task, this.updatedData);

                        // 保存完整的任务对象
                        const putRequest = store.put(task);
            
                        putRequest.onsuccess = () => {
                            console.log('Task updated successfully');
                        };
            
                        putRequest.onerror = (event) => {
                            console.error('Error updating task:', event.target.error);
                        };
                    } else {
                        console.error('Task not found');
                    }
                    resolve(event.target.result);
                };
            }).catch(error => {
                reject('IndexedDB error: ' + error);  // 如果更新任务失败
            });
        });
    }

    // Step 2: Update DOM
    updateDOM() {
        updateTaskInDOM(this.taskId, this.updatedData);
        resetTaskInput();
        // TODO sortTasks(listType, attribute, direction);
    }

    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            id: this.taskId,
            data: this.updatedData,
            action: 'update',
        });
    }

    // Execute all steps in order
    execute() {
        this.updateIndexedDB().then(() => {
            console.log('Task successfully updated in IndexedDB with ID:', this.taskId);
            this.updateDOM();
            this.addToSyncQueue();
        }).catch((error) => {
            console.error('Failed to update task:', error);
        });
    }
}

class DeleteTaskCommand extends Command {
    constructor(taskId) {
        super();
        this.taskId = taskId;
    }

    // Step 1: Delete from IndexedDB
    updateIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDBTasks().then(db => {
                const transaction = db.transaction('Tasks', 'readwrite');
                const store = transaction.objectStore('Tasks');
                const request = store.delete(this.taskId);

                request.onsuccess = (event) => {
                    resolve(event.target.result);
                }

                request.onerror = (event) => {
                    console.error('Error deleting task from IndexedDB:', event.target.error);
                    reject('Error deleting task from IndexedDB: ' + event.target.error);
                }
            }).catch(error => {
                reject('IndexedDB error: ' + error);  // 如果删除任务失败
            })
        })
    }

    // Step 2: Update DOM
    updateDOM() {
        // 从页面移除任务
        const taskItem = document.querySelector(`[data-task-id="${this.taskId}"]`).closest('.accordion-item');
        if (taskItem) {
            taskItem.remove();  // 从 DOM 中移除任务元素
        }
    }

    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            id: this.taskId,
            action: 'delete',
        });

    }

    // Execute all steps in order
    execute() {
        this.updateIndexedDB().then(() => {
            console.log('Task successfully deleted from IndexedDB with ID:', this.taskId);
            this.updateDOM();
            this.addToSyncQueue();
        }).catch((error) => {
            console.error('Failed to delete task:', error);
        });
    }
}

class FinishTaskCommand extends Command {
    constructor(taskId, finishedAt) {
        super();
        this.taskId = taskId;
        this.finishedAt = finishedAt;
    }

    // Step 1: Update IndexedDB
    updateIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDBTasks().then(db => {
                const transaction = db.transaction('Tasks', 'readwrite');
                const store = transaction.objectStore('Tasks');
                // 先获取现有的记录
                const getRequest = store.get(this.taskId);

                getRequest.onsuccess = (event) => {
                    const task = event.target.result;  // 获取到的完整记录
            
                    // 确保记录存在
                    if (task) {
                        // 更新需要修改的字段
                        task.is_finished = true;
                        task.finished_at = this.finishedAt;
            
                        // 保存完整的任务对象
                        const putRequest = store.put(task);
            
                        putRequest.onsuccess = () => {
                            console.log('Task finished successfully');
                        };
            
                        putRequest.onerror = (event) => {
                            console.error('Error finishing task:', event.target.error);
                        };
                    } else {
                        console.error('Task not found');
                    }
                    resolve(event.target.result);
                };
            
                getRequest.onerror = (event) => {
                    console.error('Error fetching task:', event.target.error);
                };
            }).catch(error => {
                reject('IndexedDB error: ' + error);  // 如果完成任务失败
            });
        });
    }

    // Step 2: Update DOM (move from unfinished to finished)
    updateDOM() {
        finishTaskInDom(this.taskId, this.finishedAt);
        // TODO sortTasks(listType, attribute, direction);
    }

    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            id: this.taskId,
            data: { 'is_finished': true, 'finished_at': this.finishedAt },
            action: 'finish',
        });
    }

    // Execute all steps in order
    execute() {
        this.updateIndexedDB().then(() => {
            console.log('Task successfully finished in IndexedDB with ID:', this.taskId);
            this.updateDOM();
            this.addToSyncQueue();
        }).catch((error) => {
            console.error('Failed to finish task:', error);
        });
    }
}

// 初始化 IndexedDB
function openIndexedDBTasks() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('localDatabase', 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            db.createObjectStore('Tasks', { keyPath: 'id', autoIncrement: true});
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            reject('IndexedDB initialization failed');
        };
    });
}

// 在 DOM 中显示任务
function displayTask(task) {
    listId = task.is_finished ? 'finished-task-list' : 'unfinished-task-list';
    const taskList = document.getElementById(listId).querySelector('ul');
    const listItem = document.createElement('div');
    listItem.classList.add('accordion-item');
  
    // 任务创建时间
    const formattedCreatedAt = formatDate(task.created_at);
    const formattedFinishedAt = task.is_finished ? formatDate(task.finished_at) : '';
  
    // 获取Emergency,Importance,Difficulty的符号表示
    const emergencySymbol = (task.emergency === 1 ? '🔥' : 
                            task.emergency === 2 ? '🔥🔥' : 
                            task.emergency === 3 ? '🔥🔥🔥' : 
                            task.emergency === 4 ? '🔥🔥🔥🔥' :
                            task.emergency);
    const importanceSymbol = (task.importance === 1 ? '⭐' :
                             task.importance === 2 ? '⭐⭐' :
                             task.importance === 3 ? '⭐⭐⭐' : 
                             task.importance === 4 ? '⭐⭐⭐⭐' : 
                             task.importance);
    const difficultySymbol = (task.difficulty === 1 ? '🔮' :
                             task.difficulty === 2 ? '🔮🔮' : 
                             task.difficulty === 3 ? '🔮🔮🔮' : 
                             task.difficulty === 4 ? '🔮🔮🔮🔮' :
                             task.difficulty); 
  
    // 把Notes中的换行符替换为HTML的换行标签
    const formattedNotes = task.notes ? task.notes.replace(/\n/g, '<br>') : '';
  
    // 任务显示
    listItem.innerHTML = `
      <h2 class="accordion-header" id="heading-${task.id}">
        <button class="accordion-button collapsed task-item" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${task.id}" aria-expanded="false" aria-controls="collapse-${task.title}">
          <span class="accordion-title" style="width: 200px; overflow: hidden; text-overflow: ellipsis;">${task.title}</span>
          <span class="emergency-symbol" style="width: 120px;">${emergencySymbol}</span>
          <span class="importance-symbol" style="width: 120px;">${importanceSymbol}</span>
          <span class="difficulty-symbol" style="width: 120px;">${difficultySymbol}</span>
          <span class="accordion-time" style="width: 80px;">${task.estimated_time}min</span>
        </button>
      </h2>
      <div id="collapse-${task.id}" class="accordion-collapse collapse" aria-labelledby="heading-${task.id}" data-bs-parent="#${listId}">
        <div class="accordion-body">
          <p style="white-space: pre-wrap; word-wrap: break-word;">${formattedNotes || '这个人很懒，什么都没有写'}</p>
          <div class="d-flex justify-content-between align-items-center">
            <small class="created-at me-4 card-footer text-muted">Created:${formattedCreatedAt}</small>
            ${task.is_finished ? `<small class="finished-at me-auto card-footer text-muted">Finished:${formattedFinishedAt}</small>` : ''}
            <div class="d-flex justify-content-end align-items-center">
              ${task.is_finished ? '' : `
              <button class="btn btn-success float-end finish-task px-5 mx-1" data-task-id="${task.id}">✔</button>
              <button class="btn btn-info    float-end update-task px-3 mx-1" data-task-id="${task.id}">✏</button>
              <label class="separate-mark">|</label>
              `}
              <button class="btn btn-danger float-end delete-task px-3 mx-1" data-task-id="${task.id}">🗑</button>
            </div>
          </div>
        </div>
      </div>
    `;
  
    // 添加到任务列表
    taskList.appendChild(listItem);
}

// 在 DOM 中更新任务
function updateTaskInDOM(taskId, taskData) {
    const listItem = document.querySelector(`#heading-${taskId}`);

    if (listItem) {
        // 更新 Title
        const titleElement = listItem.querySelector('.accordion-title');
        titleElement.textContent = taskData.title;
        
        // 更新 Emergency symbol
        const emergencySymbol = taskData.emergency === 1 ? '🔥' : 
                                taskData.emergency === 2 ? '🔥🔥' : 
                                taskData.emergency === 3 ? '🔥🔥🔥' : 
                                taskData.emergency === 4 ? '🔥🔥🔥🔥' : taskData.emergency;
        listItem.querySelector('.emergency-symbol').textContent = emergencySymbol;
    
        // 更新 Importance symbol
        const importanceSymbol = taskData.importance === 1 ? '⭐' :
                                taskData.importance === 2 ? '⭐⭐' :
                                taskData.importance === 3 ? '⭐⭐⭐' : 
                                taskData.importance === 4 ? '⭐⭐⭐⭐' : taskData.importance;
        listItem.querySelector('.importance-symbol').textContent = importanceSymbol;
        
        // 更新 Difficulty symbol
        const difficultySymbol = taskData.difficulty === 1 ? '🔮' :
                                taskData.difficulty === 2 ? '🔮🔮' : 
                                taskData.difficulty === 3 ? '🔮🔮🔮' : 
                                taskData.difficulty === 4 ? '🔮🔮🔮🔮' : taskData.difficulty;
        listItem.querySelector('.difficulty-symbol').textContent = difficultySymbol;
    
        // 更新 Estimated time
        listItem.querySelector('.accordion-time').textContent = `${taskData.estimated_time}min`;
    
        // 更新 Notes
        const collapseDiv = document.querySelector(`#collapse-${taskId}`);
        const notesElement = collapseDiv.querySelector('p');
        notesElement.innerHTML = taskData.notes.replace(/\n/g, '<br>');
    }
}

// 在 DOM 中把任务移动到已完成列表
function finishTaskInDom(taskId, finishedAt) {
    const taskItem = document.querySelector(`[data-task-id="${taskId}"]`).closest('.accordion-item');
    if (taskItem) {
        // 1. 删除 update-task, finish-task 按钮
        const updateButton = taskItem.querySelector('.update-task');
        const finishButton = taskItem.querySelector('.finish-task');
        const separateMark = taskItem.querySelector('.separate-mark');

        if (updateButton) {
            updateButton.remove();
        }
        if (finishButton) {
            finishButton.remove();
        }
        if (separateMark) {
            separateMark.remove();
        }

        const collapseDiv = taskItem.querySelector('.accordion-collapse');
        if (collapseDiv) {
            // 如果已经有实例，先销毁旧的 Collapse 实例
            const existingInstance = bootstrap.Collapse.getInstance(collapseDiv);
            if (existingInstance) {
                existingInstance.dispose();  // 销毁旧的实例
            }

            // 更新 data-bs-parent 属性，确保折叠行为正常
            collapseDiv.setAttribute('data-bs-parent', '#finished-task-list');

            // 增加 Finished time
            const formattedFinishedAt = formatDate(finishedAt);
            collapseDiv.querySelector('small').insertAdjacentHTML('afterend', 
                `<small class="me-auto card-footer text-muted">Finished:${formattedFinishedAt}</small>`)

            // 将任务从 Unfinished 列表移动到 Finished 列表
            taskItem.remove();
            document.getElementById('finished-task-list').querySelector('ul').appendChild(taskItem);

            // 重新初始化 Bootstrap Collapse 行为
            let newCollapseInstance = new bootstrap.Collapse(collapseDiv, {
                toggle: false  // 确保任务初始时为折叠状态
            });
            // 手动折叠新完成的任务
            newCollapseInstance.hide();  
        }
    }
}

// 重置表单内容
function resetTaskInput() {
    document.getElementById('task-title').value = '';
    if (document.getElementById('task-modal')) {
        document.getElementById('modal-task-title').value = '';
        document.getElementById('task-notes').value = '';
        document.getElementById('task-time').value = '15';
        document.getElementById('emergency-low').checked = true;
        document.getElementById('importance-low').checked = true;
        document.getElementById('difficulty-easy').checked = true;
    }
}

// 格式化时间戳 yyyy/mm/dd-hh:mm
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = String(date.getFullYear());  // 获取后两位年份
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day}-${hour}:${minute}:${second}`;
}


