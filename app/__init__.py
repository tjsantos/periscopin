# setup eventlet async mode
import eventlet
eventlet.monkey_patch()
async_mode = 'eventlet'
print(f'async_mode is {async_mode}')

from flask import Flask
from flask_socketio import SocketIO
from whitenoise import WhiteNoise

from . import settings

app = Flask(__name__)
app.config['SECRET_KEY'] = settings.SECRET_KEY
app.wsgi_app = WhiteNoise(app.wsgi_app, root='app/dist/', index_file=True)

socketio = SocketIO(app, async_mode=async_mode)

from . import views