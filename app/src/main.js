import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';

// interactive testing using mocks
// import { mockIO } from '../tests/mockSocket';
// window.io = mockIO;

$(() => console.log('ready! from jquery handler'));

class Hello extends React.Component {
  render() {
    return <h1>hello world</h1>;
  }
}

let a = io;

const Listing = () => {
  return (<div class="list-group">
    <a href="#"
       class="list-group-item list-group-item-action flex-column align-items-start active">
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">List group item heading</h5>
        <small>3 days ago</small>
      </div>
      <p class="mb-1">
        Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget
        risus varius blandit.
      </p>
      <small>Donec id elit non mi porta.</small>
    </a>
    <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">List group item heading</h5>
        <small class="text-muted">3 days ago</small>
      </div>
      <p class="mb-1">
        Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget
        risus varius blandit.
      </p>
      <small class="text-muted">Donec id elit non mi porta.</small>
    </a>
    <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">List group item heading</h5>
        <small class="text-muted">3 days ago</small>
      </div>
      <p class="mb-1">
        Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget
        risus varius blandit.
      </p>
      <small class="text-muted">Donec id elit non mi porta.</small>
    </a>
  </div>);
};

const RefreshButton = () => {
  return (
    <button type="button" className="btn btn-default btn-lg btn-block" id="refresh-button">
      0 new streams
    </button>
  );
};

const App = () => {
  return (
    <div className="container-fluid">
      <div className="row" style={{height: '100vh'}}>
        <div className="col-sm-3">
          <div className="row">
            <RefreshButton/>
          </div>
          <div className="list-group row" id="listing">
            <Listing/>
          </div>
        </div>
        <div className="col-sm-9">
          <div id="map">
            map
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App/>, document.querySelector(`#root`));
//
//
// $(document).ready(function () {
//   let streams = [];
//   let new_streams = [];
//   let namespace = '/main';
//   var socket = io(location.protocol + '//' + document.domain + ':' + location.port + namespace);
//   socket.on('new stream', function (data) {
//     new_streams.push(data);
//     $('#refresh-button').text(new_streams.length + ' new streams');
//     //$('#log').prepend('<p class="time" data-time="' + data.created_at + '">asdf</p>');
//     console.log(data);
//   });
//
//   $('#refresh-button').on('click', function () {
//     streams = streams.concat(new_streams);
//     new_streams = [];
//     $('#listing').empty();
//     map.series.regions[0].clear();
//     map.removeAllMarkers();
//     var selectedRegions = map.getSelectedRegions();
//     var n_display = 30;
//     var i_stop = Math.max(streams.length - n_display, 0);
//     for (var i = streams.length - 1; i >= i_stop; i--) {
//       var broadcast = streams[i];
//
//       var loc = broadcast.location;
//       var locationString = [loc.city, loc.country_state, loc.country];
//       locationString = locationString.filter(Boolean).join(', ');
//       if (!locationString) {
//         var locationHtml = '<span class="text-muted">Unknown location</span>';
//       } else {
//         var locationHtml = '<strong>' + locationString + '</strong>';
//       }
//
//       if (!broadcast.status) {
//         var statusHtml = '<span class="text-muted">Untitled</span>';
//       } else {
//         var statusHtml = broadcast.status;
//       }
//
//       var activeIfSelected = '';
//       if (selectedRegions.indexOf(broadcast.location.iso_code) > -1) {
//         activeIfSelected = 'list-group-item-info';
//       }
//
//       var html = [
//         '<a href="' + broadcast.url + '" target="_blank" ',
//         'class="list-group-item ' + activeIfSelected + '" ',
//         'data-iso_code="' + broadcast.location.iso_code + '">',
//         '<strong>' + broadcast.name + '</strong> ',
//         '<span class="text-muted">@' + broadcast.screen_name + ' · ',
//         '<span class="time" data-time="' + broadcast.created_at + '">',
//         timeSince(broadcast.created_at),
//         '</span></span>',
//         '<br>' + locationHtml,
//         '<br>' + statusHtml,
//         '</a>',
//       ].join('');
//       $('#listing').append(html);
//
//       mapStream(broadcast);
//     }
//
//     $('#refresh-button').text(new_streams.length + ' new streams');
//   });
//
//   let map = new jvm.Map({
//     container: $('#map'),
//     map: 'world_mill_en',
//     regionsSelectable: true,
//     series: {
//       regions: [{
//         scale: ['#C8EEFF', '#0071A4'],
//         attribute: 'fill',
//       }],
//     },
//     onRegionSelected: function (e, code, isSelected, selectedRegions) {
//       $('#listing .list-group-item').each(function (index, e) {
//         if ($(this).data('iso_code') == code) {
//           if (isSelected) {
//             $(this).addClass('list-group-item-info');
//           } else {
//             $(this).removeClass('list-group-item-info');
//           }
//         }
//       });
//     },
//     markerStyle: {
//       initial: {
//         fill: 'yellow',
//         r: 4,
//       },
//     },
//   });
//
//   function mapStream(stream) {
//     var values = {};
//     values[stream.location.iso_code] = 1;
//     map.series.regions[0].setValues(values);
//     if (stream.location.ip_lat || stream.location.ip_lng) {
//       let markers = {};
//       markers[stream.screen_name] = {
//         latLng: [stream.location.ip_lat, stream.location.ip_lng],
//         name: '@' + stream.screen_name,
//       };
//       map.addMarkers(markers);
//     }
//   }
//
//   function timeSince(dateString) {
//     var then = new Date(dateString);
//     var seconds = (Date.now() - then) / 1000;
//     if (seconds < 60) {
//       return parseInt(seconds) + 's';
//     } else if (seconds < 3600) {
//       return parseInt(seconds / 60) + 'm';
//     } else if (seconds < 86400) {
//       return parseInt(seconds / 3600) + 'h';
//     } else {
//       return parseInt(seconds / 86400) + 'd';
//     }
//   }
//
//   function updateTime() {
//     $('.time').each(function () {
//       $(this).text(timeSince($(this).data("time")));
//     });
//   }
//
//   setInterval(updateTime, 20000);
// });

console.log('hello world');