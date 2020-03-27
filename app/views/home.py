# Module: home.py
# Description: Defines routes for the home page.

from __main__ import app
from flask import render_template

@app.route('/')
def hello():
    return "Hello World";

@app.route('/test')
def test():
    return render_template('test.html')
