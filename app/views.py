from app import app, socketio
from app.stream import stream_manager
from flask import render_template

from threading import Thread
from datetime import datetime
import time

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect', namespace='/main')
def on_connect():
    stream_manager.new_connection()

@socketio.on('disconnect', namespace='/main')
def on_disconnect():
    stream_manager.new_disconnect()

