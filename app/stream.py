import json
import os
import time
from urlparse import urlparse

from app import socketio
from pyquery import PyQuery as pq
import requests
import reverse_geocode
import tweepy

TWITTER_CONSUMER_KEY = os.environ.get('TWITTER_CONSUMER_KEY')
TWITTER_CONSUMER_SECRET = os.environ.get('TWITTER_CONSUMER_SECRET')
TWITTER_OAUTH_TOKEN = os.environ.get('TWITTER_OAUTH_TOKEN')
TWITTER_OAUTH_SECRET = os.environ.get('TWITTER_OAUTH_SECRET')

class MyListener(tweepy.streaming.StreamListener):

    def on_status(self, status):
        # skip retweets
        if getattr(status, 'retweeted_status', False):
            #print('skipping retweet by @{}\n'.format(status.author.screen_name))
            return True

        for url in status.entities['urls']:
            expanded_url = url['expanded_url']
            parsed_url = urlparse(expanded_url)
            if parsed_url.netloc == 'www.periscope.tv':
                try:
                    info = get_stream_info(expanded_url)
                except Exception as e:
                    print('Unable to get stream info from @{}:'.format(status.author.screen_name))
                    print(e)
                    print('')
                    continue

                broadcast = info['broadcast']
                location = get_location_info(broadcast)
                data = {
                    'name': status.author.name, 'screen_name': status.author.screen_name,
                    'created_at': status.created_at.isoformat() + 'Z',
                    'location': location,
                    'status': broadcast['status'],
                    'url': expanded_url
                }
                socketio.emit('new stream', data, namespace='/main')

                try:
                    print((data['name'] + ' @' + data['screen_name']).encode('utf-8'))
                    print(u', '.join(
                        [location['city'], location['country_state'], location['country']]
                    ).encode('utf-8'))
                    print(data['status'].encode('utf-8') or u'Untitled')
                    print(u'')
                except (UnicodeDecodeError, UnicodeEncodeError) as e:
                    import IPython; IPython.embed()

        return True

website = 'https://github.com/tjsantos/periscopin'
user_agent_add = '( {} )'.format(website)
headers = {'User-Agent': requests.utils.default_user_agent() + ' ' + user_agent_add}
def get_stream_info(url):
    response = requests.get(url, headers=headers)
    d = pq(response.text)
    info = d('meta[name="broadcast-data"]').attr('content')
    info = json.loads(info)
    return info

countries = reverse_geocode.GeocodeData().countries
def get_location_info(broadcast):
    bc = broadcast
    country = bc['country']
    # get country from iso code or latlong
    if not country:
        if bc['iso_code']:
            country = countries[bc['iso_code']]
        elif bc['ip_lat'] or bc['ip_lng']:
            rg_loc = reverse_geocode.get((bc['ip_lat'], bc['ip_lng']))
            country = rg_loc['country']

    location = {key: bc[key] for key in ['city', 'country_state', 'iso_code', 'ip_lat', 'ip_lng']}
    location['country'] = country
    return location

listener = MyListener()
auth = tweepy.OAuthHandler(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET)
auth.set_access_token(TWITTER_OAUTH_TOKEN, TWITTER_OAUTH_SECRET)

stream = tweepy.Stream(auth, listener)

class StreamManager:

    def __init__(self):
        self.users = 0
        self.stream = stream
        self.start_stream()

    '''
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
    '''

    def start_stream(self):
        print('starting stream')
        self.stream.filter(track=['#periscope'], async=True)
        #self.running = True
        #thread = Thread(target=self._stream)
        #thread.start()

    def stop_stream(self):
        print('stopping stream')
        self.stream.disconnect()
        #self.running = False

    def new_connection(self):
        self.users += 1
        print('user connected ({})'.format(self.users))

    def new_disconnect(self):
        self.users -= 1
        print('user disconnected ({})'.format(self.users))

stream_manager = StreamManager()
