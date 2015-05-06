from flask import render_template
from app import app, socketio

from threading import Thread
import time

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect', namespace='/main')
def on_connect():
    stream_manager.new_connection()
    print('user connected ({})'.format(stream_manager.users))

@socketio.on('disconnect', namespace='/main')
def on_disconnect():
    stream_manager.new_disconnect()
    print('user disconnected ({})'.format(stream_manager.users))

class StreamManager:

    def __init__(self):
        self.users = 0
        self.running = False

    def _stream(self):
        while self.running:
            print(time.time())
            time.sleep(2)

    def start_stream(self):
        print('starting stream')
        self.running = True
        thread = Thread(target=self._stream)
        thread.start()

    def stop_stream(self):
        print('stopping stream')
        self.running = False

    def new_connection(self):
        self.users += 1
        if not self.running:
            self.start_stream()

    def new_disconnect(self):
        self.users -= 1
        if self.users == 0:
            self.stop_stream()

stream_manager = StreamManager()
