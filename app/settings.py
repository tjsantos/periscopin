import os

TWITTER_CONSUMER_KEY = os.environ['TWITTER_CONSUMER_KEY']
TWITTER_CONSUMER_SECRET = os.environ['TWITTER_CONSUMER_SECRET']
TWITTER_OAUTH_TOKEN = os.environ['TWITTER_OAUTH_TOKEN']
TWITTER_OAUTH_SECRET = os.environ['TWITTER_OAUTH_SECRET']
DEBUG = os.environ.get('APP_DEBUG')
APP_DATA_MODE = os.environ.get('APP_DATA_MODE', 'default')  # 'capture', 'replay', or default
PORT = int(os.environ.get('PORT', 5000))
try:
    SECRET_KEY = os.environ['APP_SECRET_KEY']
except KeyError:
    raise Exception('secret key is not set')
