# Module: views/home.py
# Description: Defines routes for the home page.

from __main__ import app
from flask import render_template, request, redirect, jsonify, send_file, send_from_directory
from werkzeug.utils import secure_filename
import os, sys, io
import datetime

# Following Lines are for assigning parent directory dynamically.
# Citation: https://askubuntu.com/questions/1163847/modulenotfounderror-while-importing-module-from-parent-folder
dir_path = os.path.dirname(os.path.realpath(__file__))
parent_dir_path = os.path.abspath(os.path.join(dir_path, os.pardir))
sys.path.insert(0, parent_dir_path)

from db_connector.db_connector import connect_to_database, execute_query
from app.biz import home as db_home

# @app.route('/hello')
# def hello():
#     return "Hello World";

# @app.route('/test')
# def test():
#     return render_template('test.html')

@app.route('/')
def home():
    '''
    Serves home page. Also gets all messages from the database for the home page.
    '''
    try:
        rows = db_home.get_all_messages()
        
        return render_template('index.html', rows=rows)
    except Exception as e:
        print('Error: Home page error: {}'.format(e))


@app.route('/messages', methods=['POST'])
def save_message():
    '''
    Saves voice recording data submitted by a user.
    '''
    try:
        # save audio file to directory in app/static/voices/
        f = request.files['audio']
        filename = f.filename
        filepath = 'voices/' + secure_filename(filename)
        url = parent_dir_path + '/static/' + filepath
        f.save(url)

        # save message details and audio blob to database
        data = {}
        data['mood'] = request.form['mood']
        data['name'] = request.form['name']
        data['age'] = request.form['age']
        data['location'] = request.form['location']
        data['audio'] = f
        data['url'] = filepath

        db_home.create_new_message_and_voice(data)

        return jsonify({'status': 200})
    except Exception as e:
        print('Error: Trying to post new voice message to timeline: {}'.format(e))


@app.route('/messages-in-range', methods=['GET'])
def get_all_messages_in_date_range():
    '''
    Gets all messages.
    Query arguments (required): start (date): start date of messages to retrieve.
                                end (date): end date of messages to retrieve.
    Returns: Rows (json list): messages within specified range.
    '''
    try:
        start_date = request.args.get('start')
        end_date = request.args.get('end')

        rows = db_home.get_all_messages_in_date_range(start_date, end_date)

        return jsonify(rows)
    except Exception as e:
        print('Error: Trying to get messages in date range: {}'.format(e))


@app.route('/date-count', methods=['GET'])
def get_count_of_messages_in_date_range():
    '''
    Retrieves dates and counts of messages on each date between a specified date range.
    '''
    try:
        start_date = request.args.get('start')
        end_date = request.args.get('end')

        rows = db_home.get_count_of_messages_in_date_range(start_date, end_date)

        return jsonify(rows)
    except Exception as e:
        print('Error: Trying to get count of messages in date range: {}'.format(e))


@app.route('/voice-message-db', methods=['GET'])
def get_voice_message_db():
    '''
    Get voice message binary blob from database.
    '''
    try:
        message_id = request.args.get('mid')
        if not message_id:
            raise Exception('Message ID required to get voice message.')

        # connect to db
        db_conn = connect_to_database()

        # query db
        query = 'SELECT messages.message_url, voice_message FROM messages \
        JOIN voices ON messages.message_id = voices.message_id \
        WHERE messages.message_id = {} LIMIT 1'.format(message_id)

        results = execute_query(db_conn, query)
        rows = results.fetchall()

        return send_file(io.BytesIO(rows[0][1]), attachment_filename=rows[0][0], as_attachment=True, mimetype='audio/ogg')
    except Exception as e:
        print('Error: Trying to get voice message blob from database: {}'.format(e))


@app.route('/voice-message-fd', methods=['GET'])
def get_voice_message_fd():
    '''
    Get voice message binary blob from file directory.
    '''
    try:
        message_id = request.args.get('mid')
        if not message_id:
            raise Exception('Message ID required to get voice message.')

        # connect to db
        db_conn = connect_to_database()

        # query db
        query = 'SELECT message_url FROM messages WHERE message_id = {} LIMIT 1'.format(message_id)
        results = execute_query(db_conn, query)
        rows = results.fetchall()

        path = rows[0][0]
        directory_path = parent_dir_path + '/static/'

        return send_from_directory(directory_path, path, as_attachment=True, mimetype='audio/ogg')
    except Exception as e:
        print('Error: Trying to get voice message blob from file directory: {}'.format(e))
