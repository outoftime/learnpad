import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import config from '../config';

const appFirebase = firebase.initializeApp({
  apiKey: config.firebaseApiKey,
  authDomain: `${config.firebaseApp}.firebaseapp.com`,
  databaseURL: `https://${config.firebaseApp}.firebaseio.com`,
});

const auth = firebase.auth(appFirebase);
const database = firebase.database(appFirebase);
const githubAuthProvider = new firebase.auth.GithubAuthProvider();
githubAuthProvider.addScope('gist');
githubAuthProvider.addScope('public_repo');

const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
googleAuthProvider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');

export {auth, database, githubAuthProvider, googleAuthProvider};
