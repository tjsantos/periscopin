import os

TWITTER_CONSUMER_KEY = os.environ['TWITTER_CONSUMER_KEY']
TWITTER_CONSUMER_SECRET = os.environ['TWITTER_CONSUMER_SECRET']
TWITTER_OAUTH_TOKEN = os.environ['TWITTER_OAUTH_TOKEN']
TWITTER_OAUTH_SECRET = os.environ['TWITTER_OAUTH_SECRET']
DEBUG = os.environ.get('APP_DEBUG', False)
CAPTURE_DATA = os.environ.get('APP_CAPTURE_DATA', False)
PORT = int(os.environ.get('PORT', 5000))
SECRET_KEY = 'secret!'  # no encryption/sessions used
