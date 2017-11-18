import React, { Component } from 'react';
import './App.css';
import logo from './logo.svg';

// interactive testing using mocks
// import { mockIO } from '../tests/mockSocket';
// window.io = mockIO;

const ListItem = (props) => {
  const stream = props.stream;
  const loc = stream.location;
  const locationString = [loc.city, loc.country_state, loc.country]
    .filter(Boolean)
    .join(', ');

  return (
    <a href={stream.url}
       target="_blank"
       rel="noopener"
       className="list-group-item list-group-item-action StreamItem">
      <div
        className="StreamThumb"
        style={{backgroundImage: `url(${stream.profile_image_url})`}}
      />
      <div className="StreamDetails">
        <p className="m-0">
          <small className="text-muted align-top">
            <TimeText createdAt={stream.created_at} />
          </small>
        </p>
        <p className="m-0 overflow-hidden">
          {stream.status || <span className="text-muted">Untitled</span>}
        </p>
        {locationString &&
          <p className="m-0">
            <small className="text-muted align-bottom">{locationString}</small>
          </p>
        }
      </div>
    </a>
  );
};

class TimeText extends React.Component {
  static timeSince(dateString) {
    const then = new Date(dateString);
    const seconds = (Date.now() - then) / 1000;
    if (seconds < 45) {
      return 'just now';
    } else if (seconds < 3600) {
      return Math.round(seconds / 60) + 'm';
    } else if (seconds < 86400) {
      return parseInt(seconds / 3600) + 'h';
    } else {
      return parseInt(seconds / 86400) + 'd';
    }
  }

  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.setState({ date: new Date()}),
      20000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    return TimeText.timeSince(this.props.createdAt);
  }
}

const RefreshButton = props => {
  return (
    <button
      type="button"
      className="btn btn-light btn-lg btn-block RefreshButton"
      onClick={props.update}
    >
      {props.newStreamsLength} new streams
    </button>
  );
};

const Streams = props => {
  const listItems = props.streams.map(stream => {
    return (
      <ListItem stream={stream} key={stream.id} />
    );
  });

  return (
    <div className="d-flex flex-column h-100">
      <RefreshButton update={props.update} newStreamsLength={props.newStreamsLength}/>
      <div className="list-group flex-auto overflow-y-scroll">
        { listItems }
      </div>
    </div>
  );
};

const GoogleMap = () => {
  return <div>map</div>;
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      streams: [],
      newStreams: []
    };
  }

  componentDidMount() {
    const namespace = '/main';
    const socket = io(location.protocol + '//' + document.domain + ':' + location.port + namespace);
    socket.on('new stream', s => this.acceptNewStream(s));
  }

  acceptNewStream(newStream) {
    // deduplicate same periscopes from different tweets
    this.setState(prevState => {
      for (let streams of [prevState.streams, prevState.newStreams]) {
        for (let stream of streams) {
          if (stream.id === newStream.id) {
            // console.log(`duplicate: `, newStream);
            return;
          }
        }
      }

      return {
        newStreams: [newStream, ...prevState.newStreams]
      };
    });
  }

  updateStreams() {
    this.setState(prevState => {
      return {
        streams: [...prevState.newStreams, ...prevState.streams],
        newStreams: []
      };
    });
  }

  render() {
    return (
      <div className="AppContainer">
        <div className="MapContainer">
          <GoogleMap/>
        </div>
        <div className="StreamsContainer">
          <Streams
            streams={this.state.streams}
            update={() => this.updateStreams()}
            newStreamsLength={this.state.newStreams.length}
          />
        </div>
      </div>
    );
  }
};

export default App;