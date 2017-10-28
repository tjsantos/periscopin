import React, { Component } from 'react';
import './App.css';
import logo from './logo.svg';

// interactive testing using mocks
// import { mockIO } from '../tests/mockSocket';
// window.io = mockIO;

const ListItem = () => {
  return (
    <a href="#"
       className="list-group-item list-group-item-action StreamItem">
      <div
        className="StreamThumb"
        style={{backgroundImage: "url(http://via.placeholder.com/350x150)"}}
      />
      <div className="StreamDetails">
        <p className="m-0"><small className="text-muted align-top">3 days ago</small></p>
        <p className="m-0 overflow-hidden">
          Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget
          risus varius blandit.
        </p>
        <p className="m-0"><small className="text-muted align-bottom">Houston, TX, United States</small></p>
      </div>
    </a>
  );
};

const RefreshButton = () => {
  return (
    <button type="button" className="btn btn-light btn-lg btn-block RefreshButton">
      0 new streams
    </button>
  );
};

const Streams = () => {
  const listItems = new Array(10).fill(<ListItem/>);

  return (
    <div className="d-flex flex-column h-100">
      <RefreshButton/>
      <div className="list-group flex-auto overflow-y-scroll">
        { listItems }
      </div>
    </div>
  );
};

const GoogleMap = () => {
  return <div>map</div>;
};

const App = () => {
  return (
    <div className="AppContainer">
      <div className="MapContainer">
        <GoogleMap/>
      </div>
      <div className="StreamsContainer">
        <Streams/>
      </div>
    </div>
  );
};

export default App;