# Module: home.py
# Description: Defines routes for the home page.

from __main__ import app

@app.route('/')
def hello():
    return "Hello World";
