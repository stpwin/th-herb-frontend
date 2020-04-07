import React from 'react';
// import logo from './logo.svg';

import { Provider } from 'react-redux'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore' // make sure you add this for firestore
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
// import { createFirestoreInstance } from 'redux-firestore';
import configureStore from './store'
import initFirebase from './initFirebase'
import { reduxFirebase as rfConfig } from './config'

import './App.css'

import Navigation from "./components/Navigation"
import MainSearch from "./components/MainSearch"
import MainList from "./components/MainList"

const initialState = window && window.__INITIAL_STATE__ // set initial state here
const store = configureStore(initialState)
// Initialize Firebase instance
initFirebase()

function App() {
  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider firebase={firebase}
        config={rfConfig}
        dispatch={store.dispatch}>
        <div className="App">
          <Navigation />
          <MainSearch />
          <MainList />
        </div>
      </ReactReduxFirebaseProvider>
    </Provider>

  );
}

export default App;
