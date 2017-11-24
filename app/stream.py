import json
import time
from urllib.parse import urlparse

import requests
import reverse_geocoder
import tweepy
from iso3166 import countries, countries_by_name
from pyquery import PyQuery as pq

from . import settings, socketio


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
                    'url': expanded_url,
                    'id': broadcast['id'],
                    'profile_image_url': broadcast['profile_image_url']
                }
                socketio.emit('new stream', data, namespace='/main')

                # try:
                #    print((data['name'] + ' @' + data['screen_name']).encode('utf-8'))
                #    print(u', '.join(
                #        [location['city'], location['country_state'], location['country']]
                #    ).encode('utf-8'))
                #    print(data['status'].encode('utf-8') or u'Untitled')
                #    print(u'')
                # except (UnicodeDecodeError, UnicodeEncodeError) as e:
                #    import IPython; IPython.embed()

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
        broadcast = info['BroadcastCache']['broadcasts'][broadcast_id]['broadcast']['data']
    except KeyError:
        # use info from canonical broadcast url
        print('unable to get broadcast from: ' + url)
        if broadcast_id == 'undefined':
            raise Exception('undefined broadcast_id')

        api_url = 'https://proxsee.pscp.tv/api/v2/accessVideoPublic?broadcast_id=' # ex: 1lPKqyeBnZwKb
        api_url += broadcast_id
        api_url += '&replay_redirect=false'
        print('using public api: ' + api_url)
        response = requests.get(api_url, headers=headers)
        try:
            data = response.json()
            broadcast = data['broadcast']
        except Exception as e:
            print('unable to get response from api')
            raise e

    return broadcast


# countries = reverse_geocoder.GeocodeData().countries
# iso_codes = {country: iso_code for iso_code, country in countries.items()}
def get_location_info(broadcast):
    location = {}
    bc = broadcast
    for key in ['city', 'country_state', 'country', 'iso_code', 'ip_lat', 'ip_lng']:
        location[key] = bc.get(key, '')

    # get location from latlong
    if (bc['ip_lat'] or bc['ip_lng']) and not (location['iso_code'] and location['city']):
        rg_loc = reverse_geocoder.get((bc['ip_lat'], bc['ip_lng']))
        # location['country'] = location['country'] or rg_loc['country']
        location['iso_code'] = location['iso_code'] or rg_loc['cc']
        location['city'] = location['city'] or rg_loc['name']
        location['country_state'] = location['country_state'] or rg_loc['admin1']
        print(('reverse geocoded: '
               f'{location["city"]}, {location["country_state"]}, {location["iso_code"]}'))
    # infer country and iso code data
    if not location['country'] and location['iso_code']:
        location['country'] = countries.get(location['iso_code']).name
    elif not location['iso_code'] and location['country']:
        location['iso_code'] = countries_by_name.get(location['country'], '').alpha2
        print(f'inferred iso_code for country: {location["country"]}')

    return location



class StreamManager:

    def __init__(self):
        listener = MyListener()
        auth = tweepy.OAuthHandler(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)
        auth.set_access_token(settings.TWITTER_OAUTH_TOKEN, settings.TWITTER_OAUTH_SECRET)

        self.stream = tweepy.Stream(auth, listener)
        self.users = 0
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


class StreamManagerMock:
    def __init__(self):
        print('using stream manager mock')

    def __getattr__(self, item):
        print('mock attr: ' + item)
        print('using empty function')
        return lambda *args: None


if settings.DEBUG:
    stream_manager = StreamManagerMock()
else:
    stream_manager = StreamManager()
