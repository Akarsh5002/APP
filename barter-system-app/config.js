import firebase from 'firebase';
require('@firebase/firestore');

  var firebaseConfig = {
    apiKey: "AIzaSyC3p5lOlHaIOxGs5bqGC9Rux_wuZcN7YlM",
    authDomain: "barter-system-app-64fd2.firebaseapp.com",
    projectId: "barter-system-app-64fd2",
    storageBucket: "barter-system-app-64fd2.appspot.com",
    messagingSenderId: "129635807654",
    appId: "1:129635807654:web:d2bda74bff643e30219f67"
  };

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();