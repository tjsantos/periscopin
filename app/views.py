from app import app, socketio
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


class StreamManager:

    def __init__(self):
        self.users = 0
        self.running = False

    def _stream(self):
        while self.running:
            now = datetime.now().isoformat()
            #print(now)
            data = {
                'name': 'name', 'screen_name': 'screen_name', 'created_at': now,
                'location': {
                    'city': 'city',
                    'country': 'country'
                },
                'status': 'status',
            }
            socketio.emit('new stream', data, namespace='/main')
            time.sleep(5)

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
        print('user connected ({})'.format(self.users))
        if not self.running:
            self.start_stream()

    def new_disconnect(self):
        self.users -= 1
        print('user disconnected ({})'.format(self.users))
        if self.users == 0:
            self.stop_stream()

stream_manager = StreamManager()
