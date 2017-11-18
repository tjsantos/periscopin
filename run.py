from app import app, socketio
import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = bool(os.environ.get('DEBUG', False))
    print('debug: ' + str(debug))
    socketio.run(app, host='0.0.0.0', port=port, debug=debug)
