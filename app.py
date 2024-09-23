import os
from flask import Flask, render_template, request, jsonify
from datetime import datetime
from supabase import create_client, Client


SUPABASE_URL = os.getenv("SUPABASE_URL")  # $env:SUPABASE_URL="..."
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # $env:SUPABASE_KEY="..."
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


app = Flask(__name__, static_folder='static')


# =========================================================
# 从数据库中完成任务
@app.route('/finish_task/<int:task_id>', methods=['PUT'])
def finish_task(task_id):
    data = request.json  # 从请求中获取要更新的数据
    is_finished = data.get('is_finished')
    finished_at = data.get('finished_at')

    # 更新 Supabase 中的任务
    response = supabase.table('Tasks').update({
        'is_finished': is_finished,
        'finished_at': finished_at
    }).eq('id', task_id).execute()

    if response.data[0]['id'] == task_id:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error'})

# 从数据库读取所有任务
@app.route('/tasks', methods=['GET'])
def get_all_tasks():
    response = supabase.table('Tasks').select('*').execute()
    tasks = response.data

    # 将任务数据转换为字典列表
    task_list = []
    for task in tasks:
        task_list.append({
            'id': task['id'],
            'title': task['title'],
            'notes': task['notes'],
            'is_finished': task['is_finished'],
            'created_at': task['created_at'],
            'finished_at': task['finished_at'],
            'emergency': task['emergency'],
            'importance': task['importance'],
            'difficulty': task['difficulty'],
            'estimated_time': task['estimated_time']
        })
    
    return jsonify(task_list)

# =========================================================
# 保存每日时间和发放勋章
@app.route('/save_time', methods=['POST'])
def save_time():
    data = request.json
    date = data.get('date', datetime.today())
    theory_time = data.get('theory_time', 0)
    practice_time = data.get('practice_time', 0)

    # 保存时间逻辑（存储理论和实践的时长）
    response = supabase.rpc(
        'increase_daily_effort', {
            'day': date,
            'x_theory': theory_time,
            'x_practice': practice_time, 
    }).execute()

    if response:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error', 'message': '保存失败'})
    
# 获取历史每日时间
@app.route('/get_time_data', methods=['GET'])
def get_time_data():
    # 从数据库中获取最近一周或一月的时间数据
    response = supabase.table('DailyEffort').select('date', 'theory_time', 'practice_time').execute()

    if response.data[0]:
        return jsonify({'status': 'success', 'data': response.data})
    else:
        return jsonify({'status': 'error', 'message': '数据获取失败'})

# =========================================================
# 更新道具
@app.route('/update_items', methods=['POST'])
def update_items():
    data = request.json
    item_name = data.get('item_name')
    quantity = data.get('quantity')

    # 使用 SQL 原生查询更新 quantity 字段
    response = supabase.rpc('increase_item', {'name': item_name, 'x': quantity}).execute()

    if response:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error', 'message': '更新失败'})

# =========================================================
# 首页路由
@app.route('/')
def home():
    return render_template('index.html')

# To-Dos页路由
@app.route('/tracking/todos')
def todos():
    return render_template('todos.html')

# Habits页路由
@app.route('/tracking/habits')
def habits():
    return render_template('habits.html')

# Research页路由
@app.route('/tracking/research')
def research():
    return render_template('research.html')

# Pokedex页路由
@app.route('/pokedex')
def pokedex():
    return render_template('pokedex.html')

# =========================================================================
@app.route('/fetch_tasks', methods=['GET'])
def fetch_tasks():
    response = supabase.table('Tasks').select('*').execute()
    return jsonify(response.data)

@app.route('/create_task', methods=['POST'])
def create_task():
    task_data = request.json
    response = supabase.table('Tasks').insert({
        'id': task_data['id'],
        'title': task_data['title'],
        'notes': task_data['notes'],
        'emergency': task_data['emergency'],
        'importance': task_data['importance'],
        'difficulty': task_data['difficulty'],
        'estimated_time': task_data['estimated_time'],
        'created_at': task_data['created_at'],
        'is_finished': task_data['is_finished'],
    }, returning='representation').execute()
    if response.data:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error', 'message': '创建任务失败'})

@app.route('/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    response = supabase.table('Tasks').delete().eq('id', task_id).execute()
    if response.data[0]['id'] == task_id:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error'})

@app.route('/update_task/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json  # 从请求中获取要更新的数据

    # 更新 Supabase 中的任务
    response = supabase.table('Tasks').update(data).eq('id', task_id).execute()

    if response.data[0]['id'] == task_id:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error'})

# =========================================================================
@app.route('/api/pokedex', methods=['GET'])
def fetch_pokemons():
    response = supabase.table('Pokedex').select('*').execute()
    # print(response.data)
    return jsonify(response.data)

@app.route('/fetch_pokedex', methods=['GET'])
def fetch_pokedex():
    response = supabase.table('Pokedex').select('*').execute()
    return jsonify(response.data)

if __name__ == '__main__':
    app.run(debug=True)
