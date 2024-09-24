!function(t,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define(r):t.ColorThief=r()}(this,function(){if(!t)var t={map:function(t,r){var n={};return r?t.map(function(t,o){return n.index=o,r.call(n,t)}):t.slice()},naturalOrder:function(t,r){return t<r?-1:t>r?1:0},sum:function(t,r){var n={};return t.reduce(r?function(t,o,e){return n.index=e,t+r.call(n,o)}:function(t,r){return t+r},0)},max:function(r,n){return Math.max.apply(null,n?t.map(r,n):r)}};var r=function(){var r=5,n=8-r,o=1e3;function e(t,n,o){return(t<<2*r)+(n<<r)+o}function i(t){var r=[],n=!1;function o(){r.sort(t),n=!0}return{push:function(t){r.push(t),n=!1},peek:function(t){return n||o(),void 0===t&&(t=r.length-1),r[t]},pop:function(){return n||o(),r.pop()},size:function(){return r.length},map:function(t){return r.map(t)},debug:function(){return n||o(),r}}}function u(t,r,n,o,e,i,u){this.r1=t,this.r2=r,this.g1=n,this.g2=o,this.b1=e,this.b2=i,this.histo=u}function a(){this.vboxes=new i(function(r,n){return t.naturalOrder(r.vbox.count()*r.vbox.volume(),n.vbox.count()*n.vbox.volume())})}function s(r,n){if(n.count()){var o=n.r2-n.r1+1,i=n.g2-n.g1+1,u=t.max([o,i,n.b2-n.b1+1]);if(1==n.count())return[n.copy()];var a,s,h,c,f=0,v=[],l=[];if(u==o)for(a=n.r1;a<=n.r2;a++){for(c=0,s=n.g1;s<=n.g2;s++)for(h=n.b1;h<=n.b2;h++)c+=r[e(a,s,h)]||0;v[a]=f+=c}else if(u==i)for(a=n.g1;a<=n.g2;a++){for(c=0,s=n.r1;s<=n.r2;s++)for(h=n.b1;h<=n.b2;h++)c+=r[e(s,a,h)]||0;v[a]=f+=c}else for(a=n.b1;a<=n.b2;a++){for(c=0,s=n.r1;s<=n.r2;s++)for(h=n.g1;h<=n.g2;h++)c+=r[e(s,h,a)]||0;v[a]=f+=c}return v.forEach(function(t,r){l[r]=f-t}),function(t){var r,o,e,i,u,s=t+"1",h=t+"2",c=0;for(a=n[s];a<=n[h];a++)if(v[a]>f/2){for(e=n.copy(),i=n.copy(),u=(r=a-n[s])<=(o=n[h]-a)?Math.min(n[h]-1,~~(a+o/2)):Math.max(n[s],~~(a-1-r/2));!v[u];)u++;for(c=l[u];!c&&v[u-1];)c=l[--u];return e[h]=u,i[s]=e[h]+1,[e,i]}}(u==o?"r":u==i?"g":"b")}}return u.prototype={volume:function(t){return this._volume&&!t||(this._volume=(this.r2-this.r1+1)*(this.g2-this.g1+1)*(this.b2-this.b1+1)),this._volume},count:function(t){var r=this.histo;if(!this._count_set||t){var n,o,i,u=0;for(n=this.r1;n<=this.r2;n++)for(o=this.g1;o<=this.g2;o++)for(i=this.b1;i<=this.b2;i++)u+=r[e(n,o,i)]||0;this._count=u,this._count_set=!0}return this._count},copy:function(){return new u(this.r1,this.r2,this.g1,this.g2,this.b1,this.b2,this.histo)},avg:function(t){var n=this.histo;if(!this._avg||t){var o,i,u,a,s=0,h=1<<8-r,c=0,f=0,v=0;for(i=this.r1;i<=this.r2;i++)for(u=this.g1;u<=this.g2;u++)for(a=this.b1;a<=this.b2;a++)s+=o=n[e(i,u,a)]||0,c+=o*(i+.5)*h,f+=o*(u+.5)*h,v+=o*(a+.5)*h;this._avg=s?[~~(c/s),~~(f/s),~~(v/s)]:[~~(h*(this.r1+this.r2+1)/2),~~(h*(this.g1+this.g2+1)/2),~~(h*(this.b1+this.b2+1)/2)]}return this._avg},contains:function(t){var r=t[0]>>n;return gval=t[1]>>n,bval=t[2]>>n,r>=this.r1&&r<=this.r2&&gval>=this.g1&&gval<=this.g2&&bval>=this.b1&&bval<=this.b2}},a.prototype={push:function(t){this.vboxes.push({vbox:t,color:t.avg()})},palette:function(){return this.vboxes.map(function(t){return t.color})},size:function(){return this.vboxes.size()},map:function(t){for(var r=this.vboxes,n=0;n<r.size();n++)if(r.peek(n).vbox.contains(t))return r.peek(n).color;return this.nearest(t)},nearest:function(t){for(var r,n,o,e=this.vboxes,i=0;i<e.size();i++)((n=Math.sqrt(Math.pow(t[0]-e.peek(i).color[0],2)+Math.pow(t[1]-e.peek(i).color[1],2)+Math.pow(t[2]-e.peek(i).color[2],2)))<r||void 0===r)&&(r=n,o=e.peek(i).color);return o},forcebw:function(){var r=this.vboxes;r.sort(function(r,n){return t.naturalOrder(t.sum(r.color),t.sum(n.color))});var n=r[0].color;n[0]<5&&n[1]<5&&n[2]<5&&(r[0].color=[0,0,0]);var o=r.length-1,e=r[o].color;e[0]>251&&e[1]>251&&e[2]>251&&(r[o].color=[255,255,255])}},{quantize:function(h,c){if(!h.length||c<2||c>256)return!1;var f=function(t){var o,i=new Array(1<<3*r);return t.forEach(function(t){o=e(t[0]>>n,t[1]>>n,t[2]>>n),i[o]=(i[o]||0)+1}),i}(h);f.forEach(function(){});var v=function(t,r){var o,e,i,a=1e6,s=0,h=1e6,c=0,f=1e6,v=0;return t.forEach(function(t){(o=t[0]>>n)<a?a=o:o>s&&(s=o),(e=t[1]>>n)<h?h=e:e>c&&(c=e),(i=t[2]>>n)<f?f=i:i>v&&(v=i)}),new u(a,s,h,c,f,v,r)}(h,f),l=new i(function(r,n){return t.naturalOrder(r.count(),n.count())});function g(t,r){for(var n,e=t.size(),i=0;i<o;){if(e>=r)return;if(i++>o)return;if((n=t.pop()).count()){var u=s(f,n),a=u[0],h=u[1];if(!a)return;t.push(a),h&&(t.push(h),e++)}else t.push(n),i++}}l.push(v),g(l,.75*c);for(var p=new i(function(r,n){return t.naturalOrder(r.count()*r.volume(),n.count()*n.volume())});l.size();)p.push(l.pop());g(p,c);for(var d=new a;p.size();)d.push(p.pop());return d}}}().quantize,n=function(t){this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.width=this.canvas.width=t.width,this.height=this.canvas.height=t.height,this.context.drawImage(t,0,0,this.width,this.height)};n.prototype.getImageData=function(){return this.context.getImageData(0,0,this.width,this.height)};var o=function(){};return o.prototype.getColor=function(t,r){return void 0===r&&(r=10),this.getPalette(t,5,r)[0]},o.prototype.getPalette=function(t,o,e){var i=function(t){var r=t.colorCount,n=t.quality;if(void 0!==r&&Number.isInteger(r)){if(1===r)throw new Error("colorCount should be between 2 and 20. To get one color, call getColor() instead of getPalette()");r=Math.max(r,2),r=Math.min(r,20)}else r=10;return void 0===n||Number.isInteger(n)?n=10:n<1&&(n=10),{colorCount:r,quality:n}}({colorCount:o,quality:e}),u=new n(t),a=function(t,r,n){for(var o=t,e=[],i=0,u=void 0,a=void 0,s=void 0,h=void 0,c=void 0;i<r;i+=n)a=o[0+(u=4*i)],s=o[u+1],h=o[u+2],(void 0===(c=o[u+3])||c>=125)&&(a>250&&s>250&&h>250||e.push([a,s,h]));return e}(u.getImageData().data,u.width*u.height,i.quality),s=r(a,i.colorCount);return s?s.palette():null},o.prototype.getColorFromUrl=function(t,r,n){var o=document.createElement("img"),e=this;o.addEventListener("load",function(){var i=e.getPalette(o,5,n);r(i[0],t)}),o.src=t},o.prototype.getImageData=function(t,r){var n=new XMLHttpRequest;n.open("GET",t,!0),n.responseType="arraybuffer",n.onload=function(){if(200==this.status){var t=new Uint8Array(this.response);o=t.length;for(var n=new Array(o),o=0;o<t.length;o++)n[o]=String.fromCharCode(t[o]);var e=n.join(""),i=window.btoa(e);r("data:image/png;base64,"+i)}},n.send()},o.prototype.getColorAsync=function(t,r,n){var o=this;this.getImageData(t,function(t){var e=document.createElement("img");e.addEventListener("load",function(){var t=o.getPalette(e,5,n);r(t[0],this)}),e.src=t})},o});
const colorThief = new ColorThief();

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
            openIndexedDB()
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

    fetchPokedex() {
        fetch('/fetch_pokedex')
        .then(response => response.json())
        .then(pokedex => {
            openIndexedDB()
            .then(db => {
                const transaction = db.transaction('Pokedex', 'readwrite');
                const store = transaction.objectStore('Pokedex');

                pokedex.forEach(pokemon => {
                    store.put({ ...pokemon, id: pokemon.id });

                    const listItem = document.querySelector(`#pokedex-card-${pokemon.id}`);
                    if (!listItem) {
                        // 如果 sidebar 中没有此宝可梦则展示
                        displaySidebarCard(pokemon);
                    }

                    // 这里是否需要更新 DOM 呢?
                    //  如果更新, 似乎要全部都更新一遍
                    //  如果不更新, 则手动刷新即可
                });
            });
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
                this.fetchTodo();
                break;
            case 'create_todo':
                this.createTodo(task);
                break;
            case 'delete_todo':
                this.deleteTodo(task);
                break;
            case 'update_todo':
                this.updateTodo(task);
                break;
            case 'finish_todo':
                this.finishTodo(task);
                break;
            case 'fetch_pokedex':
                this.fetchPokedex();
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



// 打开 IndexedDB Tasks
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('localDatabase', 2);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('Tasks')) {
                db.createObjectStore('Tasks', { keyPath: 'id', autoIncrement: true});
            }
            if (!db.objectStoreNames.contains('Pokedex')) {
                db.createObjectStore('Pokedex', { keyPath: 'id' });
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

// 在侧边栏中展示当前宝可梦缩略卡片
function displaySidebarCard(pokemon) {
    const pokedexSidebar = document.getElementById('pokedex-list');
    const sidebarCard = document.createElement('div');
    // sidebarCard.classList.add('pokedex-card');

    const id = pokemon.id;
    const formattedId = String(id).padStart(3, '0');
    const imgSrc = `static/imgs/${formattedId}.png`;
    const isUnlocked = pokemon.is_unlocked;
    const nameCN = pokemon.name_cn;
    const nameEN = pokemon.name_en;
    const nameCNEN = nameCN + ' ' + nameEN;
    const type1 = pokemon.type1;
    const type2 = pokemon.type2;
    const level = pokemon.level;

    let typeContext;
    if (isUnlocked) {
        typeContext = `${type1}`;
        if (type2) {
            typeContext = typeContext + ` / ${type2}`;
        }
    } else {
        typeContext = '??';
        if (type2) {
            typeContext = typeContext + ' / ??';
        }
    }

    // 缩略卡片内容
    sidebarCard.innerHTML = `
        <div class="pokedex-card" id="pokedex-card-${id}">
            <div class="pokedex-card-info">
                <strong>No.${formattedId} ${isUnlocked ? nameCNEN : '???'}</strong>
                <span>${typeContext}</span>
            </div>
            <div class="pokedex-card-thumbnail">
                <img id="pokedex-thumbnail-${pokemon.id}" src="${imgSrc}" alt="${pokemon.name_cn}">
            </div>
        </div>
    `;
    // <span>${isUnlocked ? pokemon.name_en : '???'}</span>

    pokedexSidebar.appendChild(sidebarCard);

    // 图片加载后提取颜色
    const card = document.getElementById(`pokedex-card-${id}`);
    const thumbnailElement = document.getElementById(`pokedex-thumbnail-${id}`);
    
    // 检查解锁状态
    if (isUnlocked === false) {
        // 设置卡片背景为灰色
        card.style.backgroundColor = "var(--bs-gray)"; // "rgba(66,66,66,0.2)", "#424242"
        // 设置宝可梦缩略图为黑色剪影. 如果加上 invert(1) 或者直接 brightness(1) 就是白色剪影
        thumbnailElement.style.filter = 'brightness(0) invert(0.4)';
    } else {
        thumbnailElement.addEventListener('load', () => {
            if (thumbnailElement.complete && thumbnailElement.naturalHeight !== 0) {
                // 提取图片主题色
                let color = colorThief.getColor(thumbnailElement);
                color = increaseSaturationLightness(color, 12, 6);
                card.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            }
        });
    }

    sidebarCard.addEventListener('click', () => {
        // 当点击时, 更新右侧区域的信息
        const detailElement = document.querySelector(`.pokedex-detail`);
        detailElement.innerHTML = `
            <h2>${nameCN} / ${nameEN}</h2>
            <h3><strong>Level:</strong> ${level}</h3>
        `;
    })

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

// 将RGB转换为HSL，增加饱和度和亮度
function increaseSaturationLightness(rgb, saturationIncrease = 10, lightnessIncrease = 10) {
    const [r, g, b] = rgb.map(x => x / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
  
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
  
      h /= 6;
    }
  
    // 增加饱和度
    s = Math.max(0, Math.min(1, s + saturationIncrease / 100));
  
    // 增加亮度
    l = Math.max(0, Math.min(1, l + lightnessIncrease / 100));
  
    // 转回到RGB
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
  
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
  
    let rNew = hue2rgb(p, q, h + 1 / 3);
    let gNew = hue2rgb(p, q, h);
    let bNew = hue2rgb(p, q, h - 1 / 3);
  
    return [Math.round(rNew * 255), Math.round(gNew * 255), Math.round(bNew * 255)];
}
