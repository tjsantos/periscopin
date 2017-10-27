import React, { Component } from 'react';
import './App.css';

// interactive testing using mocks
// import { mockIO } from '../tests/mockSocket';
// window.io = mockIO;

const ListItem = () => {
  return (
    <a href="#"
       className="list-group-item list-group-item-action flex-column align-items-start">
      <div className="d-flex w-100 justify-content-between">
        <h5 className="mb-1">List group item heading</h5>
        <small>3 days ago</small>
      </div>
      <p className="mb-1">
        Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget
        risus varius blandit.
      </p>
      <small>Donec id elit non mi porta.</small>
    </a>
  );
};

const RefreshButton = () => {
  return (
    <button type="button" className="btn btn-default btn-lg btn-block" id="refresh-button">
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
  console.log('rendering App 1');

  return (
    <div className="row no-gutters App">
      <div className="col-sm-9 order-sm-2 MapContainer">
        <GoogleMap/>
      </div>
      <div className="col-sm-3 order-sm-1 StreamsContainer">
        <Streams/>
      </div>
    </div>
  );
};

export default App;