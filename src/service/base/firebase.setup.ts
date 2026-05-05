// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyA3tk-S5UL96xjZexOiRGfnsNTj2R71utE',
    authDomain: 'song-repo.firebaseapp.com',
    projectId: 'song-repo',
    storageBucket: 'song-repo.appspot.com',
    messagingSenderId: '1090818897368',
    appId: '1:1090818897368:web:c8c9df08bb07d5aa34aead',
    measurementId: 'G-LQJVFK9TMT',
    // measurementId: 'G-8M4PR0FMY8', // beta
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
