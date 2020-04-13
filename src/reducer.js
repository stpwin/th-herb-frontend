import { combineReducers } from 'redux'
import { firebaseReducer as firebase } from 'react-redux-firebase'
import { firestoreReducer as firestore } from 'redux-firestore'
import { loginReducer as login } from './reducer.login'
import { dataReducer as data } from './reducer.data'
import { fullviewReducer as fullView } from "./reducer.fullview"
// import firebase from 'react-redux-firebase/lib/reducer'
// import firestore from 'redux-firestore/lib/reducer'

const rootReducer = combineReducers({
    firebase,
    firestore,
    login,
    data,
    fullView
})

export default rootReducer