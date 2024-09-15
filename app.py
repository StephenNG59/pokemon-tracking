import os
from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime
import sqlite3

app = Flask(__name__)

# 初始化数据库
def init_db():
    conn = sqlite3.connect('data/tasks.db')  # 创建或连接本地数据库文件
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            notes TEXT,
            emergency INTEGER,
            importance INTEGER,
            difficulty INTEGER,
            time INTEGER
        )
    ''')
    conn.commit()
    conn.close()

# 添加任务到数据库
@app.route('/add_task', methods=['POST'])
def add_task():
    task_data = request.json
    conn = sqlite3.connect('data/tasks.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO tasks (title, notes, emergency, importance, difficulty, time)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (task_data['title'], task_data['notes'], task_data['emergency'], task_data['importance'], task_data['difficulty'], task_data['time']))
    task_id = cursor.lastrowid  # 获取新插入任务的id
    conn.commit()
    conn.close()
    return jsonify({'status': 'success', 'id': task_id})

@app.route('/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = sqlite3.connect('data/tasks.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# 从数据库读取所有任务
@app.route('/tasks', methods=['GET'])
def get_tasks():
    conn = sqlite3.connect('data/tasks.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tasks')
    tasks = cursor.fetchall()
    conn.close()

    # 将任务数据转换为字典列表
    task_list = []
    for task in tasks:
        task_list.append({
            'id': task[0],
            'title': task[1],
            'notes': task[2],
            'emergency': task[3],
            'importance': task[4],
            'difficulty': task[5],
            'time': task[6]
        })
    
    return jsonify(task_list)

# 首页路由
@app.route('/')
def home():
    return render_template('index.html')


if __name__ == '__main__':
    init_db()  # 启动时初始化数据库
    app.run(debug=True)
