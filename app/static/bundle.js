/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

$(document).ready(function() {
    streams = [];
    new_streams = [];
    namespace = '/main';
    var socket = io(location.protocol + '//' + document.domain + ':' + location.port + namespace);
    socket.on('new stream', function(data) {
        new_streams.push(data);
        $('#refresh-button').text(new_streams.length + ' new streams');
        //$('#log').prepend('<p class="time" data-time="' + data.created_at + '">asdf</p>');
        console.log(data);
    });

    $('#refresh-button').on('click', function() {
        streams = streams.concat(new_streams);
        new_streams = [];
        $('#listing').empty();
        map.series.regions[0].clear();
        map.removeAllMarkers();
        var selectedRegions = map.getSelectedRegions();
        var n_display = 30;
        var i_stop = Math.max(streams.length - n_display, 0);
        for (var i = streams.length - 1; i >= i_stop; i--) {
            var broadcast = streams[i];

            var loc = broadcast.location;
            var locationString = [loc.city, loc.country_state, loc.country];
            locationString = locationString.filter(Boolean).join(', ');
            if (!locationString) {
                var locationHtml = '<span class="text-muted">Unknown location</span>';
            } else {
                var locationHtml = '<strong>' + locationString + '</strong>';
            }

            if (!broadcast.status) {
                var statusHtml = '<span class="text-muted">Untitled</span>';
            } else {
                var statusHtml = broadcast.status;
            }

            var activeIfSelected = '';
            if (selectedRegions.indexOf(broadcast.location.iso_code) > -1) {
                activeIfSelected = 'list-group-item-info';
            }

            var html = [
                '<a href="' + broadcast.url + '" target="_blank" ',
                'class="list-group-item ' + activeIfSelected + '" ',
                'data-iso_code="' + broadcast.location.iso_code + '">',
                '<strong>' + broadcast.name + '</strong> ',
                '<span class="text-muted">@' + broadcast.screen_name + ' · ',
                '<span class="time" data-time="' + broadcast.created_at + '">',
                timeSince(broadcast.created_at),
                '</span></span>',
                '<br>' + locationHtml,
                '<br>' + statusHtml,
                '</a>',
            ].join('');
            $('#listing').append(html);

            mapStream(broadcast);
        }

        $('#refresh-button').text(new_streams.length + ' new streams');
    });

    map = new jvm.Map({
        container: $('#map'),
        map: 'world_mill_en',
        regionsSelectable: true,
        series: {
            regions: [{
                scale: ['#C8EEFF', '#0071A4'],
                attribute: 'fill',
            }],
        },
        onRegionSelected: function (e, code, isSelected, selectedRegions) {
            $('#listing .list-group-item').each( function (index, e) {
                if ( $(this).data('iso_code') == code ) {
                    if (isSelected) {
                        $(this).addClass('list-group-item-info');
                    } else {
                        $(this).removeClass('list-group-item-info');
                    }
                }
            });
        },
        markerStyle: {
            initial: {
                fill: 'yellow',
                r: 4,
            },
        },
    });

    function mapStream(stream) {
        var values = {};
        values[stream.location.iso_code] = 1;
        map.series.regions[0].setValues(values);
        if (stream.location.ip_lat || stream.location.ip_lng) {
            markers = {};
            markers[stream.screen_name] = {
                latLng: [stream.location.ip_lat, stream.location.ip_lng],
                name: '@' + stream.screen_name,
            };
            map.addMarkers(markers);
        }
    }

    function timeSince(dateString) {
        var then = new Date(dateString);
        var seconds = (Date.now() - then) / 1000;
        if (seconds < 60) {
            return parseInt(seconds) + 's';
        } else if (seconds < 3600) {
            return parseInt(seconds/60) + 'm';
        } else if (seconds < 86400) {
            return parseInt(seconds/3600) + 'h';
        } else {
            return parseInt(seconds/86400) + 'd';
        }
    }

    function updateTime() {
        $('.time').each(function() {
            $(this).text(timeSince($(this).data("time")));
        });
    }

    setInterval(updateTime, 20000);
});


/***/ })
/******/ ]);