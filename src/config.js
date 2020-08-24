export const firebase = {
    apiKey: "AIzaSyCxf4zy3J6kqjkLD0YEC-Ro5Ix2ijKEZzI",
    authDomain: "thai-herbal-pharm.firebaseapp.com",
    databaseURL: "https://thai-herbal-pharm.firebaseio.com",
    projectId: "thai-herbal-pharm",
    storageBucket: "thai-herbal-pharm.appspot.com",
    messagingSenderId: "692378519908",
    appId: "1:692378519908:web:5795e98afe87c004cbd271",
    measurementId: "G-42KELCZB2D"
}

export const storageConfig = {
    disease_images_path: "disease_images",
    herbal_images_path: "herbal_images",
}

export const reduxFirebase = {
    userProfile: 'users',
    useFirestoreForProfile: true,
    enableLogging: false
}

export default { firebase, reduxFirebase }