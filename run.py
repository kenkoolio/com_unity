# Module: run.py
# Description: Entry point to the app

from flask import Flask
app = Flask(__name__,
            # static_url_path='',
            static_folder='app/static',
            template_folder='app/templates')

from app.views import home

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
    # app.run(debug=True, use_reloader=True, host='0.0.0.0', port="33887")
