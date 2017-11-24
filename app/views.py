from . import socketio
from .stream import stream_manager

@socketio.on('connect', namespace='/main')
def on_connect():
    stream_manager.new_connection()

@socketio.on('disconnect', namespace='/main')
def on_disconnect():
    stream_manager.new_disconnect()

