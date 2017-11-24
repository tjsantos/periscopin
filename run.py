from app import app, socketio, settings

if __name__ == '__main__':
    print(f'debug: {settings.DEBUG}')
    socketio.run(app, host='0.0.0.0', port=settings.PORT, debug=settings.DEBUG)
