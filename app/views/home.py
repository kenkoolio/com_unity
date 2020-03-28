# Module: home.py
# Description: Defines routes for the home page.

from __main__ import app
from flask import render_template
import os, sys

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
def test():
    return render_template('index.html')
