from flask import Flask
app = Flask(__name__)

from app.views import home

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
