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
        return new Promise((resolve, reject) => {
            fetch('/fetch_tasks')
            .then(response => response.json())
            .then(tasks => {
                openIndexedDB()
                .then(db => {
                    const transaction = db.transaction('Tasks', 'readwrite');
                    const store = transaction.objectStore('Tasks');
                    store.clear();
    
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
            }).catch(error => {
                console.error('Error fetching todos');
                this.queue.unshift(task);
                setTimeout(() => this.processQueue(), 10000);
                reject('Error: ' + error);
            });

            resolve();
        })  
    }

    createTodo(task) {
        return new Promise((resolve, reject) => {
            fetch('/create_task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task.data),
            })
            .then(response => response.json())
            .then(() => this.processQueue())
            .catch((error) => {
                console.error('Error creating task');
                this.queue.unshift(task);
                setTimeout(() => this.processQueue(), 10000);
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    deleteTodo(task) {
        return new Promise((resolve, reject) => {
            fetch(`/delete_task/${task.id}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(() => this.processQueue())
            .catch(() => {
                console.error('Error deleting task');
                this.queue.unshift(task);
                setTimeout(() => this.processQueue(), 10000);
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    updateTodo(task) {
        return new Promise((resolve, reject) => {
            fetch(`/update_task/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task.data),
            })
            .then(response => response.json())
            .then(() => this.processQueue())  // Process the next task
            .catch((error) => {
                console.error('Error syncing task');
                this.queue.unshift(task);  // Re-add the task if it fails
                setTimeout(() => this.processQueue(), 10000);  // Retry in 10 seconds
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    finishTodo(task) {
        return new Promise((resolve, reject) => {
            // task.data.is_finished = true;
            fetch(`/finish_task/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task.data),
            })
            .then(response => response.json())
            .then(() => this.processQueue())  // Process the next task
            .catch((error) => {
                console.error('Error syncing task');
                this.queue.unshift(task);  // Re-add the task if it fails
                setTimeout(() => this.processQueue(), 10000);  // Retry in 10 seconds
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    fetchPokedex() {
        return new Promise((resolve, reject) => {
            fetch('/fetch_pokedex')
            .then(response => response.json())
            .then(pokedex => {
                openIndexedDB()
                .then(db => {
                    const transaction = db.transaction('Pokedex', 'readwrite');
                    const store = transaction.objectStore('Pokedex');
    
                    pokedex.forEach(pokemon => {
                        store.put({ ...pokemon, id: pokemon.id, url_id: pokemon.url_id });
    
                        const listItem = document.querySelector(`#pokedex-card-${pokemon.url_id}`);
                        if (!listItem) {
                            // 如果 sidebar 中没有此宝可梦则展示
                            displaySidebarCard(pokemon);
                        }
    
                        // 这里是否需要更新 DOM 呢?
                        //  如果更新, 似乎要全部都更新一遍
                        //  如果不更新, 则手动刷新即可
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching pokedex');
                this.queue.unshift(task);  // Re-add the task if it fails
                setTimeout(() => this.processQueue(), 10000);  // Retry in 10 seconds
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    fetchResearch() {
        return new Promise((resolve, reject) => {
            fetch('/fetch_research')
            .then(response => response.json())
            .then(researches => {
                openIndexedDB()
                .then(db => {
                    const transaction = db.transaction('Research', 'readwrite');
                    const store = transaction.objectStore('Research');
                    store.clear();  // 以防 IndexedDB 中有冗余记录没删除
    
                    researches.forEach(research => {
                        store.put({ ...research, date: research.date });
                    })
    
                    displayTodayResearch(researches);
                    displayHistoryResearch(researches);
                    displayResearchBadges(researches);
                })
            })
            .catch(error => {
                console.error('Error fetching research');
                this.queue.unshift(task);  // Re-add the task if it fails
                setTimeout(() => this.processQueue(), 10000);  // Retry in 10 seconds
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    updateResearch(task) {
        return new Promise((resolve, reject) => {
            fetch(`/update_research`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task.data),
            })
            .then(response => response.json())
            .then(() => this.processQueue())  // Process the next task
            .catch((error) => {
                console.error('Error syncing task');
                this.queue.unshift(task);  // Re-add the task if it fails
                setTimeout(() => this.processQueue(), 10000);  // Retry in 10 seconds
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    fetchItems() {
        return new Promise((resolve, reject) => {
            fetch('/fetch_items')
            .then(response => response.json())
            .then(items => {
                openIndexedDB()
                .then(db => {
                    const transaction = db.transaction('Items', 'readwrite');
                    const store = transaction.objectStore('Items');
    
                    items.forEach(item => {
                        store.put({ ...item, id: item.id });
                    })

                    // TODO displayItems(items)
                })
            })
            .catch(error => {
                console.error('Error fetching items');
                this.queue.unshift(task);
                setTimeout(() => this.processQueue(), 10000);
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    addItem(task) {
        return new Promise((resolve, reject) => {
            fetch('/add_item', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task.data),
            })
            .then(response => response.json())
            .then(() => this.processQueue())
            .catch((error) => {
                console.error('Error adding item');
                this.queue.unshift(task);
                setTimeout(() => this.processQueue(), 10000);
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    addPokemonExp(task) {
        return new Promise((resolve, reject) => {
            fetch('/add_pokemon_exp', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task.data),
            })
            .then(response => response.json())
            .then(() => this.processQueue())
            .catch((error) => {
                console.error('Error adding pokemon exp:', error);
                this.queue.unshift(task);
                setTimeout(() => this.processQueue(), 10000);
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    addPokemonImg(task) {
        return new Promise((resolve, reject) => {
            fetch('/add_pokemon_img', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task.data),
            })
            .then(response => response.json())
            .then(() => this.processQueue())
            .catch((error) => {
                console.error('Error adding pokemon img:', error);
                this.queue.unshift(task);
                setTimeout(() => this.processQueue(), 10000);
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    addPokemonLR(task) {
        return new Promise((resolve, reject) => {
            fetch('/add_pokemon_lr', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task.data),
            })
            .then(response => response.json())
            .then(() => this.processQueue())
            .catch((error) => {
                console.error('Error adding pokemon learning rate:', error);
                this.queue.unshift(task);
                setTimeout(() => this.processQueue(), 10000);
                reject('Error: ' + error);
            });
            resolve();
        });
    }

    updatePokemon(task) {
        return new Promise((resolve, reject) => {
            fetch(`/update_pokemon`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task.data),
            })
            .then(response => response.json())
            .then(() => this.processQueue())  // Process the next task
            .catch((error) => {
                console.error('Error syncing task');
                this.queue.unshift(task);  // Re-add the task if it fails
                setTimeout(() => this.processQueue(), 10000);  // Retry in 10 seconds
                reject('Error: ' + error);
            });
            resolve();
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
            case 'fetch_todo':
                this.fetchTodo().then(() => this.processQueue());
                break;
            case 'create_todo':
                this.createTodo(task).then(() => this.processQueue());
                break;
            case 'delete_todo':
                this.deleteTodo(task).then(() => this.processQueue());
                break;
            case 'update_todo':
                this.updateTodo(task).then(() => this.processQueue());
                break;
            case 'finish_todo':
                this.finishTodo(task).then(() => this.processQueue());
                break;
            case 'fetch_pokedex':
                this.fetchPokedex().then(() => this.processQueue());
                break;
            case 'fetch_research':
                this.fetchResearch().then(() => this.processQueue());
                break;
            case 'update_research':
                this.updateResearch(task).then(() => this.processQueue());
                break;
            case 'fetch_items':
                this.fetchItems().then(() => this.processQueue());
                break;
            case 'add_item':
                this.addItem(task).then(() => this.processQueue());
                break;
            case 'add_pokemon_exp':
                this.addPokemonExp(task).then(() => this.processQueue());
                break;
            case 'add_pokemon_img':
                this.addPokemonImg(task).then(() => this.processQueue());
                break;
            case 'add_pokemon_lr':
                this.addPokemonLR(task).then(() => this.processQueue());
                break;
            case 'update_pokemon':
                this.updatePokemon(task).then(() => this.processQueue());
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
            openIndexedDB().then(db => {
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
            action: 'fetch_todo',
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
            openIndexedDB().then(db => {
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
            action: 'create_todo',
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
            openIndexedDB().then(db => {
                const transaction = db.transaction('Tasks', 'readwrite');
                const store = transaction.objectStore('Tasks');

                // 先获取现有的记录
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
            action: 'update_todo',
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
            openIndexedDB().then(db => {
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
            action: 'delete_todo',
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
            openIndexedDB().then(db => {
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
            action: 'finish_todo',
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

class FetchPokedexCommand extends Command {
    constructor() {
        super();
    }

    // Step 1: Read from IndexedDB
    readIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDB().then(db => {
                const transaction = db.transaction('Pokedex', 'readonly');
                const store = transaction.objectStore('Pokedex');
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const pokedex = event.target.result;
                    resolve(pokedex);
                };

                request.onerror = (event) => {
                    console.error('Error fetching pokedex:', event.target.error);
                    reject('Error fetching pokedex: ' + event.target.error);
                };
            }).catch(error => {
                reject('IndexedDB error: ' + error);
            });
        })
    }

    // Step 2: Update DOM (Pokedex sidebar)
    updateSidebarWithPokedex(pokedex) {
        pokedex.forEach(pokemon => {
            displaySidebarCard(pokemon);
        })
    }

    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            action: 'fetch_pokedex',
        });
    }

    // Execute 
    execute() {
        this.readIndexedDB().then((pokedex) => {
            this.updateSidebarWithPokedex(pokedex);
            this.addToSyncQueue();
        }).catch(error => {
            console.error('Error loading pokedex:', error);
        });
    }
}

class FetchResearchCommand extends Command {
    constructor() {
        super();
    }

    // Step 1: Read from IndexedDB
    readIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDB().then(db => {
                const transaction = db.transaction('Research', 'readonly');
                const store = transaction.objectStore('Research');
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const researches = event.target.result;  // 获取到的所有研究记录数组
                    resolve(researches);  // 返回研究记录数组
                };
    
                request.onerror = (event) => {
                    console.error('Error fetching researches:', event.target.error);
                    reject('Error fetching researches: ' + event.target.error);
                };
            }).catch(error => {
                reject('IndexedDB error: ' + error);
            })
        })
    }

    // Step 2: Update DOM
    updateDOMWithResearches(researches) {
        displayTodayResearch(researches);
        displayHistoryResearch(researches);
        displayResearchBadges(researches);
    }

    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            action: 'fetch_research',
        });
    }

    // Execute
    execute() {
        this.readIndexedDB().then((researches) => {
            this.updateDOMWithResearches(researches);
            this.addToSyncQueue();
        }).catch(error => {
            console.error('Error loading researches:', error);
        });
    }

}

class AddResearchCommand extends Command {
    constructor(researchData) {
        super();
        this.researchData = researchData;
    }

    // Step 1: Update IndexedDB
    updateIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDB().then(db => {
                // 修改本地 Research 数据表
                const transaction = db.transaction('Research', 'readwrite');
                const store = transaction.objectStore('Research');

                // 先查找指定日期的记录
                const getRequest = store.get(this.researchData.date);

                // 注意使用箭头函数来继承外部上下文中的 this
                getRequest.onsuccess = (event) => {
                    const data = event.target.result;
                    if (data) {
                        // 如果存在该日期的记录, 更新
                        data.theory_time += this.researchData.theory_time;
                        data.practice_time += this.researchData.practice_time;
                        this.researchData.theory_time = data.theory_time;
                        this.researchData.practice_time = data.practice_time;

                        // 使用 put() 更新记录
                        const updateRequest = store.put(data);
                        updateRequest.onsuccess = (event) => {
                            console.log('更新研究时间成功');
                            resolve(event.target.result);
                        };
                        updateRequest.onerror = (event) => {
                            console.error('更新研究时间失败');
                            reject('Error updating research:', event.target.error);
                        };
                    } else {
                        // 如果不存在该日期的记录, 添加新记录
                        const addRequest = store.add(this.researchData);
                        addRequest.onsuccess = (event) => {
                            console.log('添加研究记录成功');
                            resolve(event.target.result);
                        };
                        addRequest.onerror = (event) => {
                            console.error('添加研究记录失败');
                            reject('Error adding research:', event.target.error);
                        };
                    }
                };

                getRequest.onerror = (event) => {
                    console.error('查找日期记录失败');
                    reject('Error getting research:', event.target.error);
                };
            })
        })
    }

    // Step 2: Update DOM
    updateDOM() {
        // 如果记录是当天的, 更新今日时间
        const today = new Date().toISOString().split('T')[0];
        if (this.researchData.date === today) {
            let todayTime = this.researchData.theory_time + this.researchData.practice_time;
            document.getElementById('today-research-time').textContent = `${todayTime} mins / today`;
        }

        // 更新图表的显示
        openIndexedDB().then(db => {
            const transaction = db.transaction('Research', 'readonly');
            const store = transaction.objectStore('Research');
            const request = store.getAll();

            request.onsuccess = (event) => {
                const researches = event.target.result;
                displayHistoryResearch(researches);
                displayResearchBadges(researches);
            };

            request.onerror = (event) => {
                console.error('Error getting all researches:', event.target.error);
            };
        })
    }

    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            // date: this.researchData.date,
            data: this.researchData,
            action: 'update_research',
        });
    }

    // Execute
    execute() {
        this.updateIndexedDB().then(() => {
            this.updateDOM();
            this.addToSyncQueue();
        }).catch(error => {
            console.error('Error adding research record:', error);
        });
    }

}

class FetchItemsCommand extends Command {
    constructor() {
        super();
    }

    // Step 1: Read from IndexedDB
    readIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDB().then(db => {
                const transaction = db.transaction('Items', 'readonly');
                const store = transaction.objectStore('Items');
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const items = event.target.result;
                    resolve(items);
                };

                request.onerror = (event) => {
                    console.error('Error fetching items:', event.target.error);
                    reject('Error fetching items: ' + event.target.error);
                };
            }).catch(error => {
                reject('IndexedDB error: ' + error);
            });
        });
    }

    // TODO Step 2: Update DOM
    updateDOMWithItems(items) {
        items.forEach(item => {
            // coin
            if (item.id === 1) {
                document.getElementById('coin-number').textContent = item.quantity;
            }
            // time essence
            else if (item.id === 11) {
                document.getElementById('time-number').textContent = item.quantity;
            }
        });
    }

    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            action: 'fetch_items',
        });
    }

    // Execute
    execute() {
        this.readIndexedDB().then((items) => {
            this.updateDOMWithItems(items);
            this.addToSyncQueue();
        }).catch(error => {
            console.error('Error loading items:', error);
        });
    }
}

class AddItemCommand extends Command {
    constructor(id, deltaQuantity) {
        super();
        this.id = id;
        this.deltaQuantity = deltaQuantity;
    }

    // Step 1: Update IndexedDB
    updateIndexedDB() {
        return new Promise((resolve, reject) => {
            if (this.deltaQuantity === 0) {
                resolve();
            }

            openIndexedDB().then(db => {
                const transaction = db.transaction('Items', 'readwrite');
                const store = transaction.objectStore('Items');

                // 获取道具记录
                const getRequest = store.get(this.id);  // 根据 id 找道具

                getRequest.onsuccess = (event) => {
                    const data = event.target.result;
                    
                    // 更新道具记录
                    data.quantity += this.deltaQuantity;
                    const updateRequest = store.put(data);
                    updateRequest.onsuccess = () => {
                        console.log(`本地道具成功增加${this.deltaQuantity}`);
                        resolve(data);
                    }
                    updateRequest.onerror = (event) => {
                        console.error('本地道具更新失败');
                        reject('Error updating item:', event.target.error);
                    }
                };

                getRequest.onerror = (event) => {
                    console.error('查找道具记录失败');
                    reject('Error getting item:', event.target.error);
                };
            });
        });
    }

    // TODO Step 2: Update DOM
    updateDOM(item) {
        if (item.id === 1) {
            document.getElementById('coin-number').textContent = item.quantity;
        }
        else if (item.id === 11) {
            document.getElementById('time-number').textContent = item.quantity;
        }
    }

    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        if (this.deltaQuantity === 0) {
            return;
        }

        taskQueueManager.addTaskToQueue({
            action: 'add_item',
            data: { id: this.id, delta: this.deltaQuantity }
        });
    }

    // Execute
    execute() {
        this.updateIndexedDB().then((data) => {
            this.updateDOM(data);
            this.addToSyncQueue();
        }).catch(error => {
            console.error('Error adding item:', error);
        });
    }
}

class AddPokemonExpCommand extends Command {
    constructor(exp) {
        super();
        this.exp = exp;
    }

    // Step 1: Update IndexedDB
    updateIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDB().then(db => {
                // 修改本地 Pokedex 数据表
                const transaction = db.transaction('Pokedex', 'readwrite');
                const store = transaction.objectStore('Pokedex');
                const getRequest = store.getAll();

                getRequest.onsuccess = (event) => {
                    const pokemons = event.target.result;
                    pokemons.forEach(pokemon => {
                        if (pokemon.is_unlocked) {
                            // 增加经验并更新等级: level = floor((exp)^(1/3))
                            pokemon.exp += Math.round(this.exp * pokemon.learning_rate);
                            pokemon.level = Math.max(Math.floor(Math.pow(pokemon.exp, 1/3)), 1);

                            // 保存完整的宝可梦对象
                            const putRequest = store.put(pokemon);

                            putRequest.onsuccess = () => {
                                console.log(`Pokemon exp locally updated:${pokemon.name_cn}-level${pokemon.level}`);
                            };
                
                            putRequest.onerror = (event) => {
                                console.error('Error updating pokemon exp:', event.target.error);
                            };
                        }
                    });
                    resolve(pokemons);
                }

                getRequest.onerror = (event) => {
                    console.error('查找宝可梦记录失败');
                    reject('Error getting pokedex:', event.target.error);
                };
            });
        });
    }

    // Step 2: Update DOM
    updateDOMWithPokemons(pokemons) {
        // 暂时不需要, 因为增加经验只会在 Research 界面产生
    }

    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            action: 'add_pokemon_exp',
            data: { delta: this.exp }
        });
    }

    // Execute
    execute() {
        this.updateIndexedDB().then((pokemons) => {
            console.log('Exp successfully added in IndexedDB:', this.exp);
            this.updateDOMWithPokemons(pokemons);
            this.addToSyncQueue();
        }).catch((error) => {
            console.error('Failed to update exp:', error);
        });
    }
}

class AddPokemonImgCommand extends Command {
    constructor(id, url_id, img_url) {
        super();
        this.id = id;
        this.url_id = url_id;
        this.img_url = img_url;
    }

    updateIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDB().then(db => {
                const transaction = db.transaction('Pokedex', 'readwrite');
                const store = transaction.objectStore('Pokedex');
                const getRequest = store.get([this.id, this.url_id]);

                getRequest.onsuccess = (event) => {
                    const pokemon = event.target.result;
                    if (!pokemon.img_urls) {
                        pokemon.img_urls = [];
                    }
                    pokemon.img_urls.push(this.img_url);
                    this.img_urls = pokemon.img_urls;

                    const putRequest = store.put(pokemon);
                    putRequest.onsuccess = () => {
                        console.log(`[Succeed] IndexedDB-put:${pokemon.name_cn}'s url+=${this.img_url}`);
                        resolve(pokemon);
                    };
                    putRequest.onerror = (event) => {
                        console.error(`[Error] IndexedDB-put:${pokemon.name_cn}`, event.target.error);
                        reject('Error adding img_url to pokemon', event.target.error);
                    };
                };

                getRequest.onerror = (event) => {
                    const msg = `[Error] IndexedDB-get:id=${this.id},url_id=${this.url_id}` + event.target.error;
                    console.error(msg);
                    reject(msg);
                }
            });
        });
    }

    updateDOMWithPokemon(pokemon) {
        displayMediaContainer(pokemon);
        const mediaContainer = document.getElementById('pokedex-media-container');
        mediaContainer.innerHTML = '';
        if (pokemon.img_urls) {
            pokemon.img_urls.forEach(url => {
              const imgCard = document.createElement('img');
              imgCard.src = url;
              mediaContainer.appendChild(imgCard);
            });
        }
    }

    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            action: 'add_pokemon_img',
            data: { 
                id:this.id, 
                url_id: this.url_id, 
                img_url: this.img_url 
            }
        });
    }

    execute() {
        this.updateIndexedDB().then((pokemon) => {
            this.updateDOMWithPokemon(pokemon);
            this.addToSyncQueue();
        }).catch((error) => {
            console.error('Failed to execute AddPokemonImgCommand:', error);
        });
    }
}

class AddPokemonHatchCounterCommand extends Command {
    constructor(counter) {
        super();
        this.counter = counter;
        this.pokemons = [];
    }

    // 判断目前的宝可梦是否是可以孵化的
    isHatchable(pokemon) {
        // pokemon.is_legendary || pokemon.is_mythical || pokemon.evolution_chain_position >= 4
        if (pokemon.is_unlocked || pokemon.is_hatching) {
            return false;
        }
        else {
            return true;
        }
    }

    // 计算随机选择宝可梦的权重
    calcWeight(pokemon) {
        if (pokemon.is_legendary || pokemon.is_mythical) {
            return 2.0;
        }
        return (100.0 / Math.pow(pokemon.evolution_chain_position, 2));
    }

    // 此函数目前只随机选择一个符合条件的 pokemon 作为新孵的蛋
    getRandomPokemonToHatch(store) {
        return new Promise((resolve, reject) => {
            let totalWeight = 0;
            let matchingItems = [];
            
            const getUnhatchRequest = store.openCursor();
            getUnhatchRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const pokemon = cursor.value;

                    // 筛选符合条件的项
                    if (this.isHatchable(pokemon)) {
                        // 计算权重并记录
                        const weight = this.calcWeight(pokemon);
                        matchingItems.push({
                            id: pokemon.id, 
                            url_id: pokemon.url_id,
                            weight: weight});
                        totalWeight += weight;
                    }
                    cursor.continue();  // 继续遍历下一个条目
                } else {
                    // 遍历结束后从符合条件的项中按权重随机选择一个
                    const random = Math.random() * totalWeight;

                    let accumulatedWeight = 0;
                    let selectedPokemon = null;
                    for (const item of matchingItems) {
                        accumulatedWeight += item.weight;
                        if (random <= accumulatedWeight) {
                            selectedPokemon = item;
                            break;
                        }
                    }

                    if (selectedPokemon) {
                        const getRequest = store.get([selectedPokemon.id, selectedPokemon.url_id]);
                        getRequest.onsuccess = (event) => {
                            const pokemon = event.target.result;
                            resolve(pokemon);
                        }

                        getRequest.onerror = (event) => {
                            console.error('Error selecting pokemon:', event.target.error);
                            reject('Error selecting pokemon');  // 没有找到符合条件的项
                        }
                    } else {
                        reject('Error selecting pokemon');  // 没有找到符合条件的项
                    }
                }
            };

            getUnhatchRequest.onerror = (event) => {
                reject('Error accessing Pokedex:', event.target.error);
            };
        });
    }

    // 把颜色转换成 bootstrap 里有设置的颜色, e.g. --bs-orange
    convertToBootstrapExistedColor(color) {
        switch (color) {
            case 'brown':
                return 'orange';
            case 'white':
                return 'gray-400';
            default:  // blue, purple, pink, red, yellow, green, black, gray
                return color;
        }
    }

    // Step 1: Update IndexedDB
    updateIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDB().then(db => {
                // 修改本地 Pokedex 数据表
                const transaction = db.transaction('Pokedex', 'readwrite');
                const store = transaction.objectStore('Pokedex');
                // const index = store.index('is_hatching_index');
                const getHatchingRequest = store.getAll();  // 获取所有 is_hatching===true 的宝可梦

                getHatchingRequest.onsuccess = (event) => {
                    const pokemons = event.target.result;
                    pokemons.forEach(pokemon => {
                        if (pokemon.is_hatching) {
                            pokemon.current_hatch_counter += this.counter;
    
                            // 如果孵化时间到, 则修改属性并随机开始一个新的孵化
                            if (isHatched(pokemon)) {
                                pokemon.is_unlocked = true;
                                pokemon.unlocked_at = new Date().toISOString();
                                pokemon.is_hatching = false;
    
                                // 随机获取一个符合条件的进行孵化
                                this.getRandomPokemonToHatch(store)
                                .then(newPokemon => {
                                    if (newPokemon) {
                                        newPokemon.is_hatching = true;
                                        newPokemon.current_hatch_counter = 0;
    
                                        console.log("newPokemon:", newPokemon);
                                        const putRequest = store.put(newPokemon);
                                        putRequest.onsuccess = () => {
                                            console.log(`#[${newPokemon.weight/10}kg-${newPokemon.height/10}m] pokemon successfully starts hatching`);
                                            
                                            // 保存更改的部分到 this.pokemons, 留待 Step 3 更新到数据库
                                            this.pokemons.push(newPokemon
                                                // {
                                                // id: newPokemon.id,
                                                // url_id: newPokemon.url_id,
                                                // is_hatching: newPokemon.is_hatching,
                                                // hatch_counter: newPokemon.hatch_counter,
                                                // current_hatch_counter: newPokemon.current_hatch_counter,
                                                // color: newPokemon.color,
                                                // evolution_chain_position: newPokemon.evolution_chain_position,
                                                // }
                                            );
                                        };
                                        putRequest.onerror = () => {
                                            console.error(`#[${newPokemon.id}-${newPokemon.url_id}] pokemon failed to start hatching`);
                                        };
                                        console.log("this.pokemons(should have new one):", this.pokemons);
                                    }
                                });
                            }
    
                            // 保存完整的宝可梦对象
                            const putRequest = store.put(pokemon);
    
                            putRequest.onsuccess = () => {
                                console.log(`Pokemon ${pokemon.id}/${pokemon.url_id} hatch counter successfully + ${this.counter}`);
                            };
                            putRequest.onerror = (event) => {
                                console.error(`Error hatching pokemon ${pokemon.name_en}/${pokemon.name_cn}:`, event.target.error);
                            };
    
                            // 保存更改的部分到 this.pokemons, 留待 Step 3 更新到数据库
                            this.pokemons.push(pokemon
                                // {
                                // id: pokemon.id,
                                // url_id: pokemon.url_id,
                                // is_unlocked: pokemon.is_unlocked,
                                // unlocked_at: pokemon.unlocked_at,
                                // is_hatching: pokemon.is_hatching,
                                // hatch_counter: pokemon.hatch_counter,
                                // current_hatch_counter: pokemon.current_hatch_counter,
                                // color: pokemon.color,
                                // evolution_chain_position: pokemon.evolution_chain_position,
                                // }
                            );
                            console.log("this.pokemons:", this.pokemons);
                        }
                    });
                    resolve(this.pokemons);
                }

                getHatchingRequest.onerror = (event) => {
                    console.error('查找宝可梦记录失败');
                    reject('Error getting pokedex:', event.target.error);
                };
            });
        });
    }

    // Step 2: Update DOM
    updateDOM() {
        const eggProgressList = document.querySelector('#egg-hatching-progress');
        eggProgressList.innerHTML = '';
        this.pokemons.forEach(pokemon => {
            if (pokemon.is_hatching) {
                const currentCounter = pokemon.current_hatch_counter;
                const totalCounter = totalHatchCounterNeeded(pokemon);
                const progress = (currentCounter / totalCounter) * 100;
                const imgSrc = `../static/imgs/eggs/${pokemon.color}.png`;
                const color = this.convertToBootstrapExistedColor(pokemon.color);
                eggProgressList.innerHTML += `
                    <div class="d-flex align-items-center">
                        <img class="me-2" src="${imgSrc}">
                        <div class="progress egg-progress my-3">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${Math.max(progress, 5)}%; background-color: var(--bs-${color});" aria-valuenow="${currentCounter}" aria-valuemin="0" aria-valuemax="${totalCounter}">
                                ${currentCounter} / ${Math.round(totalCounter)}
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    // 这里和 updateTask 类似, 是把新的 pokemonData 直接 update 到数据库中.
    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        this.pokemons.forEach(pokemon => {
            taskQueueManager.addTaskToQueue({
                action: 'update_pokemon',
                data: pokemon
            });
        });
    }

    // Execute
    execute() {
        this.updateIndexedDB().then(() => {
            console.log('Pokemons successfully updated in IndexedDB');
            setTimeout(() => this.updateDOM(), 1000);
            // this.updateDOM();
            setTimeout(() => this.addToSyncQueue(), 1000);
            // this.addToSyncQueue();
        }).catch((error) => {
            console.error('Failed to update pokemons:', error);
        });
    }
}

class AddPokemonLearningRateCommand extends Command {
    constructor(id, url_id, times) {
        super();
        this.id = id;
        this.url_id = url_id;
        this.times = times; // Math.pow(1.01, times);
    }

    // Step 1: Update IndexedDB
    updateIndexedDB() {
        return new Promise((resolve, reject) => {
            openIndexedDB().then(db => {
                // 修改本地 Pokedex 数据表
                const transaction = db.transaction('Pokedex', 'readwrite');
                const store = transaction.objectStore('Pokedex');
                const getRequest = store.get([this.id, this.url_id]);

                getRequest.onsuccess = (event) => {
                    const pokemon = event.target.result;

                    // 更改 learning_rate
                    pokemon.learning_rate *= this.times;

                    // 保存完整的宝可梦对象
                    const putRequest = store.put(pokemon);

                    putRequest.onsuccess = () => {
                        console.log(`Pokemon learning_rate locally updated:${pokemon.name_cn}-lr${pokemon.learning_rate}`);
                    };
        
                    putRequest.onerror = (event) => {
                        console.error('Error updating pokemon exp:', event.target.error);
                    };

                    resolve(pokemon);
                }

                getRequest.onerror = (event) => {
                    console.error('查找宝可梦记录失败');
                    reject('Error getting pokedex:', event.target.error);
                };
            });
        });
    }

    // Step 2: Update DOM
    updateDOMWithPokemon(pokemon) {
        const sidebarCard = document.getElementById(`pokedex-card-${this.url_id}`);
        if (sidebarCard) {
            const progressBar = sidebarCard.querySelector('.progress-bar-animated');
            progressBar.style.setProperty('animation-duration', `${3. / Math.sqrt(pokemon.learning_rate)}s`);
        }
    }

    // Step 3: Add to queue for backend sync
    addToSyncQueue() {
        taskQueueManager.addTaskToQueue({
            action: 'add_pokemon_lr',
            data: { id: this.id, url_id: this.url_id, times: this.times }
        });
    }

    // Execute
    execute() {
        this.updateIndexedDB().then((pokemon) => {
            console.log('Learning rate successfully multiplied in IndexedDB:', this.times);
            this.updateDOMWithPokemon(pokemon);
            this.addToSyncQueue();
        }).catch((error) => {
            console.error('Failed to update learning rate:', error);
        });
    }
}

// 打开 IndexedDB Tasks
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('localDatabase', 6);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('Tasks')) {
                db.createObjectStore('Tasks', { keyPath: 'id', autoIncrement: true});
            }
            if (!db.objectStoreNames.contains('Pokedex')) {
                const store = db.createObjectStore('Pokedex', { keyPath: ['id', 'url_id'] });
                // store.createIndex('is_hatching_index', 'is_hatching', { unique: false });
            }
            if (!db.objectStoreNames.contains('Research')) {
                db.createObjectStore('Research', { keyPath: 'date' });
            }
            if (!db.objectStoreNames.contains('Items')) {
                db.createObjectStore('Items', { keyPath: 'id' });
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            reject('IndexedDB initialization failed');
        };
    });
}

// 计算当前宝可梦孵化所需的hatch_counter
function totalHatchCounterNeeded(pokemon) {
    return pokemon.hatch_counter * Math.sqrt(pokemon.evolution_chain_position);
}

// 判断目前宝可梦的孵化是否已完成
function isHatched(pokemon) {
    return (pokemon.current_hatch_counter >= totalHatchCounterNeeded(pokemon));
}