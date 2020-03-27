# Module: run.py
# Description: Entry point to the app

from flask import Flask
app = Flask(__name__)

from app.views import home

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
