# Module: home.py
# Description: Defines routes for the home page.

from __main__ import app
from flask import render_template, request, redirect
import os, sys
import datetime

# Following Lines are for assigning parent directory dynamically.
# Citation: https://askubuntu.com/questions/1163847/modulenotfounderror-while-importing-module-from-parent-folder
dir_path = os.path.dirname(os.path.realpath(__file__))
parent_dir_path = os.path.abspath(os.path.join(dir_path, os.pardir))
sys.path.insert(0, parent_dir_path)

from db_connector.db_connector import connect_to_database, execute_query


# @app.route('/hello')
# def hello():
#     return "Hello World";

# @app.route('/test')
# def test():
#     return render_template('test.html')

@app.route('/')
def home():
    '''
    Serves home page
    '''
    return render_template('index.html')


@app.route('/messages', methods=['POST'])
def save_message():
    '''
    Saves voice recording data submitted by a user.
    '''
    try:
        # get request data
        req_data = request.get_json()

        now = datetime.datetime.now()
        mood = req_data['mood']     #required
        audio = req_data['audio']   #required
        name = req_data['name']
        age = req_data['age']
        location = req_data['location']

        # connect to db
        db_conn = connect_to_database()

        # form query string with optional fields
        query = 'INSERT INTO messages (message_date, user_mood, user_name, user_age, user_location) \
                VALUES ({}, {}'.format(now, mood)

        if name:
            query += ', "{}"'.format(name)
        else:
            query += ', null'

        if age:
            query += ', {}'.format(age)
        else:
            query += ', null'

        if location:
            query += ', "{}"'.format(location)
        else:
            query += ', null'

        query += ')'

        print('TEST: {}'.format(query))

        result = execute_query(db_conn, query)

        return redirect('/')
    except Exception as e:
        print('Error: Trying to post new voice message to timeline: {}'.format(e))
