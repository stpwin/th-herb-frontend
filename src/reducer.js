import { combineReducers } from 'redux'
import { firebaseReducer as firebase } from 'react-redux-firebase'
import { firestoreReducer as firestore } from 'redux-firestore'
import { loginReducer as login } from './reducer.login'
import { dataReducer as data } from './reducer.data'
import { modalReducer as modal } from "./reducer.modal"
import { viewReducer as view } from "./reducer.view"
// import firebase from 'react-redux-firebase/lib/reducer'
// import firestore from 'redux-firestore/lib/reducer'

const rootReducer = combineReducers({
    firebase,
    firestore,
    login,
    data,
    modal,
    view
})

export default rootReducer