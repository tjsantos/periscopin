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
            if parsed_url.netloc in ('www.periscope.tv', 'www.pscp.tv'):
                try:
                    broadcast = get_stream_info(expanded_url)
                except Exception as e:
                    print('Unable to get stream info from @{}:'.format(status.author.screen_name))
                    print(e)
                    print('')
                    continue

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

        if time.time() > stream_manager.idle_stop_time:
            stream_manager.stop_stream()

        return True

website = 'https://github.com/tjsantos/periscopin'
user_agent_add = '( {} )'.format(website)
headers = {'User-Agent': requests.utils.default_user_agent() + ' ' + user_agent_add}
def get_stream_info(url):
    # get info from initial periscope redirect url
    response = requests.get(url, headers=headers)
    d = pq(response.text)
    info = d('#page-container').attr('data-store')
    info = json.loads(info)
    broadcast_url = d('link[rel="canonical"]').attr('href')
    broadcast_id = urlparse(broadcast_url).path.split('/')[-1]
    try:
        # use info from initial redirect url
        broadcast = info['BroadcastCache']['broadcasts'][broadcast_id]['broadcast']
    except KeyError:
        # use info from canonical broadcast url
        print('unable to get broadcast from: ' + url)
        if broadcast_id == 'undefined':
            raise Exception('undefined')

        api_url = 'https://api.periscope.tv/api/v2/getBroadcastPublic?broadcast_id=' # ex: 1lPKqyeBnZwKb
        api_url += broadcast_id
        print('using public api: ' + api_url)
        response = requests.get(api_url, headers=headers)
        data = response.json()
        broadcast = data['broadcast']

    return broadcast

countries = reverse_geocode.GeocodeData().countries
iso_codes = {country: iso_code for iso_code, country in countries.items()}
def get_location_info(broadcast):
    location = {}
    bc = broadcast
    for key in ['city', 'country_state', 'country', 'iso_code', 'ip_lat', 'ip_lng']:
        location[key] = bc.get(key, '')

    # get location from latlong
    if bc['ip_lat'] or bc['ip_lng']:
        rg_loc = reverse_geocode.get((bc['ip_lat'], bc['ip_lng']))
        location['country'] = location['country'] or rg_loc['country']
        location['iso_code'] = location['iso_code'] or rg_loc['country_code']
        location['city'] = location['city'] or rg_loc['city']
    # interpolate country and iso code data
    if not location['country'] and location['iso_code']:
        location['country'] = countries[location['iso_code']]
    elif not location['iso_code'] and location['country']:
        location['iso_code'] = iso_codes.get(location['country'], '')

    return location

listener = MyListener()
auth = tweepy.OAuthHandler(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET)
auth.set_access_token(TWITTER_OAUTH_TOKEN, TWITTER_OAUTH_SECRET)

stream = tweepy.Stream(auth, listener)

class StreamManager:

    def __init__(self):
        self.users = 0
        self.stream = stream
        self.idle_stop_time = float('inf')
        self.idle_stop_time_delay = 300 # seconds to wait for more users before disconnecting stream

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
        self.idle_stop_time = float('inf')
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
        if not self.stream.running:
            self.start_stream()
        self.idle_stop_time = float('inf')

    def new_disconnect(self):
        self.users -= 1
        print('user disconnected ({})'.format(self.users))
        if self.users == 0:
            self.idle_stop_time = time.time() + self.idle_stop_time_delay
            print('disconnecting stream in {} seconds if no '
                  'users...'.format(self.idle_stop_time_delay))

stream_manager = StreamManager()
