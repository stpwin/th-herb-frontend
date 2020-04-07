import { combineReducers } from 'redux'
import { firebaseReducer as firebase } from 'react-redux-firebase'
import { firestoreReducer as firestore } from 'redux-firestore'
// import firebase from 'react-redux-firebase/lib/reducer'
// import firestore from 'redux-firestore/lib/reducer'

const rootReducer = combineReducers({
    firebase,
    firestore
})

export default rootReducer