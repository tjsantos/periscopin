
async_mode = 'eventlet'
import eventlet
eventlet.monkey_patch()
print('async_mode is ' + async_mode)

from flask import Flask
from flask_socketio import SocketIO
from whitenoise import WhiteNoise

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'  # no encryption/sessions used
app.wsgi_app = WhiteNoise(app.wsgi_app, root='app/dist/', index_file=True)
socketio = SocketIO(app, async_mode=async_mode)
from app import views
