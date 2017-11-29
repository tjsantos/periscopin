from . import socketio, settings, stream


class NullClass:
    def __init__(self):
        print('using NullClass')

    def __getattr__(self, item):
        print('mock attr: ' + item)
        print('using empty function')

        def empty(*args, **kwargs):
            print(f'{item} called with args:{args}, kwargs: {kwargs}')

        return empty


# dependency injection: obtain dependencies at runtime based on environment settings
def get_stream():
    if settings.DEBUG:
        return NullClass()
    else:
        return stream.default_stream


stream_manager = stream.StreamManager(get_stream())


@socketio.on('connect', namespace='/main')
def on_connect():
    stream_manager.new_connection()


@socketio.on('disconnect', namespace='/main')
def on_disconnect():
    stream_manager.new_disconnect()

