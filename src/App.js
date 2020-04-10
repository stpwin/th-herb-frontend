import React from 'react';
// import logo from './logo.svg';

import { Provider } from 'react-redux'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/firestore' // make sure you add this for firestore
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import { createFirestoreInstance } from 'redux-firestore';
import configureStore from './store'
import initFirebase from './initFirebase'
import { reduxFirebase as rfConfig } from './config'

import './App.css'

import Navigation from "./components/Navigation"
import MainSearch from "./components/MainSearch"
import MainList from "./components/MainList"
import Login from "./components/Login"

const initialState = window && window.__INITIAL_STATE__ // set initial state here
const store = configureStore(initialState)
// Initialize Firebase instance
const fbInstance = initFirebase()

fbInstance.auth().onAuthStateChanged(authUser => {
  // console.log("onAuthStateChanged", authUser)
  if (authUser) {

    store.dispatch({ type: 'SET_AUTH_USER', authUser })
    localStorage.setItem('authUser', JSON.stringify(authUser));
  } else {
    store.dispatch({ type: 'SET_AUTH_USER', authUser: null })
    localStorage.removeItem('authUser');
  }
})

const rrfProps = {
  firebase,
  config: rfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance // <- needed if using firestore
}

function App() {
  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <div className="App">
          <Login />
          <Navigation />
          <MainSearch />
          <MainList />
        </div>
      </ReactReduxFirebaseProvider>
    </Provider>

  );
}

export default App;
