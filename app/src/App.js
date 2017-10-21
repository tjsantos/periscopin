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

const Listing = () => {
  const listItems = new Array(10).fill(<ListItem/>);

  return (
    <div className="h-100 d-flex flex-column">
      <RefreshButton/>
      <div className="flex-auto list-group">
        { listItems }
      </div>
    </div>
  );
};

const GoogleMap = () => {
  return <div>map345</div>;
};

const App = () => {
  console.log('rendering App 1');

  return (
    <div className="App a">
      <div className="row no-gutters h-100">
        <div className="col-sm-9 order-sm-2">
          <GoogleMap/>
        </div>
        <div className="col-sm-3 order-sm-1">
          <Listing/>
        </div>
      </div>
    </div>
  );
};

export default App;