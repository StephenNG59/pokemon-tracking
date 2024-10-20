import os
from flask import Flask, render_template, request, jsonify
from datetime import datetime
from supabase import create_client, Client


SUPABASE_URL = os.getenv("SUPABASE_URL")  # $env:SUPABASE_URL="..."
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # $env:SUPABASE_KEY="..."
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__, static_folder='static')

# =========================================================================
# =========================================================================
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

# =========================================================================
@app.route('/fetch_pokedex', methods=['GET'])
def fetch_pokedex():
    response = supabase.table('Pokedex').select('*').execute()
    return jsonify(response.data)

# =========================================================================
@app.route('/fetch_research', methods=['GET'])
def fetch_research():
    response = supabase.table('Research').select('*').execute()
    return jsonify(response.data)

@app.route('/update_research', methods=['PUT'])
def update_research():
    data = request.json
    date = data.get('date', datetime.today())
    theory_time = data.get('theory_time', 0)
    practice_time = data.get('practice_time', 0)
    
    # 更新 Supabase 中的研究记录
    # response = supabase.table('Research').update(data).eq('date', date).execute()
    response = supabase.rpc(
        'upsert_research', {
            'day': date,
            'x_theory': theory_time,
            'x_practice': practice_time, 
    }).execute()

    if response.data:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error', 'message': '更新数据库失败'})

# =========================================================================
@app.route('/fetch_items', methods=['GET'])
def fetch_items():
    response = supabase.table('Items').select('*').execute()
    return jsonify(response.data)

@app.route('/add_item', methods=['PUT'])
def add_item():
    data = request.json
    item_id = data.get('id')
    item_delta = data.get('delta')

    # 添加 Supabase 中的道具记录
    response = supabase.rpc(
        'increase_item', {
            'x': item_delta,
            'item_id': item_id,
        }
    ).execute()

    if response.data:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error', 'message': '增减数据库的道具失败'})

# =========================================================================
@app.route('/add_pokemon_exp', methods=['PUT'])
def add_pokemon_exp():
    data = request.json
    exp_delta = data.get('delta')

    # 添加 Supabase 中的宝可梦经验
    response = supabase.rpc(
        'increase_pokemon_exp', {
            'x': exp_delta
        }
    ).execute()

    if response.data:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error', 'message': '更改数据库的宝可梦失败'})

@app.route('/add_pokemon_img', methods=['PUT'])
def add_pokemon_img():
    data = request.json
    id = data.get('id')
    url_id = data.get('url_id')
    img_url = data.get('img_url')
    print(f"{id}, {url_id}, {img_url}")
    response = supabase.rpc(
        'add_img_url', {
            'pokemon_id': id,
            'pokemon_url_id': url_id,
            'new_img_url': img_url
        }
    ).execute()

    if response.data:
        print(response.data)
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error', 'message': '添加数据库的宝可梦图片失败'})

@app.route('/update_pokemon', methods=['PUT'])
def update_pokemon():
    data = request.json
    response = supabase.table('Pokedex').update(data).eq('id', data['id']).eq('url_id', data['url_id']).execute()

    if response.data[0]['url_id'] == data['url_id']:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error'})


if __name__ == '__main__':
    app.run(debug=True)
